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

    const keys = Object.keys(body).filter(k => ['status'].includes(k));
    if (keys.length > 0) {
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const sqlParams: any[] = keys.map(k => body[k]);
      sqlParams.push(id);
      
      const [result] = await pool.execute<any>(`UPDATE requirements SET ${setClause} WHERE id = ?`, sqlParams);
      if (result.affectedRows === 0) {
        return NextResponse.json({ success: false, error: 'Requirement not found' }, { status: 404 });
      }
    }
    
    const [requirements] = await pool.execute<RowDataPacket[]>('SELECT id as _id, customerName, email, phone, title, description, budget, status, createdAt, updatedAt FROM requirements WHERE id = ?', [id]);

    return NextResponse.json({ success: true, data: requirements[0] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
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
    
    const [result] = await pool.execute<any>('DELETE FROM requirements WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Requirement not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
