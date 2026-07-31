import { NextResponse } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const hashedPassword = await hashPassword('admin123');
    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO users (id, name, email, password, role, isEmailVerified) VALUES (?, ?, ?, ?, ?, ?)',
      [id, 'Admin', 'admin@example.com', hashedPassword, 'super_admin', true]
    );
    return NextResponse.json({ success: true, message: 'Admin created! Email: admin@example.com, Password: admin123' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: String(e) + (e.stack ? '\\n' + e.stack : '') });
  }
}
