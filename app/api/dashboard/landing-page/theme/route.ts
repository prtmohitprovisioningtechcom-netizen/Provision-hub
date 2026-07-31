import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/server/middleware/auth';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';
import { LANDING_SECTIONS } from '@/constants';
import { buildDefaultSections } from '@/lib/theme-content';
import { normalizeLayoutId } from '@/lib/layout-id';
import { ensureLandingPageLayoutColumn } from '@/lib/ensure-layout-column';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;

    let { companyId } = auth;
    if (typeof companyId === 'object' && companyId !== null) {
      companyId = (companyId as { _id?: string; id?: string })._id
        || (companyId as { id?: string }).id
        || String(companyId);
    }

    if (!companyId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await ensureLandingPageLayoutColumn();

    const body = await request.json();
    const { templateId } = body;
    const layoutId = normalizeLayoutId(body.layoutId);

    if (!templateId || typeof templateId !== 'string') {
      return NextResponse.json({ success: false, error: 'templateId is required' }, { status: 400 });
    }

    const [companies] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM companies WHERE id = ?',
      [companyId],
    );
    if (companies.length === 0) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    const defaultSections = JSON.stringify(buildDefaultSections(LANDING_SECTIONS));

    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id, sections FROM landing_pages WHERE companyId = ?',
      [companyId],
    );

    if (existing.length > 0) {
      let sections = existing[0].sections;
      if (typeof sections === 'string') {
        try {
          sections = JSON.parse(sections);
        } catch {
          sections = [];
        }
      }
      const hasSections = Array.isArray(sections) && sections.length > 0;

      if (hasSections) {
        await pool.execute(
          'UPDATE landing_pages SET templateId = ?, layoutId = ?, updatedAt = NOW() WHERE companyId = ?',
          [templateId, layoutId, companyId],
        );
      } else {
        await pool.execute(
          'UPDATE landing_pages SET templateId = ?, layoutId = ?, sections = ?, isPublished = 1, updatedAt = NOW() WHERE companyId = ?',
          [templateId, layoutId, defaultSections, companyId],
        );
      }
    } else {
      const id = crypto.randomUUID();
      await pool.execute(
        'INSERT INTO landing_pages (id, companyId, templateId, layoutId, sections, pages, isPublished) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, companyId, templateId, layoutId, defaultSections, '[]', 1],
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Theme updated successfully',
      data: { templateId, layoutId },
    });
  } catch (error: unknown) {
    console.error('Error updating theme:', error);
    const message = error instanceof Error ? error.message : 'Failed to update theme';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
