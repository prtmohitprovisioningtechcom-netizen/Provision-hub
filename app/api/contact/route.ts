import { NextRequest } from 'next/server';
import { contactSchema } from '@/lib/validators';
import { connectDB } from '@/lib/mongodb';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import ContactMessage from '@/models/ContactMessage';
import { apiError, apiSuccess } from '@/server/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`contact-${ip}`, 5, 10 * 60 * 1000);
    if (!limit.success) {
      return apiError('Too many messages. Please try again later.', 429);
    }

    const body = contactSchema.parse(await request.json());
    await connectDB();
    await ContactMessage.create(body);
    return apiSuccess(null, 'Message sent successfully', 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to send message';
    return apiError(message, 400);
  }
}
