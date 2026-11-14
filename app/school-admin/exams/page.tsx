'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Plus,
  BookOpen,
  CheckCircle2,
  Calendar,
  Save,
  Loader2,
  X,
  Award,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExaminationsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);

  // Marks Grid Data
  const [gridData, setGridData] = useState<{ students: any[]; subjects: any[]; marksMap: any } | null>(null);
  const [marksState, setMarksState] = useState<Record<string, { theory: string; practical: string; isAbsent: boolean }>>({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [seedingSubjects, setSeedingSubjects] = useState(false);

  // New Exam Modal
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    name: '',
    examType: 'annual',
    startDate: '2027-02-15',
    endDate: '2027-03-05',
  });

  useEffect(() => {
    fetchExams();
    fetchClasses();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/school-erp/exams');
      const json = await res.json();
      if (res.ok && json.success) {
        setExams(json.data.exams || []);
        if (json.data.exams?.length > 0 && !selectedExam) {
          setSelectedExam(json.data.exams[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/school-erp/academic');
      const json = await res.json();
      if (res.ok && json.success && json.data.classes?.length > 0) {
        setClasses(json.data.classes);
        if (!selectedClass) setSelectedClass(json.data.classes[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedExam && selectedClass) {
      fetchMarksGrid();
    }
  }, [selectedExam, selectedClass]);

  const fetchMarksGrid = async () => {
    try {
      const res = await fetch(`/api/school-erp/exams?examId=${selectedExam}&classId=${selectedClass}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setGridData(json.data);

        // Prepopulate marksState
        const initialMap: Record<string, { theory: string; practical: string; isAbsent: boolean }> = {};
        for (const std of json.data.students || []) {
          for (const sub of json.data.subjects || []) {
            const key = `${std.id}_${sub.id}`;
            const existing = json.data.marksMap?.[key];
            initialMap[key] = {
              theory: existing ? String(existing.theoryMarks) : '',
              practical: existing ? String(existing.practicalMarks) : '',
              isAbsent: Boolean(existing?.isAbsent),
            };
          }
        }
        setMarksState(initialMap);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAutoSeedSubjects = async () => {
    if (!selectedClass) return;
    setSeedingSubjects(true);
    const toastId = toast.loading('Adding standard CBSE subjects for this class...');
    try {
      const res = await fetch('/api/school-erp/academic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_standard_subjects', classId: selectedClass }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Subjects added', { id: toastId });
        fetchMarksGrid();
      } else {
        toast.error(json.message || 'Failed to add subjects', { id: toastId });
      }
    } catch {
      toast.error('Error adding subjects', { id: toastId });
    } finally {
      setSeedingSubjects(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.name) {
      toast.error('Exam name is required');
      return;
    }

    try {
      const res = await fetch('/api/school-erp/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_exam', ...examForm }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message);
        setIsAddExamOpen(false);
        setExamForm({ name: '', examType: 'annual', startDate: '', endDate: '' });
        fetchExams();
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to create exam');
    }
  };

  const handleSaveMarks = async () => {
    if (!gridData || !selectedExam || !selectedClass) return;

    setSavingMarks(true);
    const toastId = toast.loading('Calculating and saving exam marks...');

    try {
      const marksList: any[] = [];
      for (const std of gridData.students || []) {
        for (const sub of gridData.subjects || []) {
          const key = `${std.id}_${sub.id}`;
          const current = marksState[key];
          if (current && (current.theory !== '' || current.practical !== '' || current.isAbsent)) {
            marksList.push({
              studentId: std.id,
              subjectId: sub.id,
              theoryMarks: Number(current.theory) || 0,
              practicalMarks: Number(current.practical) || 0,
              maxMarks: Number(sub.maxTheoryMarks) + Number(sub.maxPracticalMarks),
              isAbsent: Boolean(current.isAbsent),
            });
          }
        }
      }

      const res = await fetch('/api/school-erp/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_marks',
          examId: selectedExam,
          classId: selectedClass,
          marksList,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Marks saved successfully', { id: toastId });
        fetchMarksGrid();
      } else {
        toast.error(json.message || 'Failed to save', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred', { id: toastId });
    } finally {
      setSavingMarks(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Examination & Marks Entry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule examinations, enter subject-wise marks, and calculate automatic grades.
          </p>
        </div>

        <button
          onClick={() => setIsAddExamOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-2 shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Schedule New Examination
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
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
                  {ex.name} ({ex.examType?.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Class</label>
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

        <div className="flex items-center gap-2">
          {selectedExam && selectedClass && (
            <Link
              href={`/school-admin/marksheets?examId=${selectedExam}&classId=${selectedClass}`}
              className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 border border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-purple-600" /> Generate Marksheets →
            </Link>
          )}

          <button
            onClick={handleSaveMarks}
            disabled={savingMarks || !gridData?.students?.length}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5 shadow disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" /> {savingMarks ? 'Saving...' : 'Save All Marks'}
          </button>
        </div>
      </div>

      {/* Marks Entry Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Subject Marks Entry Sheet</h2>
            <p className="text-[11px] text-slate-400">Enter marks for each student. Mark &apos;AB&apos; for absent students.</p>
          </div>
          <span className="text-xs text-slate-500 font-bold">
            {gridData?.students?.length || 0} Students • {gridData?.subjects?.length || 0} Subjects
          </span>
        </div>

        {gridData && gridData.students?.length > 0 && gridData.subjects?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-slate-50 dark:bg-slate-800">
                    Roll & Student Name
                  </th>
                  {gridData.subjects.map((sub: any) => (
                    <th key={sub.id} className="py-3 px-3 text-center border-r border-slate-200 dark:border-slate-700">
                      <span className="block truncate max-w-[140px] font-bold">{sub.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {sub.maxPracticalMarks > 0
                          ? `Th:${sub.maxTheoryMarks} + Pr:${sub.maxPracticalMarks}`
                          : `Max: ${sub.maxTheoryMarks}`}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {gridData.students.map((std: any) => (
                  <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-white dark:bg-slate-900">
                      <span className="font-mono text-indigo-600 mr-2">{std.rollNo || '01'}.</span>
                      {std.firstName} {std.lastName}
                    </td>

                    {gridData.subjects.map((sub: any) => {
                      const key = `${std.id}_${sub.id}`;
                      const cur = marksState[key] || { theory: '', practical: '', isAbsent: false };
                      return (
                        <td
                          key={sub.id}
                          className={`p-2 border-r border-slate-200 dark:border-slate-700 text-center ${
                            cur.isAbsent ? 'bg-rose-50/70 dark:bg-rose-950/20' : ''
                          }`}
                        >
                          {cur.isAbsent ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider">
                                ABSENT
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setMarksState({
                                    ...marksState,
                                    [key]: { ...cur, isAbsent: false },
                                  })
                                }
                                className="text-[9px] text-indigo-600 underline cursor-pointer"
                              >
                                Undo
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              {sub.maxPracticalMarks > 0 ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    value={cur.theory}
                                    onChange={(e) =>
                                      setMarksState({
                                        ...marksState,
                                        [key]: { ...cur, theory: e.target.value },
                                      })
                                    }
                                    placeholder={`T:${sub.maxTheoryMarks}`}
                                    title={`Theory Marks (Max ${sub.maxTheoryMarks})`}
                                    className="w-12 px-1 py-1 text-center font-bold text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                  <span className="text-[10px] text-slate-400 font-bold">+</span>
                                  <input
                                    type="number"
                                    value={cur.practical}
                                    onChange={(e) =>
                                      setMarksState({
                                        ...marksState,
                                        [key]: { ...cur, practical: e.target.value },
                                      })
                                    }
                                    placeholder={`P:${sub.maxPracticalMarks}`}
                                    title={`Practical Marks (Max ${sub.maxPracticalMarks})`}
                                    className="w-12 px-1 py-1 text-center font-bold text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  value={cur.theory}
                                  onChange={(e) =>
                                    setMarksState({
                                      ...marksState,
                                      [key]: { ...cur, theory: e.target.value },
                                    })
                                  }
                                  placeholder={`/${sub.maxTheoryMarks}`}
                                  className="w-16 px-2 py-1 text-center font-bold text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setMarksState({
                                    ...marksState,
                                    [key]: { ...cur, isAbsent: true },
                                  })
                                }
                                className="text-[9px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Mark student absent"
                              >
                                Mark AB
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-500 space-y-3">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-300">
              {gridData?.subjects?.length === 0
                ? 'No subjects configured for this class yet'
                : 'No students enrolled in this class'}
            </p>
            {gridData?.subjects?.length === 0 && selectedClass && (
              <div className="space-y-2 max-w-md mx-auto">
                <p className="text-slate-400 text-[11px]">
                  Click below to automatically add 6 standard CBSE subjects (English, Hindi, Math, Science, Social Science, Computer) so you can enter marks immediately.
                </p>
                <button
                  type="button"
                  onClick={handleAutoSeedSubjects}
                  disabled={seedingSubjects}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow inline-flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  {seedingSubjects ? 'Adding Subjects...' : 'Auto-Add 6 Standard CBSE Subjects'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: ADD EXAMINATION */}
      {isAddExamOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Schedule New Examination</h3>
              <button onClick={() => setIsAddExamOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Exam Name *</label>
                <input
                  type="text"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  placeholder="e.g. Half Yearly Examination 2026"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Exam Type</label>
                <select
                  value={examForm.examType}
                  onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="annual">Annual Examination</option>
                  <option value="half_yearly">Half Yearly Examination</option>
                  <option value="unit_test">Unit Test</option>
                  <option value="monthly">Monthly Assessment</option>
                  <option value="pre_board">Pre-Board Exam</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Start Date</label>
                <input
                  type="date"
                  value={examForm.startDate}
                  onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExamOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold">
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

