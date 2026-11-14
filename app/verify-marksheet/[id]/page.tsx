import { Metadata } from 'next';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Award, Printer, ArrowLeft, Building2 } from 'lucide-react';
import { MarksheetVerificationClient } from '@/components/school/MarksheetVerificationClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Digital Marksheet Verification | Bhartiyebazar School Cloud`,
    description: `Official digital marksheet verification portal for document reference ${id}. Authenticated by school board guidelines.`,
  };
}

export default async function MarksheetVerificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let marksheet: any = null;
  let subjects: any[] = [];

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT m.*, s.firstName, s.lastName, s.admissionNo, s.rollNo, s.dob, s.fatherName, s.motherName, s.photoUrl,
              c.name as className, sec.name as sectionName,
              e.name as examName, e.examType,
              sch.name as schoolName, sch.logoUrl as schoolLogo, sch.affiliationBoard, sch.address as schoolAddress,
              sch.stampUrl, sch.signatureUrl, sch.principalName, sch.phone as schoolPhone
       FROM school_marksheets m
       JOIN school_students s ON s.id = m.studentId
       JOIN school_classes c ON c.id = m.classId
       LEFT JOIN school_sections sec ON sec.id = m.sectionId
       JOIN school_exams e ON e.id = m.examId
       JOIN schools sch ON sch.id = m.schoolId
       WHERE m.verificationCode = ? OR m.id = ?
       LIMIT 1`,
      [id, id]
    );

    if (rows.length > 0) {
      marksheet = rows[0];

      const [subRows] = await pool.execute<RowDataPacket[]>(
        `SELECT sm.*, sub.name as subjectName, sub.code as subjectCode
         FROM school_exam_marks sm
         JOIN school_subjects sub ON sub.id = sm.subjectId
         WHERE sm.schoolId = ? AND sm.examId = ? AND sm.studentId = ?
         ORDER BY sub.name ASC`,
        [marksheet.schoolId, marksheet.examId, marksheet.studentId]
      );
      subjects = subRows;
    }
  } catch (error) {
    console.error('Marksheet verification error:', error);
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Verification Top Banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Official Marksheet Verification
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> 100% Authentic
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Digital Record Ref: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{id}</span>
              </p>
            </div>
          </div>

          <Link
            href="/school-management-software"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> School ERP Portal
          </Link>
        </div>

        {marksheet ? (
          <MarksheetVerificationClient marksheet={marksheet} subjects={subjects} />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-red-200 dark:border-red-900/50 shadow-sm">
            <div className="h-16 w-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold mb-4">
              ✕
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              No Record Found for Code: {id}
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              This marksheet reference could not be verified in the school records database. Please verify the URL or contact the respective school administration.
            </p>
            <Link
              href="/school-management-software"
              className="mt-6 inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md"
            >
              Return to School Portal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

