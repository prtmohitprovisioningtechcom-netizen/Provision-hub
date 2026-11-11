import { NextRequest } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import crypto from 'crypto';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { SeoService } from '@/server/services/seo.service';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;

    await SeoService.ensureSeoTables();

    // Fetch the company profile
    const [companies] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, slug, category, theme, address, seo FROM companies WHERE id = ? OR ownerId = ? LIMIT 1',
      [auth.companyId || '', auth.userId],
    );

    if (companies.length === 0) {
      return apiError('Company profile not found', 404);
    }

    const company = companies[0];

    // Fetch Category SEO record
    let categorySeo = null;
    if (company.category) {
      const [catRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM seo_records WHERE type = "category" AND (LOWER(targetName) = LOWER(?) OR targetId = ?) LIMIT 1',
        [company.category, company.category],
      );
      if (catRows.length > 0) {
        categorySeo = {
          ...catRows[0],
          faqs: typeof catRows[0].faqs === 'string' ? JSON.parse(catRows[0].faqs) : catRows[0].faqs || [],
          secondaryKeywords: typeof catRows[0].secondaryKeywords === 'string' ? JSON.parse(catRows[0].secondaryKeywords) : catRows[0].secondaryKeywords || [],
        };
      }
    }

    // Fetch Theme SEO record
    let themeSeo = null;
    if (company.theme) {
      const [themeRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM seo_records WHERE type = "theme" AND targetId = ? LIMIT 1',
        [company.theme],
      );
      if (themeRows.length > 0) {
        themeSeo = {
          ...themeRows[0],
          faqs: typeof themeRows[0].faqs === 'string' ? JSON.parse(themeRows[0].faqs) : themeRows[0].faqs || [],
          secondaryKeywords: typeof themeRows[0].secondaryKeywords === 'string' ? JSON.parse(themeRows[0].secondaryKeywords) : themeRows[0].secondaryKeywords || [],
        };
      }
    }

    // Fetch Company's own custom SEO record (or pending submissions)
    const [companySeoRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM seo_records WHERE type = "custom" AND targetId = ? LIMIT 1',
      [company.id],
    );

    const customSeo = companySeoRows.length > 0 ? {
      ...companySeoRows[0],
      faqs: typeof companySeoRows[0].faqs === 'string' ? JSON.parse(companySeoRows[0].faqs) : companySeoRows[0].faqs || [],
      secondaryKeywords: typeof companySeoRows[0].secondaryKeywords === 'string' ? JSON.parse(companySeoRows[0].secondaryKeywords) : companySeoRows[0].secondaryKeywords || [],
      customSchema: typeof companySeoRows[0].customSchema === 'string' ? JSON.parse(companySeoRows[0].customSchema) : companySeoRows[0].customSchema || null,
    } : null;

    return apiSuccess({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        category: company.category,
        theme: company.theme,
        city: typeof company.address === 'string' ? (JSON.parse(company.address)?.city || '') : (company.address?.city || ''),
      },
      categorySeo,
      themeSeo,
      customSeo,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch company SEO';
    return apiError(message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;

    await SeoService.ensureSeoTables();

    const body = (await parseBody(request)) as any;
    const {
      companyId,
      metaTitle,
      metaDescription,
      focusKeyword,
      secondaryKeywords,
      h1,
      h2,
      h3,
      contentBody,
      faqs,
      customSchema,
    } = body;

    const [companies] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, slug, category, address FROM companies WHERE id = ? OR ownerId = ? LIMIT 1',
      [companyId || auth.companyId || '', auth.userId],
    );

    if (companies.length === 0) {
      return apiError('Company not found', 404);
    }

    const company = companies[0];
    const urlPath = `/${company.slug}`;

    const score = SeoService.calculateSeoScore({
      metaTitle,
      metaDescription,
      focusKeyword,
      h1,
      contentBody,
      faqs,
      customSchema,
    });

    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM seo_records WHERE type = "custom" AND targetId = ? LIMIT 1',
      [company.id],
    );

    if (existing.length > 0) {
      await pool.execute(
        `UPDATE seo_records 
         SET metaTitle = ?, metaDescription = ?, focusKeyword = ?, secondaryKeywords = ?,
             h1 = ?, h2 = ?, h3 = ?, contentBody = ?, faqs = ?, customSchema = ?,
             status = 'pending_approval', seoScore = ?, updatedAt = NOW()
         WHERE id = ?`,
        [
          metaTitle,
          metaDescription,
          focusKeyword || '',
          JSON.stringify(secondaryKeywords || []),
          h1 || company.name,
          h2 || '',
          h3 || '',
          contentBody || '',
          JSON.stringify(faqs || []),
          JSON.stringify(customSchema || {}),
          score,
          existing[0].id,
        ],
      );

      return apiSuccess({ id: existing[0].id, score, status: 'pending_approval' }, 'SEO updated and submitted for Super Admin review!');
    } else {
      const newId = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO seo_records 
          (id, type, targetId, targetName, slug, urlPath, metaTitle, metaDescription, focusKeyword,
           secondaryKeywords, canonicalUrl, h1, h2, h3, contentBody, faqs, schemaType, customSchema,
           status, seoScore, createdByRole, createdByUserId)
         VALUES (?, 'custom', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LocalBusiness', ?, 'pending_approval', ?, 'company_admin', ?)`,
        [
          newId,
          company.id,
          company.name,
          company.slug,
          urlPath,
          metaTitle,
          metaDescription,
          focusKeyword || '',
          JSON.stringify(secondaryKeywords || []),
          `https://bhartiyebazar.com${urlPath}`,
          h1 || company.name,
          h2 || '',
          h3 || '',
          contentBody || '',
          JSON.stringify(faqs || []),
          JSON.stringify(customSchema || {}),
          score,
          auth.userId,
        ],
      );

      return apiSuccess({ id: newId, score, status: 'pending_approval' }, 'SEO profile submitted for Super Admin approval!');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    return apiError(message, 500);
  }
}

