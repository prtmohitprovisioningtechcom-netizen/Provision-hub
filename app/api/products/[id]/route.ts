import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { ProductService } from '@/server/services/product.service';
import { productSchema } from '@/lib/validators';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    const body = await parseBody(request);
    const data = productSchema.partial().parse(body);
    const product = await ProductService.update(id, data);
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

    const { id } = await params;
    const result = await ProductService.delete(id);
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return apiError(message, 400);
  }
}
