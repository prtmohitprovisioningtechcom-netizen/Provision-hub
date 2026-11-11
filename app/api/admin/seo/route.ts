import { NextRequest } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import crypto from 'crypto';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { SeoService, PLATFORM_THEMES, TOP_INDIAN_LOCATIONS } from '@/server/services/seo.service';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['super_admin', 'company_admin']);
    if (auth instanceof Response) return auth;

    await SeoService.ensureSeoTables();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';

    // 1. SEO DASHBOARD STATS
    if (action === 'dashboard') {
      const [[totalRecordsRes]] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM seo_records');
      const [[categoriesRes]] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM seo_records WHERE type = "category"');
      const [[themesRes]] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM seo_records WHERE type = "theme"');
      const [[locationsRes]] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM seo_records WHERE type = "location"');
      const [[publishedRes]] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM seo_records WHERE status = "published"');
      const [[pendingRes]] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM seo_records WHERE status = "pending_approval"');
      const [[keywordsRes]] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM seo_keywords');
      const [[avgScoreRes]] = await pool.execute<RowDataPacket[]>('SELECT AVG(seoScore) as avgScore FROM seo_records');

      // Recent 5 activities
      const [recentActivities] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM seo_activity_logs ORDER BY createdAt DESC LIMIT 8'
      );

      // Audit alerts: missing meta description or low SEO score
      const [auditIssues] = await pool.execute<RowDataPacket[]>(
        `SELECT id, targetName, type, slug, seoScore, metaTitle, metaDescription 
         FROM seo_records 
         WHERE seoScore < 70 OR LENGTH(metaDescription) < 50 OR LENGTH(metaTitle) < 20 
         ORDER BY seoScore ASC LIMIT 6`
      );

      return apiSuccess({
        stats: {
          total: totalRecordsRes.count || 0,
          categories: categoriesRes.count || 0,
          themes: themesRes.count || 0,
          locations: locationsRes.count || 0,
          keywords: keywordsRes.count || 0,
          published: publishedRes.count || 0,
          pending: pendingRes.count || 0,
          healthScore: Math.round(Number(avgScoreRes.avgScore || 85)),
        },
        recentActivities,
        auditIssues,
      });
    }

    // 2. SEO RECORDS LIST
    if (action === 'records') {
      const type = searchParams.get('type'); // category, theme, location, service, etc.
      const status = searchParams.get('status');
      const search = (searchParams.get('search') || '').trim().toLowerCase();
      const page = Math.max(1, Number(searchParams.get('page') || 1));
      const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 25)));
      const offset = (page - 1) * limit;

      let whereConditions = ['1=1'];
      let queryParams: any[] = [];

      if (type && type !== 'all') {
        whereConditions.push('type = ?');
        queryParams.push(type);
      }
      if (status && status !== 'all') {
        whereConditions.push('status = ?');
        queryParams.push(status);
      }
      if (search) {
        whereConditions.push('(LOWER(targetName) LIKE ? OR LOWER(slug) LIKE ? OR LOWER(focusKeyword) LIKE ?)');
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      const whereClause = whereConditions.join(' AND ');

      const [[countRes]] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM seo_records WHERE ${whereClause}`,
        queryParams,
      );

      const [records] = await pool.execute<RowDataPacket[]>(
        `SELECT id, type, targetId, targetName, slug, urlPath, metaTitle, metaDescription, focusKeyword, 
                secondaryKeywords, canonicalUrl, h1, h2, h3, contentBody, faqs, schemaType, customSchema, 
                indexDirective, inSitemap, sitemapPriority, status, seoScore, rejectionReason, createdAt, updatedAt
         FROM seo_records 
         WHERE ${whereClause} 
         ORDER BY updatedAt DESC 
         LIMIT ${limit} OFFSET ${offset}`,
        queryParams,
      );

      return apiSuccess({
        records: records.map((r) => ({
          ...r,
          secondaryKeywords: typeof r.secondaryKeywords === 'string' ? JSON.parse(r.secondaryKeywords) : r.secondaryKeywords || [],
          faqs: typeof r.faqs === 'string' ? JSON.parse(r.faqs) : r.faqs || [],
          customSchema: typeof r.customSchema === 'string' ? JSON.parse(r.customSchema) : r.customSchema || null,
          inSitemap: Boolean(r.inSitemap),
        })),
        pagination: {
          total: countRes.total,
          page,
          limit,
          totalPages: Math.ceil(countRes.total / limit),
        },
      });
    }

    // 3. GET SINGLE RECORD BY ID
    if (action === 'record_by_id') {
      const id = searchParams.get('id');
      if (!id) return apiError('Record id is required', 400);

      const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM seo_records WHERE id = ? LIMIT 1', [id]);
      if (rows.length === 0) return apiError('SEO record not found', 404);

      const r = rows[0];
      return apiSuccess({
        ...r,
        secondaryKeywords: typeof r.secondaryKeywords === 'string' ? JSON.parse(r.secondaryKeywords) : r.secondaryKeywords || [],
        faqs: typeof r.faqs === 'string' ? JSON.parse(r.faqs) : r.faqs || [],
        customSchema: typeof r.customSchema === 'string' ? JSON.parse(r.customSchema) : r.customSchema || null,
        imageAltTags: typeof r.imageAltTags === 'string' ? JSON.parse(r.imageAltTags) : r.imageAltTags || [],
        internalLinks: typeof r.internalLinks === 'string' ? JSON.parse(r.internalLinks) : r.internalLinks || [],
        inSitemap: Boolean(r.inSitemap),
      });
    }

    // 4. GLOBAL SEO SETTINGS
    if (action === 'global_settings') {
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM seo_global_settings LIMIT 1');
      if (rows.length === 0) return apiError('Settings not found', 404);
      const s = rows[0];
      return apiSuccess({
        ...s,
        organizationSchema: typeof s.organizationSchema === 'string' ? JSON.parse(s.organizationSchema) : s.organizationSchema || {},
      });
    }

    // 5. MASTER LOCATIONS LIST
    if (action === 'locations') {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM seo_locations WHERE isActive = 1 ORDER BY state ASC, city ASC'
      );
      return apiSuccess(rows);
    }

    // 6. MASTER KEYWORDS BANK & CANNIBALIZATION REPORT
    if (action === 'keywords') {
      const [keywords] = await pool.execute<RowDataPacket[]>('SELECT * FROM seo_keywords ORDER BY createdAt DESC');
      
      // Check cannibalization: find focus keywords shared by multiple published records
      const [cannibalizationRows] = await pool.execute<RowDataPacket[]>(
        `SELECT focusKeyword, COUNT(*) as count, GROUP_CONCAT(targetName SEPARATOR ', ') as pages 
         FROM seo_records 
         WHERE status = 'published' AND focusKeyword != '' 
         GROUP BY LOWER(focusKeyword) 
         HAVING count > 1`
      );

      return apiSuccess({
        keywords,
        cannibalization: cannibalizationRows,
      });
    }

    // 7. TEMPLATES
    if (action === 'templates') {
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM seo_templates ORDER BY isDefault DESC, name ASC');
      return apiSuccess(rows.map((t) => ({
        ...t,
        faqTemplate: typeof t.faqTemplate === 'string' ? JSON.parse(t.faqTemplate) : t.faqTemplate || [],
      })));
    }

    // 8. TECHNICAL REDIRECTS
    if (action === 'redirects') {
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM seo_redirects ORDER BY createdAt DESC');
      return apiSuccess(rows);
    }

    return apiError('Invalid action', 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SEO request failed';
    return apiError(message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['super_admin', 'company_admin']);
    if (auth instanceof Response) return auth;

    await SeoService.ensureSeoTables();

    const body = (await parseBody(request)) as any;
    const action = body?.action;
    const isSuperAdmin = auth.role === 'super_admin';

    // 1. AI SEO GENERATOR
    if (action === 'ai_generate') {
      const { type, name, focusKeyword, location, targetAudience } = body;
      if (!name) return apiError('Target name is required for AI generation', 400);

      const generated = SeoService.generateAiSeoContent({
        type: type || 'category',
        name,
        focusKeyword,
        location,
        targetAudience,
      });

      return apiSuccess(generated, 'AI SEO Content generated successfully!');
    }

    // 2. SAVE OR UPDATE SEO RECORD
    if (action === 'save_record') {
      const {
        id,
        type,
        targetId,
        targetName,
        slug,
        metaTitle,
        metaDescription,
        focusKeyword,
        secondaryKeywords,
        canonicalUrl,
        h1,
        h2,
        h3,
        contentBody,
        faqs,
        schemaType,
        customSchema,
        imageAltTags,
        internalLinks,
        indexDirective,
        inSitemap,
        sitemapPriority,
        sitemapChangeFreq,
        status,
      } = body;

      if (!targetName || !slug || !metaTitle || !metaDescription) {
        return apiError('Please fill Target Name, Slug, Meta Title & Meta Description', 400);
      }

      const cleanSlug = String(slug).toLowerCase().replace(/[^a-z0-9\-_/]+/g, '-').replace(/(^-|-$)/g, '');
      const urlPath = cleanSlug.startsWith('/') ? cleanSlug : `/${cleanSlug}`;

      // Calculate automated SEO Health Score
      const calculatedScore = SeoService.calculateSeoScore({
        metaTitle,
        metaDescription,
        focusKeyword,
        h1,
        contentBody,
        faqs,
        customSchema,
        canonicalUrl,
      });

      // Role permission: Company admin submissions become 'pending_approval' unless super admin
      let finalStatus = status || 'published';
      if (!isSuperAdmin) {
        finalStatus = 'pending_approval';
      }

      if (id) {
        // UPDATE existing record
        await pool.execute(
          `UPDATE seo_records 
           SET targetName = ?, slug = ?, urlPath = ?, metaTitle = ?, metaDescription = ?, focusKeyword = ?,
               secondaryKeywords = ?, canonicalUrl = ?, h1 = ?, h2 = ?, h3 = ?, contentBody = ?,
               faqs = ?, schemaType = ?, customSchema = ?, imageAltTags = ?, internalLinks = ?,
               indexDirective = ?, inSitemap = ?, sitemapPriority = ?, sitemapChangeFreq = ?,
               status = ?, seoScore = ?, updatedAt = NOW()
           WHERE id = ?`,
          [
            targetName,
            cleanSlug,
            urlPath,
            metaTitle,
            metaDescription,
            focusKeyword || '',
            JSON.stringify(secondaryKeywords || []),
            canonicalUrl || `https://bhartiyebazar.com${urlPath}`,
            h1 || targetName,
            h2 || '',
            h3 || '',
            contentBody || '',
            JSON.stringify(faqs || []),
            schemaType || 'WebPage',
            JSON.stringify(customSchema || {}),
            JSON.stringify(imageAltTags || []),
            JSON.stringify(internalLinks || []),
            indexDirective || 'index, follow',
            inSitemap !== false ? 1 : 0,
            Number(sitemapPriority || 0.8),
            sitemapChangeFreq || 'weekly',
            finalStatus,
            calculatedScore,
            id,
          ],
        );

        // Log activity
        await pool.execute(
          'INSERT INTO seo_activity_logs (id, seoRecordId, action, performedByRole, performedByUserId, details) VALUES (?, ?, ?, ?, ?, ?)',
          [crypto.randomUUID(), id, 'updated', auth.role, auth.userId, JSON.stringify({ targetName, score: calculatedScore, status: finalStatus })],
        );

        return apiSuccess({ id, score: calculatedScore, status: finalStatus }, 'SEO Record updated successfully!');
      } else {
        // CREATE new record
        const newId = crypto.randomUUID();
        await pool.execute(
          `INSERT INTO seo_records 
            (id, type, targetId, targetName, slug, urlPath, metaTitle, metaDescription, focusKeyword,
             secondaryKeywords, canonicalUrl, h1, h2, h3, contentBody, faqs, schemaType, customSchema,
             imageAltTags, internalLinks, indexDirective, inSitemap, sitemapPriority, sitemapChangeFreq,
             status, seoScore, createdByRole, createdByUserId)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newId,
            type || 'custom',
            targetId || newId,
            targetName,
            cleanSlug,
            urlPath,
            metaTitle,
            metaDescription,
            focusKeyword || '',
            JSON.stringify(secondaryKeywords || []),
            canonicalUrl || `https://bhartiyebazar.com${urlPath}`,
            h1 || targetName,
            h2 || '',
            h3 || '',
            contentBody || '',
            JSON.stringify(faqs || []),
            schemaType || 'WebPage',
            JSON.stringify(customSchema || {}),
            JSON.stringify(imageAltTags || []),
            JSON.stringify(internalLinks || []),
            indexDirective || 'index, follow',
            inSitemap !== false ? 1 : 0,
            Number(sitemapPriority || 0.8),
            sitemapChangeFreq || 'weekly',
            finalStatus,
            calculatedScore,
            auth.role,
            auth.userId,
          ],
        );

        // Log activity
        await pool.execute(
          'INSERT INTO seo_activity_logs (id, seoRecordId, action, performedByRole, performedByUserId, details) VALUES (?, ?, ?, ?, ?, ?)',
          [crypto.randomUUID(), newId, 'created', auth.role, auth.userId, JSON.stringify({ targetName, score: calculatedScore, status: finalStatus })],
        );

        return apiSuccess({ id: newId, score: calculatedScore, status: finalStatus }, 'SEO Record created successfully!');
      }
    }

    // 3. BULK GENERATE LOCATION PAGES
    if (action === 'bulk_generate_locations') {
      if (!isSuperAdmin) return apiError('Only Super Admin can execute bulk location generation', 403);
      const { categoryId, categoryName, citySlugs } = body;
      if (!categoryName || !Array.isArray(citySlugs) || citySlugs.length === 0) {
        return apiError('Category Name and at least one City slug required', 400);
      }

      let generatedCount = 0;
      for (const citySlug of citySlugs) {
        const [locRows] = await pool.execute<RowDataPacket[]>('SELECT city, state FROM seo_locations WHERE slug = ? LIMIT 1', [citySlug]);
        const city = locRows[0]?.city || citySlug;
        const state = locRows[0]?.state || 'India';

        const recordSlug = `explore/${citySlug}/${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const urlPath = `/${recordSlug}`;

        const [existing] = await pool.execute<RowDataPacket[]>('SELECT id FROM seo_records WHERE slug = ? LIMIT 1', [recordSlug]);
        if (existing.length === 0) {
          const aiData = SeoService.generateAiSeoContent({
            type: 'location',
            name: `${categoryName}`,
            location: `${city}, ${state}`,
            focusKeyword: `${categoryName.toLowerCase()} in ${city.toLowerCase()}`,
          });

          await pool.execute(
            `INSERT INTO seo_records 
              (id, type, targetId, targetName, slug, urlPath, metaTitle, metaDescription, focusKeyword,
               secondaryKeywords, canonicalUrl, h1, h2, h3, contentBody, faqs, schemaType, customSchema,
               inSitemap, sitemapPriority, status, seoScore, createdByRole, createdByUserId)
             VALUES (?, 'location', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LocalBusiness', ?, 1, 0.75, 'published', 95, 'super_admin', ?)`,
            [
              crypto.randomUUID(),
              `${categoryId || 'cat'}-${citySlug}`,
              `${categoryName} in ${city}`,
              recordSlug,
              urlPath,
              aiData.metaTitle,
              aiData.metaDescription,
              aiData.focusKeyword,
              JSON.stringify(aiData.secondaryKeywords),
              `https://bhartiyebazar.com${urlPath}`,
              aiData.h1,
              aiData.h2,
              aiData.h3,
              aiData.contentBody,
              JSON.stringify(aiData.faqs),
              JSON.stringify(aiData.schema),
              auth.userId,
            ],
          );
          generatedCount++;
        }
      }

      return apiSuccess({ generatedCount }, `Successfully generated ${generatedCount} location SEO pages!`);
    }

    // 4. APPROVE RECORD
    if (action === 'approve_record') {
      if (!isSuperAdmin) return apiError('Only Super Admin can approve SEO records', 403);
      const { id } = body;
      await pool.execute('UPDATE seo_records SET status = "published", approvedByUserId = ?, publishedAt = NOW() WHERE id = ?', [auth.userId, id]);
      
      await pool.execute(
        'INSERT INTO seo_activity_logs (id, seoRecordId, action, performedByRole, performedByUserId, details) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), id, 'approved', auth.role, auth.userId, JSON.stringify({ status: 'published' })],
      );

      return apiSuccess({ id, status: 'published' }, 'SEO Record approved & published successfully!');
    }

    // 5. REJECT RECORD
    if (action === 'reject_record') {
      if (!isSuperAdmin) return apiError('Only Super Admin can reject SEO records', 403);
      const { id, reason } = body;
      await pool.execute('UPDATE seo_records SET status = "rejected", rejectionReason = ? WHERE id = ?', [reason || 'Requires revision', id]);

      await pool.execute(
        'INSERT INTO seo_activity_logs (id, seoRecordId, action, performedByRole, performedByUserId, details) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), id, 'rejected', auth.role, auth.userId, JSON.stringify({ reason })],
      );

      return apiSuccess({ id, status: 'rejected' }, 'SEO Record marked as rejected with feedback.');
    }

    // 6. DELETE RECORD
    if (action === 'delete_record') {
      if (!isSuperAdmin) return apiError('Only Super Admin can delete SEO records', 403);
      const { id } = body;
      await pool.execute('DELETE FROM seo_records WHERE id = ?', [id]);
      return apiSuccess({ id }, 'SEO Record deleted.');
    }

    // 7. UPDATE GLOBAL SETTINGS
    if (action === 'update_global_settings') {
      if (!isSuperAdmin) return apiError('Only Super Admin can update Global SEO settings', 403);
      const {
        siteName,
        defaultTitle,
        defaultDescription,
        defaultKeywords,
        canonicalBaseUrl,
        twitterHandle,
        googleSiteVerification,
        bingSiteVerification,
        googleAnalyticsId,
        robotsTxtContent,
        defaultIndexation,
        organizationSchema,
      } = body;

      await pool.execute(
        `UPDATE seo_global_settings 
         SET siteName = ?, defaultTitle = ?, defaultDescription = ?, defaultKeywords = ?,
             canonicalBaseUrl = ?, twitterHandle = ?, googleSiteVerification = ?,
             bingSiteVerification = ?, googleAnalyticsId = ?, robotsTxtContent = ?,
             defaultIndexation = ?, organizationSchema = ?`,
        [
          siteName || 'Bhartiyebazar',
          defaultTitle || '',
          defaultDescription || '',
          defaultKeywords || '',
          canonicalBaseUrl || 'https://bhartiyebazar.com',
          twitterHandle || '',
          googleSiteVerification || '',
          bingSiteVerification || '',
          googleAnalyticsId || '',
          robotsTxtContent || '',
          defaultIndexation || 'index, follow',
          JSON.stringify(organizationSchema || {}),
        ],
      );

      return apiSuccess({}, 'Global SEO settings saved successfully!');
    }

    // 8. KEYWORD ACTIONS
    if (action === 'save_keyword') {
      const { keyword, keywordType, intent, mappedType, mappedTargetId, searchVolume, difficulty } = body;
      if (!keyword) return apiError('Keyword text required', 400);

      await pool.execute(
        `INSERT INTO seo_keywords (id, keyword, keywordType, intent, mappedType, mappedTargetId, searchVolume, difficulty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE keywordType = VALUES(keywordType), intent = VALUES(intent), mappedType = VALUES(mappedType), mappedTargetId = VALUES(mappedTargetId)`,
        [
          crypto.randomUUID(),
          keyword.trim().toLowerCase(),
          keywordType || 'primary',
          intent || 'commercial',
          mappedType || 'none',
          mappedTargetId || '',
          Number(searchVolume || 1000),
          difficulty || 'medium',
        ],
      );

      return apiSuccess({}, 'Keyword saved.');
    }

    if (action === 'delete_keyword') {
      const { id } = body;
      await pool.execute('DELETE FROM seo_keywords WHERE id = ?', [id]);
      return apiSuccess({ id }, 'Keyword deleted.');
    }

    // 9. REDIRECT ACTIONS
    if (action === 'save_redirect') {
      if (!isSuperAdmin) return apiError('Unauthorized', 403);
      const { sourcePath, targetPath, statusCode } = body;
      if (!sourcePath || !targetPath) return apiError('Source and Target path required', 400);

      await pool.execute(
        `INSERT INTO seo_redirects (id, sourcePath, targetPath, statusCode) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE targetPath = VALUES(targetPath), statusCode = VALUES(statusCode)`,
        [crypto.randomUUID(), sourcePath.trim(), targetPath.trim(), Number(statusCode || 301)],
      );

      return apiSuccess({}, 'Redirect saved.');
    }

    if (action === 'delete_redirect') {
      if (!isSuperAdmin) return apiError('Unauthorized', 403);
      const { id } = body;
      await pool.execute('DELETE FROM seo_redirects WHERE id = ?', [id]);
      return apiSuccess({ id }, 'Redirect deleted.');
    }

    return apiError('Invalid action', 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SEO action failed';
    return apiError(message, 500);
  }
}

