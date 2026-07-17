'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ products: 0, services: 0, leads: 0, reviews: 0 });

  useEffect(() => {
    axios
      .get('/api/dashboard/stats')
      .then((res) => {
        if (res.data.success) setStats(res.data.data.stats);
      })
      .finally(() => setLoading(false));
  }, []);

  const barData = [
    { name: 'Products', count: stats.products },
    { name: 'Services', count: stats.services },
    { name: 'Leads', count: stats.leads },
    { name: 'Reviews', count: stats.reviews },
  ];

  const lineData = MONTHS.map((month, i) => ({
    month,
    leads: Math.max(0, Math.round(stats.leads / 6 + (i - 2) * 2)),
    views: Math.max(0, Math.round(stats.leads * 3 + i * 5)),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track your business performance"
      />

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Traffic & Leads Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <p className="mt-4 text-center text-xs text-gray-400">
                Placeholder trend data — connect analytics API for live metrics
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
