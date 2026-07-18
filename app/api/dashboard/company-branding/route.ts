import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/server/middleware/auth';
import { apiError, apiSuccess } from '@/server/utils/api-response';
import { connectDB } from '@/lib/mongodb';
import Company from '@/models/Company';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    await connectDB();
    const company = await Company.findById(auth.companyId)
      .select('name slug logo theme rating reviewCount')
      .lean();
    if (!company) return apiError('Company not found', 404);
    return apiSuccess(company);
  } catch {
    return apiError('Failed to load company branding', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const body = (await request.json()) as {
      logo?: unknown;
      primaryColor?: unknown;
    };
    const update: Record<string, string> = {};
    if (body.logo !== undefined) {
      if (
        typeof body.logo !== 'string' ||
        (!body.logo.startsWith('https://') && !body.logo.startsWith('data:image/'))
      ) {
        return apiError('Logo must be an image URL or valid Base64 image', 400);
      }
      update.logo = body.logo;
    }
    if (body.primaryColor !== undefined) {
      if (
        typeof body.primaryColor !== 'string' ||
        !/^#[0-9a-fA-F]{6}$/.test(body.primaryColor)
      ) {
        return apiError('Invalid brand color', 400);
      }
      update['theme.primaryColor'] = body.primaryColor;
    }
    if (!Object.keys(update).length) {
      return apiError('Invalid logo image', 400);
    }

    await connectDB();
    const company = await Company.findByIdAndUpdate(
      auth.companyId,
      { $set: update },
      { new: true },
    )
      .select('name slug logo theme')
      .lean();
    if (!company) return apiError('Company not found', 404);

    revalidatePath(`/${company.slug}`);
    return apiSuccess(company, 'Company branding updated');
  } catch {
    return apiError('Failed to update navbar logo', 500);
  }
}
