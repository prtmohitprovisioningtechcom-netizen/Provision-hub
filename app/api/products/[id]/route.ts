import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { ProductService } from '@/server/services/product.service';
import { productSchema } from '@/lib/validators';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { revalidateCompanyPage } from '@/lib/revalidate-company';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const { id } = await params;
    const existing = await ProductService.getById(id);
    if (existing.companyId.toString() !== auth.companyId) {
      return apiError('Product not found', 404);
    }
    const body = await parseBody(request);
    const data = productSchema.partial().parse(body);
    const product = await ProductService.update(id, data);
    await revalidateCompanyPage(auth.companyId);
    return apiSuccess(product, 'Product updated');
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
    const existing = await ProductService.getById(id);
    if (existing.companyId.toString() !== auth.companyId) {
      return apiError('Product not found', 404);
    }
    const result = await ProductService.delete(id);
    await revalidateCompanyPage(auth.companyId);
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return apiError(message, 400);
  }
}
