import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/server/middleware/auth';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;
    
    if (!auth.companyId) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT name, logo, phone, email, address, description, rating, reviewCount, theme, socialLinks FROM companies WHERE id = ?',
      [auth.companyId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    const company = rows[0];
    
    // Parse JSON fields
    company.theme = typeof company.theme === 'string' ? JSON.parse(company.theme) : (company.theme || {});
    company.socialLinks = typeof company.socialLinks === 'string' ? JSON.parse(company.socialLinks) : (company.socialLinks || {});
    company.address = typeof company.address === 'string' ? JSON.parse(company.address) : (company.address || {});
    company.rating = Number(company.rating) || 0;
    company.reviewCount = Number(company.reviewCount) || 0;

    return NextResponse.json({ success: true, data: company });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    if (!auth.companyId) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    const body = await request.json();
    
    // Get current company data to merge JSON fields
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT theme, socialLinks FROM companies WHERE id = ?',
      [auth.companyId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    let theme = typeof rows[0].theme === 'string' ? JSON.parse(rows[0].theme) : (rows[0].theme || {});
    let socialLinks = typeof rows[0].socialLinks === 'string' ? JSON.parse(rows[0].socialLinks) : (rows[0].socialLinks || {});

    const updates: string[] = [];
    const values: any[] = [];

    if (body.logo !== undefined) {
      updates.push('logo = ?');
      values.push(body.logo);
    }
    
    if (body.primaryColor !== undefined) {
      theme = { ...theme, primaryColor: body.primaryColor };
      updates.push('theme = ?');
      values.push(JSON.stringify(theme));
    }

    if (body.socialLinks !== undefined) {
      socialLinks = { ...socialLinks, ...body.socialLinks };
      updates.push('socialLinks = ?');
      values.push(JSON.stringify(socialLinks));
    }

    if (updates.length > 0) {
      values.push(auth.companyId);
      await pool.execute(
        `UPDATE companies SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    const [updatedRows] = await pool.execute<RowDataPacket[]>(
      'SELECT name, logo, phone, email, address, description, rating, reviewCount, theme, socialLinks FROM companies WHERE id = ?',
      [auth.companyId]
    );
    
    const updatedCompany = updatedRows[0];
    updatedCompany.theme = typeof updatedCompany.theme === 'string' ? JSON.parse(updatedCompany.theme) : (updatedCompany.theme || {});
    updatedCompany.socialLinks = typeof updatedCompany.socialLinks === 'string' ? JSON.parse(updatedCompany.socialLinks) : (updatedCompany.socialLinks || {});
    updatedCompany.address = typeof updatedCompany.address === 'string' ? JSON.parse(updatedCompany.address) : (updatedCompany.address || {});
    updatedCompany.rating = Number(updatedCompany.rating) || 0;
    updatedCompany.reviewCount = Number(updatedCompany.reviewCount) || 0;

    return NextResponse.json({ success: true, data: updatedCompany });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
