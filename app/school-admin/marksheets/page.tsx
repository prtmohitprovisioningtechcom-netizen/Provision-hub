'use client';

import { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  Printer,
  Eye,
  CheckCircle2,
  Calendar,
  School,
  FileCheck2,
  Loader2,
  X,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MarksheetsBuilderPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [templateDesign, setTemplateDesign] = useState<'classic' | 'modern' | 'colorful'>('classic');
  const [marksheets, setMarksheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Preview Marksheet Modal
  const [previewMarksheet, setPreviewMarksheet] = useState<any>(null);

  useEffect(() => {
    fetchExams();
    fetchClasses();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/school-erp/exams');
      const json = await res.json();
      if (res.ok && json.success && json.data.exams?.length > 0) {
        setExams(json.data.exams);
        setSelectedExam(json.data.exams[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/school-erp/academic');
      const json = await res.json();
      if (res.ok && json.success && json.data.classes?.length > 0) {
        setClasses(json.data.classes);
        setSelectedClass(json.data.classes[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedExam && selectedClass) {
      fetchGeneratedMarksheets();
    }
  }, [selectedExam, selectedClass]);

  const fetchGeneratedMarksheets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/school-erp/marksheets?examId=${selectedExam}&classId=${selectedClass}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setMarksheets(json.data.marksheets || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBulk = async () => {
    if (!selectedExam || !selectedClass) {
      toast.error('Please select both an Exam and a Class');
      return;
    }

    setGenerating(true);
    const toastId = toast.loading('Calculating marks, percentages, CBSE grades and generating marksheets...');

    try {
      const res = await fetch('/api/school-erp/marksheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_bulk',
          examId: selectedExam,
          classId: selectedClass,
          templateDesign,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message, { id: toastId });
        fetchGeneratedMarksheets();
      } else {
        toast.error(json.message || 'Failed to generate marksheets', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Automatic Marksheet Generator
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            CBSE & State Board compliant marksheet builder with 3 professional designs and secure QR verification.
          </p>
        </div>

        <button
          onClick={handleGenerateBulk}
          disabled={generating}
          className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 flex items-center gap-2 shadow disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" /> {generating ? 'Generating...' : 'Batch Generate Marksheets'}
        </button>
      </div>

      {/* Selectors & Template Design Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Exam</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Three Ready-Made Marksheet Designs Selector */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Choose Design Template</label>
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTemplateDesign('classic')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  templateDesign === 'classic' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'
                }`}
              >
                1. Classic School
              </button>
              <button
                type="button"
                onClick={() => setTemplateDesign('modern')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  templateDesign === 'modern' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'
                }`}
              >
                2. Modern Sleek
              </button>
              <button
                type="button"
                onClick={() => setTemplateDesign('colorful')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  templateDesign === 'colorful' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'
                }`}
              >
                3. Premium Colorful
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Marksheets List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white">Generated Student Marksheets</h2>
          <span className="text-xs text-slate-500">{marksheets.length} Marksheets</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600 mb-2" />
            <p className="text-xs text-slate-500">Loading marksheets...</p>
          </div>
        ) : marksheets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Adm No</th>
                  <th className="py-3 px-4">Total Marks</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Security Code</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {marksheets.map((ms) => (
                  <tr key={ms.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-black text-purple-600">#{ms.rankInClass || '—'}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {ms.firstName} {ms.lastName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{ms.admissionNo}</td>
                    <td className="py-3 px-4 font-bold">
                      {ms.totalObtained} / {ms.totalMaxMarks}
                    </td>
                    <td className="py-3 px-4 font-black text-indigo-600 text-sm">{ms.percentage}%</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-black text-[11px] bg-slate-100 text-slate-800">
                        {ms.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                          ms.resultStatus === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {ms.resultStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{ms.verificationCode}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={`/verify-marksheet/${ms.verificationCode}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          title="Open Digital Verification & Print"
                        >
                          <Printer className="h-4 w-4" />
                        </a>
                        <a
                          href={`/verify-marksheet/${ms.verificationCode}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          title="Verify QR Portal"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-500">
            No marksheets generated yet for this class and exam. Make sure marks are saved in the Examination module, then click &quot;Batch Generate Marksheets&quot;.
          </div>
        )}
      </div>
    </div>
  );
}

