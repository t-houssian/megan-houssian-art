import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { head } from '@vercel/blob';
import { InquiryValidationError, MAX_ORIGINAL_REFERENCE_BYTES, MAX_REFERENCE_FILE_BYTES, MAX_REFERENCE_IMAGES, REFERENCE_CONTENT_TYPES } from './inquiry';

export const REFERENCE_PREFIX = 'commission-references/';
export const REFERENCE_RETENTION_MS = 35 * 24 * 60 * 60 * 1000;

type UploadFile = { name: string; size: number; contentType: string; pathname: string };
export type UploadSession = { purpose: 'upload'; validUntil: number; files: UploadFile[] };
type DownloadToken = { purpose: 'download'; validUntil: number; pathname: string };

function secret() {
  const value = process.env.BLOB_READ_WRITE_TOKEN;
  if (!value) throw new Error('Reference image storage is not configured');
  return value;
}

export function signReferenceToken(value: UploadSession | DownloadToken) {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url');
  const signature = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function readReferenceToken<T extends UploadSession | DownloadToken>(token: string, purpose: T['purpose']): T {
  try {
    if (token.length > 20000) throw new Error();
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) throw new Error();
    const expected = createHmac('sha256', secret()).update(payload).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error();
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString()) as T;
    if (value.purpose !== purpose || !Number.isFinite(value.validUntil) || value.validUntil <= Date.now()) throw new Error();
    return value;
  } catch {
    throw new InquiryValidationError('The image link or upload session has expired. Please upload your photos again.');
  }
}

export function createUploadSession(input: unknown) {
  if (!Array.isArray(input) || !input.length || input.length > MAX_REFERENCE_IMAGES) {
    throw new InquiryValidationError('Please choose between 1 and 10 reference images.');
  }
  const folder = `${REFERENCE_PREFIX}${randomUUID()}/`;
  let totalBytes = 0;
  const files: UploadFile[] = input.map((item, index) => {
    if (!item || typeof item.name !== 'string' || item.name.length > 255 || !item.name.trim() ||
        !Number.isInteger(item.size) || item.size <= 0 || item.size > MAX_REFERENCE_FILE_BYTES ||
        !REFERENCE_CONTENT_TYPES.includes(item.contentType)) {
      throw new InquiryValidationError('Please use JPG, PNG, WEBP, GIF, or HEIC images, up to 25 MB each.');
    }
    totalBytes += item.size;
    const extension = item.contentType.split('/')[1].replace('jpeg', 'jpg');
    return { name: item.name, size: item.size, contentType: item.contentType, pathname: `${folder}${index}.${extension}` };
  });
  if (totalBytes > MAX_ORIGINAL_REFERENCE_BYTES) throw new InquiryValidationError('Please keep reference images under 100 MB in total.');
  const session: UploadSession = { purpose: 'upload', validUntil: Date.now() + 60 * 60 * 1000, files };
  return { token: signReferenceToken(session), validUntil: session.validUntil, files };
}

export async function getReferenceLinks(token: string) {
  if (!token) return [];
  const session = readReferenceToken<UploadSession>(token, 'upload');
  const abortSignal = AbortSignal.timeout(8000);
  // Only server-signed paths are inspected. Never fetch arbitrary submitted URLs.
  return Promise.all(session.files.map(async (file) => {
    const blob = await head(file.pathname, { abortSignal });
    if (blob.pathname !== file.pathname || blob.size !== file.size || blob.contentType !== file.contentType) {
      throw new InquiryValidationError('An image upload is incomplete. Please upload your photos again.');
    }
    const validUntil = blob.uploadedAt.getTime() + REFERENCE_RETENTION_MS;
    const downloadToken = signReferenceToken({ purpose: 'download', pathname: file.pathname, validUntil });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.meganhoussianart.com';
    const url = new URL('/api/commission-reference', baseUrl);
    url.searchParams.set('token', downloadToken);
    return { name: file.name, url: url.toString(), expiresAt: validUntil };
  }));
}
