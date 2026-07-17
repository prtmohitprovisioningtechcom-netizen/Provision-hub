import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { ProductService } from '@/server/services/product.service';
import { productSchema } from '@/lib/validators';
import { apiSuccess, apiError, apiPaginated, parseBody } from '@/server/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    if (!companyId) return apiError('Company ID required', 400);
    const result = await ProductService.getByCompany(companyId, page, limit);
    return apiPaginated(result.products, result.pagination);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get products';
    return apiError(message, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const body = await parseBody(request);
    const data = productSchema.parse(body);
    const product = await ProductService.create(auth.companyId, data);
    return apiSuccess(product, 'Product created', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return apiError(message, 400);
  }
}
