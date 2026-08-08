import { NextRequest } from 'next/server';
import { requireAuth, coerceCompanyId } from '@/server/middleware/auth';
import { CompanyService } from '@/server/services/company.service';
import { apiSuccess, apiError } from '@/server/utils/api-response';

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;

    const companyId = coerceCompanyId(auth.companyId);
    if (!companyId) return apiError('Company not found', 404);

    const body = await request.json();
    const payload: Record<string, unknown> = {};
    
    if (body.customDomain !== undefined) {
      payload.customDomain = body.customDomain;
    }
    
    // Tenants can only set status to 'pending' when requesting a domain
    if (body.customDomainStatus === 'pending') {
      payload.customDomainStatus = 'pending';
    }

    const updated = await CompanyService.update(companyId, payload);
    return apiSuccess(updated, 'Custom domain requested successfully');
  } catch (error) {
    console.error('Me update failed:', error);
    const message = error instanceof Error ? error.message : 'Update failed';
    return apiError(message, 400);
  }
}
