import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { ReviewService } from '@/server/services/review.service';
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
    const review = await ReviewService.updateStatus(id, status);
    return apiSuccess(review, 'Review updated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return apiError(message, 400);
  }
}
