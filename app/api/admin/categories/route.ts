import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/server/middleware/auth';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;
    
    const [categories] = await pool.execute<RowDataPacket[]>(
      'SELECT id as _id, name, slug, description, icon, isActive, type, createdAt, updatedAt FROM categories WHERE type = "business" OR type IS NULL ORDER BY createdAt DESC'
    );

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
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 },
      );
    }

    const slug =
      typeof body.slug === 'string' && body.slug.trim()
        ? createSlug(body.slug)
        : createSlug(name);

    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id as _id, name, slug, description, icon, isActive, type, createdAt, updatedAt FROM categories WHERE (name = ? OR slug = ?) AND type = "business"',
      [name, slug]
    );

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        data: { ...existing[0], isActive: Boolean(existing[0].isActive) },
        alreadyExists: true,
        message: 'Category already exists',
      });
    }

    const id = crypto.randomUUID();
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const icon = typeof body.icon === 'string' ? body.icon.trim() : '';
    const isActive = body.isActive !== false ? 1 : 0;

    await pool.execute(
      'INSERT INTO categories (id, name, slug, description, icon, isActive, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, slug, description, icon, isActive, 'business']
    );

    const [created] = await pool.execute<RowDataPacket[]>('SELECT id as _id, name, slug, description, icon, isActive, type, createdAt, updatedAt FROM categories WHERE id = ?', [id]);
    return NextResponse.json({ success: true, data: { ...created[0], isActive: Boolean(created[0].isActive) } });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        {
          success: false,
          error: 'This name or slug is used by another category. Please choose a different value.',
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
