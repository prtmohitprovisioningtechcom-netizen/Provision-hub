import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { comparePassword, hashPassword } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

async function getUserRow(userId: string) {
  const [users] = await pool.execute<RowDataPacket[]>(
    'SELECT id as _id, name, email, phone, role, avatar, isEmailVerified, companyId, createdAt, updatedAt FROM users WHERE id = ?',
    [userId],
  );
  if (users.length === 0) return null;
  return { ...users[0], isEmailVerified: Boolean(users[0].isEmailVerified) };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const user = await getUserRow(auth.userId);
    if (!user) return apiError('User not found', 404);
    return apiSuccess(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load profile';
    return apiError(message, 400);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = await parseBody(request);
    const {
      name,
      phone,
      avatar,
      currentPassword,
      newPassword,
    } = body as {
      name?: string;
      phone?: string;
      avatar?: string | null;
      currentPassword?: string;
      newPassword?: string;
    };

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return apiError('Current and new password are required', 400);
      }
      if (newPassword.length < 6) {
        return apiError('New password must be at least 6 characters', 400);
      }

      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT password FROM users WHERE id = ?',
        [auth.userId],
      );
      if (rows.length === 0) return apiError('User not found', 404);

      const valid = await comparePassword(currentPassword, rows[0].password);
      if (!valid) return apiError('Current password is incorrect', 400);

      const hashed = await hashPassword(newPassword);
      await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, auth.userId]);
    }

    const updateData: Record<string, string | null> = {};
    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) return apiError('Name is required', 400);
      updateData.name = trimmed;
    }
    if (phone !== undefined) updateData.phone = String(phone).trim() || null;
    if (avatar !== undefined) updateData.avatar = avatar ? String(avatar) : null;

    if (Object.keys(updateData).length > 0) {
      const keys = Object.keys(updateData);
      const setClause = keys.map((k) => `${k} = ?`).join(', ');
      const params = keys.map((k) => updateData[k]);
      params.push(auth.userId);
      await pool.execute(`UPDATE users SET ${setClause} WHERE id = ?`, params);
    }

    const user = await getUserRow(auth.userId);
    if (!user) return apiError('User not found', 404);

    return apiSuccess(
      user,
      currentPassword ? 'Password updated' : 'Profile updated',
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return apiError(message, 400);
  }
}
