import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { SchoolService } from '@/server/services/school.service';
import {
  generateSchoolToken,
  getSchoolAuthFromRequest,
  SCHOOL_AUTH_COOKIE,
  SchoolAuthPayload,
} from '@/lib/school-auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  await SchoolService.ensureTables();

  const body = await parseBody<Record<string, any>>(request);
  if (!body) return apiError('Invalid request payload', 400);

  const action = (body.action || 'login') as string;

  // 1. REGISTRATION
  if (action === 'register') {
    const {
      schoolName,
      affiliationBoard = 'CBSE',
      regNumber = '',
      address = '',
      state = '',
      city = '',
      pincode = '',
      phone = '',
      email = '',
      websiteUrl = '',
      principalName = '',
      estYear = '',
      academicSession = '2026-2027',
      schoolType = 'Co-Educational',
      medium = 'English',
      adminName,
      adminEmail,
      adminPhone,
      password,
    } = body;

    if (!schoolName || !adminName || !password || (!adminEmail && !adminPhone)) {
      return apiError('School name, admin name, password and email/phone are required.', 400);
    }

    if (password.length < 6) {
      return apiError('Password must be at least 6 characters long.', 400);
    }

    // Check if school or admin email already exists
    const contactEmail = (adminEmail || email || '').trim().toLowerCase();
    const contactPhone = (adminPhone || phone || '').trim();

    if (contactEmail) {
      const [existingUsers] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM school_users WHERE email = ? LIMIT 1',
        [contactEmail]
      );
      if (existingUsers.length > 0) {
        return apiError('An admin account with this email already exists. Please login instead.', 409);
      }
    }

    // Create unique slug
    let baseSlug = slugify(schoolName, { lower: true, strict: true }) || 'school';
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (true) {
      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM schools WHERE slug = ? LIMIT 1',
        [uniqueSlug]
      );
      if (existing.length === 0) break;
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    // Generate unique School Code e.g. SCH-58921
    const schoolCode = `SCH-${Math.floor(10000 + Math.random() * 90000)}`;
    const schoolId = crypto.randomUUID();
    const adminId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    // Trial expires in 14 days
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 14);

    // Insert School
    await pool.execute(
      `INSERT INTO schools 
       (id, slug, schoolCode, name, affiliationBoard, regNumber, address, city, state, pincode, phone, email, websiteUrl, principalName, estYear, currentSession, schoolType, medium, plan, planExpiresAt, status, aboutSchool, principalMessage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'free_trial', ?, 'active', ?, ?)`,
      [
        schoolId,
        uniqueSlug,
        schoolCode,
        schoolName.trim(),
        affiliationBoard,
        regNumber,
        address,
        city,
        state,
        pincode,
        contactPhone,
        contactEmail,
        websiteUrl,
        principalName,
        estYear,
        academicSession,
        schoolType,
        medium,
        trialExpiry,
        `Welcome to ${schoolName}. We are dedicated to educational excellence and holistic student development.`,
        `Welcome parents and students to ${schoolName}. Our mission is to nurture intellect, character, and leadership.`,
      ]
    );

    // Insert Admin User
    await pool.execute(
      `INSERT INTO school_users (id, schoolId, role, name, email, phone, passwordHash, status)
       VALUES (?, ?, 'school_admin', ?, ?, ?, ?, 'active')`,
      [adminId, schoolId, adminName.trim(), contactEmail, contactPhone, passwordHash]
    );

    // Seed default starter data: sessions, classes, subjects, fee categories, exams
    await SchoolService.seedDefaultSchoolData(schoolId, academicSession);

    const tokenPayload: SchoolAuthPayload = {
      userId: adminId,
      schoolId,
      role: 'school_admin',
      name: adminName.trim(),
      email: contactEmail,
      phone: contactPhone,
      schoolSlug: uniqueSlug,
      schoolName: schoolName.trim(),
    };

    const token = generateSchoolToken(tokenPayload);

    const response = apiSuccess(
      {
        message: 'School registered successfully!',
        school: {
          id: schoolId,
          name: schoolName,
          slug: uniqueSlug,
          schoolCode,
        },
        user: tokenPayload,
        token,
      },
      'School registered successfully!',
      201
    );

    response.cookies.set(SCHOOL_AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 14,
    });

    return response;
  }

  // 2. LOGIN
  if (action === 'login') {
    const { identifier, password, schoolCode } = body;
    if (!identifier || !password) {
      return apiError('Email/Phone and Password are required.', 400);
    }

    const cleanIdentifier = String(identifier).trim();

    // Query user by email, phone, or schoolCode join
    let query = `
      SELECT u.id, u.schoolId, u.role, u.name, u.email, u.phone, u.passwordHash, u.status AS userStatus,
             s.name AS schoolName, s.slug AS schoolSlug, s.schoolCode, s.status AS schoolStatus, s.plan
      FROM school_users u
      JOIN schools s ON s.id = u.schoolId
      WHERE (u.email = ? OR u.phone = ?)
    `;
    const params: any[] = [cleanIdentifier, cleanIdentifier];

    if (schoolCode) {
      query += ' AND s.schoolCode = ?';
      params.push(String(schoolCode).trim());
    }

    query += ' LIMIT 1';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    if (rows.length === 0) {
      return apiError('Invalid login credentials or school not found.', 401);
    }

    const user = rows[0];

    if (user.schoolStatus === 'suspended') {
      return apiError('This school account has been suspended. Please contact platform support.', 403);
    }

    if (user.userStatus !== 'active') {
      return apiError('Your user account is inactive. Please contact school administration.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return apiError('Incorrect password. Please try again.', 401);
    }

    const tokenPayload: SchoolAuthPayload = {
      userId: user.id,
      schoolId: user.schoolId,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      schoolSlug: user.schoolSlug,
      schoolName: user.schoolName,
    };

    const token = generateSchoolToken(tokenPayload);

    const redirectUrl =
      user.role === 'parent' || user.role === 'student'
        ? '/school-management-software/portal'
        : '/school-admin';

    const response = apiSuccess({
      message: 'Login successful',
      user: tokenPayload,
      school: {
        id: user.schoolId,
        name: user.schoolName,
        slug: user.schoolSlug,
        code: user.schoolCode,
        plan: user.plan,
      },
      token,
      redirectUrl,
    });

    response.cookies.set(SCHOOL_AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 14,
    });

    return response;
  }

  // 3. LOGOUT
  if (action === 'logout') {
    const response = apiSuccess({ message: 'Logged out successfully' });
    response.cookies.set(SCHOOL_AUTH_COOKIE, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });
    return response;
  }

  return apiError('Invalid action', 400);
}

export async function GET(request: NextRequest) {
  await SchoolService.ensureTables();

  const user = await getSchoolAuthFromRequest(request);
  if (!user) {
    return apiError('Not authenticated', 401);
  }

  const [schools] = await pool.execute<RowDataPacket[]>(
    `SELECT id, slug, schoolCode, name, logoUrl, stampUrl, signatureUrl, affiliationBoard, regNumber, 
            address, city, state, pincode, phone, email, websiteUrl, principalName, estYear, 
            currentSession, schoolType, medium, plan, planExpiresAt, status, themePrimaryColor, 
            themeAccentColor, marksheetDesign, aboutSchool, principalMessage, facilitiesJson
     FROM schools WHERE id = ? LIMIT 1`,
    [user.schoolId]
  );

  if (schools.length === 0) {
    return apiError('School record not found', 404);
  }

  return apiSuccess({
    user,
    school: schools[0],
  });
}

