'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Bell, CheckCheck } from 'lucide-react';
import { INotification, NotificationType } from '@/types';
import { formatDate } from '@/lib/utils';
import { useCompany } from '@/hooks/useCompany';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import axios from '@/services/api';

const typeIcons: Record<NotificationType, string> = {
  new_lead: 'bg-blue-100 text-blue-600',
  new_review: 'bg-yellow-100 text-yellow-600',
  new_login: 'bg-purple-100 text-purple-600',
  subscription_expiry: 'bg-red-100 text-red-600',
  system_update: 'bg-gray-100 text-gray-600',
  verification: 'bg-green-100 text-green-600',
};

export default function NotificationsPage() {
  const { user } = useCompany();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    
    axios.get('/api/dashboard/notifications')
      .then((res) => {
        if (res.data.success && res.data.data) {
          setNotifications(res.data.data);
        }
      })
      .catch((err) => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, [user?._id]);

  const markAsRead = async (id: string) => {
    try {
      await axios.patch('/api/dashboard/notifications', { id });
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const markAllRead = async () => {
    try {
      await axios.patch('/api/dashboard/notifications', {});
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unreadCount ? `${unreadCount} unread` : 'All caught up'}
        action={
          unreadCount > 0 ? (
            <Button variant="outline" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : notifications.length ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    'flex items-start gap-4 rounded-lg border p-4 transition-colors',
                    notification.isRead
                      ? 'border-gray-100 dark:border-gray-800 opacity-70'
                      : 'border-indigo-100 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      typeIcons[notification.type],
                    )}
                  >
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(notification.createdAt)}</p>
                  </div>
                  {!notification.isRead && (
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(notification._id)}>
                      Mark read
                    </Button>
                  )}
                  {notification.link && (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={notification.link}
                        onClick={() => {
                          if (!notification.isRead) void markAsRead(notification._id);
                        }}
                      >
                        View
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You're all caught up! New alerts will appear here."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
