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
      .select('name slug logo theme rating reviewCount phone socialLinks')
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
      socialLinks?: unknown;
    };
    const update: Record<string, unknown> = {};
    if (body.logo !== undefined) {
      if (
        typeof body.logo !== 'string' ||
        !(
          body.logo.startsWith('https://') ||
          body.logo.startsWith('/api/media/') ||
          body.logo.startsWith('data:image/')
        )
      ) {
        return apiError('Logo must be an uploaded image URL', 400);
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
    if (body.socialLinks !== undefined) {
      if (!body.socialLinks || typeof body.socialLinks !== 'object') {
        return apiError('Invalid social links', 400);
      }
      const incoming = body.socialLinks as Record<string, unknown>;
      const allowed = ['facebook', 'instagram', 'youtube', 'twitter', 'linkedin', 'whatsapp'] as const;
      for (const key of allowed) {
        if (incoming[key] === undefined) continue;
        const value = String(incoming[key] || '').trim();
        if (value && !/^https?:\/\//i.test(value) && key !== 'whatsapp') {
          update[`socialLinks.${key}`] = `https://${value}`;
        } else {
          update[`socialLinks.${key}`] = value;
        }
      }
    }
    if (!Object.keys(update).length) {
      return apiError('Nothing to update', 400);
    }

    await connectDB();
    const company = await Company.findByIdAndUpdate(
      auth.companyId,
      { $set: update },
      { new: true },
    )
      .select('name slug logo theme socialLinks')
      .lean();
    if (!company) return apiError('Company not found', 404);

    revalidatePath(`/${company.slug}`);
    revalidatePath(`/${company.slug}`, 'layout');
    return apiSuccess(company, 'Company branding updated');
  } catch {
    return apiError('Failed to update navbar logo', 500);
  }
}
