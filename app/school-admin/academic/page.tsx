'use client';

import { useState, useEffect } from 'react';
import {
  School,
  Plus,
  BookOpen,
  Calendar,
  Layers,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AcademicSetupPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  // Forms
  const [classForm, setClassForm] = useState({ name: '', numericOrder: '1', capacity: '40' });
  const [sectionForm, setSectionForm] = useState({ classId: '', name: 'B', roomNo: 'Room-2' });
  const [subjectForm, setSubjectForm] = useState({
    classId: '',
    name: '',
    code: '',
    type: 'both',
    maxTheory: '80',
    maxPractical: '20',
    passMarks: '33',
  });

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/school-erp/academic');
      const json = await res.json();
      if (res.ok && json.success) {
        setClasses(json.data.classes || []);
        setSections(json.data.sections || []);
        setSubjects(json.data.subjects || []);
        setSessions(json.data.sessions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/school-erp/academic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_class', ...classForm }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message);
        setIsAddClassOpen(false);
        setClassForm({ name: '', numericOrder: '1', capacity: '40' });
        fetchAcademicData();
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to add class');
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/school-erp/academic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_section', ...sectionForm }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message);
        setIsAddSectionOpen(false);
        fetchAcademicData();
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to add section');
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/school-erp/academic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_subject', ...subjectForm }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message);
        setIsAddSubjectOpen(false);
        setSubjectForm({
          classId: '',
          name: '',
          code: '',
          type: 'both',
          maxTheory: '80',
          maxPractical: '20',
          passMarks: '33',
        });
        fetchAcademicData();
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to add subject');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Academic Setup</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure school classes, sections, subjects, and academic sessions dynamically.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddClassOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Class
          </button>
          <button
            onClick={() => setIsAddSectionOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Section
          </button>
          <button
            onClick={() => setIsAddSubjectOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-700 flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Subject
          </button>
        </div>
      </div>

      {/* Grid: Classes & Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Classes Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <School className="h-4 w-4 text-indigo-600" /> Active School Classes ({classes.length})
          </h2>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {classes.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                  <span className="text-[10px] text-slate-400">Order: {c.numericOrder}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {c.studentCount} Students
                  </span>
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-200 text-slate-700">
                    {c.sectionCount || 1} Sec
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-cyan-600" /> Curriculum Subjects ({subjects.length})
          </h2>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{s.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {s.code || '—'} • {s.className}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {Number(s.maxTheoryMarks) + Number(s.maxPracticalMarks)} Max
                  </span>
                  <span className="text-[10px] text-slate-400">Pass: {s.passMarks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: ADD CLASS */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Add New Class</h3>
              <button onClick={() => setIsAddClassOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Class Name *</label>
                <input
                  type="text"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="e.g. Class 11"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Order Index</label>
                <input
                  type="number"
                  value={classForm.numericOrder}
                  onChange={(e) => setClassForm({ ...classForm, numericOrder: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold">
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SECTION */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Add Section</h3>
              <button onClick={() => setIsAddSectionOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Class *</label>
                <select
                  value={sectionForm.classId}
                  onChange={(e) => setSectionForm({ ...sectionForm, classId: e.target.value })}
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
                <label className="block font-bold mb-1">Section Name *</label>
                <input
                  type="text"
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                  placeholder="e.g. B or C"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-bold">
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBJECT */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Add Curriculum Subject</h3>
              <button onClick={() => setIsAddSubjectOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Class *</label>
                <select
                  value={subjectForm.classId}
                  onChange={(e) => setSubjectForm({ ...subjectForm, classId: e.target.value })}
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
                <label className="block font-bold mb-1">Subject Name *</label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Physics"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Subject Code</label>
                <input
                  type="text"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  placeholder="PHY-101"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Max Theory</label>
                  <input
                    type="number"
                    value={subjectForm.maxTheory}
                    onChange={(e) => setSubjectForm({ ...subjectForm, maxTheory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Max Practical</label>
                  <input
                    type="number"
                    value={subjectForm.maxPractical}
                    onChange={(e) => setSubjectForm({ ...subjectForm, maxPractical: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-cyan-600 text-white font-bold">
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

