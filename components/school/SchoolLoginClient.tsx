'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { School, Mail, Lock, ArrowRight, ArrowLeft, Loader2, Sparkles, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export function SchoolLoginClient() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Please enter email/phone and password');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Signing in to school portal...');

    try {
      const res = await fetch('/api/school-erp/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          identifier: identifier.trim(),
          password,
          schoolCode: schoolCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid credentials');
      }

      toast.success('Login successful! Redirecting...', { id: toastId });
      router.push(data.data?.redirectUrl || '/school-admin');
    } catch (err: any) {
      toast.error(err.message || 'Login failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center justify-between text-xs text-slate-500">
        <Link href="/school-management-software" className="hover:text-indigo-600 flex items-center gap-1 font-bold">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to School ERP
        </Link>
        <Link href="/school-management-software/portal" className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> Student / Parent Portal
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center mb-4">
            <School className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">School Admin Login</h1>
          <p className="mt-1 text-xs text-slate-500">
            Sign in to access your school dashboard, students, fee records, and marksheets.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Admin Email or Mobile *
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@school.com or 9876543210"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              School Code (Optional)
            </label>
            <input
              type="text"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
              placeholder="e.g. SCH-48912"
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
              </>
            ) : (
              <>
                Access School Dashboard <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          <span>Need to register a new school? </span>
          <Link
            href="/school-management-software/register"
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            Start 14-Day Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}

