import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { connectDB } from '@/lib/mongodb';
import Gallery from '@/models/Gallery';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    await connectDB();
    const gallery = await Gallery.findOne({ companyId: auth.companyId }).lean();
    
    return apiSuccess(gallery || { images: [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get gallery';
    return apiError(message, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const body = await parseBody(request);
    const { images } = body as { images: any[] };

    if (!Array.isArray(images)) {
      return apiError('Invalid images data', 400);
    }

    await connectDB();
    const gallery = await Gallery.findOneAndUpdate(
      { companyId: auth.companyId },
      { images },
      { new: true, upsert: true }
    ).lean();

    return apiSuccess(gallery);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save gallery';
    return apiError(message, 400);
  }
}
