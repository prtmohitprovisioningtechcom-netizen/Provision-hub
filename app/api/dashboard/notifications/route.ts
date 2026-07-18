import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    await connectDB();
    const notifications = await Notification.find({ userId: auth.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    return apiSuccess(notifications);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get notifications';
    return apiError(message, 400);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = await parseBody(request);
    await connectDB();

    if (body.id) {
      // Mark specific notification as read
      await Notification.findOneAndUpdate(
        { _id: body.id, userId: auth.userId },
        { isRead: true }
      );
    } else {
      // Mark all as read
      await Notification.updateMany(
        { userId: auth.userId, isRead: false },
        { isRead: true }
      );
    }

    return apiSuccess({ message: 'Notifications updated' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update notifications';
    return apiError(message, 400);
  }
}
