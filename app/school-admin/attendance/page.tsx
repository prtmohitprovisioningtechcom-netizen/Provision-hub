'use client';

import { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Users,
  Search,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttendanceRegisterPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [register, setRegister] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

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
    if (selectedClass) fetchRegister();
  }, [selectedClass, selectedDate]);

  const fetchRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/school-erp/attendance?classId=${selectedClass}&date=${selectedDate}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setRegister(json.data.register || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setRegister((prev) =>
      prev.map((item) => (item.id === studentId ? { ...item, status } : item))
    );
  };

  const handleMarkAll = (status: string) => {
    setRegister((prev) => prev.map((item) => ({ ...item, status })));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    const toastId = toast.loading('Saving attendance register...');

    try {
      const payload = {
        classId: selectedClass,
        date: selectedDate,
        attendanceList: register.map((r) => ({
          studentId: r.id,
          status: r.status,
          remarks: r.remarks || '',
        })),
      };

      const res = await fetch('/api/school-erp/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Attendance saved!', { id: toastId });
        fetchRegister();
      } else {
        toast.error(json.message || 'Failed to save', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = register.filter((r) => r.status === 'present').length;
  const absentCount = register.filter((r) => r.status === 'absent').length;
  const leaveCount = register.filter((r) => r.status === 'leave').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Daily Attendance Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mark daily class & section attendance, track leaves, and monitor student absenteeism.
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || register.length === 0}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-2 shadow disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Attendance Register'}
        </button>
      </div>

      {/* Class & Date Selector Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Class</label>
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

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
            >
            </input>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMarkAll('present')}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-200"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll('absent')}
            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold border border-rose-200"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Metrics Card */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{register.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Present</span>
          <div className="text-xl font-black text-emerald-600 mt-1">{presentCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-rose-600">Absent</span>
          <div className="text-xl font-black text-rose-600 mt-1">{absentCount}</div>
        </div>
      </div>

      {/* Register List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-xs text-slate-500">Loading student attendance...</p>
          </div>
        ) : register.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Adm No</th>
                  <th className="py-3 px-4 text-center">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {register.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold">{std.rollNo || '—'}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {std.firstName} {std.lastName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{std.admissionNo}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(std.id, 'present')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            std.status === 'present' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(std.id, 'absent')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            std.status === 'absent' ? 'bg-rose-600 text-white shadow' : 'text-slate-500'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(std.id, 'leave')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            std.status === 'leave' ? 'bg-amber-600 text-white shadow' : 'text-slate-500'
                          }`}
                        >
                          Leave
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
            No students enrolled in this class. Add students from the Students module.
          </div>
        )}
      </div>
    </div>
  );
}

