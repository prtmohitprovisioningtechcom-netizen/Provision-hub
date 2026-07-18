'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { MessageSquare, Mail, Phone, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { ILead } from '@/types';

export default function MessagesPage() {
  const [messages, setMessages] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const { data } = await axios.get('/api/leads');
        if (data.success) {
          setMessages(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Customer messages and inquiries from your Contact Form."
      />

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : messages.length ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={cn(
                    'rounded-xl border p-5 transition-shadow hover:shadow-md',
                    message.status === 'new'
                      ? 'border-indigo-100 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-900/10'
                      : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950',
                  )}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {message.customerName}
                        </h3>
                        {message.status === 'new' && (
                          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                            New
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        {message.email && (
                          <a href={`mailto:${message.email}`} className="flex items-center gap-1.5 hover:text-indigo-600">
                            <Mail className="h-4 w-4" />
                            {message.email}
                          </a>
                        )}
                        {message.phone && (
                          <a href={`tel:${message.phone}`} className="flex items-center gap-1.5 hover:text-indigo-600">
                            <Phone className="h-4 w-4" />
                            {message.phone}
                          </a>
                        )}
                      </div>
                      
                      {message.interestedService && (
                        <p className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          Interested in: {message.interestedService}
                        </p>
                      )}
                      
                      {message.message && (
                        <div className="mt-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                          {message.message}
                        </div>
                      )}
                    </div>
                    
                    <span className="whitespace-nowrap text-xs font-medium text-gray-400">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description="When customers fill out your website's contact form, their messages will appear here."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
