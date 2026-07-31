import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { NotificationService } from '@/server/services/notification.service';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const { notifications } = await NotificationService.getByUser(auth.userId, 1, 50);
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

    const body = (await parseBody(request)) as { id?: string };
    
    if (body.id) {
      await NotificationService.markAsRead(body.id);
    } else {
      await NotificationService.markAllAsRead(auth.userId);
    }

    return apiSuccess({ message: 'Notifications updated' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update notifications';
    return apiError(message, 400);
  }
}
