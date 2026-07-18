import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = await parseBody(request);
    await connectDB();

    const { name, phone } = body as { name?: string, phone?: string };

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
      auth.userId,
      updateData,
      { new: true }
    ).select('-password').lean();

    if (!user) {
      return apiError('User not found', 404);
    }

    return apiSuccess(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return apiError(message, 400);
  }
}
