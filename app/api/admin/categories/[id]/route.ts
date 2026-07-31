import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/server/middleware/auth';
import { RowDataPacket } from 'mysql2';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;
        
    const { id } = await context.params;
    const body = await request.json();

    if (body.name && !body.slug) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (Object.keys(body).length > 0) {
      const keys = Object.keys(body);
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const params = keys.map(k => {
        if (k === 'isActive') return body[k] ? 1 : 0;
        return body[k];
      });
      params.push(id);
      await pool.execute(`UPDATE categories SET ${setClause} WHERE id = ?`, params);
    }

    const [categories] = await pool.execute<RowDataPacket[]>('SELECT id as _id, name, slug, description, icon, isActive, type, createdAt, updatedAt FROM categories WHERE id = ?', [id]);
    
    if (categories.length === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { ...categories[0], isActive: Boolean(categories[0].isActive) } });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'Category with this name or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;
        
    const { id } = await context.params;
    
    const [result] = await pool.execute<any>('DELETE FROM categories WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
