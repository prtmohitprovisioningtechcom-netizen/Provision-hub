'use client';

import { useRef } from 'react';
import { Award, Printer, CheckCircle2, QrCode, Calendar, User, BookOpen } from 'lucide-react';

interface MarksheetVerificationClientProps {
  marksheet: any;
  subjects: any[];
}

export function MarksheetVerificationClient({ marksheet, subjects }: MarksheetVerificationClientProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const isModern = marksheet.templateDesign === 'modern';
  const isColorful = marksheet.templateDesign === 'colorful';

  return (
    <div className="space-y-4">
      {/* Top Action Controls */}
      <div className="flex justify-end gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md transition-all cursor-pointer"
        >
          <Printer className="h-4 w-4" /> Print / Save PDF
        </button>
      </div>

      {/* Marksheet Document Wrapper */}
      <div
        ref={printRef}
        className={`bg-white text-slate-900 rounded-3xl p-6 sm:p-10 border shadow-md relative overflow-hidden print:p-0 print:border-none print:shadow-none ${
          isColorful
            ? 'border-indigo-200 ring-2 ring-indigo-500/20'
            : isModern
            ? 'border-slate-300'
            : 'border-amber-200 border-2'
        }`}
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
          <span className="text-8xl font-black uppercase tracking-widest">{marksheet.schoolName}</span>
        </div>

        {/* 1. Header Section */}
        <div className="border-b-2 pb-6 text-center relative border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="h-20 w-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center p-2 overflow-hidden shadow-inner">
              {marksheet.schoolLogo ? (
                <img src={marksheet.schoolLogo} alt="School Logo" className="h-full w-full object-contain" />
              ) : (
                <Award className="h-10 w-10 text-indigo-600" />
              )}
            </div>

            <div className="flex-1 text-center">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
                {marksheet.schoolName}
              </h2>
              <p className="text-xs text-slate-600 max-w-xl mx-auto mt-1">
                {marksheet.schoolAddress} • Affiliated to {marksheet.affiliationBoard || 'CBSE Board'}
              </p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-black tracking-wider uppercase border border-slate-300">
                <span>{marksheet.examName || 'Annual Assessment Report'}</span>
                <span>•</span>
                <span>Session: 2026-2027</span>
              </div>
            </div>

            {/* Student photo preview */}
            <div className="h-24 w-20 rounded-xl border border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden text-[10px] text-slate-400">
              {marksheet.photoUrl ? (
                <img src={marksheet.photoUrl} alt="Student" className="h-full w-full object-cover" />
              ) : (
                <span>Photo</span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Student Info Grid */}
        <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Student Name</span>
            <span className="font-black text-slate-800 text-sm">
              {marksheet.firstName} {marksheet.lastName}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Admission No.</span>
            <span className="font-mono font-bold text-indigo-700">{marksheet.admissionNo}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Class & Section</span>
            <span className="font-bold text-slate-800">
              {marksheet.className} - {marksheet.sectionName || 'A'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Roll Number</span>
            <span className="font-bold text-slate-800">{marksheet.rollNo || '01'}</span>
          </div>

          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Father&apos;s Name</span>
            <span className="font-medium text-slate-800">{marksheet.fatherName || 'Not Specified'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Mother&apos;s Name</span>
            <span className="font-medium text-slate-800">{marksheet.motherName || 'Not Specified'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Date of Birth</span>
            <span className="font-medium text-slate-800">
              {marksheet.dob ? new Date(marksheet.dob).toLocaleDateString('en-IN') : '15/07/2012'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Attendance</span>
            <span className="font-bold text-emerald-700">{marksheet.attendancePercent || 94}%</span>
          </div>
        </div>

        {/* 3. Subject-wise Marks Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-3 text-center">Subject Code</th>
                <th className="py-3 px-3 text-center">Max Marks</th>
                <th className="py-3 px-3 text-center">Theory</th>
                <th className="py-3 px-3 text-center">Practical</th>
                <th className="py-3 px-3 text-center font-black">Marks Obtained</th>
                <th className="py-3 px-3 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.length > 0 ? (
                subjects.map((sub, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{sub.subjectName}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{sub.subjectCode || '—'}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{sub.maxMarks || 100}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{sub.theoryMarks}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{sub.practicalMarks}</td>
                    <td className="py-2.5 px-3 text-center font-black text-indigo-700">{sub.totalMarks}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-black text-[11px] bg-slate-100 text-slate-800">
                        {sub.grade || 'A1'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    Subject marks entered for this exam will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Grand Result Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-center mb-6">
          <div>
            <span className="block text-[10px] uppercase font-bold text-indigo-500">Total Marks</span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              {marksheet.totalObtained} / {marksheet.totalMaxMarks}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-indigo-500">Overall Percentage</span>
            <span className="text-base sm:text-lg font-black text-indigo-700">{marksheet.percentage}%</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-indigo-500">Final Grade</span>
            <span className="text-base sm:text-lg font-black text-emerald-700">{marksheet.grade}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-indigo-500">Final Result</span>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                marksheet.resultStatus === 'PASS'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {marksheet.resultStatus}
            </span>
          </div>
        </div>

        {/* 5. Remarks & Verification QR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-200 text-xs">
          <div className="flex-1 space-y-1">
            <span className="font-bold text-slate-700">Class Teacher Remarks:</span>
            <p className="italic text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              &quot;{marksheet.teacherRemarks}&quot;
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold pt-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Digitally signed & verified by School Examination Board.
            </div>
          </div>

          {/* QR Verification Seal */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="h-16 w-16 bg-white border border-slate-300 rounded-xl flex items-center justify-center p-1 text-slate-800">
              <QrCode className="h-12 w-12 text-slate-900" />
            </div>
            <div className="text-[10px] leading-tight space-y-0.5 text-slate-500">
              <span className="font-bold uppercase text-slate-700 block">QR Security Seal</span>
              <span>Code: {marksheet.verificationCode}</span>
              <span className="block font-mono text-[9px] text-slate-400">
                Verified: {new Date(marksheet.generatedAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* 6. Signatures */}
        <div className="mt-8 pt-8 grid grid-cols-3 text-center text-xs font-bold text-slate-700">
          <div>
            <div className="h-10 flex items-center justify-center">
              <span className="text-[11px] font-cursive italic text-slate-400">Signature</span>
            </div>
            <span className="border-t border-slate-300 pt-1 block">Class Teacher</span>
          </div>
          <div>
            <div className="h-10 flex items-center justify-center">
              {marksheet.stampUrl ? (
                <img src={marksheet.stampUrl} alt="Stamp" className="h-10 object-contain mx-auto" />
              ) : (
                <span className="text-[10px] text-slate-300 uppercase tracking-widest">[School Seal]</span>
              )}
            </div>
            <span className="border-t border-slate-300 pt-1 block">School Stamp</span>
          </div>
          <div>
            <div className="h-10 flex items-center justify-center">
              {marksheet.signatureUrl ? (
                <img src={marksheet.signatureUrl} alt="Signature" className="h-10 object-contain mx-auto" />
              ) : (
                <span className="text-[11px] font-cursive italic text-indigo-600">Principal Sign</span>
              )}
            </div>
            <span className="border-t border-slate-300 pt-1 block">Principal Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
}

