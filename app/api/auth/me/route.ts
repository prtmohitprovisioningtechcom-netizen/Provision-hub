import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/middleware/auth';
import { AuthService } from '@/server/services/auth.service';
import { apiSuccess, apiError } from '@/server/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return apiSuccess(null);
    }

    const user = await AuthService.getMe(auth.userId);
    return apiSuccess(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user';
    return apiError(message, 400);
  }
}
