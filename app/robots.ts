import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = siteConfig.url || 'https://bhartiyebazar.com';
  let disallowPaths = ['/dashboard/', '/admin/', '/api/'];

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT robotsTxtContent FROM seo_global_settings LIMIT 1',
    );
    if (rows.length > 0 && rows[0].robotsTxtContent) {
      const content = rows[0].robotsTxtContent as string;
      const lines = content.split('\n');
      const customDisallow: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().startsWith('disallow:')) {
          const path = trimmed.substring(9).trim();
          if (path) customDisallow.push(path);
        }
      }
      if (customDisallow.length > 0) {
        disallowPaths = customDisallow;
      }
    }
  } catch (err) {
    console.error('Error fetching dynamic robots.txt rules:', err);
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: disallowPaths,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
