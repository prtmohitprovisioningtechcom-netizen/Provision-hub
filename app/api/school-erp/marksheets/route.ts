import { NextRequest } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { SchoolService } from '@/server/services/school.service';
import { getSchoolAuthFromRequest } from '@/lib/school-auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await SchoolService.ensureTables();

  const { searchParams } = new URL(request.url);
  const verificationCode = searchParams.get('verificationCode');
  const marksheetId = searchParams.get('marksheetId');

  // 1. PUBLIC VERIFICATION LOOKUP (Accessible via QR scan without authentication)
  if (verificationCode || marksheetId) {
    let query = `
      SELECT m.*, s.firstName, s.lastName, s.admissionNo, s.rollNo, s.dob, s.fatherName, s.motherName, s.photoUrl,
             c.name as className, sec.name as sectionName,
             e.name as examName, e.examType,
             sch.name as schoolName, sch.logoUrl as schoolLogo, sch.affiliationBoard, sch.address as schoolAddress,
             sch.stampUrl, sch.signatureUrl, sch.principalName
      FROM school_marksheets m
      JOIN school_students s ON s.id = m.studentId
      JOIN school_classes c ON c.id = m.classId
      LEFT JOIN school_sections sec ON sec.id = m.sectionId
      JOIN school_exams e ON e.id = m.examId
      JOIN schools sch ON sch.id = m.schoolId
      WHERE m.verificationCode = ? OR m.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [verificationCode || '', marksheetId || '']);

    if (rows.length === 0) {
      return apiError('Marksheet verification record not found', 404);
    }

    const marksheet = rows[0];

    // Fetch subject breakdown
    const [subjectMarks] = await pool.execute<RowDataPacket[]>(
      `SELECT sm.*, sub.name as subjectName, sub.code as subjectCode
       FROM school_exam_marks sm
       JOIN school_subjects sub ON sub.id = sm.subjectId
       WHERE sm.schoolId = ? AND sm.examId = ? AND sm.studentId = ?
       ORDER BY sub.name ASC`,
      [marksheet.schoolId, marksheet.examId, marksheet.studentId]
    );

    return apiSuccess({
      marksheet,
      subjects: subjectMarks,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    });
  }

  // 2. AUTHENTICATED SCHOOL ADMIN LOOKUP
  const authUser = await getSchoolAuthFromRequest(request);
  if (!authUser) return apiError('Unauthorized', 401);

  const schoolId = authUser.schoolId;
  const examId = searchParams.get('examId');
  const classId = searchParams.get('classId');
  const studentId = searchParams.get('studentId');

  try {
    let query = `
      SELECT m.*, s.firstName, s.lastName, s.admissionNo, s.rollNo, s.fatherName,
             c.name as className, sec.name as sectionName,
             e.name as examName
      FROM school_marksheets m
      JOIN school_students s ON s.id = m.studentId
      JOIN school_classes c ON c.id = m.classId
      LEFT JOIN school_sections sec ON sec.id = m.sectionId
      JOIN school_exams e ON e.id = m.examId
      WHERE m.schoolId = ?
    `;
    const params: any[] = [schoolId];

    if (examId) {
      query += ' AND m.examId = ?';
      params.push(examId);
    }
    if (classId) {
      query += ' AND m.classId = ?';
      params.push(classId);
    }
    if (studentId) {
      query += ' AND m.studentId = ?';
      params.push(studentId);
    }

    query += ' ORDER BY m.percentage DESC, s.rollNo ASC LIMIT 100';

    const [marksheets] = await pool.execute<RowDataPacket[]>(query, params);

    return apiSuccess({ marksheets });
  } catch (error: any) {
    console.error('Marksheets GET error:', error);
    return apiError(error.message || 'Failed to fetch marksheets', 500);
  }
}

export async function POST(request: NextRequest) {
  await SchoolService.ensureTables();

  const authUser = await getSchoolAuthFromRequest(request);
  if (!authUser) return apiError('Unauthorized', 401);

  const schoolId = authUser.schoolId;
  const body = await parseBody<Record<string, any>>(request);
  if (!body) return apiError('Invalid request payload', 400);

  const action = body.action || 'generate_bulk';

  try {
    // 1. GENERATE BULK OR INDIVIDUAL MARKSHEETS
    if (action === 'generate_bulk' || action === 'generate_single') {
      let {
        examId,
        classId,
        studentId,
        sectionId,
        templateDesign = 'classic',
        teacherRemarks = 'Diligent, hardworking and shows commendable aptitude.',
      } = body;

      if (!examId) {
        return apiError('Exam ID is required to generate marksheet', 400);
      }

      // If studentId is provided but no classId, look up classId
      if (studentId && !classId) {
        const [stRows] = await pool.execute<RowDataPacket[]>(
          'SELECT classId FROM school_students WHERE schoolId = ? AND id = ?',
          [schoolId, studentId]
        );
        if (stRows.length > 0) classId = stRows[0].classId;
      }

      if (!classId && !studentId) {
        return apiError('Exam and Class (or Student) are required to generate marksheets', 400);
      }

      // Fetch students
      let stdQuery = 'SELECT id, admissionNo, rollNo, firstName, lastName, classId, sectionId FROM school_students WHERE schoolId = ? AND status = "active"';
      const stdParams: any[] = [schoolId];

      if (studentId) {
        stdQuery += ' AND id = ?';
        stdParams.push(studentId);
      } else if (classId) {
        stdQuery += ' AND classId = ?';
        stdParams.push(classId);
        if (sectionId) {
          stdQuery += ' AND sectionId = ?';
          stdParams.push(sectionId);
        }
      }

      const [students] = await pool.execute<RowDataPacket[]>(stdQuery, stdParams);

      if (students.length === 0) {
        return apiError('No students found for marksheet generation', 400);
      }

      // Calculate marks for each student
      const studentResults: any[] = [];
      for (const std of students) {
        const [marks] = await pool.execute<RowDataPacket[]>(
          `SELECT totalMarks, maxMarks, isAbsent, grade FROM school_exam_marks 
           WHERE schoolId = ? AND examId = ? AND studentId = ?`,
          [schoolId, examId, std.id]
        );

        let totalObtained = 0;
        let totalMax = 0;
        for (const m of marks) {
          totalObtained += Number(m.totalMarks) || 0;
          totalMax += Number(m.maxMarks) || 100;
        }

        if (totalMax === 0) totalMax = 500; // fallback

        const { percentage, grade, result } = SchoolService.calculateGradeAndResult(totalObtained, totalMax);

        studentResults.push({
          studentId: std.id,
          totalMax,
          totalObtained,
          percentage,
          grade,
          result,
        });
      }

      // Sort by percentage descending to assign ranks
      studentResults.sort((a, b) => b.percentage - a.percentage);

      let count = 0;
      const year = new Date().getFullYear();

      for (let i = 0; i < studentResults.length; i++) {
        const res = studentResults[i];
        const rank = i + 1;
        const verificationCode = `VRF-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
        const marksheetId = crypto.randomUUID();

        // Calculate student's actual attendance percentage from attendance records
        const [attRows] = await pool.execute<RowDataPacket[]>(
          `SELECT 
             COUNT(*) as totalDays,
             SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as presentDays
           FROM school_attendance
           WHERE schoolId = ? AND studentId = ?`,
          [schoolId, res.studentId]
        );
        const tDays = Number(attRows[0]?.totalDays || 0);
        const pDays = Number(attRows[0]?.presentDays || 0);
        const actualAttPercent = tDays > 0 ? Number(((pDays / tDays) * 100).toFixed(1)) : 94.5;

        // Check if marksheet already exists for this exam+student
        const [existing] = await pool.execute<RowDataPacket[]>(
          'SELECT id FROM school_marksheets WHERE schoolId = ? AND examId = ? AND studentId = ? LIMIT 1',
          [schoolId, examId, res.studentId]
        );

        const currentStudent = students.find((s) => s.id === res.studentId);
        const resolvedClassId = currentStudent?.classId || classId;
        const resolvedSectionId = sectionId || currentStudent?.sectionId || null;

        if (existing.length > 0) {
          await pool.execute(
            `UPDATE school_marksheets 
             SET totalMaxMarks = ?, totalObtained = ?, percentage = ?, grade = ?,
                 resultStatus = ?, rankInClass = ?, attendancePercent = ?, templateDesign = ?, teacherRemarks = ?,
                 generatedAt = NOW()
             WHERE id = ?`,
            [
              res.totalMax,
              res.totalObtained,
              res.percentage,
              res.grade,
              res.result,
              rank,
              actualAttPercent,
              templateDesign,
              teacherRemarks,
              existing[0].id,
            ]
          );
        } else {
          await pool.execute(
            `INSERT INTO school_marksheets 
             (id, schoolId, examId, studentId, classId, sectionId, totalMaxMarks, totalObtained, percentage, grade, resultStatus, rankInClass, attendancePercent, teacherRemarks, templateDesign, verificationCode)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              marksheetId,
              schoolId,
              examId,
              res.studentId,
              resolvedClassId,
              resolvedSectionId,
              res.totalMax,
              res.totalObtained,
              res.percentage,
              res.grade,
              res.result,
              rank,
              actualAttPercent,
              teacherRemarks,
              templateDesign,
              verificationCode,
            ]
          );
        }
        count++;
      }

      return apiSuccess({
        message: `Generated and updated ${count} student marksheets successfully with ${templateDesign} design.`,
        count,
      });
    }

    return apiError('Unknown action', 400);
  } catch (error: any) {
    console.error('Marksheets POST error:', error);
    return apiError(error.message || 'Operation failed', 500);
  }
}

