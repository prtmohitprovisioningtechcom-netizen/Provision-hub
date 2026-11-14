import { NextRequest } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
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
  const search = searchParams.get('search');
  const status = searchParams.get('status') || 'active';
  const studentId = searchParams.get('studentId');

  try {
    if (studentId) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT s.*, c.name as className, sec.name as sectionName,
                sess.name as sessionName,
                r.routeName, r.driverName, r.driverPhone,
                st.stopName, st.pickupTime, st.dropTime, st.monthlyFare as stopMonthlyFare,
                v.vehicleNo, v.vehicleType
         FROM school_students s
         JOIN school_classes c ON c.id = s.classId
         LEFT JOIN school_sections sec ON sec.id = s.sectionId
         LEFT JOIN school_sessions sess ON sess.id = s.sessionId
         LEFT JOIN school_transport_routes r ON r.id = s.transportRouteId
         LEFT JOIN school_transport_stops st ON st.id = s.transportStopId
         LEFT JOIN school_vehicles v ON v.id = r.vehicleId
         WHERE s.schoolId = ? AND s.id = ? LIMIT 1`,
        [schoolId, studentId]
      );

      if (rows.length === 0) return apiError('Student not found', 404);

      // Fetch student's fee invoices
      const [invoices] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM school_fee_invoices WHERE schoolId = ? AND studentId = ? ORDER BY createdAt DESC`,
        [schoolId, studentId]
      );

      // Fetch student's marksheets
      const [marksheets] = await pool.execute<RowDataPacket[]>(
        `SELECT m.*, e.name as examName
         FROM school_marksheets m
         JOIN school_exams e ON e.id = m.examId
         WHERE m.schoolId = ? AND m.studentId = ? ORDER BY m.generatedAt DESC`,
        [schoolId, studentId]
      );

      // Fetch student's attendance statistics
      const [attRows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
           COUNT(*) as totalDays,
           COALESCE(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END), 0) as presentDays,
           COALESCE(SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END), 0) as absentDays,
           COALESCE(SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END), 0) as leaveDays
         FROM school_attendance
         WHERE schoolId = ? AND studentId = ?`,
        [schoolId, studentId]
      );

      const totalDays = Number(attRows[0]?.totalDays || 0);
      const presentDays = Number(attRows[0]?.presentDays || 0);
      const attendancePercent = totalDays > 0 ? Number(((presentDays / totalDays) * 100).toFixed(1)) : 95.0;

      return apiSuccess({
        student: rows[0],
        invoices,
        marksheets,
        attendance: {
          ...attRows[0],
          attendancePercent,
        },
      });
    }

    let query = `
      SELECT s.id, s.admissionNo, s.rollNo, s.firstName, s.lastName, s.dob, s.gender,
             s.bloodGroup, s.photoUrl, s.category, s.fatherName, s.motherName, s.fatherPhone,
             s.motherPhone, s.address, s.city, s.status, s.admissionDate, s.classId, s.sectionId,
             s.transportOpted, s.transportRouteId, s.transportStopId, s.monthlyTransportFee,
             c.name as className, sec.name as sectionName,
             r.routeName, st.stopName
      FROM school_students s
      JOIN school_classes c ON c.id = s.classId
      LEFT JOIN school_sections sec ON sec.id = s.sectionId
      LEFT JOIN school_transport_routes r ON r.id = s.transportRouteId
      LEFT JOIN school_transport_stops st ON st.id = s.transportStopId
      WHERE s.schoolId = ?
    `;
    const params: any[] = [schoolId];

    if (classId) {
      query += ' AND s.classId = ?';
      params.push(classId);
    }
    if (sectionId) {
      query += ' AND s.sectionId = ?';
      params.push(sectionId);
    }
    if (status && status !== 'all') {
      query += ' AND s.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (s.firstName LIKE ? OR s.lastName LIKE ? OR s.admissionNo LIKE ? OR s.fatherPhone LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY c.numericOrder ASC, sec.name ASC, s.rollNo ASC, s.firstName ASC LIMIT 200';

    const [students] = await pool.execute<RowDataPacket[]>(query, params);

    return apiSuccess({
      students,
      total: students.length,
    });
  } catch (error: any) {
    console.error('Students GET error:', error);
    return apiError(error.message || 'Failed to fetch students', 500);
  }
}

export async function POST(request: NextRequest) {
  await SchoolService.ensureTables();

  const authUser = await getSchoolAuthFromRequest(request);
  if (!authUser) return apiError('Unauthorized', 401);

  const schoolId = authUser.schoolId;
  const body = await parseBody<Record<string, any>>(request);
  if (!body) return apiError('Invalid request payload', 400);

  const action = body.action || 'add_student';

  try {
    // 1. ADD INDIVIDUAL STUDENT
    if (action === 'add_student') {
      const {
        firstName,
        lastName = '',
        admissionNo,
        rollNo = '',
        dob,
        gender = 'Male',
        bloodGroup = '',
        category = 'General',
        religion = '',
        fatherName = '',
        motherName = '',
        fatherPhone = '',
        motherPhone = '',
        address = '',
        city = '',
        state = '',
        pincode = '',
        classId,
        sectionId,
        sessionId,
        admissionDate,
        photoUrl = '',
      } = body;

      if (!firstName || !classId) {
        return apiError('Student first name and class are required', 400);
      }

      // Generate unique admission number if not provided
      let finalAdmNo = (admissionNo || '').trim();
      if (!finalAdmNo) {
        const year = new Date().getFullYear();
        finalAdmNo = `ADM-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // Ensure no collision in this school
      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM school_students WHERE schoolId = ? AND admissionNo = ? LIMIT 1',
        [schoolId, finalAdmNo]
      );
      if (existing.length > 0) {
        return apiError(`Admission number ${finalAdmNo} already exists for this school.`, 409);
      }

      // Ensure valid section
      let finalSectionId = sectionId;
      if (!finalSectionId) {
        const [defaultSec] = await pool.execute<RowDataPacket[]>(
          'SELECT id FROM school_sections WHERE schoolId = ? AND classId = ? ORDER BY name ASC LIMIT 1',
          [schoolId, classId]
        );
        finalSectionId = defaultSec[0]?.id || null;
      }

      const studentId = crypto.randomUUID();
      const admDate = admissionDate || new Date().toISOString().split('T')[0];

      await pool.execute(
        `INSERT INTO school_students 
         (id, schoolId, admissionNo, rollNo, firstName, lastName, dob, gender, bloodGroup, photoUrl, category, religion, fatherName, motherName, fatherPhone, motherPhone, address, city, state, pincode, classId, sectionId, sessionId, admissionDate, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          studentId,
          schoolId,
          finalAdmNo,
          rollNo,
          firstName.trim(),
          lastName.trim(),
          dob || null,
          gender,
          bloodGroup,
          photoUrl,
          category,
          religion,
          fatherName.trim(),
          motherName.trim(),
          fatherPhone.trim(),
          motherPhone.trim(),
          address.trim(),
          city.trim(),
          state.trim(),
          pincode.trim(),
          classId,
          finalSectionId,
          sessionId || null,
          admDate,
        ]
      );

      // Create Parent / Student login portal access
      const defaultPassword = fatherPhone ? fatherPhone.slice(-6) : '123456';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      const studentUserId = crypto.randomUUID();

      await pool.execute(
        `INSERT INTO school_users (id, schoolId, role, name, phone, passwordHash, refStudentId, status)
         VALUES (?, ?, 'student', ?, ?, ?, ?, 'active')`,
        [
          studentUserId,
          schoolId,
          `${firstName} ${lastName}`.trim(),
          fatherPhone.trim() || finalAdmNo,
          passwordHash,
          studentId,
        ]
      );

      return apiSuccess({
        message: 'Student registered successfully',
        studentId,
        admissionNo: finalAdmNo,
        portalLogin: {
          username: finalAdmNo,
          defaultPassword,
        },
      });
    }

    // 2. UPDATE STUDENT
    if (action === 'update_student') {
      const {
        studentId,
        firstName,
        lastName = '',
        rollNo = '',
        dob,
        gender,
        bloodGroup,
        category,
        fatherName = '',
        motherName = '',
        fatherPhone = '',
        address = '',
        city = '',
        classId,
        sectionId,
        status = 'active',
        photoUrl,
      } = body;

      if (!studentId) return apiError('Student ID is required', 400);

      await pool.execute(
        `UPDATE school_students 
         SET firstName = ?, lastName = ?, rollNo = ?, dob = ?, gender = ?, bloodGroup = ?,
             category = ?, fatherName = ?, motherName = ?, fatherPhone = ?, address = ?,
             city = ?, classId = ?, sectionId = ?, status = ?, photoUrl = COALESCE(?, photoUrl)
         WHERE schoolId = ? AND id = ?`,
        [
          firstName.trim(),
          lastName.trim(),
          rollNo,
          dob || null,
          gender,
          bloodGroup,
          category,
          fatherName.trim(),
          motherName.trim(),
          fatherPhone.trim(),
          address.trim(),
          city.trim(),
          classId,
          sectionId,
          status,
          photoUrl || null,
          schoolId,
          studentId,
        ]
      );

      return apiSuccess({ message: 'Student information updated' });
    }

    // 3. BULK IMPORT STUDENTS (from Excel / JSON)
    if (action === 'bulk_import') {
      const { students = [], classId, sectionId } = body;
      if (!Array.isArray(students) || students.length === 0) {
        return apiError('No student data provided for import', 400);
      }

      let importedCount = 0;
      const year = new Date().getFullYear();

      for (const std of students) {
        if (!std.firstName && !std.name) continue;
        const nameParts = (std.name || std.firstName || '').split(' ');
        const fName = nameParts[0] || 'Student';
        const lName = std.lastName || nameParts.slice(1).join(' ') || '';
        const admNo = std.admissionNo || `ADM-${year}-${Math.floor(10000 + Math.random() * 90000)}`;

        const sId = crypto.randomUUID();
        await pool.execute(
          `INSERT INTO school_students 
           (id, schoolId, admissionNo, rollNo, firstName, lastName, gender, fatherName, fatherPhone, classId, sectionId, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
           ON DUPLICATE KEY UPDATE firstName = VALUES(firstName), lastName = VALUES(lastName)`,
          [
            sId,
            schoolId,
            admNo,
            std.rollNo || '',
            fName,
            lName,
            std.gender || 'Male',
            std.fatherName || '',
            std.fatherPhone || '',
            std.classId || classId,
            std.sectionId || sectionId || null,
          ]
        );
        importedCount++;
      }

      return apiSuccess({ message: `Successfully imported ${importedCount} students.` });
    }

    // 4. DELETE STUDENT
    if (action === 'delete_student') {
      const { studentId } = body;
      if (!studentId) return apiError('Student ID is required', 400);

      await pool.execute(
        'UPDATE school_students SET status = "inactive" WHERE schoolId = ? AND id = ?',
        [schoolId, studentId]
      );

      return apiSuccess({ message: 'Student moved to inactive/archived status' });
    }

    return apiError('Unknown action', 400);
  } catch (error: any) {
    console.error('Students POST error:', error);
    return apiError(error.message || 'Operation failed', 500);
  }
}

