import { NextRequest } from 'next/server';
import { CompanyService } from '@/server/services/company.service';
import {
  authenticateRequest,
  coerceCompanyId,
  requireAuth,
  resolveCompanyIdForUser,
} from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/api-response';

const ALLOWED_COMPANY_FIELDS = new Set([
  'name',
  'ownerName',
  'email',
  'phone',
  'category',
  'description',
  'website',
  'gst',
  'pan',
  'address',
  'socialLinks',
  'businessHours',
  'theme',
  'seo',
  'logo',
  'banner',
  'favicon',
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Authenticated owners can load their company even if not approved yet (Settings page).
    const auth = await authenticateRequest(request);
    if (auth?.role === 'company_admin' && auth.userId) {
      try {
        const companyId =
          coerceCompanyId(auth.companyId) ||
          (await resolveCompanyIdForUser(auth.userId, auth.companyId));
        if (companyId) {
          const owned = await CompanyService.getBySlugAnyStatus(slug);
          const ownedId = coerceCompanyId(owned.company._id);
          if (ownedId && ownedId === companyId) {
            return apiSuccess(owned);
          }
        }
      } catch {
        // Fall through to public approved lookup
      }
    }

    const result = await CompanyService.getBySlug(slug);
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Company not found';
    return apiError(message, 404);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;

    const { slug } = await params;
    const companyBundle = await CompanyService.getBySlugAnyStatus(slug);
    const companyId = coerceCompanyId(companyBundle.company._id);
    if (!companyId) return apiError('Company not found', 404);

    if (auth.role === 'company_admin' && companyId !== auth.companyId) {
      return apiError('You can only update your own company', 403);
    }

    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_COMPANY_FIELDS.has(key) && value !== undefined) {
        payload[key] = value;
      }
    }

    const updated = await CompanyService.update(companyId, payload);
    return apiSuccess(updated, 'Company updated');
  } catch (error) {
    console.error('Company update failed:', error);
    const message = error instanceof Error ? error.message : 'Update failed';
    return apiError(message, 400);
  }
}
