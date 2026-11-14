'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  CreditCard,
  Printer,
  Edit,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Loader2,
  QrCode,
  GraduationCap,
  Bus,
  Eye,
  CalendarCheck2,
  FileCheck2,
  Award,
  Phone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Receipt,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentsManagementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [idCardStudent, setIdCardStudent] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // 360 Student Profile Modal
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileTab, setProfileTab] = useState<'info' | 'fees' | 'transport' | 'attendance' | 'marksheets'>('info');

  // Quick Collect Fee from inside Profile
  const [collectingInvoice, setCollectingInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payRef, setPayRef] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  // Bus Pass Printable Modal
  const [busPassStudent, setBusPassStudent] = useState<any>(null);
  const [schoolMeta, setSchoolMeta] = useState<any>(null);

  // Issue Invoice Modal inside Student Profile
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    title: 'Monthly Tuition Fee',
    monthYear: 'November 2026',
    discount: '0',
    dueDate: '2026-11-25',
  });
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  // Generate Marksheet Modal inside Student Profile
  const [isGenerateMarksheetOpen, setIsGenerateMarksheetOpen] = useState(false);
  const [marksheetForm, setMarksheetForm] = useState({
    examId: '',
    templateDesign: 'classic',
  });
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [isGeneratingMarksheet, setIsGeneratingMarksheet] = useState(false);

  // New Student Form
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    admissionNo: '',
    rollNo: '',
    classId: '',
    dob: '2012-05-15',
    gender: 'Male',
    bloodGroup: 'B+',
    fatherName: '',
    motherName: '',
    fatherPhone: '',
    address: '',
    city: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search');
      if (q) setSearch(q);
      const stdId = params.get('studentId');
      if (stdId) handleOpenProfile(stdId);
    }
    fetchClasses();
    fetchStudents(true);
    fetchSchoolMeta();
    fetchAvailableExams();
  }, []);

  const fetchAvailableExams = async () => {
    try {
      const res = await fetch('/api/school-erp/exams');
      const json = await res.json();
      if (res.ok && json.data?.exams) {
        setAvailableExams(json.data.exams);
        if (json.data.exams.length > 0) {
          setMarksheetForm((prev) => ({ ...prev, examId: json.data.exams[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSchoolMeta = async () => {
    try {
      const res = await fetch('/api/school-erp/auth');
      const json = await res.json();
      if (res.ok && json.data?.school) {
        setSchoolMeta(json.data.school);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenProfile = async (studentId: string) => {
    setProfileLoading(true);
    setProfileTab('info');
    try {
      const res = await fetch(`/api/school-erp/students?studentId=${studentId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setProfileData(json.data);
      } else {
        toast.error('Could not load student profile');
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRecordProfileFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingInvoice || !payAmount) return;
    setIsPaying(true);
    try {
      const res = await fetch('/api/school-erp/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_payment',
          invoiceId: collectingInvoice.id,
          studentId: collectingInvoice.studentId,
          amount: payAmount,
          paymentMethod: payMethod,
          transactionRef: payRef,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Fee recorded! Receipt: ${json.data.receiptNo}`);
        setCollectingInvoice(null);
        if (profileData?.student?.id) {
          handleOpenProfile(profileData.student.id);
        }
        fetchStudents();
      } else {
        toast.error(json.message || 'Payment recording failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setIsPaying(false);
    }
  };

  const handleCreateStudentInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData?.student?.id) return;
    setIsCreatingInvoice(true);
    const toastId = toast.loading('Generating student fee invoice...');
    try {
      const res = await fetch('/api/school-erp/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_invoices',
          studentId: profileData.student.id,
          classId: profileData.student.classId,
          title: invoiceForm.title,
          monthYear: invoiceForm.monthYear,
          dueDate: invoiceForm.dueDate,
          discount: Number(invoiceForm.discount) || 0,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Invoice issued successfully!', { id: toastId });
        setIsCreateInvoiceOpen(false);
        handleOpenProfile(profileData.student.id);
      } else {
        toast.error(json.message || 'Failed to issue invoice', { id: toastId });
      }
    } catch {
      toast.error('Network error occurred', { id: toastId });
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleGenerateStudentMarksheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData?.student?.id || !marksheetForm.examId) {
      toast.error('Please select an Examination');
      return;
    }
    setIsGeneratingMarksheet(true);
    const toastId = toast.loading('Calculating marks & generating official marksheet...');
    try {
      const res = await fetch('/api/school-erp/marksheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_single',
          studentId: profileData.student.id,
          classId: profileData.student.classId,
          examId: marksheetForm.examId,
          templateDesign: marksheetForm.templateDesign,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Marksheet generated!', { id: toastId });
        setIsGenerateMarksheetOpen(false);
        handleOpenProfile(profileData.student.id);
      } else {
        toast.error(json.message || 'Failed to generate marksheet', { id: toastId });
      }
    } catch {
      toast.error('Network error occurred', { id: toastId });
    } finally {
      setIsGeneratingMarksheet(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/school-erp/academic');
      const json = await res.json();
      if (res.ok && json.success) {
        setClasses(json.data.classes || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      let url = '/api/school-erp/students?';
      if (selectedClass) url += `classId=${selectedClass}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.success) {
        setStudents(json.data.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.classId) {
      toast.error('First name and class are required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/school-erp/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_student', ...form }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Student admitted! Adm No: ${json.data.admissionNo}`);
        setIsAddOpen(false);
        setForm({
          firstName: '',
          lastName: '',
          admissionNo: '',
          rollNo: '',
          classId: '',
          dob: '2012-05-15',
          gender: 'Male',
          bloodGroup: 'B+',
          fatherName: '',
          motherName: '',
          fatherPhone: '',
          address: '',
          city: '',
        });
        fetchStudents();
      } else {
        toast.error(json.message || 'Failed to add student');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Students Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student registrations, profiles, class enrollment, and print digital ID cards.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-2 shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Register New Student
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
            placeholder="Search student by name, admission no, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 outline-none"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 outline-none"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => fetchStudents()}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          Filter
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-xs text-slate-500">Loading student directory...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Adm No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Parent Details</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{s.admissionNo}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <button
                        onClick={() => handleOpenProfile(s.id)}
                        className="text-left font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors cursor-pointer group flex items-center gap-1.5"
                      >
                        <span>{s.firstName} {s.lastName}</span>
                        <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
                      </button>
                      {s.transportOpted ? (
                        <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[9px] font-bold block w-fit">
                          <Bus className="h-2.5 w-2.5" /> Bus: {s.stopName || s.routeName || 'Opted'}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {s.className} ({s.sectionName || 'A'})
                    </td>
                    <td className="py-3 px-4 text-slate-600">{s.rollNo || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">{s.fatherName || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">{s.fatherPhone || '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenProfile(s.id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer shadow-sm transition-all duration-150 active:scale-[0.96]"
                          title="Open 360° Comprehensive Profile"
                        >
                          <Eye className="h-3 w-3" /> 360° Profile
                        </button>
                        <button
                          onClick={() => setIdCardStudent(s)}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-all duration-150 active:scale-[0.96]"
                          title="Print Student ID Card"
                        >
                          <CreditCard className="h-3 w-3" /> ID
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-500">
            No students found matching your criteria. Click &quot;Register New Student&quot; to add.
          </div>
        )}
      </div>

      {/* MODAL: ADD STUDENT */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Register New Student</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                    placeholder="Aarav"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Class *</label>
                  <select
                    value={form.classId}
                    onChange={(e) => setForm({ ...form, classId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={form.rollNo}
                    onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                    placeholder="e.g. 01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Father&apos;s Name</label>
                  <input
                    type="text"
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    placeholder="Suresh Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Father&apos;s Mobile *</label>
                  <input
                    type="text"
                    value={form.fatherPhone}
                    onChange={(e) => setForm({ ...form, fatherPhone: e.target.value })}
                    placeholder="9876543210"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Admitting...' : 'Admit Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINT DIGITAL ID CARD */}
      {idCardStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black uppercase text-indigo-600">Student Identity Card</span>
              <button onClick={() => setIdCardStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ID Card Visual */}
            <div className="border-2 border-indigo-600 rounded-2xl p-4 bg-gradient-to-b from-indigo-50 to-white text-center space-y-3 relative overflow-hidden shadow">
              <div className="bg-indigo-600 text-white py-1 px-3 rounded-lg text-xs font-black uppercase tracking-wider">
                Student ID Card
              </div>

              <div className="h-20 w-20 mx-auto rounded-xl bg-slate-200 border-2 border-white shadow flex items-center justify-center overflow-hidden">
                <GraduationCap className="h-10 w-10 text-indigo-600" />
              </div>

              <div>
                <h3 className="font-black text-base text-slate-900">
                  {idCardStudent.firstName} {idCardStudent.lastName}
                </h3>
                <span className="font-mono text-xs font-bold text-indigo-600">{idCardStudent.admissionNo}</span>
              </div>

              <div className="text-xs space-y-1 text-left bg-white p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">Class & Sec:</span>
                  <span className="font-bold text-slate-800">
                    {idCardStudent.className} ({idCardStudent.sectionName || 'A'}) • Roll: {idCardStudent.rollNo || '01'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">Father:</span>
                  <span className="font-bold text-slate-800">{idCardStudent.fatherName || 'Not Listed'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">Emergency Phone:</span>
                  <span className="font-bold text-slate-800">{idCardStudent.fatherPhone || 'Not Listed'}</span>
                </div>
                {idCardStudent.transportOpted && (
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] block">School Bus Stop:</span>
                    <span className="font-bold text-amber-700 flex items-center gap-1">
                      <Bus className="h-3 w-3" /> {idCardStudent.stopName || idCardStudent.routeName || 'Transport Opted'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                <span>Authorized Signatory</span>
                <QrCode className="h-6 w-6 text-slate-800" />
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center justify-center gap-1.5 shadow"
            >
              <Printer className="h-4 w-4" /> Print ID Card
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 360° STUDENT COMPREHENSIVE PROFILE MODAL */}
      {/* ---------------------------------------------------- */}
      {profileLoading && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-3 shadow-xl">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Loading student 360° records...</span>
          </div>
        </div>
      )}

      {profileData && profileData.student && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
                  {profileData.student.firstName?.[0]}
                  {profileData.student.lastName?.[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {profileData.student.firstName} {profileData.student.lastName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Active Student
                    </span>
                    {profileData.student.transportOpted ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                        <Bus className="h-2.5 w-2.5" /> Transport
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 mt-1 flex-wrap">
                    <span>Adm No: <strong className="text-slate-800 dark:text-slate-200 font-mono">{profileData.student.admissionNo}</strong></span>
                    <span>•</span>
                    <span>Class: <strong className="text-slate-800 dark:text-slate-200">{profileData.student.className} ({profileData.student.sectionName || 'A'})</strong></span>
                    <span>•</span>
                    <span>Roll: <strong className="text-slate-800 dark:text-slate-200">{profileData.student.rollNo || '—'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIdCardStudent(profileData.student)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Print ID Card"
                >
                  <CreditCard className="h-3.5 w-3.5" /> ID Card
                </button>
                {profileData.student.transportOpted ? (
                  <button
                    onClick={() => setBusPassStudent(profileData.student)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Print Bus Pass"
                  >
                    <Bus className="h-3.5 w-3.5" /> Bus Pass
                  </button>
                ) : null}
                <button
                  onClick={() => setProfileData(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 gap-1 overflow-x-auto font-bold bg-white dark:bg-slate-900 shrink-0">
              <button
                onClick={() => setProfileTab('info')}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                  profileTab === 'info'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Users className="h-3.5 w-3.5" /> Personal & Family
              </button>

              <button
                onClick={() => setProfileTab('fees')}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                  profileTab === 'fees'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" /> Fee Ledger ({profileData.invoices?.length || 0})
              </button>

              <button
                onClick={() => setProfileTab('transport')}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                  profileTab === 'transport'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Bus className="h-3.5 w-3.5" /> Bus Transport
              </button>

              <button
                onClick={() => setProfileTab('attendance')}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                  profileTab === 'attendance'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <CalendarCheck2 className="h-3.5 w-3.5" /> Attendance ({profileData.attendance?.attendancePercent || 95}%)
              </button>

              <button
                onClick={() => setProfileTab('marksheets')}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                  profileTab === 'marksheets'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Award className="h-3.5 w-3.5" /> Marksheets ({profileData.marksheets?.length || 0})
              </button>
            </div>

            {/* Profile Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* TAB 1: PERSONAL & PARENT INFO */}
              {profileTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Father & Guardian</span>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {profileData.student.fatherName || 'Not Listed'}
                      </div>
                      {profileData.student.fatherPhone && (
                        <a href={`tel:${profileData.student.fatherPhone}`} className="text-indigo-600 hover:underline flex items-center gap-1 text-xs">
                          <Phone className="h-3 w-3" /> {profileData.student.fatherPhone}
                        </a>
                      )}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Mother Details</span>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {profileData.student.motherName || 'Not Listed'}
                      </div>
                      {profileData.student.motherPhone && (
                        <a href={`tel:${profileData.student.motherPhone}`} className="text-slate-600 flex items-center gap-1 text-xs">
                          <Phone className="h-3 w-3" /> {profileData.student.motherPhone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Date of Birth</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {profileData.student.dob ? new Date(profileData.student.dob).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Gender</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{profileData.student.gender || 'Male'}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Blood Group</span>
                      <span className="font-bold text-rose-600">{profileData.student.bloodGroup || 'B+'}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Category</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{profileData.student.category || 'General'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Residential Address</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {profileData.student.address || 'Local Address'}, {profileData.student.city || ''}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: FEES & BILLING LEDGER */}
              {profileTab === 'fees' && (
                <div className="space-y-4">
                  {/* Summary row */}
                  {(() => {
                    const invs = profileData.invoices || [];
                    const totalBilled = invs.reduce((sum: number, i: any) => sum + Number(i.totalAmount || 0), 0);
                    const totalPaid = invs.reduce((sum: number, i: any) => sum + Number(i.paidAmount || 0), 0);
                    const pending = totalBilled - totalPaid;

                    return (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Invoiced</span>
                          <span className="text-base font-black text-slate-900 dark:text-white">₹{totalBilled.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">Total Paid</span>
                          <span className="text-base font-black text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase block">Pending Balance</span>
                          <span className="text-base font-black text-amber-600">₹{pending.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Fee Invoices & Payments</span>
                    <button
                      type="button"
                      onClick={() => setIsCreateInvoiceOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" /> Issue Fee Invoice
                    </button>
                  </div>

                  {/* Invoices list */}
                  {profileData.invoices && profileData.invoices.length > 0 ? (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                          <tr>
                            <th className="py-2.5 px-3">Invoice No</th>
                            <th className="py-2.5 px-3">Title / Month</th>
                            <th className="py-2.5 px-3">Billed</th>
                            <th className="py-2.5 px-3">Paid</th>
                            <th className="py-2.5 px-3">Balance</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {profileData.invoices.map((inv: any) => {
                            const bal = Number(inv.totalAmount) - Number(inv.paidAmount);
                            return (
                              <tr key={inv.id}>
                                <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{inv.invoiceNo}</td>
                                <td className="py-2.5 px-3">{inv.title || inv.monthYear || 'Fee'}</td>
                                <td className="py-2.5 px-3 font-bold">₹{inv.totalAmount}</td>
                                <td className="py-2.5 px-3 text-emerald-600 font-bold">₹{inv.paidAmount}</td>
                                <td className="py-2.5 px-3 text-amber-600 font-bold">₹{bal}</td>
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                    inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {inv.status}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  {inv.status !== 'paid' ? (
                                    <button
                                      onClick={() => {
                                        setCollectingInvoice(inv);
                                        setPayAmount(String(bal));
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 cursor-pointer shadow-xs"
                                    >
                                      Collect ₹{bal}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-emerald-600 font-bold">Cleared</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 space-y-2">
                      <p>No invoices issued yet for this student.</p>
                      <button
                        type="button"
                        onClick={() => setIsCreateInvoiceOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Issue First Fee Invoice
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BUS TRANSPORT */}
              {profileTab === 'transport' && (
                <div className="space-y-4">
                  {profileData.student.transportOpted ? (
                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2">
                          <span className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                            <Bus className="h-4 w-4" />
                          </span>
                          <div>
                            <span className="font-black text-slate-900 dark:text-white text-sm block">
                              {profileData.student.routeName || 'Assigned Bus Route'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Vehicle: {profileData.student.vehicleNo || 'General'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setBusPassStudent(profileData.student)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 flex items-center gap-1 shadow cursor-pointer"
                        >
                          <Printer className="h-3.5 w-3.5" /> Print Bus Pass
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60">
                          <span className="text-[10px] text-slate-400 font-bold block">Pickup Stop</span>
                          <span className="font-bold text-slate-900 dark:text-white">{profileData.student.stopName || 'Stop Point'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60">
                          <span className="text-[10px] text-slate-400 font-bold block">Morning Pickup</span>
                          <span className="font-bold text-emerald-600">{profileData.student.pickupTime || '07:30 AM'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60">
                          <span className="text-[10px] text-slate-400 font-bold block">Afternoon Drop</span>
                          <span className="font-bold text-indigo-600">{profileData.student.dropTime || '02:30 PM'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60">
                          <span className="text-[10px] text-slate-400 font-bold block">Monthly Fare</span>
                          <span className="font-mono font-black text-emerald-600 text-sm">
                            ₹{Number(profileData.student.monthlyTransportFee || 0).toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200/60">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Driver in Charge</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{profileData.student.driverName || 'Driver'}</span>
                        </div>
                        {profileData.student.driverPhone && (
                          <a href={`tel:${profileData.student.driverPhone}`} className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1">
                            <Phone className="h-3 w-3" /> Call Driver ({profileData.student.driverPhone})
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400">
                      <Bus className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                      Student has not opted for school transport. You can assign them to a bus route from Transport Fleet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ATTENDANCE */}
              {profileTab === 'attendance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Days</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">{profileData.attendance?.totalDays || 0}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-bold block">Present</span>
                      <span className="text-xl font-black text-emerald-600">{profileData.attendance?.presentDays || 0}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
                      <span className="text-[10px] text-rose-700 dark:text-rose-300 uppercase font-bold block">Absent</span>
                      <span className="text-xl font-black text-rose-600">{profileData.attendance?.absentDays || 0}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center">
                      <span className="text-[10px] text-indigo-700 dark:text-indigo-300 uppercase font-bold block">Attendance %</span>
                      <span className="text-xl font-black text-indigo-600">{profileData.attendance?.attendancePercent || 95}%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>Overall Academic Attendance</span>
                      <span className="text-indigo-600">{profileData.attendance?.attendancePercent || 95}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, profileData.attendance?.attendancePercent || 95)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: MARKSHEETS */}
              {profileTab === 'marksheets' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Official Academic Marksheets</span>
                    <button
                      type="button"
                      onClick={() => setIsGenerateMarksheetOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Generate Marksheet
                    </button>
                  </div>

                  {profileData.marksheets && profileData.marksheets.length > 0 ? (
                    <div className="space-y-2.5">
                      {profileData.marksheets.map((ms: any) => (
                        <div
                          key={ms.id}
                          className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm block">
                              {ms.examName || 'Term Examination'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Verification Code: {ms.verificationCode}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="font-black text-indigo-600 text-sm block">{ms.percentage}% ({ms.grade})</span>
                              <span className={`text-[10px] font-bold ${ms.resultStatus === 'PASS' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {ms.resultStatus} • Rank #{ms.rankInClass || 1}
                              </span>
                            </div>

                            <a
                              href={`/verify-marksheet/${ms.verificationCode}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold flex items-center gap-1 shadow-xs"
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> View Marksheet
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 space-y-2">
                      <Award className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                      <p>No marksheets generated yet for this student.</p>
                      <button
                        type="button"
                        onClick={() => setIsGenerateMarksheetOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Generate First Marksheet
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* QUICK COLLECT FEE MODAL (INSIDE 360 PROFILE) */}
      {/* ---------------------------------------------------- */}
      {collectingInvoice && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-emerald-600" /> Collect Fee Payment
              </h4>
              <button onClick={() => setCollectingInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordProfileFee} className="space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono">
                <span className="text-[10px] text-slate-400 block">Invoice #{collectingInvoice.invoiceNo}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Total Billed: ₹{collectingInvoice.totalAmount}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount to Pay (₹) *</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm text-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="cash">Cash (Counter)</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="bank_transfer">Bank Transfer / IMPS</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reference / UTR / Cheque No</label>
                <input
                  type="text"
                  placeholder="Optional reference"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCollectingInvoice(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isPaying ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PRINTABLE STUDENT BUS PASS MODAL */}
      {/* ---------------------------------------------------- */}
      {busPassStudent && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <span className="text-xs font-black uppercase text-amber-600 flex items-center gap-1.5">
                <Bus className="h-4 w-4" /> Official Bus Pass
              </span>
              <button onClick={() => setBusPassStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Visual Bus Pass */}
            <div className="border-2 border-amber-500/80 rounded-2xl p-4 bg-gradient-to-br from-amber-500/5 via-white to-amber-500/10 shadow-sm relative overflow-hidden">
              <div className="text-center pb-2.5 border-b border-amber-200">
                <h4 className="font-black text-sm uppercase text-slate-900">
                  {schoolMeta?.name || 'School ERP'}
                </h4>
                <p className="text-[10px] text-slate-500 truncate">{schoolMeta?.address || 'Campus Road'}</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Session 2026 - 2027
                </span>
              </div>

              <div className="py-3 flex gap-3 items-center">
                <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0 text-slate-400 font-bold text-xs uppercase">
                  {busPassStudent.firstName?.[0]}
                  {busPassStudent.lastName?.[0]}
                </div>
                <div className="space-y-0.5 text-xs">
                  <h5 className="font-black text-slate-900 text-sm">
                    {busPassStudent.firstName} {busPassStudent.lastName}
                  </h5>
                  <div className="text-[11px] text-slate-600 font-semibold">
                    Class: {busPassStudent.className} ({busPassStudent.sectionName || 'A'})
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Adm: {busPassStudent.admissionNo}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 p-2.5 rounded-xl bg-white border border-amber-200 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Route:</span>
                  <span className="font-bold text-indigo-700">{busPassStudent.routeName || 'Transport Route'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Vehicle:</span>
                  <span className="font-mono font-bold text-slate-800">{busPassStudent.vehicleNo || 'General'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Stop:</span>
                  <span className="font-bold text-slate-900">{busPassStudent.stopName || 'Designated Point'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Pickup Time:</span>
                  <span className="font-semibold text-emerald-700">{busPassStudent.pickupTime || '07:30 AM'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Driver Phone:</span>
                  <span className="font-mono font-semibold text-slate-700">{busPassStudent.driverPhone || 'School Office'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-amber-200 text-[9px] text-slate-400">
                <div>
                  <span className="block font-bold text-slate-700">Transport Incharge</span>
                  <span>Authorized Signature</span>
                </div>
                <QrCode className="h-7 w-7 text-slate-800" />
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-4 w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 flex items-center justify-center gap-1.5 shadow cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Print Bus Pass
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: ISSUE NEW FEE INVOICE FOR STUDENT */}
      {/* ---------------------------------------------------- */}
      {isCreateInvoiceOpen && profileData?.student && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-indigo-600" /> Issue Fee Invoice
              </h4>
              <button onClick={() => setIsCreateInvoiceOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudentInvoice} className="space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono">
                <span className="text-[10px] text-slate-400 block">Student:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {profileData.student.firstName} {profileData.student.lastName} ({profileData.student.admissionNo})
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Invoice Title *</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.title}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
                  placeholder="e.g. Monthly Tuition Fee / Admission Fee"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Month / Session Label</label>
                <input
                  type="text"
                  value={invoiceForm.monthYear}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, monthYear: e.target.value })}
                  placeholder="e.g. November 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={invoiceForm.discount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateInvoiceOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingInvoice}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isCreatingInvoice ? 'Issuing...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: GENERATE MARKSHEET FOR STUDENT */}
      {/* ---------------------------------------------------- */}
      {isGenerateMarksheetOpen && profileData?.student && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600" /> Generate Marksheet
              </h4>
              <button onClick={() => setIsGenerateMarksheetOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateStudentMarksheet} className="space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono">
                <span className="text-[10px] text-slate-400 block">Student:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {profileData.student.firstName} {profileData.student.lastName} ({profileData.student.className})
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Examination *</label>
                <select
                  required
                  value={marksheetForm.examId}
                  onChange={(e) => setMarksheetForm({ ...marksheetForm, examId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
                >
                  <option value="">Select Exam</option>
                  {availableExams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.examType?.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Design Template</label>
                <select
                  value={marksheetForm.templateDesign}
                  onChange={(e) => setMarksheetForm({ ...marksheetForm, templateDesign: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
                >
                  <option value="classic">Design 1: Classic CBSE School Marksheet</option>
                  <option value="modern">Design 2: Modern Sleek Report Card</option>
                  <option value="colorful">Design 3: Premium Colorful Performance Sheet</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGenerateMarksheetOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingMarksheet}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 disabled:opacity-50"
                >
                  {isGeneratingMarksheet ? 'Generating...' : 'Generate Marksheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

