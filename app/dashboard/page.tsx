'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Wrench, Users, Star, TrendingUp, Globe, Receipt, BookOpen, ArrowRight } from 'lucide-react';
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
      .then((res) => {
        if (res.data?.success) setData(res.data.data);
      })
      .catch((err) => {
        // Avoid noisy console AxiosError for expected auth/company edge cases
        if (err?.response?.status !== 400 && err?.response?.status !== 401) {
          console.error(err);
        }
      })
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
            <Link href={`/${companySlug}`} target="_blank">
              <Globe className="mr-2 h-4 w-4" />
              View Full Landing Page
            </Link>
          </Button>
        )}
      </div>

      {/* Quick Launch: Vyapari Daily Software Suite */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/60 dark:via-gray-900 dark:to-purple-950/40 p-5 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 text-[10px] font-extrabold uppercase mb-1">
                Daily Shop Software #1
              </span>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                🧾 GST / Non-GST Billing & Invoice Software
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                1-Click me customer ka Pukka Bill banayein, Paid/Unpaid record save rakhein, PDF print karein ya WhatsApp par bill bhejein.
              </p>
            </div>
          </div>
          <Button asChild className="w-full sm:w-fit rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
            <Link href="/dashboard/billing">
              Open Billing Software <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/60 dark:via-gray-900 dark:to-teal-950/40 p-5 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold uppercase mb-1">
                Daily Shop Software #2
              </span>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                📒 Digital Bahi-Khata / Udhaar Software
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                KhataBook style me grahakon ka Udhaar (Maine Diya) aur Jama (Mujhe Mila) likhein aur 1-Click me WhatsApp Payment Reminder bhejein.
              </p>
            </div>
          </div>
          <Button asChild className="w-full sm:w-fit rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
            <Link href="/dashboard/khata">
              Open Digital Bahi-Khata <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
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
