import { issueSignedToken, presignUrl } from '@vercel/blob';
import { readReferenceToken } from '../../../lib/commission-uploads';
import { InquiryValidationError } from '../../../lib/inquiry';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const value = readReferenceToken<{ purpose: 'download'; validUntil: number; pathname: string }>(
      new URL(request.url).searchParams.get('token') || '', 'download',
    );
    // Redirect straight to storage so large downloads also bypass function limits.
    const validUntil = Math.min(value.validUntil, Date.now() + 5 * 60 * 1000);
    const delegation = await issueSignedToken({ pathname: value.pathname, operations: ['get'], validUntil, abortSignal: AbortSignal.timeout(8000) });
    const { presignedUrl } = await presignUrl(delegation, { pathname: value.pathname, operation: 'get', access: 'private', validUntil });
    return new Response(null, { status: 302, headers: { Location: presignedUrl, 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } });
  } catch (error) {
    return new Response(error instanceof InquiryValidationError
      ? 'This reference image link has expired or is invalid. Photos are available for 35 days after upload.'
      : 'This photo is temporarily unavailable. Please try again.',
    { status: error instanceof InquiryValidationError ? 410 : 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
