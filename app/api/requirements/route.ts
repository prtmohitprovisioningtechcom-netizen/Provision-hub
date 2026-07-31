import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.customerName || !body.email || !body.phone || !body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO requirements (id, customerName, email, phone, title, description, budget, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, body.customerName, body.email, body.phone, body.title, body.description, body.budget || null, body.status || 'new']
    );

    const [rows] = await pool.execute<any[]>('SELECT * FROM requirements WHERE id = ?', [id]);
    return NextResponse.json({ success: true, data: { ...rows[0], _id: rows[0].id } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
