import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { connectDB } from '@/lib/mongodb';
import LandingPage from '@/models/LandingPage';
import Company from '@/models/Company';
import { LANDING_SECTIONS } from '@/constants';

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

    let body: unknown;
    try {
      body = await parseBody(request);
    } catch {
      return apiError(
        'Request is too large. Re-upload images (they must use Cloudinary URLs, not embedded files) and try again.',
        413,
      );
    }
    const { sections } = body as { sections: any[] };

    if (!Array.isArray(sections)) {
      return apiError('Invalid sections data', 400);
    }
    if (sections.length > 20) {
      return apiError('A landing page can contain up to 20 sections', 400);
    }
    if (JSON.stringify(sections).length > 3_500_000) {
      return apiError(
        'The total landing page data is too large. Please remove some images and try again.',
        413,
      );
    }
    const sanitized = sections; // Base64 is now fully allowed and stored in Vercel DB

    const allowedTypes = new Set(
      LANDING_SECTIONS.map((section) => section.type),
    );
    const sectionTypes = sanitized.map((section) => section?.type);
    if (sectionTypes.some((type) => !allowedTypes.has(type))) {
      return apiError('Landing page contains an unsupported section', 400);
    }
    if (new Set(sectionTypes).size !== sectionTypes.length) {
      return apiError('Each landing page section can only be added once', 400);
    }
    const normalizedSections = [...sanitized]
      .sort((a, b) => {
        if (a.type === 'navbar') return -1;
        if (b.type === 'navbar') return 1;
        return Number(a.order || 0) - Number(b.order || 0);
      })
      .map((section, order) => ({ ...section, order }));

    await connectDB();
    const landingPage = await LandingPage.findOneAndUpdate(
      { companyId: auth.companyId },
      { sections: normalizedSections, isPublished: true },
      { new: true, upsert: true }
    ).lean();

    const company = await Company.findById(auth.companyId).select('slug').lean();
    if (company?.slug) {
      revalidatePath(`/${company.slug}`);
    }

    return apiSuccess(landingPage);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save landing page';
    return apiError(message, 400);
  }
}
