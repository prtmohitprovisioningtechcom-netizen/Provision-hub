import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'business';

    let sql =
      'SELECT id as _id, name, slug, description, icon, isActive, type, createdAt, updatedAt FROM categories WHERE isActive = 1';
    const params: string[] = [];

    if (type === 'business') {
      sql += ' AND (type = ? OR type IS NULL)';
      params.push('business');
    } else {
      sql += ' AND type = ?';
      params.push(type);
    }

    sql += ' ORDER BY name ASC';

    const [categories] = await pool.execute<RowDataPacket[]>(sql, params);

    return NextResponse.json({
      success: true,
      data: categories.map((c) => ({ ...c, isActive: Boolean(c.isActive) })),
    });
  } catch (error: unknown) {
    const { dbErrorMessage } = await import('@/lib/db-errors');
    const message = dbErrorMessage(error, 'Failed to fetch categories');
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
