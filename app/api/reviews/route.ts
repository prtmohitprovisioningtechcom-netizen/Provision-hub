import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { ReviewService } from '@/server/services/review.service';
import { reviewSchema } from '@/lib/validators';
import { apiSuccess, apiError, apiPaginated, parseBody } from '@/server/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const page = Number(searchParams.get('page')) || 1;
    const status = searchParams.get('status') || undefined;

    if (!companyId) return apiError('Company ID required', 400);
    const result = await ReviewService.getByCompany(companyId, page, 20, status);
    return apiPaginated(result.reviews, result.pagination);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get reviews';
    return apiError(message, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = await parseBody(request);
    const data = reviewSchema.parse(body);
    const review = await ReviewService.create({
      ...data,
      userId: auth.userId,
      customerName: (body as { customerName?: string }).customerName || 'Anonymous',
    });
    return apiSuccess(review, 'Review submitted', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create review';
    return apiError(message, 400);
  }
}
