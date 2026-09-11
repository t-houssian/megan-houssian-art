import { del, list } from '@vercel/blob';
import { REFERENCE_PREFIX, REFERENCE_RETENTION_MS } from '../../../../lib/commission-uploads';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  const cutoff = Date.now() - REFERENCE_RETENTION_MS;
  let cursor: string | undefined;
  let deleted = 0;
  do {
    const page = await list({ prefix: REFERENCE_PREFIX, cursor, limit: 1000 });
    const expired = page.blobs.filter((blob) => blob.uploadedAt.getTime() <= cutoff);
    if (expired.length) {
      await del(expired.map((blob) => blob.url));
      deleted += expired.length;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  console.info('commission-references.cleaned', { deleted });
  return Response.json({ deleted });
}
