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

  const classId = searchParams.get('classId');
  const sectionId = searchParams.get('sectionId');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  try {
    if (!classId) {
      return apiError('Class is required to fetch attendance register', 400);
    }

    // Fetch students in this class/section
    let stdQuery = 'SELECT id, admissionNo, rollNo, firstName, lastName, gender FROM school_students WHERE schoolId = ? AND classId = ? AND status = "active"';
    const stdParams: any[] = [schoolId, classId];
    if (sectionId) {
      stdQuery += ' AND sectionId = ?';
      stdParams.push(sectionId);
    }
    stdQuery += ' ORDER BY rollNo ASC, firstName ASC';

    const [students] = await pool.execute<RowDataPacket[]>(stdQuery, stdParams);

    // Fetch attendance on this date
    const [attRows] = await pool.execute<RowDataPacket[]>(
      'SELECT studentId, status, remarks FROM school_attendance WHERE schoolId = ? AND classId = ? AND date = ?',
      [schoolId, classId, date]
    );

    const attendanceMap: Record<string, { status: string; remarks: string }> = {};
    for (const row of attRows) {
      attendanceMap[row.studentId] = { status: row.status, remarks: row.remarks || '' };
    }

    // Combine student list with attendance status
    const register = students.map((std) => ({
      ...std,
      status: attendanceMap[std.id]?.status || 'present',
      remarks: attendanceMap[std.id]?.remarks || '',
      isMarked: Boolean(attendanceMap[std.id]),
    }));

    return apiSuccess({
      date,
      register,
      totalStudents: register.length,
      presentCount: register.filter((r) => r.status === 'present').length,
      absentCount: register.filter((r) => r.status === 'absent').length,
      leaveCount: register.filter((r) => r.status === 'leave').length,
    });
  } catch (error: any) {
    console.error('Attendance GET error:', error);
    return apiError(error.message || 'Failed to fetch attendance', 500);
  }
}

export async function POST(request: NextRequest) {
  await SchoolService.ensureTables();

  const authUser = await getSchoolAuthFromRequest(request);
  if (!authUser) return apiError('Unauthorized', 401);

  const schoolId = authUser.schoolId;
  const body = await parseBody<Record<string, any>>(request);
  if (!body) return apiError('Invalid request payload', 400);

  const { classId, sectionId, date, attendanceList = [] } = body;

  if (!classId || !date || !Array.isArray(attendanceList) || attendanceList.length === 0) {
    return apiError('Class, date, and attendance list are required', 400);
  }

  try {
    let savedCount = 0;
    for (const item of attendanceList) {
      const { studentId, status = 'present', remarks = '' } = item;
      if (!studentId) continue;

      const attId = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO school_attendance (id, schoolId, classId, sectionId, studentId, date, status, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)`,
        [attId, schoolId, classId, sectionId || null, studentId, date, status, remarks]
      );
      savedCount++;
    }

    return apiSuccess({
      message: `Marked attendance for ${savedCount} student(s) on ${date}`,
      count: savedCount,
    });
  } catch (error: any) {
    console.error('Attendance POST error:', error);
    return apiError(error.message || 'Failed to save attendance', 500);
  }
}

