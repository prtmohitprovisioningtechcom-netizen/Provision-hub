import { Metadata } from 'next';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { SitemapClient } from '@/components/sitemap/SitemapClient';
import { getPlatformSettings } from '@/lib/platform-settings';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // Cache for 30 minutes

export const metadata: Metadata = {
  title: 'Visual HTML Sitemap | Bhartiyebazar',
  description:
    'Complete HTML visual sitemap directory for Bhartiyebazar (bhartiyebazar.com). Explore all core platform pages, 13 core business services, 18 website themes, verified categories, top cities, and live merchant storefronts.',
  alternates: {
    canonical: 'https://bhartiyebazar.com/sitemap',
  },
  openGraph: {
    title: 'Visual HTML Sitemap | Bhartiyebazar',
    description:
      'Explore all core pages, 13 business services, 18 website themes, verified categories, top cities, and merchant storefronts on Bhartiyebazar.',
    url: 'https://bhartiyebazar.com/sitemap',
    type: 'website',
    siteName: 'Bhartiyebazar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visual HTML Sitemap | Bhartiyebazar',
    description:
      'Direct index of all pages, services, themes, cities, and stores on Bhartiyebazar.',
  },
};

export default async function GlobalSitemapPage() {
  const settings = await getPlatformSettings();

  // Fetch active business categories safely
  let categoryRows: { name: string; slug: string }[] = [];
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT name, slug FROM categories WHERE isActive = 1 AND (type = "business" OR type IS NULL) ORDER BY name ASC LIMIT 100'
    );
    categoryRows = rows as { name: string; slug: string }[];
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error);
  }

  // Fetch approved companies/storefronts safely
  let companyRows: { name: string; slug: string; category?: string }[] = [];
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT name, slug, category FROM companies WHERE status = "approved" ORDER BY isVerified DESC, createdAt DESC LIMIT 40'
    );
    companyRows = rows as { name: string; slug: string; category?: string }[];
  } catch (error) {
    console.error('Failed to fetch companies for sitemap:', error);
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://bhartiyebazar.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Sitemap',
        item: 'https://bhartiyebazar.com/sitemap',
      },
    ],
  };

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Visual HTML Sitemap - Bhartiyebazar',
    description:
      'Complete visual index of all services, themes, categories, and business pages on Bhartiyebazar.',
    url: 'https://bhartiyebazar.com/sitemap',
    publisher: {
      '@type': 'Organization',
      name: 'Bhartiyebazar',
      url: 'https://bhartiyebazar.com',
      legalName: 'Bhartiyebazar (Powered by Provisioning Tech)',
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar config={settings.themeConfig} featureToggles={settings.featureToggles} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <main className="flex-1">
        <SitemapClient categories={categoryRows} companies={companyRows} />
      </main>

      <Footer config={settings} />
    </div>
  );
}
