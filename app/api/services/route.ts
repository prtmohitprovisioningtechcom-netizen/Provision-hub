import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { ServiceService } from '@/server/services/service.service';
import { serviceSchema } from '@/lib/validators';
import { apiSuccess, apiError, apiPaginated, parseBody } from '@/server/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    if (!companyId) return apiError('Company ID required', 400);
    const result = await ServiceService.getByCompany(companyId, page, limit);
    return apiPaginated(result.services, result.pagination);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get services';
    return apiError(message, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const body = await parseBody(request);
    const data = serviceSchema.parse(body);
    const service = await ServiceService.create(auth.companyId, data);
    return apiSuccess(service, 'Service created', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create service';
    return apiError(message, 400);
  }
}
