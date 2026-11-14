'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft,
  MessageCircle,
  Search,
  Trash2,
  Phone,
  Sparkles,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  printKhataStatement,
  buildWhatsAppKhataReminderUrl,
} from '@/lib/vyapari-print-whatsapp';
import { cn } from '@/lib/utils';

interface KhataCustomer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  partyType: 'customer' | 'supplier';
  createdAt: string;
}

interface KhataEntry {
  id: string;
  customerId: string;
  entryType: 'gave' | 'got';
  amount: number;
  note: string;
  entryDate: string;
}

export default function DigitalKhataSoftwarePage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<KhataCustomer[]>([]);
  const [entries, setEntries] = useState<KhataEntry[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Customer Form
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [openingAmount, setOpeningAmount] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  // Add Entry (You Gave / You Got) Form
  const [entryAmount, setEntryAmount] = useState('');
  const [entryNote, setEntryNote] = useState('');
  const [isSavingEntry, setIsSavingEntry] = useState(false);

  const shopName = user?.name ? `${user.name}` : 'Hamari Dukan';

  useEffect(() => {
    fetchKhataData(true);
  }, []);

  const fetchKhataData = async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const { data } = await api.get('/api/dashboard/khata');
      if (data?.success && data.data) {
        const custList: KhataCustomer[] = data.data.customers || [];
        const entryList: KhataEntry[] = data.data.entries || [];
        setCustomers(custList);
        setEntries(entryList);
        if (custList.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(custList[0].id);
        }
      }
    } catch {
      toast.error('Could not load Bahi-Khata records');
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  // Compute balance per customer: positive = Merchant GAVE more (Customer owes merchant / "Lena Hai")
  // negative = Merchant GOT more (Merchant owes customer / "Dena Hai")
  const customerBalances = useMemo(() => {
    const map: Record<string, { gave: number; got: number; net: number }> = {};
    for (const c of customers) {
      map[c.id] = { gave: 0, got: 0, net: 0 };
    }
    for (const e of entries) {
      if (!map[e.customerId]) {
        map[e.customerId] = { gave: 0, got: 0, net: 0 };
      }
      if (e.entryType === 'gave') {
        map[e.customerId].gave += Number(e.amount || 0);
        map[e.customerId].net += Number(e.amount || 0);
      } else {
        map[e.customerId].got += Number(e.amount || 0);
        map[e.customerId].net -= Number(e.amount || 0);
      }
    }
    return map;
  }, [customers, entries]);

  // Overall KPIs across all customers
  const { totalLenaHai, totalDenaHai } = useMemo(() => {
    let lena = 0;
    let dena = 0;
    Object.values(customerBalances).forEach((b) => {
      if (b.net > 0) lena += b.net;
      if (b.net < 0) dena += Math.abs(b.net);
    });
    return { totalLenaHai: lena, totalDenaHai: dena };
  }, [customerBalances]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) {
      toast.error('Customer ka naam likhein');
      return;
    }
    setIsAddingCustomer(true);
    try {
      const payload = {
        action: 'add_customer',
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        openingAmount: Number(openingAmount || 0),
        openingType: 'gave',
        openingNote: 'Opening Udhaar Balance',
      };
      const { data } = await api.post('/api/dashboard/khata', payload);
      if (data?.success && data.data) {
        await fetchKhataData();
        setSelectedCustomerId(data.data.id);
        setNewCustomerName('');
        setNewCustomerPhone('');
        setOpeningAmount('');
        toast.success('Customer Bahi-Khata me jud gaya!');
      }
    } catch {
      toast.error('Failed to add customer');
    } finally {
      setIsAddingCustomer(false);
    }
  };

  const handleAddEntry = async (entryType: 'gave' | 'got') => {
    if (!selectedCustomerId) {
      toast.error('Pehle customer select karein');
      return;
    }
    const amt = Number(entryAmount);
    if (!amt || amt <= 0) {
      toast.error('Sahi amount (₹) dalein');
      return;
    }

    setIsSavingEntry(true);
    try {
      const payload = {
        action: 'add_entry',
        customerId: selectedCustomerId,
        entryType,
        amount: amt,
        note:
          entryNote.trim() ||
          (entryType === 'gave' ? 'Saman Udhaar Diya' : 'Payment Jama Mila'),
      };
      const { data } = await api.post('/api/dashboard/khata', payload);
      if (data?.success && data.data) {
        setEntries((prev) => [data.data, ...prev]);
        setEntryAmount('');
        setEntryNote('');
        toast.success(
          entryType === 'gave'
            ? `₹${amt} Udhaar (You Gave) save ho gaya!`
            : `₹${amt} Jama (You Got) save ho gaya!`,
        );
      }
    } catch {
      toast.error('Failed to save entry');
    } finally {
      setIsSavingEntry(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await api.delete(`/api/dashboard/khata?entryId=${entryId}`);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      toast.success('Entry deleted');
    } catch {
      toast.error('Could not delete entry');
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await api.delete(`/api/dashboard/khata?customerId=${customerId}`);
      const remaining = customers.filter((c) => c.id !== customerId);
      setCustomers(remaining);
      setEntries((prev) => prev.filter((e) => e.customerId !== customerId));
      setSelectedCustomerId(remaining[0]?.id || null);
      toast.success('Customer Khata deleted');
    } catch {
      toast.error('Could not delete customer');
    }
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || null;
  const selectedCustomerEntries = entries.filter((e) => e.customerId === selectedCustomerId);
  const selectedBalance = selectedCustomerId
    ? customerBalances[selectedCustomerId] || { gave: 0, got: 0, net: 0 }
    : { gave: 0, got: 0, net: 0 };

  const buildWhatsAppReminderUrl = (customer: KhataCustomer | null, netAmount: number) => {
    if (!customer) return '#';
    const custEntries = selectedCustomerEntries.map((e) => ({
      id: e.id,
      type: e.entryType,
      amount: Number(e.amount || 0),
      note: e.note,
      date: new Date(e.entryDate).toLocaleDateString('en-IN'),
    }));
    return buildWhatsAppKhataReminderUrl({
      shopName,
      customerName: customer.name,
      customerPhone: customer.phone,
      netBalance: netAmount,
      entries: custEntries,
    });
  };

  const handlePrintKhata = () => {
    if (!selectedCustomer) return;
    const custEntries = selectedCustomerEntries.map((e) => ({
      id: e.id,
      type: e.entryType,
      amount: Number(e.amount || 0),
      note: e.note,
      date: new Date(e.entryDate).toLocaleDateString('en-IN'),
    }));
    printKhataStatement({
      shopName,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      netBalance: selectedBalance.net,
      entries: custEntries,
    });
  };

  const filteredCustomers = customers.filter(
    (c) =>
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery),
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Total Market Lena / Dena Summary */}
      <div className="rounded-3xl bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-amber-300 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Bhartiyebazar Digital Bahi-Khata (KhataBook Style)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              📒 Digital Bahi-Khata & Udhaar Software
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-2xl">
              Apne grahakon ka Udhaar (Maine Diya) aur Jama (Mujhe Mila) likhein — aur 1-Click me WhatsApp par Payment Reminder bhejein.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center shrink-0">
            <div className="rounded-2xl bg-rose-500/20 border border-rose-400/40 px-4 py-3">
              <div className="text-[11px] text-rose-200 font-bold uppercase">Market Se Lena Hai</div>
              <div className="text-xl sm:text-2xl font-black text-rose-300">
                ₹{totalLenaHai.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-rose-200/80">You Will Get</div>
            </div>
            <div className="rounded-2xl bg-emerald-500/20 border border-emerald-400/40 px-4 py-3">
              <div className="text-[11px] text-emerald-200 font-bold uppercase">Dena Hai (Advance)</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300">
                ₹{totalDenaHai.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-200/80">You Will Give</div>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
              <div className="text-[11px] text-emerald-100 font-bold uppercase">Total Customers</div>
              <div className="text-xl sm:text-2xl font-black text-white">{customers.length}</div>
              <div className="text-[10px] text-emerald-200/80">Active Khata</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Left = Add Customer & Customer List, Right = Selected Customer Ledger */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Customer List + Add Customer */}
        <div className="lg:col-span-5 space-y-5 print:hidden">
          {/* Add Customer Card */}
          <Card className="border-slate-200 dark:border-slate-800 rounded-3xl shadow-md">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-600" />
                Naya Customer / Party Jodein
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <form onSubmit={handleAddCustomer} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-bold">Customer Name *</Label>
                    <Input
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="e.g. Suresh Sharma"
                      className="mt-1 h-9 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold">WhatsApp Mobile No *</Label>
                    <Input
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="mt-1 h-9 text-xs sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label className="text-xs font-bold">Purana Baki / Opening Udhaar ₹ (Optional)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={openingAmount}
                      onChange={(e) => setOpeningAmount(e.target.value)}
                      placeholder="0"
                      className="mt-1 h-9 text-xs sm:text-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isAddingCustomer}
                    className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 shrink-0"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                    {isAddingCustomer ? 'Adding...' : 'Add Customer'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Customers List */}
          <Card className="border-slate-200 dark:border-slate-800 rounded-3xl shadow-md overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  Grahak Khata List ({filteredCustomers.length})
                </CardTitle>
              </div>
              <div className="relative mt-2">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Customer naam ya number khojein..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0 max-h-[460px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <div className="p-6 text-center text-xs text-gray-500">Loading customers...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="font-bold text-sm text-gray-700 dark:text-gray-300">
                    Abhi koi customer nahi juda hai
                  </p>
                  <p className="text-xs mt-1">Upar naam aur mobile number daal kar customer jodein.</p>
                </div>
              ) : (
                filteredCustomers.map((cust) => {
                  const bal = customerBalances[cust.id]?.net || 0;
                  const isSelected = cust.id === selectedCustomerId;
                  return (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => setSelectedCustomerId(cust.id)}
                      className={cn(
                        'w-full flex items-center justify-between p-4 text-left transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-l-4 border-indigo-600'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-900/50',
                      )}
                    >
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                          {cust.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />
                          <span>{cust.phone || 'No phone'}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <div
                          className={cn(
                            'text-sm font-black',
                            bal > 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : bal < 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-gray-500',
                          )}
                        >
                          ₹{Math.abs(bal).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {bal > 0 ? 'Lena Hai' : bal < 0 ? 'Dena Hai' : 'Settled'}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Selected Customer Khata Ledger & Entry Buttons */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <Card className="border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg overflow-hidden">
              {/* Customer Ledger Header */}
              <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black">{selectedCustomer.name}</h2>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-indigo-300">
                      Bahi-Khata
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Mobile: {selectedCustomer.phone || 'Not provided'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-2 text-right border',
                      selectedBalance.net > 0
                        ? 'bg-rose-500/20 border-rose-400/40 text-rose-200'
                        : selectedBalance.net < 0
                          ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                          : 'bg-white/10 border-white/15 text-slate-200',
                    )}
                  >
                    <div className="text-[10px] font-bold uppercase">
                      {selectedBalance.net > 0
                        ? 'Customer Se Lena Hai'
                        : selectedBalance.net < 0
                          ? 'Customer Ko Dena Hai'
                          : 'Hisab Barabar'}
                    </div>
                    <div className="text-lg font-black">
                      ₹{Math.abs(selectedBalance.net).toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* 1-Click WhatsApp Reminder */}
                  <Button
                    asChild
                    className="h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg print:hidden"
                  >
                    <a
                      href={buildWhatsAppReminderUrl(selectedCustomer, selectedBalance.net)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-1.5" />
                      WhatsApp Reminder Bhejein
                    </a>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrintKhata}
                    className="h-11 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs px-3 print:hidden"
                    title="Print Khata Statement"
                  >
                    <Printer className="h-4 w-4 mr-1.5" />
                    Print PDF
                  </Button>
                </div>
              </div>

              <CardContent className="p-5 sm:p-6 space-y-6">
                {/* New Entry Box (You Gave / You Got) */}
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 p-4 space-y-3 print:hidden">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    Nayi Len-Den Entry Karein (Add Transaction)
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold">Amount (₹) *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={entryAmount}
                        onChange={(e) => setEntryAmount(e.target.value)}
                        placeholder="e.g. 500"
                        className="mt-1 h-10 font-bold text-base bg-white dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold">Saman / Vivaran (Note)</Label>
                      <Input
                        value={entryNote}
                        onChange={(e) => setEntryNote(e.target.value)}
                        placeholder="e.g. Rashan ka saman / UPI Jama"
                        className="mt-1 h-10 bg-white dark:bg-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Button
                      type="button"
                      disabled={isSavingEntry}
                      onClick={() => handleAddEntry('gave')}
                      className="h-11 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-md shadow-rose-500/20"
                    >
                      <ArrowUpRight className="h-4 w-4 mr-1.5" />
                      🔴 Maine Diya (Udhaar)
                    </Button>
                    <Button
                      type="button"
                      disabled={isSavingEntry}
                      onClick={() => handleAddEntry('got')}
                      className="h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-500/20"
                    >
                      <ArrowDownLeft className="h-4 w-4 mr-1.5" />
                      🟢 Mujhe Mila (Jama)
                    </Button>
                  </div>
                </div>

                {/* Passbook Entries Table */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
                      Len-Den Passbook ({selectedCustomerEntries.length} Entries)
                    </h3>
                    <button
                      type="button"
                      onClick={() => selectedCustomer && handleDeleteCustomer(selectedCustomer.id)}
                      className="text-xs text-red-500 hover:underline flex items-center gap-1 print:hidden cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Customer Khata
                    </button>
                  </div>

                  {selectedCustomerEntries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center text-gray-500 text-xs">
                      Is customer ki abhi koi entry nahi hai. Upar Amount daal kar &ldquo;Maine Diya&rdquo; ya &ldquo;Mujhe Mila&rdquo; dabayein.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-900 text-xs uppercase text-gray-500 border-b border-gray-200 dark:border-gray-800">
                            <th className="py-2.5 px-4 text-left">Date & Vivaran</th>
                            <th className="py-2.5 px-4 text-right text-rose-600">Maine Diya (Udhaar)</th>
                            <th className="py-2.5 px-4 text-right text-emerald-600">Mujhe Mila (Jama)</th>
                            <th className="py-2.5 px-3 text-right print:hidden"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {selectedCustomerEntries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-900/40">
                              <td className="py-3 px-4">
                                <div className="font-bold text-gray-900 dark:text-white">
                                  {entry.note || (entry.entryType === 'gave' ? 'Udhaar Diya' : 'Jama Mila')}
                                </div>
                                <div className="text-[11px] text-gray-400">
                                  {new Date(entry.entryDate).toLocaleString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right font-extrabold text-rose-600 bg-rose-50/40 dark:bg-rose-950/20">
                                {entry.entryType === 'gave'
                                  ? `₹${Number(entry.amount).toLocaleString('en-IN')}`
                                  : '—'}
                              </td>
                              <td className="py-3 px-4 text-right font-extrabold text-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20">
                                {entry.entryType === 'got'
                                  ? `₹${Number(entry.amount).toLocaleString('en-IN')}`
                                  : '—'}
                              </td>
                              <td className="py-3 px-3 text-right print:hidden">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                                  title="Delete entry"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 dark:border-slate-800 rounded-3xl shadow-md p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                Apna Digital Bahi-Khata Shuru Karein
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1">
                Left side me Customer ka naam aur WhatsApp number daal kar pehla Khata kholein.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

