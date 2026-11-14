import { NextRequest } from 'next/server';
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
    const [schools] = await pool.execute<RowDataPacket[]>(
      `SELECT id, slug, schoolCode, name, logoUrl, stampUrl, signatureUrl, affiliationBoard, regNumber,
              address, city, state, pincode, phone, email, websiteUrl, principalName, estYear,
              currentSession, schoolType, medium, plan, planExpiresAt, status, themePrimaryColor,
              themeAccentColor, marksheetDesign, aboutSchool, principalMessage, facilitiesJson
       FROM schools WHERE id = ? LIMIT 1`,
      [schoolId]
    );

    if (schools.length === 0) return apiError('School not found', 404);

    return apiSuccess({ school: schools[0] });
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return apiError(error.message || 'Failed to fetch settings', 500);
  }
}

export async function POST(request: NextRequest) {
  await SchoolService.ensureTables();

  const authUser = await getSchoolAuthFromRequest(request);
  if (!authUser) return apiError('Unauthorized', 401);

  const schoolId = authUser.schoolId;
  const body = await parseBody<Record<string, any>>(request);
  if (!body) return apiError('Invalid request payload', 400);

  const {
    name,
    logoUrl,
    stampUrl,
    signatureUrl,
    affiliationBoard,
    regNumber,
    address,
    city,
    state,
    pincode,
    phone,
    email,
    websiteUrl,
    principalName,
    estYear,
    schoolType,
    medium,
    themePrimaryColor,
    themeAccentColor,
    marksheetDesign,
    aboutSchool,
    principalMessage,
    facilitiesJson,
  } = body;

  try {
    await pool.execute(
      `UPDATE schools 
       SET name = COALESCE(?, name),
           logoUrl = COALESCE(?, logoUrl),
           stampUrl = COALESCE(?, stampUrl),
           signatureUrl = COALESCE(?, signatureUrl),
           affiliationBoard = COALESCE(?, affiliationBoard),
           regNumber = COALESCE(?, regNumber),
           address = COALESCE(?, address),
           city = COALESCE(?, city),
           state = COALESCE(?, state),
           pincode = COALESCE(?, pincode),
           phone = COALESCE(?, phone),
           email = COALESCE(?, email),
           websiteUrl = COALESCE(?, websiteUrl),
           principalName = COALESCE(?, principalName),
           estYear = COALESCE(?, estYear),
           schoolType = COALESCE(?, schoolType),
           medium = COALESCE(?, medium),
           themePrimaryColor = COALESCE(?, themePrimaryColor),
           themeAccentColor = COALESCE(?, themeAccentColor),
           marksheetDesign = COALESCE(?, marksheetDesign),
           aboutSchool = COALESCE(?, aboutSchool),
           principalMessage = COALESCE(?, principalMessage),
           facilitiesJson = COALESCE(?, facilitiesJson)
       WHERE id = ?`,
      [
        name,
        logoUrl,
        stampUrl,
        signatureUrl,
        affiliationBoard,
        regNumber,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        websiteUrl,
        principalName,
        estYear,
        schoolType,
        medium,
        themePrimaryColor,
        themeAccentColor,
        marksheetDesign,
        aboutSchool,
        principalMessage,
        facilitiesJson ? JSON.stringify(facilitiesJson) : null,
        schoolId,
      ]
    );

    return apiSuccess({ message: 'School settings and branding updated successfully' });
  } catch (error: any) {
    console.error('Settings POST error:', error);
    return apiError(error.message || 'Failed to update settings', 500);
  }
}

