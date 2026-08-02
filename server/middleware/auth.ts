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

/** Normalize JWT / object company refs into a plain id string. */
export function coerceCompanyId(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return undefined;
    return trimmed;
  }
  if (typeof value === 'object') {
    const obj = value as { _id?: unknown; id?: unknown };
    return coerceCompanyId(obj._id ?? obj.id);
  }
  return undefined;
}

async function companyExists(companyId: string): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM companies WHERE id = ? LIMIT 1',
    [companyId],
  );
  return rows.length > 0;
}

/** Resolve company id from users.companyId or companies.ownerId, and backfill when needed. */
export async function resolveCompanyIdForUser(
  userId: string,
  tokenCompanyId?: string | null,
): Promise<string | undefined> {
  const fromToken = coerceCompanyId(tokenCompanyId);
  if (fromToken && (await companyExists(fromToken))) {
    return fromToken;
  }

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(u.companyId, c.id) AS companyId
     FROM users u
     LEFT JOIN companies c ON c.ownerId = u.id
     WHERE u.id = ?
     LIMIT 1`,
    [userId],
  );

  const companyId = coerceCompanyId(rows[0]?.companyId);
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

  // Ensure user still exists in database (prevents stale token issues)
  const [users] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM users WHERE id = ?',
    [user.userId],
  );
  if (users.length === 0) {
    return apiError('Unauthorized', 401);
  }

  if (user.role === 'company_admin') {
    const resolvedCompanyId = await resolveCompanyIdForUser(user.userId, user.companyId);

    if (!resolvedCompanyId) {
      // Keep 400 so dashboard clients can show a clear "no company" state
      return apiError('No company associated', 400);
    }

    user.companyId = resolvedCompanyId;
  } else {
    // Normalize any non-string companyId from older tokens
    user.companyId = coerceCompanyId(user.companyId);
  }

  return user;
}
