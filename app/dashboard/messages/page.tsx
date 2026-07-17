'use client';

import { MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const PLACEHOLDER_MESSAGES = [
  {
    _id: '1',
    senderName: 'Sarah Johnson',
    subject: 'Partnership Inquiry',
    content: 'Hi, I am interested in partnering with your company for an upcoming project.',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    senderName: 'Mike Chen',
    subject: 'Product Question',
    content: 'Could you provide more details about your premium service package?',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    _id: '3',
    senderName: 'Emily Davis',
    subject: 'Follow Up',
    content: 'Thank you for the quick response on my previous enquiry. I would like to schedule a call.',
    isRead: true,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
];

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Customer messages and inquiries"
      />

      <Card>
        <CardContent className="p-6">
          {PLACEHOLDER_MESSAGES.length ? (
            <div className="space-y-3">
              {PLACEHOLDER_MESSAGES.map((message) => (
                <div
                  key={message._id}
                  className={cn(
                    'rounded-lg border p-4',
                    message.isRead
                      ? 'border-gray-100 dark:border-gray-800'
                      : 'border-indigo-100 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{message.subject}</p>
                      <p className="text-sm text-gray-500">From {message.senderName}</p>
                    </div>
                    {!message.isRead && (
                      <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message.content}</p>
                  <p className="mt-2 text-xs text-gray-400">{formatDate(message.createdAt)}</p>
                </div>
              ))}
              <p className="pt-4 text-center text-xs text-gray-400">
                Placeholder messages — messaging API integration coming soon
              </p>
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description="Customer messages will appear here."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
