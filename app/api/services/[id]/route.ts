import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { ServiceService } from '@/server/services/service.service';
import { apiSuccess, apiError } from '@/server/utils/api-response';
import { revalidateCompanyPage } from '@/lib/revalidate-company';
import { serviceSchema } from '@/lib/validators';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const { id } = await params;
    const existing = await ServiceService.getById(id);
    if (existing.companyId.toString() !== auth.companyId) {
      return apiError('Service not found', 404);
    }

    const data = serviceSchema.parse(await request.json());
    const service = await ServiceService.update(id, data);
    await revalidateCompanyPage(auth.companyId);
    return apiSuccess(service, 'Service updated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return apiError(message, 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const { id } = await params;
    const existing = await ServiceService.getById(id);
    if (existing.companyId.toString() !== auth.companyId) {
      return apiError('Service not found', 404);
    }
    const result = await ServiceService.delete(id);
    await revalidateCompanyPage(auth.companyId);
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return apiError(message, 400);
  }
}
