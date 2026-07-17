import Notification from '@/models/Notification';
import { connectDB } from '@/lib/mongodb';
import { getPaginationMeta } from '@/lib/utils';

export class NotificationService {
  static async getByUser(userId: string, page = 1, limit = 20) {
    await connectDB();
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false }),
    ]);
    return { notifications, unreadCount, pagination: getPaginationMeta(page, limit, total) };
  }

  static async markAsRead(id: string) {
    await connectDB();
    await Notification.findByIdAndUpdate(id, { isRead: true });
    return { message: 'Marked as read' };
  }

  static async markAllAsRead(userId: string) {
    await connectDB();
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return { message: 'All marked as read' };
  }
}
