import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/server/middleware/auth';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;
    
    const [requirements] = await pool.execute<RowDataPacket[]>('SELECT id as _id, customerName, email, phone, title, description, budget, status, createdAt, updatedAt FROM requirements ORDER BY createdAt DESC');
    
    return NextResponse.json({ success: true, data: requirements });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
