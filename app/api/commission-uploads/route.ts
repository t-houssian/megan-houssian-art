import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { createUploadSession, readReferenceToken, type UploadSession } from '../../../lib/commission-uploads';
import { InquiryValidationError } from '../../../lib/inquiry';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Public inquiry form: issue scoped, size-limited upload tokens only to this site.
    // Signed Blob callbacks are validated by handleUpload and do not send Origin.
    if (body?.type !== 'blob.upload-completed' && request.headers.get('origin') !== new URL(request.url).origin) {
      return NextResponse.json({ error: 'Invalid upload origin.' }, { status: 403 });
    }
    if (body?.type === 'prepare') {
      return NextResponse.json(createUploadSession(body.files));
    }
    const result = await handleUpload({
      request,
      body: body as HandleUploadBody,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = readReferenceToken<UploadSession>(clientPayload || '', 'upload');
        const file = session.files.find((candidate) => candidate.pathname === pathname);
        if (!file) throw new InquiryValidationError('Invalid image upload.');
        return {
          allowedContentTypes: [file.contentType], maximumSizeInBytes: file.size,
          validUntil: session.validUntil, addRandomSuffix: false, allowOverwrite: false,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof InquiryValidationError ? error.message : 'Unable to upload images. Please try again.',
    }, { status: error instanceof InquiryValidationError ? error.status : 400 });
  }
}
