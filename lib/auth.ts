import jwt, { type SignOptions } from 'jsonwebtoken';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { AuthPayload, UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: AuthPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, JWT_SECRET, options);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    // Prefer jsonwebtoken (same lib that signs) for consistent claim parsing.
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & Partial<AuthPayload>;
      const userId = String(decoded.userId || decoded.sub || '');
      const email = String(decoded.email || '');
      const role = decoded.role as UserRole | undefined;
      if (!userId || !email || !role) return null;
      const companyId = decoded.companyId ? String(decoded.companyId) : undefined;
      return { userId, email, role, companyId };
    } catch {
      // Fallback for tokens verified via jose
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userId = String(payload.userId || payload.sub || '');
      const email = String(payload.email || '');
      const role = payload.role as UserRole | undefined;
      if (!userId || !email || !role) return null;
      const companyId = payload.companyId ? String(payload.companyId) : undefined;
      return { userId, email, role, companyId };
    }
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}
