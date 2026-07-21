import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/middleware/auth';
import { ReviewService } from '@/server/services/review.service';
import { reviewSchema } from '@/lib/validators';
import { apiSuccess, apiError, apiPaginated, parseBody } from '@/server/utils/api-response';
import { z } from 'zod';

const publicReviewSchema = reviewSchema.extend({
  customerName: z.string().min(2, 'Name is required').max(80),
});

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
    const body = await parseBody(request);
    const data = publicReviewSchema.parse(body);
    const user = await authenticateRequest(request);

    const review = await ReviewService.create({
      companyId: data.companyId,
      rating: data.rating,
      comment: data.comment,
      images: data.images,
      userId: user?.userId,
      customerName: data.customerName.trim(),
    });
    return apiSuccess(review, 'Review submitted', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create review';
    return apiError(message, 400);
  }
}
