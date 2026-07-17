'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import axios from 'axios';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Building2, Clock, MessageSquare, Star, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AdminDashboardData {
  stats: {
    totalUsers: number;
    totalCompanies: number;
    pendingCompanies: number;
    totalLeads: number;
    totalReviews: number;
  };
  recentCompanies: Array<{
    _id: string;
    name: string;
    slug: string;
    status: string;
    createdAt: string;
  }>;
  companiesByCategory: Array<{ _id: string; count: number }>;
}

const statConfig = [
  { key: 'totalUsers' as const, label: 'Total Users', icon: Users, color: 'text-blue-600' },
  { key: 'totalCompanies' as const, label: 'Total Companies', icon: Building2, color: 'text-purple-600' },
  { key: 'pendingCompanies' as const, label: 'Pending Approval', icon: Clock, color: 'text-orange-600' },
  { key: 'totalLeads' as const, label: 'Total Leads', icon: MessageSquare, color: 'text-green-600' },
  { key: 'totalReviews' as const, label: 'Total Reviews', icon: Star, color: 'text-yellow-600' },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/admin?type=dashboard')
      .then((res) => setData(res.data.data))
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) return;
        console.error(error);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500">Platform overview and recent activity</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statConfig.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-6">
                {loading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold">{data?.stats[stat.key] ?? 0}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Companies</CardTitle>
            <Link href="/admin/companies" className="text-sm text-indigo-600 flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data?.recentCompanies?.length ? (
              <div className="space-y-4">
                {data.recentCompanies.map((company) => (
                  <div
                    key={company._id}
                    className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-xs text-gray-400">{formatDate(company.createdAt)}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full capitalize ${
                        company.status === 'approved'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : company.status === 'pending'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {company.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No companies yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Companies by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data?.companiesByCategory?.length ? (
              <div className="space-y-3">
                {data.companiesByCategory.map((cat) => (
                  <div key={cat._id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat._id || 'Uncategorized'}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(100, (cat.count / (data.stats.totalCompanies || 1)) * 100)}%`,
                          }}
                          className="h-full bg-indigo-500 rounded-full"
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-6 text-right">{cat.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No category data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
