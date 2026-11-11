import { NextRequest, NextResponse } from 'next/server';
import { SeoService } from '@/server/services/seo.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = (searchParams.get('section') || 'index') as any;
    const baseUrl = 'https://bhartiyebazar.com';

    if (section === 'index') {
      const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/api/sitemap?section=categories</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap?section=themes</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap?section=locations</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap?section=companies</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap?section=pages</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

      return new NextResponse(sitemapIndexXml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      });
    }

    const items = await SeoService.getSitemapData(section);
    const urlTags = items
      .map(
        (it) => `  <url>
    <loc>${it.url}</loc>
    <lastmod>${it.lastModified}</lastmod>
    <changefreq>${it.changeFreq || 'weekly'}</changefreq>
    <priority>${Number(it.priority || 0.8).toFixed(2)}</priority>
  </url>`,
      )
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlTags}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

