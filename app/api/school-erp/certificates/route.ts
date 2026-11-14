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
  const certType = searchParams.get('certType');

  try {
    let query = `
      SELECT cert.*, s.firstName, s.lastName, s.admissionNo, s.fatherName,
             c.name as className, sec.name as sectionName,
             sch.name as schoolName, sch.address as schoolAddress, sch.affiliationBoard,
             sch.logoUrl as schoolLogo, sch.stampUrl, sch.signatureUrl, sch.principalName
      FROM school_certificates cert
      JOIN school_students s ON s.id = cert.studentId
      JOIN school_classes c ON c.id = s.classId
      LEFT JOIN school_sections sec ON sec.id = s.sectionId
      JOIN schools sch ON sch.id = cert.schoolId
      WHERE cert.schoolId = ?
    `;
    const params: any[] = [schoolId];

    if (certType) {
      query += ' AND cert.certType = ?';
      params.push(certType);
    }

    query += ' ORDER BY cert.createdAt DESC LIMIT 100';

    const [certificates] = await pool.execute<RowDataPacket[]>(query, params);

    return apiSuccess({ certificates });
  } catch (error: any) {
    console.error('Certificates GET error:', error);
    return apiError(error.message || 'Failed to fetch certificates', 500);
  }
}

export async function POST(request: NextRequest) {
  await SchoolService.ensureTables();

  const authUser = await getSchoolAuthFromRequest(request);
  if (!authUser) return apiError('Unauthorized', 401);

  const schoolId = authUser.schoolId;
  const body = await parseBody<Record<string, any>>(request);
  if (!body) return apiError('Invalid request payload', 400);

  const { studentId, certType = 'transfer', reason = '', conductGrade = 'Good', issueDate } = body;

  if (!studentId) return apiError('Student is required to issue certificate', 400);

  try {
    const year = new Date().getFullYear();
    const typePrefix = certType.substring(0, 2).toUpperCase();
    const certificateNo = `${typePrefix}-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
    const certId = crypto.randomUUID();
    const date = issueDate || new Date().toISOString().split('T')[0];

    await pool.execute(
      `INSERT INTO school_certificates 
       (id, schoolId, certType, certificateNo, studentId, issueDate, reason, conductGrade)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [certId, schoolId, certType, certificateNo, studentId, date, reason, conductGrade]
    );

    return apiSuccess({
      message: `${certType.toUpperCase()} Certificate generated successfully`,
      certificateNo,
      certId,
    });
  } catch (error: any) {
    console.error('Certificates POST error:', error);
    return apiError(error.message || 'Operation failed', 500);
  }
}

