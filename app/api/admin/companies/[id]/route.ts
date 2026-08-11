import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { CompanyService } from '@/server/services/company.service';
import { apiSuccess, apiError } from '@/server/utils/api-response';
import { hashPassword } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    const body = await request.json();
    
    if (body.customDomainStatus) {
      const company = await CompanyService.update(id, { customDomainStatus: body.customDomainStatus });
      return apiSuccess(company, `Domain marked as ${body.customDomainStatus}`);
    }

    if (body.status) {
      const company = await CompanyService.updateStatus(id, body.status);
      return apiSuccess(company, `Company ${body.status}`);
    }

    if (body.password) {
      const hashedPassword = await hashPassword(body.password);
      await CompanyService.updateOwnerPassword(id, hashedPassword);
      return apiSuccess({ success: true }, 'Owner password updated successfully');
    }
    
    return apiError('No valid status provided', 400);
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
