import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { AdminService } from '@/server/services/admin.service';
import { CompanyService } from '@/server/services/company.service';
import { CompanyStatus } from '@/types';
import { apiSuccess, apiError, apiPaginated } from '@/server/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'dashboard') {
      const stats = await AdminService.getDashboardStats();
      return apiSuccess(stats);
    }

    if (type === 'users') {
      const page = Number(searchParams.get('page')) || 1;
      const result = await AdminService.getUsers(page);
      return apiSuccess(result);
    }

    const page = Number(searchParams.get('page')) || 1;
    const status = searchParams.get('status') as CompanyStatus | null;
    const result = await CompanyService.getAllForAdmin(page, 20, status || undefined);
    return apiPaginated(result.companies, result.pagination);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Admin request failed';
    return apiError(message, 400);
  }
}
