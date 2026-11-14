'use client';

import { useState, useEffect } from 'react';
import {
  School,
  Building2,
  Users,
  CreditCard,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  X,
  Edit,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperAdminSchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');

  // Plan Edit Modal
  const [editSchool, setEditSchool] = useState<any>(null);
  const [newPlan, setNewPlan] = useState('pro');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, [selectedPlan]);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/schools?';
      if (selectedPlan !== 'all') url += `plan=${selectedPlan}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.success) {
        setSchools(json.data.schools || []);
        setSummary(json.data.summary || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (schoolId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_status',
          schoolId,
          status: nextStatus,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message);
        fetchSchools();
      } else {
        toast.error(json.message || 'Action failed');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error');
    }
  };

  const handleUpdatePlan = async () => {
    if (!editSchool) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_plan',
          schoolId: editSchool.id,
          plan: newPlan,
          durationMonths: 12,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message);
        setEditSchool(null);
        fetchSchools();
      } else {
        toast.error(json.message || 'Update failed');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">School ERP Platform Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor all registered Indian schools, manage subscriptions, and oversee campus access.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Total Registered</span>
          <div className="text-2xl font-black text-gray-900 dark:text-white">{summary.totalSchools || 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-emerald-600 block mb-1">Active Campuses</span>
          <div className="text-2xl font-black text-emerald-600">{summary.activeSchools || 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-indigo-600 block mb-1">Paid Subscriptions</span>
          <div className="text-2xl font-black text-indigo-600">{summary.paidSchools || 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-amber-600 block mb-1">Free Trial Accounts</span>
          <div className="text-2xl font-black text-amber-600">{summary.trialSchools || 0}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchSchools()}
            placeholder="Search school name, school code, city, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 outline-none"
          />
        </div>

        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 outline-none"
        >
          <option value="all">All Plans</option>
          <option value="free_trial">Free Trial</option>
          <option value="standard">Standard</option>
          <option value="pro">Pro Digital Campus</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <button
          onClick={fetchSchools}
          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Schools Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-xs text-gray-500">Loading registered schools...</p>
          </div>
        ) : schools.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">School Name</th>
                  <th className="py-3 px-4">Board & City</th>
                  <th className="py-3 px-4">Enrolled Students</th>
                  <th className="py-3 px-4">Faculty</th>
                  <th className="py-3 px-4">Active Plan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {schools.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{s.schoolCode}</td>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                      {s.name}
                      <span className="block text-[10px] text-gray-400 font-normal">{s.phone || s.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      {s.affiliationBoard || 'CBSE'}
                      <span className="block text-[10px] text-gray-400">{s.city}, {s.state}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-600">{s.totalStudents || 0}</td>
                    <td className="py-3 px-4 font-medium">{s.totalTeachers || 0}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full font-black text-[10px] uppercase bg-purple-50 text-purple-700 border border-purple-200">
                        {s.plan?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                          s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditSchool(s);
                            setNewPlan(s.plan || 'pro');
                          }}
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          title="Upgrade Plan"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(s.id, s.status)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            s.status === 'active'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {s.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-gray-500">
            No registered schools found. Schools that register will appear here.
          </div>
        )}
      </div>

      {/* MODAL: UPGRADE PLAN */}
      {editSchool && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 text-xs">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="font-black text-sm">Manage School Subscription</h3>
              <button onClick={() => setEditSchool(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4">
              <span className="font-bold text-gray-800 dark:text-gray-200 block">{editSchool.name}</span>
              <span className="text-[10px] text-gray-400">{editSchool.schoolCode}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Select SaaS Plan</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none font-bold"
                >
                  <option value="free_trial">14-Day Free Trial</option>
                  <option value="standard">Standard (₹24,999/yr)</option>
                  <option value="pro">Pro Digital Campus (₹49,999/yr)</option>
                  <option value="enterprise">Enterprise Group (₹99,999/yr)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditSchool(null)}
                  className="px-3 py-1.5 rounded-lg border text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePlan}
                  disabled={updating}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Apply Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

