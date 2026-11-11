'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  MessageCircle,
  Phone,
  Store,
  Calendar,
  X,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Receipt,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface VyapariMerchant {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  gstNumber?: string;
  address?: string;
  isPaidPro: boolean;
  planType: 'monthly' | 'yearly' | 'free' | string;
  paymentStatus: 'paid' | 'pending' | 'unpaid';
  paymentAmount: number;
  paymentReference: string;
  paidAt: string | null;
  expiresAt: string | null;
  adminNotes: string;
  createdAt: string | null;
  totalBills: number;
  totalKhataCustomers: number;
}

interface PaymentStats {
  total: number;
  paid: number;
  pending: number;
  unpaid: number;
  totalRevenue: number;
}

export default function VyapariPaymentsAdminPage() {
  const [merchants, setMerchants] = useState<VyapariMerchant[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    paid: 0,
    pending: 0,
    unpaid: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'unpaid'>('all');

  // Modal State for Manual Activation / Mark Paid
  const [activeModalMerchant, setActiveModalMerchant] = useState<VyapariMerchant | null>(null);
  const [modalPlan, setModalPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [modalAmount, setModalAmount] = useState('199');
  const [modalRef, setModalRef] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVyapariPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(
        `/api/admin/vyapari-payments?status=${statusFilter}&search=${encodeURIComponent(search)}`,
      );
      if (res.data?.success && res.data.data) {
        setMerchants(res.data.data.merchants || []);
        setStats(
          res.data.data.stats || {
            total: 0,
            paid: 0,
            pending: 0,
            unpaid: 0,
            totalRevenue: 0,
          },
        );
      }
    } catch {
      toast.error('Failed to load vyapari payment records');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchVyapariPayments();
  }, [fetchVyapariPayments]);

  const handleOpenActivateModal = (m: VyapariMerchant) => {
    setActiveModalMerchant(m);
    const plan = m.planType === 'yearly' ? 'yearly' : 'monthly';
    setModalPlan(plan);
    setModalAmount(plan === 'yearly' ? '999' : '199');
    setModalRef(m.paymentReference || '');
    setModalNotes(m.adminNotes || '');
  };

  const handleConfirmMarkPaid = async () => {
    if (!activeModalMerchant) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/admin/vyapari-payments', {
        action: 'mark_paid',
        userId: activeModalMerchant.id,
        planType: modalPlan,
        paymentAmount: Number(modalAmount),
        paymentReference: modalRef.trim(),
        adminNotes: modalNotes.trim(),
      });
      if (res.data?.success) {
        toast.success(
          `Payment Received! ${activeModalMerchant.shopName} is now Pro Unlimited (${modalPlan.toUpperCase()}).`,
        );
        setActiveModalMerchant(null);
        await fetchVyapariPayments();
      }
    } catch {
      toast.error('Failed to activate merchant plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkUnpaid = async (m: VyapariMerchant) => {
    if (!confirm(`Are you sure you want to revoke Pro for ${m.shopName}?`)) return;
    try {
      const res = await api.post('/api/admin/vyapari-payments', {
        action: 'mark_unpaid',
        userId: m.id,
      });
      if (res.data?.success) {
        toast.success(`Marked as UNPAID for ${m.shopName}`);
        await fetchVyapariPayments();
      }
    } catch {
      toast.error('Failed to revoke plan');
    }
  };

  const buildReminderWhatsApp = (m: VyapariMerchant) => {
    const clean = (m.phone || '').replace(/\D/g, '');
    const phone = clean.length === 10 ? `91${clean}` : clean;
    const msg = `Namaste *${m.ownerName || 'Vyapari'}* ji, Bhartiyebazar Software Team ki taraf se.\n\nAapki dukan *${m.shopName}* ke 3 Free Bills poore ho gaye hain.\n\n✨ Unlimited GST/Non-GST Billing & Digital Bahi-Khata chalu rakhne ke liye apna plan activate karein:\n\n• Monthly Plan: ₹199 / Month\n• Yearly Plan: ₹999 / Year (Best Value)\n\nPayment UPI: 6397650818\nKripya pay karne ke baad screenshot bhejein. Dhanyawad! 🙏`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const buildDirectWhatsApp = (m: VyapariMerchant) => {
    const clean = (m.phone || '').replace(/\D/g, '');
    const phone = clean.length === 10 ? `91${clean}` : clean;
    const msg = `Namaste *${m.ownerName || 'Vyapari'}* ji (${m.shopName}), Bhartiyebazar Support team aapki kya madad kar sakti hai?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-bold text-indigo-300 border border-indigo-400/30 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>SuperAdmin &bull; Software Subscription Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Vyapari Software &amp; Payments
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Yahan dekhein kis vyapari ka payment aa gaya hai aur kiska baki hai. 1-Click me Pro Unlimited activate karein ya payment reminder bhejein.
            </p>
          </div>

          <Button
            type="button"
            onClick={fetchVyapariPayments}
            variant="outline"
            className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs h-10 gap-1.5 self-start md:self-auto"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-gray-500 flex items-center justify-between">
            <span>Total Shops</span>
            <Store className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {stats.total}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Registered Merchants</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
            <span>🟢 Payment Aa Gaya</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {stats.paid}
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400 mt-0.5">
            Active Paid Pro
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-300 flex items-center justify-between">
            <span>🟡 Verification Pending</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
            {stats.pending}
          </div>
          <div className="text-[11px] text-amber-600/80 dark:text-amber-400 mt-0.5">
            UTR Proof Submitted
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <span>🔴 Payment Baki</span>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
            {stats.unpaid}
          </div>
          <div className="text-[11px] text-rose-600/80 dark:text-rose-400 mt-0.5">
            Free Trial / Unpaid
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/20 p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
            <span>💰 Total Revenue</span>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-indigo-600/80 dark:text-indigo-400 mt-0.5">
            Subscription Collection
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap',
              statusFilter === 'all'
                ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xs'
                : 'text-gray-600 dark:text-gray-400',
            )}
          >
            All Merchants ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={cn(
              'px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap',
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400',
            )}
          >
            🟢 Paid Pro ({stats.paid})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={cn(
              'px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap',
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400',
            )}
          >
            🟡 Pending ({stats.pending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unpaid')}
            className={cn(
              'px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap',
              statusFilter === 'unpaid'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400',
            )}
          >
            🔴 Unpaid ({stats.unpaid})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shop, owner, mobile..."
            className="pl-9 h-10 rounded-xl text-xs bg-white dark:bg-gray-900"
          />
        </div>
      </div>

      {/* Main Merchants Table */}
      <Card className="rounded-3xl border-gray-200 dark:border-gray-800 shadow-md overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-gray-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600" />
              Loading vyapari payment records...
            </div>
          ) : merchants.length === 0 ? (
            <div className="p-12 text-center text-gray-500 space-y-2">
              <Receipt className="h-10 w-10 mx-auto text-gray-300" />
              <p className="font-bold text-gray-800 dark:text-gray-200">
                Koi vyapari record nahi mila
              </p>
              <p className="text-xs">
                {search ? 'Try adjusting your search query' : 'Naye vyapari register hone par yahan dikhenge'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-900/60 text-left uppercase text-[11px] font-bold text-gray-500 border-b border-gray-200 dark:border-gray-800">
                    <th className="py-3 px-4">Dukan &amp; Vyapari</th>
                    <th className="py-3 px-4">Mobile &amp; WhatsApp</th>
                    <th className="py-3 px-4">Bills Made</th>
                    <th className="py-3 px-4">Plan &amp; Amount</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {merchants.map((m) => {
                    const isLimitOver = !m.isPaidPro && m.totalBills >= 3;
                    return (
                      <tr
                        key={m.id}
                        className={cn(
                          'hover:bg-gray-50/70 dark:hover:bg-gray-900/40 transition-colors',
                          m.paymentStatus === 'pending' && 'bg-amber-50/30 dark:bg-amber-950/10',
                        )}
                      >
                        {/* Shop & Vyapari Details */}
                        <td className="py-3.5 px-4">
                          <div className="font-black text-gray-900 dark:text-white text-sm">
                            {m.shopName}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Prop: <strong className="text-gray-700 dark:text-gray-300">{m.ownerName}</strong>
                          </div>
                          {m.gstNumber && (
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                              GST: {m.gstNumber}
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {m.createdAt
                              ? new Date(m.createdAt).toLocaleDateString('en-IN')
                              : 'Recent'}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-800 dark:text-gray-200">
                            +91 {m.phone}
                          </div>
                          <a
                            href={buildDirectWhatsApp(m)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-bold mt-1"
                          >
                            <MessageCircle className="h-3 w-3" /> Chat on WhatsApp
                          </a>
                        </td>

                        {/* Usage */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                              {m.totalBills} Bills
                            </span>
                            {isLimitOver && (
                              <span className="rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 text-[10px] font-black uppercase">
                                3/3 Over
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {m.totalKhataCustomers} Khata Customers
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-3.5 px-4">
                          <div className="font-black text-indigo-600 dark:text-indigo-400 uppercase text-xs">
                            {m.planType === 'yearly'
                              ? 'Yearly Plan (₹999)'
                              : m.planType === 'monthly'
                                ? 'Monthly Plan (₹199)'
                                : 'Free Trial'}
                          </div>
                          {m.paymentAmount > 0 && (
                            <div className="text-xs font-bold text-emerald-600 mt-0.5">
                              Paid: ₹{m.paymentAmount}
                            </div>
                          )}
                          {m.expiresAt && (
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              Exp: {new Date(m.expiresAt).toLocaleDateString('en-IN')}
                            </div>
                          )}
                        </td>

                        {/* Payment Status Badge */}
                        <td className="py-3.5 px-4">
                          {m.paymentStatus === 'paid' ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 text-xs font-black">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                PAYMENT RECEIVED
                              </span>
                              {m.paymentReference && (
                                <div className="text-[10px] text-gray-400">
                                  Ref: {m.paymentReference}
                                </div>
                              )}
                            </div>
                          ) : m.paymentStatus === 'pending' ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-2.5 py-1 text-xs font-black animate-pulse">
                                <Clock className="h-3.5 w-3.5 text-amber-600" />
                                APPROVAL PENDING
                              </span>
                              {m.paymentReference && (
                                <div className="text-[11px] font-mono font-bold text-amber-900 dark:text-amber-200">
                                  UTR: {m.paymentReference}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 px-2.5 py-1 text-xs font-black">
                                <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                                PAYMENT BAKI (UNPAID)
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Admin Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                            {m.paymentStatus === 'pending' ? (
                              <Button
                                size="sm"
                                type="button"
                                onClick={() => handleOpenActivateModal(m)}
                                className="h-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-sm"
                              >
                                ⚡ Verify &amp; Activate Pro
                              </Button>
                            ) : m.paymentStatus === 'paid' ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  type="button"
                                  onClick={() => handleOpenActivateModal(m)}
                                  className="h-8 rounded-xl text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                >
                                  Extend Plan
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  type="button"
                                  onClick={() => handleMarkUnpaid(m)}
                                  className="h-8 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold"
                                  title="Revoke Pro Access"
                                >
                                  Revoke
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  type="button"
                                  onClick={() => handleOpenActivateModal(m)}
                                  className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm"
                                >
                                  🟢 Mark as Paid
                                </Button>

                                <Button
                                  asChild
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-xl text-xs font-bold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                >
                                  <a
                                    href={buildReminderWhatsApp(m)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    Send Reminder
                                  </a>
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Payment Activation Modal */}
      <AnimatePresence>
        {activeModalMerchant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 border-2 border-indigo-600 p-6 sm:p-7 shadow-2xl text-left"
            >
              <button
                type="button"
                onClick={() => setActiveModalMerchant(null)}
                className="absolute top-4 right-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <div className="inline-block rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-black uppercase mb-1">
                  Activate Unlimited Pro
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Payment Verification &amp; Activation
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Shop: <strong>{activeModalMerchant.shopName}</strong> &bull; Prop: {activeModalMerchant.ownerName} (+91 {activeModalMerchant.phone})
                </p>
              </div>

              <div className="mt-5 space-y-4 text-xs">
                {/* Plan Selection */}
                <div>
                  <Label className="font-bold text-xs">Subscription Plan *</Label>
                  <div className="grid grid-cols-2 gap-2.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setModalPlan('monthly');
                        setModalAmount('199');
                      }}
                      className={cn(
                        'p-3 rounded-2xl border-2 text-left cursor-pointer transition-all',
                        modalPlan === 'monthly'
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 font-bold'
                          : 'border-gray-200 dark:border-gray-800',
                      )}
                    >
                      <div className="text-[11px] text-gray-500">Monthly Plan</div>
                      <div className="text-lg font-black text-indigo-600 mt-0.5">₹199</div>
                      <div className="text-[10px] text-gray-400">30 Days Pro</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setModalPlan('yearly');
                        setModalAmount('999');
                      }}
                      className={cn(
                        'p-3 rounded-2xl border-2 text-left cursor-pointer transition-all relative',
                        modalPlan === 'yearly'
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 font-bold'
                          : 'border-gray-200 dark:border-gray-800',
                      )}
                    >
                      <span className="absolute -top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                        Best
                      </span>
                      <div className="text-[11px] text-gray-500">Yearly Plan</div>
                      <div className="text-lg font-black text-indigo-600 mt-0.5">₹999</div>
                      <div className="text-[10px] text-gray-400">365 Days Pro</div>
                    </button>
                  </div>
                </div>

                {/* Amount Paid */}
                <div>
                  <Label className="font-bold text-xs">Amount Received (₹) *</Label>
                  <Input
                    type="number"
                    value={modalAmount}
                    onChange={(e) => setModalAmount(e.target.value)}
                    placeholder="199"
                    className="mt-1 h-10 font-bold text-sm"
                  />
                </div>

                {/* Reference / UTR */}
                <div>
                  <Label className="font-bold text-xs">UPI Ref / UTR / Transaction ID</Label>
                  <Input
                    value={modalRef}
                    onChange={(e) => setModalRef(e.target.value)}
                    placeholder="e.g. 402918291029 or Cash / QR"
                    className="mt-1 h-10 font-mono text-xs"
                  />
                </div>

                {/* Admin Notes */}
                <div>
                  <Label className="font-bold text-xs">Internal Admin Notes</Label>
                  <Input
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="e.g. Received via GPay / Approved by SuperAdmin"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveModalMerchant(null)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmMarkPaid}
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md"
                >
                  {isSubmitting ? 'Activating...' : 'Confirm Payment & Activate'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

