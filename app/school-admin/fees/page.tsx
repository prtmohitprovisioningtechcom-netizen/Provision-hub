'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Calendar,
  Layers,
  ArrowUpRight,
  QrCode,
  Bus,
  Phone,
  Send,
  Sparkles,
  Check,
  Edit2,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FeesManagementPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Generate Invoice Form
  const [genForm, setGenForm] = useState({
    classId: '',
    title: 'Monthly School Tuition Fee',
    monthYear: 'November 2026',
    discount: '0',
    dueDate: '2026-11-25',
  });
  const [invoiceTarget, setInvoiceTarget] = useState<'class' | 'student'>('class');
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Collect Payment Form
  const [payForm, setPayForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    transactionRef: '',
    notes: 'Paid at fee counter',
  });

  // Primary Tabs: 'invoices' | 'defaulters' | 'structures'
  const [activeTab, setActiveTab] = useState<'invoices' | 'defaulters' | 'structures'>('invoices');

  // Defaulters State (Student-wise Pending Fees)
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [defaultersLoading, setDefaultersLoading] = useState(false);
  const [defaulterSearch, setDefaulterSearch] = useState('');
  const [defaulterClass, setDefaulterClass] = useState('');

  // Fee Structure & Class Pricing State
  const [categories, setCategories] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [structureClasses, setStructureClasses] = useState<any[]>([]);
  const [selectedStructureClass, setSelectedStructureClass] = useState('');
  const [editingAmounts, setEditingAmounts] = useState<Record<string, number>>({});
  const [isSavingStructure, setIsSavingStructure] = useState(false);
  const [structuresLoading, setStructuresLoading] = useState(false);

  // Add Category Modal
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    frequency: 'monthly',
    isOptional: false,
  });
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchFees(true);
    fetchDefaulters();
    fetchStructures();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/school-erp/academic');
      const json = await res.json();
      if (res.ok && json.success) setClasses(json.data.classes || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFees = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch('/api/school-erp/fees');
      const json = await res.json();
      if (res.ok && json.success) {
        setInvoices(json.data.invoices || []);
        setSummary(json.data.summary || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleClassSelect = async (classId: string) => {
    setGenForm((prev) => ({ ...prev, classId }));
    setSelectedStudentId('');
    if (classId) {
      try {
        const res = await fetch(`/api/school-erp/students?classId=${classId}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setClassStudents(json.data.students || []);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setClassStudents([]);
    }
  };

  const handleGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genForm.classId) {
      toast.error('Please select a class');
      return;
    }
    if (invoiceTarget === 'student' && !selectedStudentId) {
      toast.error('Please select a student');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = { action: 'generate_invoices', ...genForm };
      if (invoiceTarget === 'student') {
        payload.studentId = selectedStudentId;
      }

      const res = await fetch('/api/school-erp/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Invoice(s) generated successfully');
        setIsGenerateOpen(false);
        fetchFees();
      } else {
        toast.error(json.message || 'Generation failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !payForm.amount) {
      toast.error('Please enter payment amount');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/school-erp/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_payment',
          invoiceId: selectedInvoice.id,
          studentId: selectedInvoice.studentId,
          ...payForm,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Fee recorded! Receipt: ${json.data.receiptNo}`);
        setIsCollectOpen(false);

        // Fetch single receipt details for printable view
        const recRes = await fetch(`/api/school-erp/fees?receiptNo=${json.data.receiptNo}`);
        const recJson = await recRes.json();
        if (recRes.ok && recJson.data?.receipt) {
          setReceiptData(recJson.data.receipt);
        }

        fetchFees();
        fetchDefaulters();
      } else {
        toast.error(json.message || 'Payment recording failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchDefaulters = async (classId?: string) => {
    setDefaultersLoading(true);
    try {
      let url = '/api/school-erp/fees?section=defaulters';
      if (classId) url += `&classId=${classId}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.success) {
        setDefaulters(json.data.defaulters || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDefaultersLoading(false);
    }
  };

  const fetchStructures = async () => {
    setStructuresLoading(true);
    try {
      const res = await fetch('/api/school-erp/fees?section=structures');
      const json = await res.json();
      if (res.ok && json.success) {
        const cats = json.data.categories || [];
        const structs = json.data.structures || [];
        const cls = json.data.classes || [];
        setCategories(cats);
        setStructures(structs);
        setStructureClasses(cls);

        const activeCid = selectedStructureClass || (cls.length > 0 ? cls[0].id : '');
        if (!selectedStructureClass && cls.length > 0) {
          setSelectedStructureClass(cls[0].id);
        }

        const map: Record<string, number> = {};
        for (const cat of cats) {
          const match = structs.find((s: any) => s.classId === activeCid && s.categoryId === cat.id);
          map[cat.id] = match ? Number(match.amount) : 0;
        }
        setEditingAmounts(map);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStructuresLoading(false);
    }
  };

  const handleSelectStructureClass = (classId: string) => {
    setSelectedStructureClass(classId);
    const map: Record<string, number> = {};
    for (const cat of categories) {
      const match = structures.find((s: any) => s.classId === classId && s.categoryId === cat.id);
      map[cat.id] = match ? Number(match.amount) : 0;
    }
    setEditingAmounts(map);
  };

  const handleSaveClassStructure = async () => {
    if (!selectedStructureClass) return;
    setIsSavingStructure(true);
    const toastId = toast.loading('Saving fee structure for class...');

    const structureList = Object.entries(editingAmounts).map(([categoryId, amount]) => ({
      categoryId,
      amount: Number(amount) || 0,
    }));

    try {
      const res = await fetch('/api/school-erp/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_set_class_structures',
          classId: selectedStructureClass,
          structures: structureList,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Fee structure updated successfully!', { id: toastId });
        fetchStructures();
      } else {
        toast.error(json.message || 'Failed to update', { id: toastId });
      }
    } catch {
      toast.error('Network error occurred', { id: toastId });
    } finally {
      setIsSavingStructure(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryForm.name) {
      toast.error('Category name is required');
      return;
    }
    setIsAddingCategory(true);
    const toastId = toast.loading('Adding fee category...');
    try {
      const res = await fetch('/api/school-erp/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_category',
          ...newCategoryForm,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Category added', { id: toastId });
        setIsAddCategoryOpen(false);
        setNewCategoryForm({ name: '', frequency: 'monthly', isOptional: false });
        fetchStructures();
      } else {
        toast.error(json.message || 'Failed to add category', { id: toastId });
      }
    } catch {
      toast.error('Error occurred', { id: toastId });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete fee category '${catName}'?`)) return;
    const toastId = toast.loading('Removing fee category...');
    try {
      const res = await fetch('/api/school-erp/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_category', categoryId: catId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Category removed', { id: toastId });
        fetchStructures();
      } else {
        toast.error(json.message || 'Failed to remove', { id: toastId });
      }
    } catch {
      toast.error('Error occurred', { id: toastId });
    }
  };

  const buildWhatsAppFeeReminder = (def: any) => {
    const rawPhone = (def.fatherPhone || def.motherPhone || '').replace(/\D/g, '');
    const cleanPhone =
      rawPhone.startsWith('91') && rawPhone.length === 12
        ? rawPhone
        : rawPhone.length === 10
        ? `91${rawPhone}`
        : rawPhone;
    const studentName = `${def.firstName} ${def.lastName}`.trim();
    const className = `${def.className || ''} ${def.sectionName ? `(${def.sectionName})` : ''}`.trim();
    const pendingAmount = Number(def.totalPending || 0).toLocaleString('en-IN');

    const msg = encodeURIComponent(
      `Dear Parent,\n\nThis is an official fee reminder regarding ${studentName} [Class: ${className}, Adm No: ${def.admissionNo}].\n\nOutstanding fee balance of ₹${pendingAmount} is pending for the academic term.\n\nPlease clear the dues at your earliest convenience at the school fee counter or via online portal.\n\nThank you,\nSchool Accounts Office`
    );
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${msg}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Fees Management & Billing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure fee structures, generate batch invoices, collect cash/UPI payments, and issue printable receipts.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-2 shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Generate Class Invoices
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Total Invoiced</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{Number(summary.totalBilled || 0).toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Total Collected</span>
          <div className="text-2xl font-black text-emerald-600">
            ₹{Number(summary.totalCollected || 0).toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Total Outstanding</span>
          <div className="text-2xl font-black text-amber-600">
            ₹{Number(summary.totalPending || 0).toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Total Concessions</span>
          <div className="text-2xl font-black text-purple-600">
            ₹{Number(summary.totalDiscounts || 0).toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 md:col-span-1">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1 flex items-center gap-1">
            <Bus className="h-3 w-3 text-indigo-500" /> Bus Transport
          </span>
          <div className="text-2xl font-black text-indigo-600">
            ₹{Number(summary.totalMonthlyBusRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {summary.totalBusStudents || 0} students on bus
          </span>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 pb-2 overflow-x-auto font-bold text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="h-4 w-4" /> Invoices & Receipts Ledger ({invoices.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('defaulters');
            fetchDefaulters();
          }}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'defaulters'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <AlertCircle className="h-4 w-4" /> Pending Fees & Defaulters ({defaulters.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('structures');
            fetchStructures();
          }}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'structures'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Layers className="h-4 w-4" /> Class Fee Structures & Adjustment ({structureClasses.length} Classes)
        </button>
      </div>

      {/* TAB 1: INVOICES & RECEIPTS LEDGER */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Student Invoices Ledger</h2>
            <span className="text-xs text-slate-500">{invoices.length} Invoices</span>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-xs text-slate-500">Loading invoices...</p>
            </div>
          ) : invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((inv) => {
                    const bal = Number(inv.totalAmount) - Number(inv.paidAmount);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inv.invoiceNo}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          <Link
                            href={`/school-admin/students?studentId=${inv.studentId}&search=${encodeURIComponent(inv.admissionNo || '')}`}
                            className="hover:text-indigo-600 hover:underline cursor-pointer"
                            title="View Student 360° Profile"
                          >
                            {inv.firstName} {inv.lastName}
                          </Link>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-[10px] text-slate-400 font-normal">{inv.admissionNo}</span>
                            {(inv.transportOpted || inv.stopName || inv.routeName) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[9px] font-bold">
                                <Bus className="h-2.5 w-2.5" /> {inv.stopName || inv.routeName || 'Bus Active'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {inv.className} ({inv.sectionName || 'A'})
                        </td>
                        <td className="py-3 px-4 font-bold">₹{inv.totalAmount}</td>
                        <td className="py-3 px-4 text-emerald-600 font-bold">₹{inv.paidAmount}</td>
                        <td className="py-3 px-4 text-amber-600 font-bold">₹{bal}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                              inv.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {inv.status !== 'paid' ? (
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPayForm({
                                  ...payForm,
                                  amount: String(bal),
                                });
                                setIsCollectOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 cursor-pointer shadow"
                            >
                              Collect ₹{bal}
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Fully Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-500">
              No fee invoices generated yet. Click &quot;Generate Class Invoices&quot; to issue monthly fees.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENT-WISE PENDING FEES & DEFAULTERS */}
      {activeTab === 'defaulters' && (
        <div className="space-y-4">
          {/* Defaulter Filters & Search */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={defaulterSearch}
                onChange={(e) => setDefaulterSearch(e.target.value)}
                placeholder="Search student by name, admission no, or father phone..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={defaulterClass}
                onChange={(e) => {
                  setDefaulterClass(e.target.value);
                  fetchDefaulters(e.target.value);
                }}
                className="w-full sm:w-44 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 outline-none"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => fetchDefaulters(defaulterClass)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Defaulters Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" /> Outstanding Due Fee Defaulters
                </h2>
                <p className="text-[11px] text-slate-400">
                  Track exact balance due per student, send 1-click WhatsApp reminders, or collect payment directly.
                </p>
              </div>

              {defaulters.length > 0 && (
                <div className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-black text-amber-700 dark:text-amber-300">
                  Total Outstanding:{' '}
                  ₹
                  {defaulters
                    .reduce((sum, d) => sum + Number(d.totalPending || 0), 0)
                    .toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {defaultersLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-600 mb-2" />
                <p className="text-xs text-slate-500">Calculating student balances...</p>
              </div>
            ) : defaulters.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Student & Adm No</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Father Contact</th>
                      <th className="py-3 px-4">Unpaid Bills</th>
                      <th className="py-3 px-4">Billed Amount</th>
                      <th className="py-3 px-4">Paid Amount</th>
                      <th className="py-3 px-4">Pending Due</th>
                      <th className="py-3 px-4">Earliest Due</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {defaulters
                      .filter((d) => {
                        const q = defaulterSearch.toLowerCase().trim();
                        if (!q) return true;
                        return (
                          d.firstName?.toLowerCase().includes(q) ||
                          d.lastName?.toLowerCase().includes(q) ||
                          d.admissionNo?.toLowerCase().includes(q) ||
                          d.fatherName?.toLowerCase().includes(q) ||
                          d.fatherPhone?.includes(q)
                        );
                      })
                      .map((def) => {
                        const pending = Number(def.totalPending || 0);
                        const isOverdue =
                          def.earliestDueDate && new Date(def.earliestDueDate) < new Date();
                        const firstInvId = def.pendingInvoicesSummary?.split('|')?.[0]?.split(':')?.[0];

                        return (
                          <tr key={def.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              <Link
                                href={`/school-admin/students?studentId=${def.studentId}&search=${encodeURIComponent(def.admissionNo || '')}`}
                                className="hover:text-indigo-600 hover:underline cursor-pointer"
                                title="View Student 360° Profile"
                              >
                                {def.firstName} {def.lastName}
                              </Link>
                              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                <span className="text-[10px] text-slate-400 font-mono font-normal">
                                  {def.admissionNo}
                                </span>
                                {(def.transportOpted || def.stopName || def.routeName) && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[9px] font-bold">
                                    <Bus className="h-2.5 w-2.5" /> {def.stopName || def.routeName || 'Bus Active'}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                              {def.className} ({def.sectionName || 'A'})
                            </td>

                            <td className="py-3 px-4">
                              <span className="block font-semibold text-slate-800 dark:text-slate-200">
                                {def.fatherName || 'Parent'}
                              </span>
                              {def.fatherPhone ? (
                                <a
                                  href={`tel:${def.fatherPhone}`}
                                  className="text-slate-500 hover:text-indigo-600 text-[11px] flex items-center gap-1"
                                >
                                  <Phone className="h-3 w-3" /> {def.fatherPhone}
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[10px]">No phone</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                                {def.unpaidInvoicesCount} Bill(s)
                              </span>
                            </td>

                            <td className="py-3 px-4 font-bold">₹{Number(def.totalBilled || 0).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4 text-emerald-600 font-bold">₹{Number(def.totalPaid || 0).toLocaleString('en-IN')}</td>

                            <td className="py-3 px-4">
                              <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-black text-xs inline-block">
                                ₹{pending.toLocaleString('en-IN')}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`block font-semibold ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                {def.earliestDueDate ? new Date(def.earliestDueDate).toLocaleDateString() : '—'}
                              </span>
                              {isOverdue && (
                                <span className="text-[9px] uppercase font-black text-rose-500 tracking-wider">
                                  Overdue
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {(def.fatherPhone || def.motherPhone) && (
                                  <a
                                    href={buildWhatsAppFeeReminder(def)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 border border-emerald-200 transition-colors shadow-xs"
                                    title="Send WhatsApp Fee Reminder"
                                  >
                                    <Send className="h-3 w-3" /> WhatsApp
                                  </a>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedInvoice({
                                      id: firstInvId || 'DEF-' + def.studentId,
                                      studentId: def.studentId,
                                      firstName: def.firstName,
                                      lastName: def.lastName,
                                      admissionNo: def.admissionNo,
                                      className: def.className,
                                      totalAmount: def.totalPending,
                                      paidAmount: 0,
                                    });
                                    setPayForm({
                                      amount: String(pending),
                                      paymentMethod: 'cash',
                                      transactionRef: '',
                                      notes: 'Clear outstanding dues',
                                    });
                                    setIsCollectOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 cursor-pointer shadow"
                                >
                                  Collect ₹{pending}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Pending Fee Defaulters</p>
                <p className="text-slate-400 max-w-sm mx-auto">
                  All active students in this selection have cleared their current fee invoices.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CLASS FEE STRUCTURES & ADJUSTMENT MATRIX */}
      {activeTab === 'structures' && (
        <div className="space-y-6">
          {/* Class Selector Pills */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-600" /> Select Class to Configure Fee Structure
                </h3>
                <p className="text-[11px] text-slate-400">
                  Pick any class to view and adjust monthly/annual fee amounts per category.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 border border-indigo-200 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add New Fee Category
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {structureClasses.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => handleSelectStructureClass(cls.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    selectedStructureClass === cls.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          </div>

          {/* Fee Matrix Form for Selected Class */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Fee Breakdown for{' '}
                  <span className="text-indigo-600">
                    {structureClasses.find((c) => c.id === selectedStructureClass)?.name || 'Selected Class'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjust standard monthly, one-time, and term fee charges. Changes will apply to all upcoming invoices.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Monthly Fee</span>
                  <span className="font-black text-indigo-700 dark:text-indigo-300 text-sm">
                    ₹
                    {categories
                      .filter((c) => c.frequency === 'monthly')
                      .reduce((sum, c) => sum + Number(editingAmounts[c.id] || 0), 0)
                      .toLocaleString('en-IN')}
                    /mo
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveClassStructure}
                  disabled={isSavingStructure}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  {isSavingStructure ? 'Saving...' : 'Save Class Fee Structure'}
                </button>
              </div>
            </div>

            {structuresLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
                <p className="text-xs text-slate-500">Loading fee structures...</p>
              </div>
            ) : categories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Fee Category Name</th>
                      <th className="py-3 px-4">Billing Frequency</th>
                      <th className="py-3 px-4">Optional / Mandatory</th>
                      <th className="py-3 px-4">Amount for this Class (₹)</th>
                      <th className="py-3 px-4 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {categories.map((cat) => {
                      const currentAmt = editingAmounts[cat.id] ?? 0;
                      return (
                        <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {cat.name}
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase">
                              {cat.frequency}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`text-[11px] font-semibold ${
                                cat.isOptional ? 'text-amber-600' : 'text-slate-500'
                              }`}
                            >
                              {cat.isOptional ? 'Optional (Transport/Hostel)' : 'Compulsory'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 max-w-[180px]">
                              <span className="text-slate-400 font-bold">₹</span>
                              <input
                                type="number"
                                min="0"
                                value={currentAmt}
                                onChange={(e) =>
                                  setEditingAmounts({
                                    ...editingAmounts,
                                    [cat.id]: Number(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-sm text-indigo-700 dark:text-indigo-300 outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            {cat.name !== 'Monthly Tuition Fee' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete this fee category"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500 space-y-3">
                <Layers className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No fee categories created yet</p>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Create First Fee Category
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: GENERATE INVOICES */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Batch Generate Fee Invoices</h3>
              <button onClick={() => setIsGenerateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoices} className="space-y-4 text-xs">
              {/* Target Selector: Batch Class vs Single Student */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Invoices To</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setInvoiceTarget('class')}
                    className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      invoiceTarget === 'class'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Entire Class (Batch)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceTarget('student');
                      if (genForm.classId) handleClassSelect(genForm.classId);
                    }}
                    className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      invoiceTarget === 'student'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Single Student
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Class *</label>
                <select
                  value={genForm.classId}
                  onChange={(e) => handleClassSelect(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.studentCount || 0} Students)
                    </option>
                  ))}
                </select>
              </div>

              {invoiceTarget === 'student' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Student *</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
                  >
                    <option value="">
                      {genForm.classId
                        ? classStudents.length > 0
                          ? 'Select Student to Invoice'
                          : 'No students found in this class'
                        : 'Select Class first'}
                    </option>
                    {classStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} (Roll: {s.rollNo || '—'} • Adm: {s.admissionNo})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Invoice Title</label>
                <input
                  type="text"
                  value={genForm.title}
                  onChange={(e) => setGenForm({ ...genForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Billing Month</label>
                <input
                  type="text"
                  value={genForm.monthYear}
                  onChange={(e) => setGenForm({ ...genForm, monthYear: e.target.value })}
                  placeholder="e.g. November 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={genForm.dueDate}
                  onChange={(e) => setGenForm({ ...genForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                >
                  {submitting
                    ? 'Generating...'
                    : invoiceTarget === 'student'
                    ? 'Issue Student Invoice'
                    : 'Generate Class Invoices'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD PAYMENT */}
      {isCollectOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Record Fee Payment</h3>
              <button onClick={() => setIsCollectOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-slate-700 mb-4">
              <span className="font-bold block">
                {selectedInvoice.firstName} {selectedInvoice.lastName} ({selectedInvoice.admissionNo})
              </span>
              <span>
                Invoice: {selectedInvoice.invoiceNo} • Total: ₹{selectedInvoice.totalAmount}
              </span>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount to Pay (₹) *</label>
                <input
                  type="number"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={payForm.paymentMethod}
                  onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="cash">Cash (Counter)</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="bank_transfer">Bank Transfer / IMPS</option>
                  <option value="cheque">Cheque</option>
                  <option value="online">Online Payment Gateway</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Ref / UPI UTR / Cheque No
                </label>
                <input
                  type="text"
                  value={payForm.transactionRef}
                  onChange={(e) => setPayForm({ ...payForm, transactionRef: e.target.value })}
                  placeholder="e.g. UPI-9481249"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCollectOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Record & Issue Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE RECEIPT */}
      {receiptData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <span className="text-xs font-black uppercase text-emerald-600">Official Fee Receipt</span>
              <button onClick={() => setReceiptData(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3 text-xs">
              <div className="text-center pb-3 border-b border-slate-200">
                <h3 className="font-black text-base uppercase text-slate-900">{receiptData.schoolName}</h3>
                <p className="text-[11px] text-slate-500">{receiptData.schoolAddress}</p>
                <span className="inline-block mt-1 font-mono font-bold text-indigo-700 text-xs">
                  Receipt No: {receiptData.receiptNo}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Student Name:</span>
                  <span className="font-bold">
                    {receiptData.firstName} {receiptData.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Admission No:</span>
                  <span className="font-mono font-bold">{receiptData.admissionNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Class:</span>
                  <span className="font-bold">{receiptData.className}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Payment Date:</span>
                  <span className="font-bold">{new Date(receiptData.paymentDate).toLocaleDateString()}</span>
                </div>
              </div>

              {(receiptData.stopName || receiptData.routeName) && (
                <div className="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Bus className="h-3 w-3 text-amber-600" /> Transport Stop:
                  </span>
                  <span>
                    {receiptData.stopName ? `${receiptData.stopName} (${receiptData.routeName})` : receiptData.routeName}
                  </span>
                </div>
              )}

              {/* Items Breakdown if available */}
              {(() => {
                let itemsList: any[] = [];
                try {
                  itemsList = typeof receiptData.itemsJson === 'string'
                    ? JSON.parse(receiptData.itemsJson)
                    : receiptData.itemsJson || [];
                } catch {}

                if (itemsList.length === 0) return null;
                return (
                  <div className="py-2 border-y border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fee Breakdown:</span>
                    {itemsList.map((it: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-slate-600 text-[11px]">
                        <span>{it.name}</span>
                        <span className="font-semibold font-mono">₹{Number(it.amount).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="p-3 rounded-xl bg-white border border-slate-200 flex justify-between items-center text-sm font-black">
                <span>Amount Paid:</span>
                <span className="text-emerald-700 text-base">₹{Number(receiptData.amount).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                <span>Mode: {receiptData.paymentMethod?.toUpperCase()}</span>
                <QrCode className="h-6 w-6 text-slate-700" />
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow"
            >
              <Printer className="h-4 w-4" /> Print / Save Fee Receipt
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW FEE CATEGORY */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-indigo-600" /> Create Fee Category
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryForm.name}
                  onChange={(e) =>
                    setNewCategoryForm({ ...newCategoryForm, name: e.target.value })
                  }
                  placeholder="e.g. Computer Lab Fee / Science Kit"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Billing Frequency
                </label>
                <select
                  value={newCategoryForm.frequency}
                  onChange={(e) =>
                    setNewCategoryForm({ ...newCategoryForm, frequency: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly (Every 3 months)</option>
                  <option value="half_yearly">Half Yearly (Every 6 months)</option>
                  <option value="yearly">Yearly (Annual)</option>
                  <option value="one_time">One Time (Admission/Registration)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cat-optional"
                  checked={newCategoryForm.isOptional}
                  onChange={(e) =>
                    setNewCategoryForm({ ...newCategoryForm, isOptional: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label
                  htmlFor="cat-optional"
                  className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer text-xs"
                >
                  Optional Service (e.g. Transport, Hostel, Canteen)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingCategory}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {isAddingCategory ? 'Adding...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

