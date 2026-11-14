'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Award,
  Save,
  CheckCircle2,
  Loader2,
  Palette,
  Image as ImageIcon,
  School,
  FileCheck2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SchoolSettingsPage() {
  const [form, setForm] = useState<any>({
    name: '',
    schoolCode: '',
    affiliationBoard: 'CBSE',
    regNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    websiteUrl: '',
    principalName: '',
    estYear: '',
    schoolType: 'Co-Educational',
    medium: 'English',
    themePrimaryColor: '#4f46e5',
    themeAccentColor: '#06b6d4',
    marksheetDesign: 'classic',
    aboutSchool: '',
    principalMessage: '',
    logoUrl: '',
    stampUrl: '',
    signatureUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/school-erp/settings');
      const json = await res.json();
      if (res.ok && json.success && json.data.school) {
        setForm(json.data.school);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Saving campus settings & branding...');

    try {
      const res = await fetch('/api/school-erp/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message, { id: toastId });
      } else {
        toast.error(json.message || 'Update failed', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-2" />
        <p className="text-xs text-slate-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">School Profile & Customization</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize school identity, marksheet design template, stamp, principal signature, and theme colors.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-2 shadow disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* 1. School Information */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <School className="h-4 w-4 text-indigo-600" /> General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold mb-1">School Name *</label>
              <input
                type="text"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Affiliation Board</label>
              <select
                name="affiliationBoard"
                value={form.affiliationBoard || 'CBSE'}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              >
                <option value="CBSE">CBSE (Central Board)</option>
                <option value="ICSE">ICSE / ISC</option>
                <option value="State Board">State Board</option>
                <option value="IB / Cambridge">IB / Cambridge</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">Affiliation / Reg Number</label>
              <input
                type="text"
                name="regNumber"
                value={form.regNumber || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Principal Name</label>
              <input
                type="text"
                name="principalName"
                value={form.principalName || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Contact Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold mb-1">Campus Address</label>
              <input
                type="text"
                name="address"
                value={form.address || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Marksheet & Document Branding */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <Award className="h-4 w-4 text-purple-600" /> Marksheet & Certificate Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Default Marksheet Template</label>
              <select
                name="marksheetDesign"
                value={form.marksheetDesign || 'classic'}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-bold text-indigo-600"
              >
                <option value="classic">1. Classic School Marksheet (Traditional CBSE)</option>
                <option value="modern">2. Modern Professional Marksheet (Card-based)</option>
                <option value="colorful">3. Premium Colorful Marksheet (Gradient header)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">Theme Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="themePrimaryColor"
                  value={form.themePrimaryColor || '#4f46e5'}
                  onChange={handleChange}
                  className="h-9 w-12 rounded-lg border border-slate-300 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  name="themePrimaryColor"
                  value={form.themePrimaryColor || '#4f46e5'}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">School Logo URL</label>
              <input
                type="text"
                name="logoUrl"
                value={form.logoUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Principal Signature URL</label>
              <input
                type="text"
                name="signatureUrl"
                value={form.signatureUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com/sign.png"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. About School & Public Portal */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <Building className="h-4 w-4 text-cyan-600" /> About School & Principal Message
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block font-bold mb-1">About the Institution</label>
              <textarea
                name="aboutSchool"
                rows={3}
                value={form.aboutSchool || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Principal&apos;s Message to Parents</label>
              <textarea
                name="principalMessage"
                rows={3}
                value={form.principalMessage || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

