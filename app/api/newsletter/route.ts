import { NextRequest } from 'next/server';
import { z } from 'zod';
import pool from '@/lib/db';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { apiError, apiSuccess } from '@/server/utils/api-response';
import { requireAuth } from '@/server/middleware/auth';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';

const subscribeSchema = z.object({
  companyId: z.string().min(1),
  email: z.string().trim().email().max(254),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const [subscribers] = await pool.execute<RowDataPacket[]>(
      'SELECT email, createdAt FROM newsletter_subscribers WHERE companyId = ? AND isActive = 1 ORDER BY createdAt DESC LIMIT 500',
      [auth.companyId]
    );

    return apiSuccess(subscribers);
  } catch {
    return apiError('Could not load subscribers', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`newsletter-${ip}`, 10, 10 * 60 * 1000).success) {
      return apiError('Too many attempts. Please try again later.', 429);
    }

    const { companyId, email } = subscribeSchema.parse(await request.json());

    const [companies] = await pool.execute<RowDataPacket[]>('SELECT id FROM companies WHERE id = ? AND status = "approved"', [companyId]);
    if (companies.length === 0) return apiError('Company not found', 404);

    const normalizedEmail = email.toLowerCase();
    const [existing] = await pool.execute<RowDataPacket[]>('SELECT id FROM newsletter_subscribers WHERE companyId = ? AND email = ?', [companyId, normalizedEmail]);

    if (existing.length > 0) {
      await pool.execute('UPDATE newsletter_subscribers SET isActive = 1 WHERE id = ?', [existing[0].id]);
    } else {
      await pool.execute('INSERT INTO newsletter_subscribers (id, companyId, email, isActive) VALUES (?, ?, ?, 1)', [crypto.randomUUID(), companyId, normalizedEmail]);
    }

    return apiSuccess(null, 'You are subscribed successfully');
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || 'Enter a valid email address'
        : 'Could not subscribe right now';
    return apiError(message, 400);
  }
}
