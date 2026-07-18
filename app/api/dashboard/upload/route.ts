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
    if (!contentType.includes('multipart/form-data')) {
      return apiError('Only multipart/form-data is supported', 400);
    }

    const form = await request.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string' || !('arrayBuffer' in (file as any))) {
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

    // Strict Cloudinary check - prevents silent bloat of DB with base64 strings
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return apiError('Cloudinary is not configured. Please add environment variables.', 400);
    }

    const uploaded = await uploadBufferToCloudinary(
      buffer,
      mimeType,
      `multi-tenant/landing-pages/${auth.companyId}`,
    );

    return apiSuccess(uploaded);
  } catch (error) {
    console.error('Landing page image upload failed:', error);
    const isConfigError = error instanceof Error && error.message.includes('Cloudinary is not configured');
    const message = isConfigError ? error.message : 'Failed to upload image';
    return apiError(message, isConfigError ? 400 : 500);
  }
}
