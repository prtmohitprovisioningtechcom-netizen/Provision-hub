import { NextRequest } from 'next/server';
import { CompanyService } from '@/server/services/company.service';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
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
    const company = await CompanyService.getBySlug(slug);
    if (
      auth.role === 'company_admin' &&
      company.company._id.toString() !== auth.companyId
    ) {
      return apiError('You can only update your own company', 403);
    }
    const body = await request.json();
    const updated = await CompanyService.update(company.company._id.toString(), body);
    return apiSuccess(updated, 'Company updated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return apiError(message, 400);
  }
}
