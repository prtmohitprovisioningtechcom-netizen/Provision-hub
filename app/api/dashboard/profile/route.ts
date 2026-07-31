import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = await parseBody(request);
    
    const { name, phone } = body as { name?: string, phone?: string };

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    if (Object.keys(updateData).length > 0) {
      const keys = Object.keys(updateData);
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const params = keys.map(k => updateData[k]);
      params.push(auth.userId);

      await pool.execute(`UPDATE users SET ${setClause} WHERE id = ?`, params);
    }

    const [users] = await pool.execute<RowDataPacket[]>('SELECT id as _id, name, email, phone, role, avatar, isEmailVerified, companyId, createdAt, updatedAt FROM users WHERE id = ?', [auth.userId]);
    
    if (users.length === 0) {
      return apiError('User not found', 404);
    }

    return apiSuccess({ ...users[0], isEmailVerified: Boolean(users[0].isEmailVerified) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return apiError(message, 400);
  }
}
