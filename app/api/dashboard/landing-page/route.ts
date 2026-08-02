import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { coerceCompanyId, requireAuth } from '@/server/middleware/auth';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';
import { LANDING_SECTIONS } from '@/constants';
import { buildDefaultSections } from '@/lib/theme-content';
import { normalizeLayoutId } from '@/lib/layout-id';
import { ensureLandingPageLayoutColumn } from '@/lib/ensure-layout-column';

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;

    const companyId = coerceCompanyId(auth.companyId);
    if (!companyId) {
      return NextResponse.json({ success: false, error: 'No company associated' }, { status: 400 });
    }

    await ensureLandingPageLayoutColumn();

    const [pages] = await pool.execute<RowDataPacket[]>(
      'SELECT id as _id, companyId, sections, pages, isPublished, templateId, layoutId FROM landing_pages WHERE companyId = ?',
      [companyId],
    );

    if (pages.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          sections: buildDefaultSections(LANDING_SECTIONS),
          pages: [],
          isPublished: false,
          templateId: null,
          layoutId: '1',
        },
      });
    }

    const row = pages[0];
    return NextResponse.json({
      success: true,
      data: {
        ...row,
        sections: parseJsonField(row.sections, []),
        pages: parseJsonField(row.pages, []),
        isPublished: Boolean(row.isPublished),
        layoutId: normalizeLayoutId(row.layoutId),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load landing page';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;

    const companyId = coerceCompanyId(auth.companyId);
    if (!companyId) {
      return NextResponse.json({ success: false, error: 'No company associated' }, { status: 400 });
    }

    await ensureLandingPageLayoutColumn();

    const body = await request.json();

    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id, templateId, layoutId FROM landing_pages WHERE companyId = ?',
      [companyId],
    );

    const sectionsStr = JSON.stringify(body.sections || []);
    const pagesStr = JSON.stringify(body.pages || []);
    const isPublished = body.isPublished === undefined ? 1 : body.isPublished ? 1 : 0;
    const templateId =
      typeof body.templateId === 'string' && body.templateId
        ? body.templateId
        : existing[0]?.templateId || null;
    const layoutId =
      body.layoutId !== undefined && body.layoutId !== null && body.layoutId !== ''
        ? normalizeLayoutId(body.layoutId)
        : normalizeLayoutId(existing[0]?.layoutId);

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE landing_pages SET sections = ?, pages = ?, isPublished = ?, templateId = COALESCE(?, templateId), layoutId = ?, updatedAt = NOW() WHERE companyId = ?',
        [sectionsStr, pagesStr, isPublished, templateId, layoutId, companyId],
      );
    } else {
      const id = crypto.randomUUID();
      await pool.execute(
        'INSERT INTO landing_pages (id, companyId, templateId, layoutId, sections, pages, isPublished) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, companyId, templateId, layoutId, sectionsStr, pagesStr, isPublished],
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...body,
        templateId,
        layoutId,
        isPublished: Boolean(isPublished),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save landing page';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
