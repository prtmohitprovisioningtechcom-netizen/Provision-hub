import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import Company from '@/models/Company';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { apiError, apiSuccess } from '@/server/utils/api-response';
import { requireAuth } from '@/server/middleware/auth';

const subscribeSchema = z.object({
  companyId: z.string().min(1),
  email: z.string().trim().email().max(254),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    await connectDB();
    const subscribers = await NewsletterSubscriber.find({
      companyId: auth.companyId,
      isActive: true,
    })
      .select('email createdAt')
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
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
    if (!mongoose.isValidObjectId(companyId)) {
      return apiError('Invalid company', 400);
    }

    await connectDB();
    const companyExists = await Company.exists({
      _id: companyId,
      status: 'approved',
    });
    if (!companyExists) return apiError('Company not found', 404);

    await NewsletterSubscriber.findOneAndUpdate(
      { companyId, email: email.toLowerCase() },
      { $set: { isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return apiSuccess(null, 'You are subscribed successfully');
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || 'Enter a valid email address'
        : 'Could not subscribe right now';
    return apiError(message, 400);
  }
}
