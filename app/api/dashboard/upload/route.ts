import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiError, apiSuccess } from '@/server/utils/api-response';
import { uploadBufferToCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';

/** Keep under Vercel’s ~4.5MB serverless body limit (multipart + overhead). */
const MAX_IMAGE_BYTES = 2.5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const contentType = request.headers.get('content-type') || '';
    let buffer: Buffer;
    let mimeType: string;

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File)) {
        return apiError('Please upload an image file', 400);
      }
      mimeType = file.type || 'image/jpeg';
      if (!ALLOWED_TYPES.has(mimeType.toLowerCase())) {
        return apiError('Please upload a valid PNG, JPG, WebP, or GIF image', 400);
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return apiError('Image must be smaller than 2.5MB after compression', 413);
      }
      buffer = Buffer.from(await file.arrayBuffer());
    } else {
      // Legacy JSON base64 support (small images only)
      const { image } = (await request.json()) as { image?: unknown };
      if (
        typeof image !== 'string' ||
        !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(image)
      ) {
        return apiError('Please upload a valid PNG, JPG, WebP, or GIF image', 400);
      }
      const base64 = image.slice(image.indexOf(',') + 1);
      const estimatedBytes = Math.ceil((base64.length * 3) / 4);
      if (estimatedBytes > MAX_IMAGE_BYTES) {
        return apiError('Image must be smaller than 2.5MB', 413);
      }
      mimeType = image.slice(5, image.indexOf(';'));
      buffer = Buffer.from(base64, 'base64');
    }

    const uploaded = await uploadBufferToCloudinary(
      buffer,
      mimeType,
      `multi-tenant/landing-pages/${auth.companyId}`,
    );

    return apiSuccess(uploaded);
  } catch (error) {
    console.error('Landing page image upload failed:', error);
    const message =
      error instanceof Error && error.message.includes('Cloudinary is not configured')
        ? error.message
        : 'Failed to upload image';
    return apiError(message, 500);
  }
}
