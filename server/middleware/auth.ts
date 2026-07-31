import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { AuthPayload, UserRole } from '@/types';
import { apiError } from '@/server/utils/api-response';
import { RowDataPacket } from 'mysql2';

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return request.cookies.get('auth-token')?.value || null;
}

/** Resolve company id from users.companyId or companies.ownerId, and backfill when needed. */
export async function resolveCompanyIdForUser(
  userId: string,
  tokenCompanyId?: string | null,
): Promise<string | undefined> {
  if (tokenCompanyId) return tokenCompanyId;

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(u.companyId, c.id) AS companyId
     FROM users u
     LEFT JOIN companies c ON c.ownerId = u.id
     WHERE u.id = ?
     LIMIT 1`,
    [userId],
  );

  const companyId = rows[0]?.companyId as string | null | undefined;
  if (!companyId) return undefined;

  await pool.execute(
    'UPDATE users SET companyId = ? WHERE id = ? AND (companyId IS NULL OR companyId = "")',
    [companyId, userId],
  );

  return companyId;
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

  if (!user.companyId && user.role === 'company_admin') {
    const companyId = await resolveCompanyIdForUser(user.userId, user.companyId);
    if (companyId) {
      return { ...user, companyId };
    }
  }

  return user;
}
