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

  try {
    // 1. Classes with section count and student count
    const [classes] = await pool.execute<RowDataPacket[]>(
      `SELECT c.id, c.name, c.numericOrder, c.capacity,
              COUNT(DISTINCT s.id) as studentCount,
              COUNT(DISTINCT sec.id) as sectionCount
       FROM school_classes c
       LEFT JOIN school_students s ON s.classId = c.id AND s.status = 'active'
       LEFT JOIN school_sections sec ON sec.classId = c.id
       WHERE c.schoolId = ?
       GROUP BY c.id, c.name, c.numericOrder, c.capacity
       ORDER BY c.numericOrder ASC, c.name ASC`,
      [schoolId]
    );

    // 2. Sections
    const [sections] = await pool.execute<RowDataPacket[]>(
      `SELECT sec.id, sec.classId, sec.name, sec.roomNo,
              c.name as className,
              t.name as classTeacherName, t.id as classTeacherId
       FROM school_sections sec
       JOIN school_classes c ON c.id = sec.classId
       LEFT JOIN school_teachers t ON t.id = sec.classTeacherId
       WHERE sec.schoolId = ?
       ORDER BY c.numericOrder ASC, sec.name ASC`,
      [schoolId]
    );

    // 3. Subjects
    const [subjects] = await pool.execute<RowDataPacket[]>(
      `SELECT sub.id, sub.classId, sub.name, sub.code, sub.type,
              sub.maxTheoryMarks, sub.maxPracticalMarks, sub.passMarks,
              c.name as className
       FROM school_subjects sub
       JOIN school_classes c ON c.id = sub.classId
       WHERE sub.schoolId = ?
       ORDER BY c.numericOrder ASC, sub.name ASC`,
      [schoolId]
    );

    // 4. Sessions
    const [sessions] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, startDate, endDate, isCurrent
       FROM school_sessions
       WHERE schoolId = ?
       ORDER BY isCurrent DESC, name DESC`,
      [schoolId]
    );

    return apiSuccess({
      classes,
      sections,
      subjects,
      sessions,
    });
  } catch (error: any) {
    console.error('Academic API GET error:', error);
    return apiError(error.message || 'Failed to fetch academic details', 500);
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
    // 1. ADD CLASS
    if (action === 'add_class') {
      const { name, numericOrder = 1, capacity = 40 } = body;
      if (!name) return apiError('Class name is required', 400);

      const classId = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO school_classes (id, schoolId, name, numericOrder, capacity)
         VALUES (?, ?, ?, ?, ?)`,
        [classId, schoolId, name.trim(), Number(numericOrder) || 1, Number(capacity) || 40]
      );

      // Add default section 'A'
      await pool.execute(
        `INSERT INTO school_sections (id, schoolId, classId, name, roomNo)
         VALUES (?, ?, ?, 'A', 'Room-1')`,
        [crypto.randomUUID(), schoolId, classId]
      );

      return apiSuccess({ message: `Class ${name} created with Section A`, classId });
    }

    // 2. DELETE CLASS
    if (action === 'delete_class') {
      const { classId } = body;
      if (!classId) return apiError('Class ID is required', 400);

      await pool.execute('DELETE FROM school_sections WHERE schoolId = ? AND classId = ?', [schoolId, classId]);
      await pool.execute('DELETE FROM school_subjects WHERE schoolId = ? AND classId = ?', [schoolId, classId]);
      await pool.execute('DELETE FROM school_classes WHERE schoolId = ? AND id = ?', [schoolId, classId]);

      return apiSuccess({ message: 'Class deleted successfully' });
    }

    // 3. ADD SECTION
    if (action === 'add_section') {
      const { classId, name, roomNo = '', classTeacherId = null } = body;
      if (!classId || !name) return apiError('Class and section name are required', 400);

      const sectionId = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO school_sections (id, schoolId, classId, name, roomNo, classTeacherId)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sectionId, schoolId, classId, name.trim().toUpperCase(), roomNo, classTeacherId || null]
      );

      return apiSuccess({ message: `Section ${name} added`, sectionId });
    }

    // 4. ADD SUBJECT
    if (action === 'add_subject') {
      const { classId, name, code = '', type = 'both', maxTheory = 80, maxPractical = 20, passMarks = 33 } = body;
      if (!classId || !name) return apiError('Class and subject name are required', 400);

      const subjectId = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO school_subjects (id, schoolId, classId, name, code, type, maxTheoryMarks, maxPracticalMarks, passMarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          subjectId,
          schoolId,
          classId,
          name.trim(),
          code.trim() || name.substring(0, 3).toUpperCase(),
          type,
          Number(maxTheory) || 80,
          Number(maxPractical) || 0,
          Number(passMarks) || 33,
        ]
      );

      return apiSuccess({ message: `Subject ${name} added`, subjectId });
    }

    // 4b. SEED STANDARD SUBJECTS FOR CLASS
    if (action === 'seed_standard_subjects') {
      const { classId } = body;
      if (!classId) return apiError('Class ID is required', 400);

      const standardSubjects = [
        { name: 'English', code: 'ENG-101', theory: 80, practical: 20 },
        { name: 'Hindi', code: 'HIN-102', theory: 80, practical: 20 },
        { name: 'Mathematics', code: 'MAT-103', theory: 80, practical: 20 },
        { name: 'Science', code: 'SCI-104', theory: 70, practical: 30 },
        { name: 'Social Science', code: 'SST-105', theory: 80, practical: 20 },
        { name: 'Computer Applications', code: 'CA-106', theory: 50, practical: 50 },
      ];

      for (const s of standardSubjects) {
        await pool.execute(
          `INSERT INTO school_subjects (id, schoolId, classId, name, code, type, maxTheoryMarks, maxPracticalMarks, passMarks)
           VALUES (?, ?, ?, ?, ?, 'both', ?, ?, 33)`,
          [crypto.randomUUID(), schoolId, classId, s.name, s.code, s.theory, s.practical]
        );
      }

      return apiSuccess({ message: 'Standard subjects added to class successfully' });
    }

    // 5. ADD SESSION
    if (action === 'add_session') {
      const { name, startDate, endDate, setAsCurrent = false } = body;
      if (!name) return apiError('Session name (e.g. 2026-2027) is required', 400);

      const sessionId = crypto.randomUUID();
      if (setAsCurrent) {
        await pool.execute('UPDATE school_sessions SET isCurrent = 0 WHERE schoolId = ?', [schoolId]);
        await pool.execute('UPDATE schools SET currentSession = ? WHERE id = ?', [name.trim(), schoolId]);
      }

      await pool.execute(
        `INSERT INTO school_sessions (id, schoolId, name, startDate, endDate, isCurrent)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sessionId, schoolId, name.trim(), startDate || null, endDate || null, setAsCurrent ? 1 : 0]
      );

      return apiSuccess({ message: `Academic Session ${name} created`, sessionId });
    }

    return apiError('Unknown action', 400);
  } catch (error: any) {
    console.error('Academic API POST error:', error);
    return apiError(error.message || 'Operation failed', 500);
  }
}

