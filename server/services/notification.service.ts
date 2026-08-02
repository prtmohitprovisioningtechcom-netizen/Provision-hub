// @ts-nocheck
import pool from '@/lib/db';
import { getPaginationMeta, sqlLimitOffset } from '@/lib/utils';
import { RowDataPacket } from 'mysql2';

export class NotificationService {
  static async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [[countResult], [unreadResult], [notifications]] = await Promise.all([
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM notifications WHERE userId = ?', [userId]),
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0', [userId]),
      pool.execute<RowDataPacket[]>(
        `SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC ${sqlLimitOffset(limit, skip)}`,
        [userId],
      ),
    ]);

    const total = countResult[0].count;
    const unreadCount = unreadResult[0].count;

    return { 
      notifications: notifications.map(n => ({ ...n, _id: n.id, isRead: Boolean(n.isRead) })), 
      unreadCount, 
      pagination: getPaginationMeta(page, limit, total) 
    };
  }

  static async markAsRead(id: string) {
    await pool.execute('UPDATE notifications SET isRead = 1 WHERE id = ?', [id]);
    return { message: 'Marked as read' };
  }

  static async markAllAsRead(userId: string) {
    await pool.execute('UPDATE notifications SET isRead = 1 WHERE userId = ? AND isRead = 0', [userId]);
    return { message: 'All marked as read' };
  }
}
