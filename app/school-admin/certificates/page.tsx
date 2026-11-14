'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Printer,
  CheckCircle2,
  Calendar,
  Award,
  Loader2,
  X,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [printCert, setPrintCert] = useState<any>(null);
  const [issuing, setIssuing] = useState(false);

  const [form, setForm] = useState({
    studentId: '',
    certType: 'transfer',
    reason: 'Parent transfer to another state',
    conductGrade: 'Excellent',
    issueDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchCertificates();
    fetchStudents();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/school-erp/certificates');
      const json = await res.json();
      if (res.ok && json.success) {
        setCertificates(json.data.certificates || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/school-erp/students');
      const json = await res.json();
      if (res.ok && json.success) {
        setStudents(json.data.students || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId) {
      toast.error('Please select a student');
      return;
    }

    setIssuing(true);
    try {
      const res = await fetch('/api/school-erp/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message);
        setIsIssueOpen(false);
        fetchCertificates();
      } else {
        toast.error(json.message || 'Failed to issue certificate');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Official School Certificates</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue Transfer Certificates (TC), Character Certificates, and Bonafide Certificates with verified security codes.
          </p>
        </div>

        <button
          onClick={() => setIsIssueOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-2 shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Issue Certificate
        </button>
      </div>

      {/* Certificates Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white">Issued Certificates Register</h2>
          <span className="text-xs text-slate-500">{certificates.length} Issued</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-xs text-slate-500">Loading certificate register...</p>
          </div>
        ) : certificates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Certificate No</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {certificates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{c.certificateNo}</td>
                    <td className="py-3 px-4 font-bold uppercase text-[11px] text-purple-600">
                      {c.certType} Certificate
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="py-3 px-4">{c.className}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(c.issueDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{c.reason || 'General'}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setPrintCert(c)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="h-3 w-3" /> View & Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-500">
            No certificates issued yet. Click &quot;Issue Certificate&quot; to generate your first document.
          </div>
        )}
      </div>

      {/* MODAL: ISSUE CERTIFICATE */}
      {isIssueOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Issue Official Certificate</h3>
              <button onClick={() => setIsIssueOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Select Student *</label>
                <select
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNo}) - {s.className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Certificate Type *</label>
                <select
                  value={form.certType}
                  onChange={(e) => setForm({ ...form, certType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="transfer">School Transfer Certificate (TC)</option>
                  <option value="character">Character Certificate</option>
                  <option value="bonafide">Bonafide Student Certificate</option>
                  <option value="study">Study Certificate</option>
                  <option value="fee_clearance">Fee Clearance Certificate</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Conduct & Character</label>
                <select
                  value={form.conductGrade}
                  onChange={(e) => setForm({ ...form, conductGrade: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Reason for Leaving / Issue</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Parent job relocation"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsIssueOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issuing}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {issuing ? 'Generating...' : 'Issue Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINT CERTIFICATE */}
      {printCert && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex justify-between items-center pb-3 border-b mb-6">
              <span className="text-xs font-black uppercase text-indigo-600">Official Document Preview</span>
              <button onClick={() => setPrintCert(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Certificate Template */}
            <div className="border-4 border-double border-amber-600 p-8 rounded-2xl bg-amber-50/20 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Award className="h-10 w-10" />
              </div>

              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  {printCert.schoolName}
                </h2>
                <p className="text-xs text-slate-600">{printCert.schoolAddress}</p>
                <span className="inline-block mt-2 font-mono font-bold text-xs text-amber-800 uppercase tracking-widest">
                  {printCert.certType} Certificate
                </span>
                <span className="block text-[10px] text-slate-400">Ref No: {printCert.certificateNo}</span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed text-justify px-4">
                This is to certify that <strong className="text-slate-900">{printCert.firstName} {printCert.lastName}</strong>, 
                Son/Daughter of <strong className="text-slate-900">{printCert.fatherName || 'Guardian'}</strong>, 
                was a bonafide student of this institution in <strong className="text-slate-900">{printCert.className}</strong>. 
                His/Her general conduct during the academic session was <strong className="text-slate-900">{printCert.conductGrade}</strong>.
                All school dues have been settled satisfactorily. Reason: {printCert.reason || 'Completion of Session'}.
              </p>

              <div className="pt-8 grid grid-cols-2 text-xs font-bold text-slate-700">
                <div className="text-left">
                  <span>Date: {new Date(printCert.issueDate).toLocaleDateString('en-IN')}</span>
                  <span className="block text-[10px] text-slate-400 mt-4">Verified Office Copy</span>
                </div>
                <div className="text-right">
                  <div className="h-8 flex items-end justify-end">
                    <span className="font-cursive italic text-indigo-700 text-sm">Principal</span>
                  </div>
                  <span className="border-t border-slate-400 pt-1 inline-block">Principal Signature & Seal</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center justify-center gap-1.5 shadow"
            >
              <Printer className="h-4 w-4" /> Print Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

