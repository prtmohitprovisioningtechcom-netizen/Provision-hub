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
    const [teachers] = await pool.execute<RowDataPacket[]>(
      `SELECT t.*, 
              GROUP_CONCAT(DISTINCT sec.name) as assignedSections,
              COUNT(DISTINCT c.id) as assignedClassCount
       FROM school_teachers t
       LEFT JOIN school_sections sec ON sec.classTeacherId = t.id
       LEFT JOIN school_classes c ON c.id = sec.classId
       WHERE t.schoolId = ?
       GROUP BY t.id
       ORDER BY t.name ASC`,
      [schoolId]
    );

    return apiSuccess({ teachers });
  } catch (error: any) {
    console.error('Teachers GET error:', error);
    return apiError(error.message || 'Failed to fetch teachers', 500);
  }
}

export async function POST(request: NextRequest) {
  await SchoolService.ensureTables();

  const authUser = await getSchoolAuthFromRequest(request);
  if (!authUser) return apiError('Unauthorized', 401);

  const schoolId = authUser.schoolId;
  const body = await parseBody<Record<string, any>>(request);
  if (!body) return apiError('Invalid request payload', 400);

  const action = body.action || 'add_teacher';

  try {
    if (action === 'add_teacher') {
      const {
        name,
        empId,
        email = '',
        phone = '',
        qualification = 'B.Ed / M.A.',
        experience = '3 Years',
        designation = 'TGT Subject Teacher',
        specialization = 'Mathematics',
        salary = 35000,
        joiningDate,
        photoUrl = '',
      } = body;

      if (!name) return apiError('Teacher name is required', 400);

      const finalEmpId = empId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      const teacherId = crypto.randomUUID();

      await pool.execute(
        `INSERT INTO school_teachers 
         (id, schoolId, empId, name, email, phone, photoUrl, qualification, experience, designation, specialization, salary, joiningDate, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          teacherId,
          schoolId,
          finalEmpId,
          name.trim(),
          email.trim(),
          phone.trim(),
          photoUrl,
          qualification,
          experience,
          designation,
          specialization,
          Number(salary) || 0,
          joiningDate || new Date().toISOString().split('T')[0],
        ]
      );

      return apiSuccess({ message: `Teacher ${name} added successfully`, teacherId, empId: finalEmpId });
    }

    if (action === 'update_teacher') {
      const { teacherId, name, email, phone, designation, qualification, salary, status } = body;
      if (!teacherId) return apiError('Teacher ID is required', 400);

      await pool.execute(
        `UPDATE school_teachers 
         SET name = ?, email = ?, phone = ?, designation = ?, qualification = ?, salary = ?, status = ?
         WHERE schoolId = ? AND id = ?`,
        [name, email, phone, designation, qualification, Number(salary) || 0, status || 'active', schoolId, teacherId]
      );

      return apiSuccess({ message: 'Teacher details updated' });
    }

    if (action === 'delete_teacher') {
      const { teacherId } = body;
      if (!teacherId) return apiError('Teacher ID is required', 400);

      await pool.execute('UPDATE school_teachers SET status = "inactive" WHERE schoolId = ? AND id = ?', [
        schoolId,
        teacherId,
      ]);

      return apiSuccess({ message: 'Teacher record marked inactive' });
    }

    return apiError('Unknown action', 400);
  } catch (error: any) {
    console.error('Teachers POST error:', error);
    return apiError(error.message || 'Operation failed', 500);
  }
}

