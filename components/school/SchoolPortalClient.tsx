'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  CalendarCheck2,
  CreditCard,
  FileCheck2,
  LogOut,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Loader2,
  Award,
  Lock,
  Building,
  AlertCircle,
  Bus,
  Phone,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function SchoolPortalClient() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loginData, setLoginData] = useState({ admissionNo: '', phone: '', password: '', schoolCode: '' });
  const [activeTab, setActiveTab] = useState<'overview' | 'fees' | 'marksheets' | 'transport'>('overview');

  const [portalData, setPortalData] = useState<{
    student: any;
    invoices: any[];
    payments: any[];
    marksheets: any[];
    attendance: any;
  } | null>(null);

  // Check existing session
  useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    try {
      const res = await fetch('/api/school-erp/portal');
      const data = await res.json();
      if (res.ok && data.success && data.data?.student) {
        setPortalData(data.data);
        setIsLoggedIn(true);
      }
    } catch {
      // not logged in
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading('Authenticating student / parent...');

    try {
      const res = await fetch('/api/school-erp/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      toast.success('Welcome to Student Portal!', { id: toastId });
      setIsLoggedIn(true);
      fetchPortalData();
    } catch (err: any) {
      toast.error(err.message || 'Invalid login details', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/school-erp/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    setIsLoggedIn(false);
    setPortalData(null);
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-3" />
        <p className="text-sm text-slate-500">Connecting to school portal...</p>
      </div>
    );
  }

  // 1. LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isLoggedIn) {
    return (
      <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
        <div className="mb-6 flex items-center justify-between text-xs text-slate-500">
          <Link href="/school-management-software" className="hover:text-indigo-600 flex items-center gap-1 font-bold">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to School ERP
          </Link>
          <Link href="/school-management-software/login" className="text-indigo-600 font-bold hover:underline">
            School Staff Login
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400 flex items-center justify-center mb-4">
              <Users className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Parent & Student Portal</h1>
            <p className="mt-1 text-xs text-slate-500">
              Access your ward&apos;s academic performance, fees, attendance, and official term marksheets.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student Admission Number or Registered Mobile *
              </label>
              <input
                type="text"
                value={loginData.admissionNo || loginData.phone}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('ADM') || isNaN(Number(val))) {
                    setLoginData({ ...loginData, admissionNo: val, phone: '' });
                  } else {
                    setLoginData({ ...loginData, phone: val, admissionNo: '' });
                  }
                }}
                placeholder="e.g. ADM-2026-0428 or 9876543210"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="block mt-1 text-[11px] text-slate-400">
                Default password: Last 6 digits of father&apos;s phone, or 123456
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                School Code (Optional)
              </label>
              <input
                type="text"
                value={loginData.schoolCode}
                onChange={(e) => setLoginData({ ...loginData, schoolCode: e.target.value })}
                placeholder="e.g. SCH-48912"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full py-3 rounded-xl bg-cyan-600 text-white font-bold text-sm hover:bg-cyan-700 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-600/30 disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : (
                'Open Student Portal'
              )}
            </button>
          </form>

          <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-[11px] text-slate-500">
            For login assistance, contact your school administration or class teacher.
          </div>
        </div>
      </div>
    );
  }

  // 2. LOGGED IN PORTAL VIEW
  const std = portalData?.student;
  const invoices = portalData?.invoices || [];
  const marksheets = portalData?.marksheets || [];
  const attendance = portalData?.attendance || {};

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Student Portal Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center font-bold overflow-hidden shadow-inner">
            {std?.photoUrl ? (
              <img src={std.photoUrl} alt="Photo" className="h-full w-full object-cover" />
            ) : (
              <GraduationCap className="h-8 w-8" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {std?.firstName} {std?.lastName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                {std?.className} - {std?.sectionName || 'A'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Admission No: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{std?.admissionNo}</span> • School: {std?.schoolName}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Overview & Attendance
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'fees' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Fee Invoices & Receipts ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('marksheets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'marksheets' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Official Marksheets ({marksheets.length})
        </button>
        <button
          onClick={() => setActiveTab('transport')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'transport' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Bus className="h-3.5 w-3.5" /> Bus & Transport {std?.transportOpted ? '✓' : ''}
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ATTENDANCE */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <span className="text-xs uppercase font-bold text-slate-400 block mb-2">Live Attendance</span>
            <div className="text-4xl sm:text-5xl font-black text-emerald-600">{attendance.percentage || 94}%</div>
            <p className="mt-2 text-xs text-slate-500">
              {attendance.presentDays} days present out of {attendance.totalDays} academic working days.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <span className="text-xs uppercase font-bold text-slate-400 block mb-2">Fee Status</span>
            <div className="text-4xl sm:text-5xl font-black text-indigo-600">
              ₹
              {invoices
                .filter((inv) => inv.status !== 'paid')
                .reduce((acc, curr) => acc + (Number(curr.totalAmount) - Number(curr.paidAmount)), 0)}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Total pending school fees for current academic term.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <span className="text-xs uppercase font-bold text-slate-400 block mb-2">Published Marksheets</span>
            <div className="text-4xl sm:text-5xl font-black text-purple-600">{marksheets.length}</div>
            <p className="mt-2 text-xs text-slate-500">
              Authentic CBSE grade digital report cards ready to download.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: FEES & INVOICES */}
      {activeTab === 'fees' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Fee Records & Invoices</h2>
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Paid Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inv.invoiceNo}</td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{inv.title}</td>
                      <td className="py-3 px-4 font-bold">₹{inv.totalAmount}</td>
                      <td className="py-3 px-4 text-emerald-600 font-bold">₹{inv.paidAmount}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No fee invoices recorded yet.</p>
          )}
        </div>
      )}

      {/* TAB 3: MARKSHEETS */}
      {activeTab === 'marksheets' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Official Marksheets</h2>
          {marksheets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {marksheets.map((ms) => (
                <div
                  key={ms.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-indigo-600">{ms.examName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          ms.resultStatus === 'PASS' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}
                      >
                        {ms.resultStatus}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {ms.percentage}% <span className="text-xs font-bold text-emerald-600">Grade: {ms.grade}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Total: {ms.totalObtained} / {ms.totalMaxMarks} (Rank: {ms.rankInClass || '—'})
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">Code: {ms.verificationCode}</span>
                    <Link
                      href={`/verify-marksheet/${ms.verificationCode}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 shadow"
                    >
                      <Printer className="h-3.5 w-3.5" /> View / Print
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No examination marksheets published yet.</p>
          )}
        </div>
      )}

      {/* TAB 4: BUS & TRANSPORT */}
      {activeTab === 'transport' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Bus className="h-5 w-5 text-indigo-600" /> School Bus & Transport Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Live bus allocation, designated stop, and driver contact</p>
            </div>
            {std?.transportOpted && (
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Print Bus Pass
              </button>
            )}
          </div>

          {std?.transportOpted ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bus Pass Card */}
              <div className="rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 p-5 bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/30 dark:from-slate-800/80 dark:to-slate-900 relative overflow-hidden shadow-sm">
                <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                  Active Bus Pass
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Bus className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{std?.schoolName}</h3>
                    <p className="text-[11px] text-slate-500">Official Student Transport Identity</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-white/80 dark:bg-slate-800/80 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900 mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Name</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{std?.firstName} {std?.lastName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Class & Section</span>
                    <span className="font-bold text-indigo-600">{std?.className} - {std?.sectionName || 'A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Admission No</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{std?.admissionNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Bus Number</span>
                    <span className="font-bold text-amber-600">{std?.vehicleNo || 'Bus #1'}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-indigo-500" /> Route</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{std?.routeName || 'School Bus Route'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-emerald-500" /> Boarding Stop</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{std?.stopName || 'Designated Stop'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-500 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-500" /> Morning Pickup</span>
                    <span className="font-bold text-emerald-600">{std?.pickupTime || '07:30 AM'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-500 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-blue-500" /> Afternoon Drop</span>
                    <span className="font-bold text-blue-600">{std?.dropTime || '02:30 PM'}</span>
                  </div>
                </div>
              </div>

              {/* Driver & Support Contact */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider">Driver & Vehicle In-Charge</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {std?.routeDriverName || 'Authorized School Driver'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Assigned Bus: {std?.vehicleNo || 'School Bus'}</p>
                    </div>
                    {std?.routeDriverPhone || std?.busDriverPhone ? (
                      <a
                        href={`tel:${std?.routeDriverPhone || std?.busDriverPhone}`}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                      >
                        <Phone className="h-3.5 w-3.5" /> Call Driver
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Phone on file</span>
                    )}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-amber-600" /> Bus Safety & Boarding Guidelines
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-800 dark:text-amber-300">
                    <li>Please arrive at the boarding stop at least 5 minutes prior to scheduled pickup time.</li>
                    <li>Always carry the student physical bus pass or show this digital portal card when boarding.</li>
                    <li>In case of address or route change, notify the school transport office 3 days in advance.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <Bus className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No School Bus Allocated</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                This student has not opted for school transport or bus service is not currently active. If you need school bus pickup and drop facility, please contact the school transport office.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

