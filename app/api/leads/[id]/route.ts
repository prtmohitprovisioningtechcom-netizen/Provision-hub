import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { LeadService } from '@/server/services/lead.service';
import { apiSuccess, apiError } from '@/server/utils/api-response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    const { status } = await request.json();
    const lead = await LeadService.updateStatus(id, status);
    return apiSuccess(lead, 'Lead updated');
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

    const { id } = await params;
    const result = await LeadService.delete(id);
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return apiError(message, 400);
  }
}
