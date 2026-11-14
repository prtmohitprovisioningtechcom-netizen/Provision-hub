import jwt, { type SignOptions } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'school-erp-secret-key-bhartiyebazar-2026';
export const SCHOOL_AUTH_COOKIE = 'school-erp-token';

export interface SchoolAuthPayload {
  userId: string;
  schoolId: string;
  role: 'school_admin' | 'principal' | 'teacher' | 'accountant' | 'student' | 'parent';
  name: string;
  email?: string;
  phone?: string;
  schoolSlug: string;
  schoolName: string;
}

export function generateSchoolToken(payload: SchoolAuthPayload): string {
  const options: SignOptions = { expiresIn: '14d' };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifySchoolToken(token: string): SchoolAuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SchoolAuthPayload;
    if (!decoded.userId || !decoded.schoolId) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function getSchoolAuthFromRequest(request: NextRequest): Promise<SchoolAuthPayload | null> {
  const authHeader = request.headers.get('authorization');
  let token: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    token = request.cookies.get(SCHOOL_AUTH_COOKIE)?.value || null;
  }

  if (!token) return null;
  const verified = verifySchoolToken(token);
  if (!verified) return null;

  // Validate active school
  try {
    const [schools] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, slug, status FROM schools WHERE id = ? LIMIT 1',
      [verified.schoolId]
    );
    if (schools.length === 0 || schools[0].status === 'suspended') {
      return null;
    }
  } catch (e) {
    console.error('Error validating school auth:', e);
  }

  return verified;
}

export async function getSchoolAuthFromCookies(): Promise<SchoolAuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SCHOOL_AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifySchoolToken(token);
}

