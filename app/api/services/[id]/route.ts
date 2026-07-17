import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { ServiceService } from '@/server/services/service.service';
import { apiSuccess, apiError } from '@/server/utils/api-response';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    const result = await ServiceService.delete(id);
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return apiError(message, 400);
  }
}
