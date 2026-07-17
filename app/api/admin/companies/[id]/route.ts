import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { CompanyService } from '@/server/services/company.service';
import { apiSuccess, apiError } from '@/server/utils/api-response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    const { status } = await request.json();
    const company = await CompanyService.updateStatus(id, status);
    return apiSuccess(company, `Company ${status}`);
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
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    const result = await CompanyService.delete(id);
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return apiError(message, 400);
  }
}
