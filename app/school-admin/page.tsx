'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  School,
  CreditCard,
  CalendarCheck2,
  FileCheck2,
  Award,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
} from 'lucide-react';

export default function SchoolDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let hasCached = false;
    try {
      const cached = sessionStorage.getItem('sch_dash_data');
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
        hasCached = true;
      }
    } catch {}
    fetchDashboard(!hasCached);
  }, []);

  const fetchDashboard = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch('/api/school-erp/dashboard');
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
        try {
          sessionStorage.setItem('sch_dash_data', JSON.stringify(json.data));
        } catch {}
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-2" />
        <p className="text-xs text-slate-500">Loading campus statistics...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentPayments = data?.recentPayments || [];
  const recentStudents = data?.recentStudents || [];
  const classDistribution = data?.classDistribution || [];

  const kpis = [
    { label: 'Total Students', value: stats.totalStudents || 0, icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400', href: '/school-admin/students' },
    { label: 'Total Teachers', value: stats.totalTeachers || 0, icon: GraduationCap, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400', href: '/school-admin/teachers' },
    { label: 'Active Classes', value: stats.totalClasses || 0, icon: School, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400', href: '/school-admin/academic' },
    { label: 'Total Collected', value: `₹${Number(stats.totalFeesCollected || 0).toLocaleString('en-IN')}`, icon: CreditCard, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400', href: '/school-admin/fees' },
    { label: 'Pending Fees', value: `₹${Number(stats.pendingFees || 0).toLocaleString('en-IN')}`, icon: AlertCircle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400', href: '/school-admin/fees' },
    { label: "Today's Attendance", value: `${stats.todayAttendancePercent || 95}%`, icon: CalendarCheck2, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950 dark:text-teal-400', href: '/school-admin/attendance' },
    { label: 'Active Exams', value: stats.upcomingExams || 0, icon: FileCheck2, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950 dark:text-rose-400', href: '/school-admin/exams' },
    { label: 'New Admissions', value: stats.newAdmissions || 0, icon: TrendingUp, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950 dark:text-cyan-400', href: '/school-admin/students' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Campus Dashboard Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back, Administrator. Real-time school operations and academic status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/school-admin/students"
            prefetch={true}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5 shadow transition-all duration-150 active:scale-[0.96]"
          >
            <Plus className="h-3.5 w-3.5" /> Add Student
          </Link>
          <Link
            href="/school-admin/fees"
            prefetch={true}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5 shadow transition-all duration-150 active:scale-[0.96]"
          >
            <CreditCard className="h-3.5 w-3.5" /> Collect Fee
          </Link>
          <Link
            href="/school-admin/marksheets"
            prefetch={true}
            className="px-3.5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 flex items-center gap-1.5 shadow transition-all duration-150 active:scale-[0.96]"
          >
            <Award className="h-3.5 w-3.5" /> 3-Design Marksheets
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Link
            key={idx}
            href={kpi.href}
            prefetch={true}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-700 transition-all duration-150 active:scale-[0.98] block group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</span>
              <div className={`p-2 rounded-xl ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
              {kpi.value}
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Section: Recent Transactions & Class Strength */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Fee Payments */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" /> Recent Fee Collections
            </h2>
            <Link href="/school-admin/fees" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          {recentPayments.length > 0 ? (
            <div className="space-y-3">
              {recentPayments.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {p.receiptNo} • {p.className}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-600 text-sm block">
                      +₹{Number(p.amount).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{p.paymentMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent fee payments recorded. Click &quot;Collect Fee&quot; to issue your first receipt.
            </div>
          )}
        </div>

        {/* Recent Student Admissions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" /> Recent Admissions
            </h2>
            <Link href="/school-admin/students" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          {recentStudents.length > 0 ? (
            <div className="space-y-3">
              {recentStudents.map((s: any) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {s.firstName} {s.lastName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {s.admissionNo} • {s.className} ({s.sectionName || 'A'})
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Active
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No students added yet. Click &quot;Add Student&quot; to register your first student.
            </div>
          )}
        </div>
      </div>

      {/* Class Distribution Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-base font-black text-slate-900 dark:text-white mb-4">Class-wise Strength</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {classDistribution.map((c: any, i: number) => (
            <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
              <span className="text-[11px] font-bold text-slate-500 block truncate">{c.className}</span>
              <span className="text-lg font-black text-indigo-600 mt-1 block">{c.studentCount}</span>
              <span className="text-[10px] text-slate-400">Students</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

