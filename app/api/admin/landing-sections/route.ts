import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/server/middleware/auth';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;
    
    const [categories] = await pool.execute<RowDataPacket[]>('SELECT id as _id, name, slug, description, icon, isActive, type, createdAt, updatedAt FROM categories WHERE type = "landing_section" ORDER BY createdAt DESC');
    return NextResponse.json({ success: true, data: categories.map(c => ({ ...c, isActive: Boolean(c.isActive) })) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;
    const body = await request.json();
    
    // Create a slug from the name if not provided
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const id = crypto.randomUUID();
    const isActive = body.isActive !== false ? 1 : 0;
    
    await pool.execute(
      'INSERT INTO categories (id, name, slug, description, icon, type, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, body.name, body.slug, body.description || '', body.icon || '', 'landing_section', isActive]
    );

    const [created] = await pool.execute<RowDataPacket[]>('SELECT id as _id, name, slug, description, icon, isActive, type, createdAt, updatedAt FROM categories WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true, data: { ...created[0], isActive: Boolean(created[0].isActive) } });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'Category with this name or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
