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

  const authUser = await getSchoolAuthFromRequest(request);
  if (!authUser) return apiError('Unauthorized', 401);

  const schoolId = authUser.schoolId;
  const { searchParams } = new URL(request.url);

  const examId = searchParams.get('examId');
  const classId = searchParams.get('classId');
  const sectionId = searchParams.get('sectionId');

  try {
    // 1. Fetch Marks Entry Grid for an Exam + Class + Section
    if (examId && classId) {
      // Fetch subjects for this class
      const [subjects] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM school_subjects WHERE schoolId = ? AND classId = ? ORDER BY name ASC',
        [schoolId, classId]
      );

      // Fetch students for this class & section
      let stdQuery = 'SELECT id, admissionNo, rollNo, firstName, lastName FROM school_students WHERE schoolId = ? AND classId = ? AND status = "active"';
      const stdParams: any[] = [schoolId, classId];
      if (sectionId) {
        stdQuery += ' AND sectionId = ?';
        stdParams.push(sectionId);
      }
      stdQuery += ' ORDER BY rollNo ASC, firstName ASC';

      const [students] = await pool.execute<RowDataPacket[]>(stdQuery, stdParams);

      // Fetch existing marks
      const [marksRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM school_exam_marks WHERE schoolId = ? AND examId = ? AND classId = ?',
        [schoolId, examId, classId]
      );

      // Map marks by studentId_subjectId
      const marksMap: Record<string, any> = {};
      for (const m of marksRows) {
        marksMap[`${m.studentId}_${m.subjectId}`] = m;
      }

      return apiSuccess({
        subjects,
        students,
        marksMap,
      });
    }

    // 2. Fetch all examinations for the school
    const [exams] = await pool.execute<RowDataPacket[]>(
      `SELECT e.*, sess.name as sessionName,
              COUNT(DISTINCT m.studentId) as markedStudentsCount
       FROM school_exams e
       LEFT JOIN school_sessions sess ON sess.id = e.sessionId
       LEFT JOIN school_exam_marks m ON m.examId = e.id
       WHERE e.schoolId = ?
       GROUP BY e.id
       ORDER BY e.createdAt DESC`,
      [schoolId]
    );

    return apiSuccess({ exams });
  } catch (error: any) {
    console.error('Exams GET error:', error);
    return apiError(error.message || 'Failed to fetch exam details', 500);
  }
}

export async function POST(request: NextRequest) {
  await SchoolService.ensureTables();

  const authUser = await getSchoolAuthFromRequest(request);
  if (!authUser) return apiError('Unauthorized', 401);

  const schoolId = authUser.schoolId;
  const body = await parseBody<Record<string, any>>(request);
  if (!body) return apiError('Invalid request payload', 400);

  const action = body.action;

  try {
    // 1. CREATE EXAMINATION
    if (action === 'create_exam') {
      const { name, examType = 'annual', sessionId, startDate, endDate } = body;
      if (!name) return apiError('Exam name is required', 400);

      const examId = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO school_exams (id, schoolId, sessionId, name, examType, startDate, endDate, isPublished)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [examId, schoolId, sessionId || null, name.trim(), examType, startDate || null, endDate || null]
      );

      return apiSuccess({ message: `Examination '${name}' scheduled`, examId });
    }

    // 2. SAVE MARKS (BULK OR CELL LEVEL)
    if (action === 'save_marks') {
      const { examId, classId, sectionId, marksList = [] } = body;
      if (!examId || !classId || !Array.isArray(marksList)) {
        return apiError('Exam, Class and marks entries are required', 400);
      }

      let savedCount = 0;
      for (const item of marksList) {
        const { studentId, subjectId, theoryMarks = 0, practicalMarks = 0, isAbsent = false, remarks = '' } = item;
        if (!studentId || !subjectId) continue;

        const tMarks = Number(theoryMarks) || 0;
        const pMarks = Number(practicalMarks) || 0;
        const total = isAbsent ? 0 : tMarks + pMarks;
        const max = Number(item.maxMarks) || 100;

        const { grade } = SchoolService.calculateGradeAndResult(total, max);

        const markId = crypto.randomUUID();
        await pool.execute(
          `INSERT INTO school_exam_marks 
           (id, schoolId, examId, classId, sectionId, studentId, subjectId, theoryMarks, practicalMarks, totalMarks, maxMarks, isAbsent, grade, remarks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             theoryMarks = VALUES(theoryMarks),
             practicalMarks = VALUES(practicalMarks),
             totalMarks = VALUES(totalMarks),
             maxMarks = VALUES(maxMarks),
             isAbsent = VALUES(isAbsent),
             grade = VALUES(grade),
             remarks = VALUES(remarks)`,
          [
            markId,
            schoolId,
            examId,
            classId,
            sectionId || null,
            studentId,
            subjectId,
            tMarks,
            pMarks,
            total,
            max,
            isAbsent ? 1 : 0,
            grade,
            remarks,
          ]
        );
        savedCount++;
      }

      return apiSuccess({ message: `Saved marks for ${savedCount} student subject(s)` });
    }

    return apiError('Unknown action', 400);
  } catch (error: any) {
    console.error('Exams POST error:', error);
    return apiError(error.message || 'Operation failed', 500);
  }
}

