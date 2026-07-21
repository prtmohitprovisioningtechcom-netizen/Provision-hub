import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiError, apiSuccess } from '@/server/utils/api-response';
import { saveMediaBuffer } from '@/lib/media-storage';

export const runtime = 'nodejs';

/** Keep under Vercel’s ~4.5MB serverless body limit. */
const MAX_IMAGE_BYTES = 2.5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return apiError('Only multipart/form-data is supported', 400);
    }

    const form = await request.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string' || !('arrayBuffer' in (file as object))) {
      return apiError('Please upload an image file', 400);
    }

    const actualFile = file as File;
    const mimeType = actualFile.type || 'image/jpeg';

    if (!ALLOWED_TYPES.has(mimeType.toLowerCase())) {
      return apiError('Please upload a valid PNG, JPG, WebP, or GIF image', 400);
    }

    if (actualFile.size > MAX_IMAGE_BYTES) {
      return apiError('Image must be smaller than 2.5MB after compression', 413);
    }

    const buffer = Buffer.from(await actualFile.arrayBuffer());
    const uploaded = await saveMediaBuffer({
      companyId: auth.companyId,
      buffer,
      mimeType,
      filename: actualFile.name,
    });

    return apiSuccess(uploaded);
  } catch (error) {
    console.error('Image upload failed:', error);
    const message =
      error instanceof Error && error.message.includes('too large')
        ? error.message
        : 'Failed to upload image';
    return apiError(message, 500);
  }
}
