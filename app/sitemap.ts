import { MetadataRoute } from 'next';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { siteConfig } from '@/config/site';
import { PLATFORM_THEMES } from '@/server/services/seo.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Always fetch fresh records from database on every request

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url || 'https://bhartiyebazar.com';
  const urlMap = new Map<string, MetadataRoute.Sitemap[number]>();

  const addUrl = (
    path: string,
    priority: number = 0.8,
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly',
    lastModified: Date = new Date(),
  ) => {
    const cleanPath = path.startsWith('http')
      ? path
      : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    if (!urlMap.has(cleanPath)) {
      urlMap.set(cleanPath, {
        url: cleanPath,
        lastModified,
        changeFrequency,
        priority,
      });
    }
  };

  // 1. Core static platform pages
  addUrl('/', 1.0, 'daily');
  addUrl('/search', 0.9, 'daily');
  addUrl('/post-requirement', 0.85, 'weekly');
  addUrl('/vyapari-software', 0.85, 'weekly');
  addUrl('/sitemap', 0.6, 'weekly');

  try {
    // 2. Fetch all published, indexable SEO records (Categories, Themes, Locations, Services, Custom Pages)
    const [seoRows] = await pool.execute<RowDataPacket[]>(
      `SELECT urlPath, sitemapPriority, sitemapChangeFreq, updatedAt 
       FROM seo_records 
       WHERE status = 'published' AND inSitemap = 1 AND (indexDirective IS NULL OR indexDirective LIKE '%index%') 
       ORDER BY updatedAt DESC LIMIT 5000`,
    );

    for (const r of seoRows) {
      if (r.urlPath) {
        addUrl(
          r.urlPath,
          Number(r.sitemapPriority || 0.8),
          (r.sitemapChangeFreq || 'weekly') as any,
          r.updatedAt ? new Date(r.updatedAt) : new Date(),
        );
      }
    }

    // 3. Fallback: Automatically include all active business categories from database
    const [catRows] = await pool.execute<RowDataPacket[]>(
      `SELECT slug, updatedAt FROM categories WHERE isActive = 1 OR isActive IS NULL`,
    );
    for (const cat of catRows) {
      if (cat.slug) {
        addUrl(`/category/${cat.slug}`, 0.85, 'weekly', cat.updatedAt ? new Date(cat.updatedAt) : new Date());
      }
    }

    // 4. Guarantee all platform themes have showcase URLs in sitemap
    for (const theme of PLATFORM_THEMES) {
      addUrl(`/themes/${theme.slug}`, 0.85, 'weekly');
    }

    // 5. Fetch all approved public company / merchant storefront URLs
    const [companyRows] = await pool.execute<RowDataPacket[]>(
      `SELECT slug, updatedAt FROM companies WHERE status = 'approved' ORDER BY updatedAt DESC LIMIT 5000`,
    );

    for (const c of companyRows) {
      if (c.slug) {
        addUrl(`/${c.slug}`, 0.75, 'weekly', c.updatedAt ? new Date(c.updatedAt) : new Date());
      }
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
  }

  return Array.from(urlMap.values());
}
