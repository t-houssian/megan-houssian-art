import { upload } from '@vercel/blob/client';

export type ReferenceUploadBatch = {
  token: string;
  validUntil: number;
  files: { pathname: string }[];
  originals: File[];
  completed: Set<number>;
};

export async function uploadReferenceImages(
  files: File[],
  cache: { current: ReferenceUploadBatch | null },
  onProgress: (message: string) => void,
) {
  if (!files.length) return '';
  let batch = cache.current;
  if (!batch || batch.validUntil <= Date.now() + 60_000 || batch.originals.length !== files.length ||
      files.some((file, index) => batch?.originals[index] !== file)) {
    const response = await fetch('/api/commission-uploads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'prepare', files: files.map((file) => ({ name: file.name, size: file.size, contentType: file.type })) }),
      signal: AbortSignal.timeout(15_000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.token) throw new Error(result?.error || 'Unable to prepare your photo upload. Please try again.');
    batch = { ...result, originals: files, completed: new Set<number>() };
    cache.current = batch;
  }
  if (!batch) throw new Error('Unable to prepare your photo upload.');
  for (let index = 0; index < files.length; index++) {
    if (batch.completed.has(index)) continue;
    onProgress(`Uploading photo ${index + 1} of ${files.length}…`);
    await upload(batch.files[index].pathname, files[index], {
      access: 'private', handleUploadUrl: '/api/commission-uploads',
      clientPayload: batch.token, contentType: files[index].type,
      multipart: files[index].size > 5 * 1024 * 1024,
      abortSignal: AbortSignal.timeout(5 * 60_000),
      onUploadProgress: ({ percentage }) => onProgress(`Uploading photo ${index + 1} of ${files.length}: ${Math.round(percentage)}%`),
    });
    batch.completed.add(index);
  }
  return batch.token;
}
