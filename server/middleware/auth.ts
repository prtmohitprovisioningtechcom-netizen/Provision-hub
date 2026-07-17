import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { AuthPayload, UserRole } from '@/types';
import { apiError } from '@/server/utils/api-response';

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return request.cookies.get('auth-token')?.value || null;
}

export async function authenticateRequest(request: NextRequest): Promise<AuthPayload | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return await verifyToken(token);
}

export async function requireAuth(
  request: NextRequest,
  allowedRoles?: UserRole[],
): Promise<AuthPayload | Response> {
  const user = await authenticateRequest(request);
  if (!user) {
    return apiError('Unauthorized', 401);
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return apiError('Forbidden', 403);
  }
  return user;
}
