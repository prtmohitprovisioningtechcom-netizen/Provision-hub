'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  MessageCircle,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  Receipt,
  IndianRupee,
  Eye,
  Download,
  Lock,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  printPukkaBill,
  buildWhatsAppPukkaBillUrl,
} from '@/lib/vyapari-print-whatsapp';
import { cn } from '@/lib/utils';

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerGst?: string;
  isGstBill: boolean;
  gstRate: number;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  gstAmount: number;
  grandTotal: number;
  status: 'paid' | 'unpaid' | 'partial';
  paymentMode: string;
  notes?: string;
  createdAt: string;
}

export default function BillingSoftwarePage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const FREE_BILL_LIMIT = 3;

  // Shop / Merchant details (auto-loaded from profile)
  const [shopInfo, setShopInfo] = useState({
    name: user?.name ? `${user.name} Store` : 'My Verified Shop',
    phone: user?.phone || '+91 9876543210',
    address: 'Main Market, India',
    gst: '',
  });

  // New Invoice Form State
  const [invoiceNumber, setInvoiceNumber] = useState(
    () => `BB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  );
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGst, setCustomerGst] = useState('');
  const [isGstBill, setIsGstBill] = useState(false);
  const [gstRate, setGstRate] = useState(18);
  const [discount, setDiscount] = useState<number>(0);
  const [status, setStatus] = useState<'paid' | 'unpaid'>('paid');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [notes, setNotes] = useState('Thank you for shopping with us!');
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: '', qty: 1, price: 0 },
  ]);

  // Selected invoice for preview/printing
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(null);
  const [khataCustomers, setKhataCustomers] = useState<Array<{ id: string; name: string; phone: string; address?: string }>>([]);

  useEffect(() => {
    fetchInvoices(true);
    fetchShopProfile();
    fetchKhataCustomers();
  }, []);

  const fetchKhataCustomers = async () => {
    try {
      const { data } = await api.get('/api/dashboard/khata');
      if (data?.success && Array.isArray(data?.data?.customers)) {
        setKhataCustomers(data.data.customers);
      }
    } catch {
      // silent
    }
  };

  const fetchShopProfile = async () => {
    try {
      const { data } = await api.get('/api/dashboard/profile');
      if (data?.success && data?.data) {
        const c = data.data;
        const addr = c.address
          ? [c.address.street, c.address.city, c.address.state].filter(Boolean).join(', ')
          : '';
        setShopInfo({
          name: c.name || shopInfo.name,
          phone: c.phone || shopInfo.phone,
          address: addr || shopInfo.address,
          gst: c.gst || '',
        });
      }
    } catch {
      // fallback to default shopInfo
    }
  };

  const fetchInvoices = async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const { data } = await api.get('/api/dashboard/billing');
      if (data?.success && Array.isArray(data.data)) {
        setInvoices(data.data);
      }
    } catch {
      toast.error('Could not load saved bills');
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0),
    [items],
  );
  const taxableAmount = useMemo(() => Math.max(0, subtotal - Number(discount || 0)), [subtotal, discount]);
  const gstAmount = useMemo(
    () => (isGstBill ? Number(((taxableAmount * gstRate) / 100).toFixed(2)) : 0),
    [isGstBill, taxableAmount, gstRate],
  );
  const grandTotal = useMemo(
    () => Number((taxableAmount + gstAmount).toFixed(2)),
    [taxableAmount, gstAmount],
  );

  const addItemRow = () => {
    setItems((prev) => [...prev, { name: '', qty: 1, price: 0 }]);
  };

  const updateItemRow = (index: number, key: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveInvoice = async () => {
    if (invoices.length >= FREE_BILL_LIMIT) {
      setShowPaymentModal(true);
      toast.error('Aapke 3 Free Bills poore ho gaye hain! Unlimited Billing ke liye Plan Activate karein.');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Please enter Customer Name');
      return;
    }
    const validItems = items.filter((i) => i.name.trim() && Number(i.price) >= 0);
    if (validItems.length === 0) {
      toast.error('Please add at least 1 item with name & price');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        invoiceNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerGst: customerGst.trim(),
        isGstBill,
        gstRate,
        items: validItems,
        discount,
        status,
        paymentMode,
        notes,
      };

      const { data } = await api.post('/api/dashboard/billing', payload);
      if (data?.success && data.data) {
        const nextList = [data.data, ...invoices];
        setInvoices(nextList);
        setPreviewInvoice(data.data);
        if (nextList.length >= FREE_BILL_LIMIT) {
          toast.success('3rd Bill Saved! Aapke 3 Free Trial Bills poore ho gaye.');
          setTimeout(() => setShowPaymentModal(true), 500);
        } else {
          toast.success(`Pukka Bill saved! (${nextList.length}/${FREE_BILL_LIMIT} Free Bills Used)`);
        }
        // Reset for next bill
        setInvoiceNumber(`BB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setCustomerGst('');
        setDiscount(0);
        setItems([{ name: '', qty: 1, price: 0 }]);
      }
    } catch {
      toast.error('Failed to save bill');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (inv: InvoiceRecord) => {
    const nextStatus = inv.status === 'paid' ? 'unpaid' : 'paid';
    // Optimistic instant UI update
    setInvoices((prev) =>
      prev.map((item) => (item.id === inv.id ? { ...item, status: nextStatus } : item)),
    );
    if (previewInvoice?.id === inv.id) {
      setPreviewInvoice({ ...previewInvoice, status: nextStatus });
    }

    try {
      await api.patch('/api/dashboard/billing', { id: inv.id, status: nextStatus });
      toast.success(`Bill marked as ${nextStatus.toUpperCase()}`);
    } catch {
      // Revert if network failed
      setInvoices((prev) =>
        prev.map((item) => (item.id === inv.id ? { ...item, status: inv.status } : item)),
      );
      if (previewInvoice?.id === inv.id) {
        setPreviewInvoice({ ...previewInvoice, status: inv.status });
      }
      toast.error('Failed to update bill status');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    const toDelete = invoices.find((item) => item.id === id);
    // Optimistic instant UI removal
    setInvoices((prev) => prev.filter((item) => item.id !== id));
    if (previewInvoice?.id === id) setPreviewInvoice(null);

    try {
      await api.delete(`/api/dashboard/billing?id=${id}`);
      toast.success('Bill deleted');
    } catch {
      if (toDelete) {
        setInvoices((prev) => [toDelete, ...prev]);
      }
      toast.error('Failed to delete bill');
    }
  };

  const buildWhatsAppBillUrl = (inv: {
    invoiceNumber: string;
    customerName: string;
    customerPhone: string;
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    isGstBill: boolean;
    gstRate: number;
    gstAmount: number;
    grandTotal: number;
    status: string;
    createdAt?: string;
  }) => {
    return buildWhatsAppPukkaBillUrl({
      shopName: shopInfo.name,
      shopPhone: shopInfo.phone,
      shopGst: shopInfo.gst,
      shopAddress: shopInfo.address,
      invoiceNo: inv.invoiceNumber,
      customerName: inv.customerName,
      customerPhone: inv.customerPhone,
      isGst: inv.isGstBill,
      gstRate: inv.gstRate,
      items: inv.items,
      subtotal: inv.subtotal,
      discount: inv.discount,
      gstAmount: inv.gstAmount,
      grandTotal: inv.grandTotal,
      status: inv.status,
      createdAt: inv.createdAt,
    });
  };

  // Active preview data (either selected historical invoice or current live form)
  const activeBill = previewInvoice || {
    id: 'live',
    invoiceNumber,
    customerName: customerName || 'Walk-in Customer',
    customerPhone: customerPhone || '',
    customerAddress,
    customerGst,
    isGstBill,
    gstRate,
    items: items.filter((i) => i.name.trim() || i.price > 0),
    subtotal,
    discount,
    gstAmount,
    grandTotal,
    status,
    paymentMode,
    notes,
    createdAt: new Date().toISOString(),
  };

  const handlePrintBill = (targetBill = activeBill) => {
    printPukkaBill({
      shopName: shopInfo.name,
      shopPhone: shopInfo.phone,
      shopGst: shopInfo.gst,
      shopAddress: shopInfo.address,
      invoiceNo: targetBill.invoiceNumber,
      customerName: targetBill.customerName,
      customerPhone: targetBill.customerPhone,
      customerAddress: targetBill.customerAddress,
      customerGst: targetBill.customerGst,
      isGst: targetBill.isGstBill,
      gstRate: targetBill.gstRate,
      items: targetBill.items,
      subtotal: targetBill.subtotal,
      discount: targetBill.discount,
      gstAmount: targetBill.gstAmount,
      grandTotal: targetBill.grandTotal,
      status: targetBill.status,
      paymentMode: targetBill.paymentMode,
      notes: targetBill.notes,
      createdAt: targetBill.createdAt,
    });
  };

  // KPIs
  const totalSales = invoices.reduce((sum, i) => sum + Number(i.grandTotal || 0), 0);
  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + Number(i.grandTotal || 0), 0);
  const totalUnpaid = invoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + Number(i.grandTotal || 0), 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerPhone.includes(searchQuery) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Step-by-Step Guide */}
      <div className="rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-xl print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-amber-300 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Bhartiyebazar GST / Non-GST Billing Software</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              🧾 Pukka Bill & Invoice Software
            </h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              Customer ka naam, mobile number aur saman dalein — 1 click me Pukka Bill save karein, PDF print निकाले या सीधा Customer ke WhatsApp par bhejein.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center shrink-0">
            <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
              <div className="text-[11px] text-indigo-200 font-semibold">Total Bills</div>
              <div className="text-lg sm:text-xl font-black text-white">₹{totalSales.toLocaleString('en-IN')}</div>
            </div>
            <div className="rounded-2xl bg-emerald-500/20 border border-emerald-400/30 px-4 py-3">
              <div className="text-[11px] text-emerald-200 font-semibold">Paid (Mila)</div>
              <div className="text-lg sm:text-xl font-black text-emerald-300">₹{totalPaid.toLocaleString('en-IN')}</div>
            </div>
            <div className="rounded-2xl bg-rose-500/20 border border-rose-400/30 px-4 py-3">
              <div className="text-[11px] text-rose-200 font-semibold">Unpaid (Baki)</div>
              <div className="text-lg sm:text-xl font-black text-rose-300">₹{totalUnpaid.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Left = Bill Builder Form, Right = Live Printable Invoice */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left: Create Bill Form */}
        <Card className="lg:col-span-7 border-slate-200 dark:border-slate-800 rounded-3xl shadow-md print:hidden">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                Naya Bill Banayein (Create New Invoice)
              </CardTitle>

              {/* GST vs Non-GST Toggle */}
              <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-gray-100 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setIsGstBill(false)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    !isGstBill
                      ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xs'
                      : 'text-gray-600 dark:text-gray-400',
                  )}
                >
                  Non-GST Bill
                </button>
                <button
                  type="button"
                  onClick={() => setIsGstBill(true)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    isGstBill
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400',
                  )}
                >
                  GST Invoice
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-5">
            {previewInvoice && (
              <div className="flex items-center justify-between rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-2.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <span>Viewing Saved Bill #{previewInvoice.invoiceNumber}</span>
                <Button size="sm" variant="outline" onClick={() => setPreviewInvoice(null)}>
                  + Create New Bill
                </Button>
              </div>
            )}

            {/* Customer Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold flex items-center justify-between">
                  <span>Customer Name *</span>
                  {khataCustomers.length > 0 && (
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      {khataCustomers.length} Khata contacts available
                    </span>
                  )}
                </Label>
                <Input
                  list="khata-customer-suggestions"
                  value={customerName}
                  onChange={(e) => {
                    setPreviewInvoice(null);
                    const val = e.target.value;
                    setCustomerName(val);
                    const matched = khataCustomers.find(
                      (c) => c.name.toLowerCase() === val.toLowerCase()
                    );
                    if (matched) {
                      if (matched.phone) setCustomerPhone(matched.phone);
                      if (matched.address) setCustomerAddress(matched.address);
                    }
                  }}
                  placeholder="e.g. Ramesh Kumar"
                  className="mt-1"
                />
                <datalist id="khata-customer-suggestions">
                  {khataCustomers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.phone ? `${c.phone}` : ''} {c.address ? `• ${c.address}` : ''}
                    </option>
                  ))}
                </datalist>
              </div>
              <div>
                <Label className="text-xs font-bold">Mobile Number (WhatsApp) *</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => {
                    setPreviewInvoice(null);
                    setCustomerPhone(e.target.value);
                  }}
                  placeholder="e.g. 9876543210"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-bold">Customer Address (Optional)</Label>
                <Input
                  value={customerAddress}
                  onChange={(e) => {
                    setPreviewInvoice(null);
                    setCustomerAddress(e.target.value);
                  }}
                  placeholder="City / Colony"
                  className="mt-1"
                />
              </div>
              {isGstBill ? (
                <div>
                  <Label className="text-xs font-bold">Customer GSTIN (Optional)</Label>
                  <Input
                    value={customerGst}
                    onChange={(e) => {
                      setPreviewInvoice(null);
                      setCustomerGst(e.target.value.toUpperCase());
                    }}
                    placeholder="07AAAAA0000A1Z5"
                    className="mt-1"
                  />
                </div>
              ) : (
                <div>
                  <Label className="text-xs font-bold">Bill Number</Label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Saman / Items List
                </Label>
                <Button type="button" size="sm" variant="outline" onClick={addItemRow} className="h-8 text-xs font-bold">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
                </Button>
              </div>

              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-2xl border border-gray-200/80 dark:border-gray-800"
                  >
                    <div className="col-span-6 sm:col-span-6">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItemRow(idx, 'name', e.target.value)}
                        placeholder={`Item ${idx + 1} name`}
                        className="h-9 text-xs sm:text-sm bg-white dark:bg-gray-900"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                      <Input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) => updateItemRow(idx, 'qty', Number(e.target.value))}
                        placeholder="Qty"
                        className="h-9 text-xs sm:text-sm bg-white dark:bg-gray-900 text-center"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-3">
                      <Input
                        type="number"
                        min={0}
                        value={item.price || ''}
                        onChange={(e) => updateItemRow(idx, 'price', Number(e.target.value))}
                        placeholder="Rate ₹"
                        className="h-9 text-xs sm:text-sm bg-white dark:bg-gray-900"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount, GST Rate, Payment Status & Mode */}
            <div className="grid sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div>
                <Label className="text-xs font-bold">Discount (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="mt-1 h-9"
                />
              </div>

              {isGstBill && (
                <div>
                  <Label className="text-xs font-bold">GST Rate (%)</Label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="mt-1 w-full h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 text-xs font-bold"
                  >
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>
              )}

              <div>
                <Label className="text-xs font-bold">Bill Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'paid' | 'unpaid')}
                  className="mt-1 w-full h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 text-xs font-bold"
                >
                  <option value="paid">✅ PAID (Paisa Mil Gaya)</option>
                  <option value="unpaid">⏳ UNPAID (Udhaar / Baki)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-bold">Payment Mode</Label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="mt-1 w-full h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 text-xs font-bold"
                >
                  <option value="UPI">📱 UPI / QR</option>
                  <option value="Cash">💵 Cash</option>
                  <option value="Udhaar">📒 Khata / Udhaar</option>
                  <option value="Card">💳 Card / Bank</option>
                </select>
              </div>
            </div>

            {status === 'unpaid' && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-900 dark:text-amber-200">
                <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Digital Bahi-Khata Auto-Sync:</strong> Saving this bill as Unpaid automatically registers an Udhaar entry for ₹{grandTotal.toLocaleString('en-IN')} in <strong>{customerName || 'customer'}</strong>&apos;s ledger.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Button
                type="button"
                onClick={handleSaveInvoice}
                disabled={isSaving}
                className="flex-1 min-w-[180px] h-11 rounded-2xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold shadow-lg shadow-indigo-500/25"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving Bill...' : 'Save Bill in Account'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handlePrintBill(activeBill)}
                className="h-11 rounded-2xl font-bold border-slate-300 dark:border-slate-700"
              >
                <Printer className="h-4 w-4 mr-2 text-indigo-600" />
                Print / Save PDF
              </Button>

              <Button
                asChild
                className="h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold"
              >
                <a
                  href={buildWhatsAppBillUrl(activeBill)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp Bill
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Live Pukka Bill Preview (Printable) */}
        <div className="lg:col-span-5">
          <div className="bg-white text-gray-900 rounded-3xl border-2 border-slate-200 shadow-xl p-6 sm:p-7 print:border-0 print:shadow-none print:p-0">
            {/* Bill Header */}
            <div className="flex items-start justify-between border-b-2 border-dashed border-gray-300 pb-4">
              <div>
                <span className="inline-block rounded-md bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  {activeBill.isGstBill ? 'TAX INVOICE (GST)' : 'CASH / RETAIL MEMO'}
                </span>
                <h2 className="text-xl font-black text-gray-900">{shopInfo.name}</h2>
                <p className="text-xs text-gray-600">{shopInfo.address}</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">Ph: {shopInfo.phone}</p>
                {shopInfo.gst && (
                  <p className="text-xs font-bold text-indigo-700">GSTIN: {shopInfo.gst}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-500">INVOICE NO</div>
                <div className="text-sm font-black text-indigo-700">{activeBill.invoiceNumber}</div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Date: {new Date(activeBill.createdAt).toLocaleDateString('en-IN')}
                </div>
                <span
                  className={cn(
                    'mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase',
                    activeBill.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800',
                  )}
                >
                  {activeBill.status === 'paid' ? '✓ PAID' : '⏳ UNPAID'} ({activeBill.paymentMode})
                </span>
              </div>
            </div>

            {/* Customer Block */}
            <div className="py-3 border-b border-gray-200 text-xs flex justify-between gap-4">
              <div>
                <span className="text-gray-400 font-bold uppercase text-[10px]">Billed To:</span>
                <div className="font-extrabold text-sm text-gray-900">{activeBill.customerName}</div>
                {activeBill.customerPhone && (
                  <div className="text-gray-600">Mob: {activeBill.customerPhone}</div>
                )}
                {activeBill.customerAddress && (
                  <div className="text-gray-500">{activeBill.customerAddress}</div>
                )}
              </div>
              {activeBill.customerGst && (
                <div className="text-right">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Party GSTIN:</span>
                  <div className="font-bold text-gray-800">{activeBill.customerGst}</div>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-[10px]">
                    <th className="py-1.5 text-left"># Item</th>
                    <th className="py-1.5 text-center">Qty</th>
                    <th className="py-1.5 text-right">Rate</th>
                    <th className="py-1.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeBill.items.length > 0 ? (
                    activeBill.items.map((it, i) => (
                      <tr key={i}>
                        <td className="py-2 font-semibold text-gray-800">
                          {i + 1}. {it.name || 'Item'}
                        </td>
                        <td className="py-2 text-center text-gray-600">{it.qty}</td>
                        <td className="py-2 text-right text-gray-600">₹{Number(it.price).toLocaleString('en-IN')}</td>
                        <td className="py-2 text-right font-bold text-gray-900">
                          ₹{(Number(it.qty) * Number(it.price)).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400 italic">
                        Add items on the left to preview bill
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="border-t-2 border-dashed border-gray-300 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">₹{activeBill.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {activeBill.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-semibold">- ₹{activeBill.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {activeBill.isGstBill && (
                <>
                  <div className="flex justify-between text-gray-600">
                    <span>CGST ({activeBill.gstRate / 2}%)</span>
                    <span>+ ₹{(activeBill.gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>SGST ({activeBill.gstRate / 2}%)</span>
                    <span>+ ₹{(activeBill.gstAmount / 2).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-base font-black text-indigo-950">
                <span>Grand Total</span>
                <span className="text-lg text-indigo-700">₹{activeBill.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-5 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
              <span>{activeBill.notes || 'Thank you for your business!'}</span>
              <span className="font-bold text-indigo-600">Verified on Bhartiyebazar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Invoices History Table */}
      <Card className="border-slate-200 dark:border-slate-800 rounded-3xl shadow-md print:hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <CardTitle className="text-lg font-extrabold flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Saved Bills & Invoices Record ({filteredInvoices.length})
            </CardTitle>
            <p className="text-xs text-gray-500">
              Aapke banaye hue sare bills hamesha ke liye yahan surakshit rehte hain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, bill no..."
                className="pl-9 h-9 text-xs w-52"
              />
            </div>
            <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-100 dark:bg-gray-800">
              {(['all', 'paid', 'unpaid'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold capitalize cursor-pointer',
                    statusFilter === st
                      ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-2xs'
                      : 'text-gray-600 dark:text-gray-400',
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading your saved bills...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <Receipt className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="font-bold text-gray-700 dark:text-gray-300">Abhi tak koi bill save nahi hai</p>
              <p className="text-xs mt-1">Upar form me customer aur saman daal kar pehla bill save karein.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/60 text-left text-xs uppercase text-gray-500 border-b border-gray-200 dark:border-gray-800">
                    <th className="py-3 px-4">Bill No</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-900/40">
                      <td className="py-3 px-4 font-bold text-indigo-600">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 dark:text-white">{inv.customerName}</div>
                        <div className="text-xs text-gray-500">{inv.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold">
                        {inv.isGstBill ? `GST (${inv.gstRate}%)` : 'Non-GST'}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-gray-900 dark:text-white">
                        ₹{Number(inv.grandTotal).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(inv)}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold cursor-pointer transition-transform active:scale-95',
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
                          )}
                          title="Click to toggle Paid / Unpaid"
                        >
                          {inv.status === 'paid' ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                            </>
                          ) : (
                            <>
                              <Clock className="h-3.5 w-3.5" /> Unpaid
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-indigo-200 text-indigo-700"
                          onClick={() => {
                            setPreviewInvoice(inv);
                            handlePrintBill(inv);
                          }}
                        >
                          <Printer className="h-3.5 w-3.5 mr-1" /> Print / PDF
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <a href={buildWhatsAppBillUrl(inv)} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteInvoice(inv.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto Payment Modal after 3 Free Bills */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 border-2 border-indigo-600 p-6 sm:p-8 shadow-2xl text-center">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Lock className="h-7 w-7" />
            </div>
            <span className="inline-block rounded-full bg-rose-100 text-rose-700 px-3 py-0.5 text-xs font-black uppercase">
              3 / 3 Free Bills Completed
            </span>
            <h3 className="mt-2 text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Aapke 3 Free Bills Poore Ho Gaye!
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Unlimited GST/Non-GST Bills aur Digital Bahi-Khata lifetime chalane ke liye apna plan activate karein:
            </p>
            <div className="mt-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 p-4">
              <div className="text-xs font-bold text-indigo-600 uppercase">Unlimited Vyapari Plan</div>
              <div className="text-3xl font-black text-gray-900 dark:text-white mt-0.5">
                ₹199 <span className="text-xs font-normal text-gray-500">/ month</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                ✓ Unlimited Bills • ✓ Unlimited Khata • ✓ Free WhatsApp Reminders
              </p>
            </div>
            <Button
              asChild
              className="mt-5 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm"
            >
              <a
                href={`https://wa.me/916397650818?text=${encodeURIComponent(
                  `Namaste Bhartiyebazar! Mere 3 Free Bills poore ho gaye hain (${shopInfo.name}). Mujhe ₹199 Unlimited Billing & Khata Plan activate karna hai.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Pay &amp; Activate Unlimited Now
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

