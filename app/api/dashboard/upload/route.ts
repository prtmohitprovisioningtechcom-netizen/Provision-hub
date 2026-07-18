import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiError, apiSuccess } from '@/server/utils/api-response';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

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
      return apiError('Image must be smaller than 5MB', 413);
    }

    const uploaded = await uploadToCloudinary(
      image,
      `multi-tenant/landing-pages/${auth.companyId}`,
    );

    return apiSuccess(uploaded);
  } catch (error) {
    console.error('Landing page image upload failed:', error);
    return apiError('Failed to upload image', 500);
  }
}
