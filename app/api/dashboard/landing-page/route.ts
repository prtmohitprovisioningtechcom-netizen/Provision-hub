import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { connectDB } from '@/lib/mongodb';
import LandingPage from '@/models/LandingPage';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    await connectDB();
    const landingPage = await LandingPage.findOne({ companyId: auth.companyId }).lean();
    
    return apiSuccess(landingPage || { sections: [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get landing page';
    return apiError(message, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const body = await parseBody(request);
    const { sections } = body as { sections: any[] };

    if (!Array.isArray(sections)) {
      return apiError('Invalid sections data', 400);
    }

    await connectDB();
    const landingPage = await LandingPage.findOneAndUpdate(
      { companyId: auth.companyId },
      { sections, isPublished: true },
      { new: true, upsert: true }
    ).lean();

    return apiSuccess(landingPage);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save landing page';
    return apiError(message, 400);
  }
}
