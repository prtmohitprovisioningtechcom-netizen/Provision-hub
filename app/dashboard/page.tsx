'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Wrench, Users, Star, TrendingUp, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCompany } from '@/hooks/useCompany';
import axios from 'axios';

interface DashboardStats {
  stats: {
    products: number;
    services: number;
    leads: number;
    reviews: number;
    newLeads: number;
  };
  recentLeads: Array<{
    _id: string;
    customerName: string;
    email: string;
    message: string;
    status: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { companySlug } = useCompany();

  useEffect(() => {
    axios
      .get('/api/dashboard/stats')
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Products', value: data?.stats.products, icon: Package, color: 'text-blue-600' },
    { label: 'Services', value: data?.stats.services, icon: Wrench, color: 'text-purple-600' },
    { label: 'Total Leads', value: data?.stats.leads, icon: Users, color: 'text-green-600' },
    { label: 'Reviews', value: data?.stats.reviews, icon: Star, color: 'text-yellow-600' },
    { label: 'New Leads', value: data?.stats.newLeads, icon: TrendingUp, color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here&apos;s your business overview.</p>
        </div>
        {companySlug && (
          <Button asChild className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Link href={`/company/${companySlug}`} target="_blank">
              <Globe className="mr-2 h-4 w-4" />
              View Full Landing Page
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              {loading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value ?? 0}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.recentLeads?.length ? (
            <div className="space-y-4">
              {data.recentLeads.map((lead) => (
                <div
                  key={lead._id}
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{lead.customerName}</p>
                    <p className="text-sm text-gray-500">{lead.email}</p>
                    <p className="text-sm text-gray-400 mt-1 truncate max-w-md">{lead.message}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No leads yet. Share your landing page to get started!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
