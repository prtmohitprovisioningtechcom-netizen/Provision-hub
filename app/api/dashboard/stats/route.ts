import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { CompanyService } from '@/server/services/company.service';
import { apiSuccess, apiError } from '@/server/utils/api-response';
import { dbErrorMessage } from '@/lib/db-errors';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const stats = await CompanyService.getDashboardStats(auth.companyId);
    return apiSuccess(stats);
  } catch (error) {
    console.error('Dashboard stats failed:', error);
    return apiError(dbErrorMessage(error, 'Failed to get stats'), 500);
  }
}
