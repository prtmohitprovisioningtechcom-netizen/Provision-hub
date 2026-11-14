'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  CreditCard,
  CalendarCheck2,
  FileCheck2,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  QrCode,
  ShieldCheck,
  Building2,
  Bus,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('sch_admin_me');
      if (cached) {
        setSchoolData(JSON.parse(cached));
        setLoading(false);
      }
    } catch {}
    fetchSchoolMe();
  }, []);

  const fetchSchoolMe = async () => {
    try {
      const res = await fetch('/api/school-erp/auth');
      const data = await res.json();
      if (res.ok && data.success && data.data?.school) {
        setSchoolData(data.data.school);
        try {
          sessionStorage.setItem('sch_admin_me', JSON.stringify(data.data.school));
        } catch {}
      } else {
        router.push('/school-management-software/login');
      }
    } catch {
      router.push('/school-management-software/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/school-erp/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    toast.success('Logged out successfully');
    window.location.href = '/school-management-software/login';
  };

  const navItems = [
    { label: 'Overview', href: '/school-admin', icon: LayoutDashboard },
    { label: 'Students', href: '/school-admin/students', icon: Users },
    { label: 'Teachers & Staff', href: '/school-admin/teachers', icon: GraduationCap },
    { label: 'Academic Setup', href: '/school-admin/academic', icon: School },
    { label: 'Fees & Billing', href: '/school-admin/fees', icon: CreditCard },
    { label: 'Bus & Transport', href: '/school-admin/transport', icon: Bus },
    { label: 'Attendance', href: '/school-admin/attendance', icon: CalendarCheck2 },
    { label: 'Examinations', href: '/school-admin/exams', icon: FileCheck2 },
    { label: '3-Design Marksheets', href: '/school-admin/marksheets', icon: Award, highlight: true },
    { label: 'Certificates (TC)', href: '/school-admin/certificates', icon: ShieldCheck },
    { label: 'School Settings', href: '/school-admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row text-slate-900 dark:text-slate-100">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* School Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <School className="h-5 w-5" />
            </div>
            <div className="truncate">
              <span className="block font-black text-sm text-slate-900 dark:text-white truncate">
                {schoolData?.name || 'School Campus'}
              </span>
              <span className="block text-[10px] text-slate-400 font-mono">
                {schoolData?.schoolCode || 'School ERP'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/school-admin'
                ? pathname === '/school-admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : item.highlight
                    ? 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    Pro
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <Link
            href="/school-management-software"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>Public School Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Academic Session:</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
                {schoolData?.currentSession || '2026-2027'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Campus Active ({schoolData?.plan?.toUpperCase() || 'FREE TRIAL'})
            </span>

            <Link
              href="/school-admin/settings"
              className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

