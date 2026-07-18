'use client';

import { useEffect, useState } from 'react';
import { Download, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/newsletter')
      .then(({ data }) => {
        if (data.success) setSubscribers(data.data || []);
      })
      .catch(() => toast.error('Could not load subscribers'))
      .finally(() => setLoading(false));
  }, []);

  const exportCsv = () => {
    const rows = [
      ['Email', 'Subscribed At'],
      ...subscribers.map((subscriber) => [
        subscriber.email,
        new Date(subscriber.createdAt).toISOString(),
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'newsletter-subscribers.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Newsletter Subscribers"
        description={`${subscribers.length} active subscriber${subscribers.length === 1 ? '' : 's'}`}
        action={
          subscribers.length ? (
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          ) : undefined
        }
      />
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-14 w-full" />
              ))}
            </div>
          ) : subscribers.length ? (
            <div className="divide-y dark:divide-gray-800">
              {subscribers.map((subscriber) => (
                <div
                  key={subscriber._id}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{subscriber.email}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(subscriber.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Mail}
              title="No subscribers yet"
              description="Subscribers from your landing page newsletter form will appear here."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
