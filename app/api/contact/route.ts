import { NextRequest } from 'next/server';
import { contactSchema } from '@/lib/validators';
import pool from '@/lib/db';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { apiError, apiSuccess } from '@/server/utils/api-response';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`contact-${ip}`, 5, 10 * 60 * 1000);
    if (!limit.success) {
      return apiError('Too many messages. Please try again later.', 429);
    }

    const body = contactSchema.parse(await request.json());
    
    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO contact_messages (id, name, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, body.name, body.email, body.subject, body.message, 'new']
    );

    return apiSuccess(null, 'Message sent successfully', 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to send message';
    return apiError(message, 400);
  }
}
