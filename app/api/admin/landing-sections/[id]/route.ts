import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/server/middleware/auth';
import { RowDataPacket } from 'mysql2';

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    const body = await request.json();
    const update = {
      name: typeof body.name === 'string' ? body.name.trim() : undefined,
      slug:
        typeof body.slug === 'string' && body.slug.trim()
          ? createSlug(body.slug)
          : typeof body.name === 'string'
            ? createSlug(body.name)
            : undefined,
      description:
        typeof body.description === 'string' ? body.description.trim() : undefined,
      icon: typeof body.icon === 'string' ? body.icon.trim() : undefined,
      isActive: body.isActive !== undefined ? (body.isActive !== false ? 1 : 0) : undefined,
    };

    const keys = Object.keys(update).filter(k => (update as any)[k] !== undefined);
    if (keys.length > 0) {
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const sqlParams: any[] = keys.map(k => (update as any)[k]);
      sqlParams.push(id);
      
      const [result] = await pool.execute<any>(`UPDATE categories SET ${setClause} WHERE id = ? AND type = 'landing_section'`, sqlParams);
      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, error: 'Landing section not found' },
          { status: 404 },
        );
      }
    }

    const [categories] = await pool.execute<RowDataPacket[]>('SELECT id as _id, name, slug, description, icon, isActive, type, createdAt, updatedAt FROM categories WHERE id = ?', [id]);
    return NextResponse.json({ success: true, data: { ...categories[0], isActive: Boolean(categories[0].isActive) } });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'Landing section name or slug already exists' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update landing section' },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    
    const [result] = await pool.execute<any>('DELETE FROM categories WHERE id = ? AND type = "landing_section"', [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Landing section not found' },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: {} });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete landing section' },
      { status: 400 },
    );
  }
}
