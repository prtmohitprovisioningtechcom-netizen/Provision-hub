'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  CreditCard,
  FileCheck2,
  CalendarCheck2,
  BookOpen,
  Bus,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Printer,
  ChevronDown,
  Building,
  School,
  FileSpreadsheet,
  Award,
  Layers,
  Smartphone,
  BarChart3,
  Clock,
  QrCode,
  HelpCircle,
} from 'lucide-react';

export function SchoolLandingClient() {
  const [activeMarksheetTab, setActiveMarksheetTab] = useState<'classic' | 'modern' | 'colorful'>('classic');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const features = [
    {
      icon: CreditCard,
      title: 'Complete Fees & Billing',
      desc: 'Create unlimited fee categories, class-wise structures, auto-generate monthly invoices, record partial/full payments, and issue printable GST receipts with QR codes.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: FileCheck2,
      title: '3-in-1 Marksheet Generator',
      desc: 'Automatic CBSE/State board marksheet builder with 3 pre-designed templates (Classic, Modern, Colorful), instant grade calculations, pass/fail results, and secure QR verification.',
      color: 'from-indigo-500 to-blue-600',
    },
    {
      icon: Users,
      title: 'Student & Admission System',
      desc: 'Complete student profiles with photo, Aadhaar, parents contact, automated admission number, roll numbers, digital ID cards, and one-click bulk import from Excel.',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: CalendarCheck2,
      title: 'Daily Class Attendance',
      desc: 'Class & section-wise attendance registers, present/absent/leave tracking, automated low attendance alerts, and monthly printable registers.',
      color: 'from-rose-500 to-pink-600',
    },
    {
      icon: GraduationCap,
      title: 'Teacher & Staff Payroll',
      desc: 'Employee directory, class teacher assignments, subject teacher mapping, staff attendance, and salary vouchers with complete audit history.',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      icon: Smartphone,
      title: 'Dedicated Parent & Student Portal',
      desc: 'Parents and students can view attendance, check outstanding fees, download payment receipts, view homework, and download term marksheets from anywhere.',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: Award,
      title: 'Transfer & Character Certificates',
      desc: 'Generate official Transfer Certificates (TC), Character Certificates, Bonafide Certificates, and Study Proofs with school stamp and principal signatures.',
      color: 'from-fuchsia-500 to-purple-600',
    },
    {
      icon: Bus,
      title: 'School Bus & Transport Fleet',
      desc: 'Vehicle fleet management, driver & conductor directory, pickup/drop routes, per-stop monthly fares, printable student bus passes, and automated fee invoice integration.',
      color: 'from-amber-500 to-yellow-600',
    },
    {
      icon: BarChart3,
      title: 'Financial Cashbook & Reports',
      desc: 'Track fee income, teacher salaries, maintenance expenses, daily cashbook, and comprehensive analytical reports exportable to Excel and PDF.',
      color: 'from-slate-700 to-slate-900',
    },
  ];

  const faqs = [
    {
      q: 'Can any school in India register and use this software?',
      a: 'Yes! Whether your school is affiliated with CBSE, ICSE, State Boards (UP, Maharashtra, Bihar, Rajasthan, MP, Karnataka, etc.), or is a Private Academy or Play School, you can register in 2 minutes and start using it immediately.',
    },
    {
      q: 'Will my school data remain isolated and private from other schools?',
      a: 'Absolutely. Every registered school receives its own dedicated school identifier and isolated database partition. No other school or unauthorized party can ever view or access your students, fee records, or teacher data.',
    },
    {
      q: 'How does the Automatic Marksheet Generator work?',
      a: 'You simply select your Academic Session, Class, and Exam (Unit Test, Half Yearly, or Annual). Enter subject marks or upload via Excel. The system automatically computes Total Marks, Percentage, CBSE Grades (A1 to E), Result (PASS/FAIL), and Class Rank, generating printable marksheets in your chosen design.',
    },
    {
      q: 'Can parents pay fees and check marksheets online?',
      a: 'Yes, every registered student gets access to the Parent & Student Portal. Parents can check fee balance, download authentic receipts, view live attendance, and download term marksheets.',
    },
    {
      q: 'Is there a free trial available?',
      a: 'Yes! Every new school gets a 14-day fully featured Free Trial with zero credit card required. You can test student registrations, fee collection, and marksheet generation with full support.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),theme(colors.slate.50))] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.950),theme(colors.slate.950))] opacity-60" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/70 dark:border-indigo-800 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="h-4 w-4" /> All-in-One Cloud School ERP SaaS
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Transform Your School with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Smart Digital Campus ERP
            </span>
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            The most complete, intuitive, and powerful School Management Platform designed for Indian schools.
            Manage Students, Fees, Attendance, Exams, Staff, and generate authentic 3-Design Marksheets with 1-Click QR Verification.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/school-management-software/register"
              className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm sm:text-base hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <School className="h-5 w-5" /> Register Your School Free
            </Link>

            <Link
              href="/school-management-software/login"
              className="px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-sm sm:text-base border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm inline-flex items-center gap-2 transition-all"
            >
              School Admin Login <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/school-management-software/portal"
              className="px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-800 inline-flex items-center gap-2 transition-all"
            >
              <Users className="h-4 w-4" /> Parent & Student Portal
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 14-Day Full Free Trial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> CBSE & State Board Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 100% Data Isolation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Instant QR Verification
            </span>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">100%</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Automated Marksheets</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400">0%</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Manual Fee Calculations</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">&lt; 2 Mins</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">School Setup & Live</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-pink-600 dark:text-pink-400">24x7</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Parent Portal Access</div>
          </div>
        </div>
      </section>

      {/* 3. COMPLETE FEATURES SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300">
            Comprehensive ERP Modules
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Everything Your School Needs to Run Smoothly
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            From nursery to higher secondary, streamline all academic, administrative, and financial workflows on a single cloud platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between group"
            >
              <div>
                <div
                  className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${feat.color} text-white flex items-center justify-center shadow-md mb-5 group-hover:scale-110 transition-transform`}
                >
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{feat.title}</h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Enterprise Ready</span>
                <span className="ml-auto text-emerald-600">Active</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. THREE MARKSHEET DESIGN PREVIEWS (CRITICAL MODULE) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-12 border border-slate-800 shadow-2xl">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              Interactive Marksheet Builder
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-white">
              Three Ready-Made Marksheet Designs
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Select and preview the design that best fits your school&apos;s identity. Each template supports automatic CBSE grade calculations, principal signatures, school stamp, and QR verification.
            </p>

            {/* Design Selector Tabs */}
            <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-slate-800/90 border border-slate-700">
              <button
                onClick={() => setActiveMarksheetTab('classic')}
                className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMarksheetTab === 'classic'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Classic School Marksheet
              </button>
              <button
                onClick={() => setActiveMarksheetTab('modern')}
                className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMarksheetTab === 'modern'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Modern Professional
              </button>
              <button
                onClick={() => setActiveMarksheetTab('colorful')}
                className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMarksheetTab === 'colorful'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Premium Colorful
              </button>
            </div>
          </div>

          {/* Interactive Marksheet Preview Card */}
          <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
            {/* Header depending on tab */}
            <div
              className={`p-4 rounded-2xl border mb-6 text-center ${
                activeMarksheetTab === 'colorful'
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-transparent'
                  : activeMarksheetTab === 'modern'
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-amber-50/80 border-amber-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold">
                  <Award className="h-8 w-8 text-current" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                    Delhi Public Model Senior Secondary School
                  </h3>
                  <p className="text-xs opacity-80 mt-0.5">
                    Affiliated to CBSE Board, New Delhi • Affiliation No. 2130849
                  </p>
                  <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/20">
                    Annual Progress Assessment (Session 2026-2027)
                  </span>
                </div>
                <div className="h-16 w-14 rounded-lg border border-current/30 flex items-center justify-center text-[10px] uppercase font-bold opacity-75">
                  Photo
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-5">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Student Name</span>
                <span className="font-bold text-slate-900">Aarav Sharma</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Admission No.</span>
                <span className="font-mono font-bold text-indigo-600">ADM-2026-0428</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Class & Sec</span>
                <span className="font-bold text-slate-900">Class 10 - Section A</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Roll No.</span>
                <span className="font-bold text-slate-900">14</span>
              </div>
            </div>

            {/* Subjects Marks Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-5">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3 text-center">Max Marks</th>
                    <th className="py-2.5 px-3 text-center">Theory</th>
                    <th className="py-2.5 px-3 text-center">Practical</th>
                    <th className="py-2.5 px-3 text-center font-bold text-indigo-700">Obtained</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { sub: 'English Language & Lit', max: 100, th: 74, pr: 18, tot: 92, gr: 'A1' },
                    { sub: 'Hindi Course A', max: 100, th: 68, pr: 19, tot: 87, gr: 'A2' },
                    { sub: 'Mathematics Standard', max: 100, th: 76, pr: 19, tot: 95, gr: 'A1' },
                    { sub: 'Science & Technology', max: 100, th: 69, pr: 28, tot: 97, gr: 'A1' },
                    { sub: 'Social Studies', max: 100, th: 72, pr: 18, tot: 90, gr: 'A1' },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{row.sub}</td>
                      <td className="py-2 px-3 text-center text-slate-500">{row.max}</td>
                      <td className="py-2 px-3 text-center text-slate-600">{row.th}</td>
                      <td className="py-2 px-3 text-center text-slate-600">{row.pr}</td>
                      <td className="py-2 px-3 text-center font-bold text-indigo-700">{row.tot}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-100 text-slate-800">
                          {row.gr}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Result & Signatures */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs">
              <div>
                <span className="font-bold text-slate-700">Grand Total: 461 / 500</span>
                <span className="ml-3 font-black text-indigo-700">Percentage: 92.20%</span>
                <span className="ml-3 px-2 py-0.5 rounded-full font-black text-[10px] bg-emerald-600 text-white uppercase">
                  PASS (Rank: 02)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <QrCode className="h-9 w-9 text-slate-700" />
                <div className="text-[10px] text-slate-500 leading-tight">
                  <span className="font-bold block text-slate-700">Digital Seal Verified</span>
                  <span>Code: VRF-2026-9812</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING PLANS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
            Transparent Pricing
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Simple, Scalable Plans for Every School
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Start with our 14-day full free trial. Upgrade anytime as your student strength grows.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="mt-6 inline-flex items-center gap-3 p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                billingCycle === 'monthly' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow' : 'text-slate-500'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'
              }`}
            >
              Annual (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Trial */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">Free Trial</div>
              <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">14-Day Full Access</h3>
              <p className="mt-2 text-xs text-slate-500">Ideal for testing all modules before subscribing.</p>
              <div className="mt-6 text-4xl font-black text-slate-900 dark:text-white">
                ₹0 <span className="text-xs font-medium text-slate-400">/ 14 days</span>
              </div>

              <ul className="mt-8 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Up to 100 Students
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Up to 10 Teachers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Complete Fees & Receipts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 3 Marksheet Designs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Attendance Management
                </li>
              </ul>
            </div>

            <Link
              href="/school-management-software/register"
              className="mt-8 block w-full py-3 text-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Pro Digital Campus (Most Popular) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-900 to-slate-900 text-white border-2 border-indigo-500 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-500 text-white text-[11px] font-black uppercase tracking-wider shadow">
              Most Popular Choice
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-wider text-indigo-300">Pro School</div>
              <h3 className="mt-2 text-2xl font-black text-white">Pro Digital Campus</h3>
              <p className="mt-2 text-xs text-indigo-200">For established schools needing full automation.</p>
              <div className="mt-6 text-4xl font-black text-white">
                {billingCycle === 'yearly' ? '₹49,999' : '₹4,999'}{' '}
                <span className="text-xs font-medium text-indigo-300">
                  {billingCycle === 'yearly' ? '/ year' : '/ month'}
                </span>
              </div>

              <ul className="mt-8 space-y-3 text-xs text-indigo-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Up to 1,500 Students
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Up to 75 Teachers & Staff
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> All Marksheet Designs + Custom Branding
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> QR Verification Portal
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Parent & Student Portal Unlocked
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Transport & Library Modules
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> WhatsApp / SMS Payment Alerts
                </li>
              </ul>
            </div>

            <Link
              href="/school-management-software/register"
              className="mt-8 block w-full py-3.5 text-center rounded-xl bg-indigo-500 text-white font-black text-xs hover:bg-indigo-600 shadow-lg shadow-indigo-500/40 transition-all"
            >
              Get Started with Pro
            </Link>
          </div>

          {/* Enterprise */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">Enterprise</div>
              <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Group of Schools</h3>
              <p className="mt-2 text-xs text-slate-500">For large educational groups and multi-branch campuses.</p>
              <div className="mt-6 text-4xl font-black text-slate-900 dark:text-white">
                {billingCycle === 'yearly' ? '₹99,999' : '₹9,999'}{' '}
                <span className="text-xs font-medium text-slate-400">
                  {billingCycle === 'yearly' ? '/ year' : '/ month'}
                </span>
              </div>

              <ul className="mt-8 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Up to 5,000+ Students
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 250+ Teachers & Staff
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Custom Domain (your-school.com)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Dedicated Account Manager
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Priority 24x7 Phone Support
                </li>
              </ul>
            </div>

            <Link
              href="/school-management-software/register"
              className="mt-8 block w-full py-3 text-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
            >
              Contact for Enterprise
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider dark:bg-slate-800 dark:text-slate-300">
            Got Questions?
          </span>
          <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-slate-900 dark:text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 sm:p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-black">
            Ready to Take Your School Digital?
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-indigo-100">
            Join hundreds of forward-thinking schools across India. Set up your digital campus, fee structures, and marksheets today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/school-management-software/register"
              className="px-8 py-3.5 rounded-2xl bg-white text-indigo-600 font-black text-sm hover:bg-slate-100 shadow-md transition-all"
            >
              Register Your School Now
            </Link>
            <Link
              href="/school-management-software/login"
              className="px-6 py-3.5 rounded-2xl bg-indigo-700/80 text-white font-bold text-sm hover:bg-indigo-700 border border-white/20 transition-all"
            >
              School Admin Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

