import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/middleware/auth';
import { AuthService } from '@/server/services/auth.service';
import { apiSuccess, apiError } from '@/server/utils/api-response';
import { AUTH_COOKIE } from '@/lib/auth-cookie';

function loggedOut() {
  const response = apiSuccess(null);
  response.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    const auth = await authenticateRequest(request);

    // No / invalid / expired session → 200 + null (not 401)
    if (!auth?.userId) {
      return token ? loggedOut() : apiSuccess(null);
    }

    try {
      const user = await AuthService.getMe(auth.userId);
      return apiSuccess(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get user';
      // Stale cookie after DB reset / deleted user
      if (message === 'User not found') {
        return loggedOut();
      }
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user';
    console.error('GET /api/auth/me failed:', error);
    return apiError(message, 500);
  }
}
