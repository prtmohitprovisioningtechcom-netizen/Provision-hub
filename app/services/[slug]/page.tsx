import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ServiceDetailThemes } from '@/components/services/ServiceDetailThemes';
import { getPlatformSettings } from '@/lib/platform-settings';
import {
  CORE_SERVICES,
  getServiceBySlug,
  getThemesForService,
} from '@/config/service-themes';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(decodeURIComponent(slug));

  if (!service) {
    return {
      title: 'Service Not Found | Bhartiyebazar',
    };
  }

  const isOther = service.slug === 'other';
  const title = isOther
    ? 'Other Services & Specialty Website Themes | Bhartiyebazar'
    : `${service.name} Website Themes & Templates | Bhartiyebazar`;
  const description = service.description;
  const url = `https://bhartiyebazar.com/services/${service.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Bhartiyebazar',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(decodeURIComponent(slug));

  if (!service) {
    notFound();
  }

  const settings = await getPlatformSettings();
  const matchedThemes = getThemesForService(service.slug);

  let companies: any[] = [];
  try {
    let rows: RowDataPacket[] = [];
    if (service.slug === 'other') {
      const coreNames = CORE_SERVICES.map((s) => s.name.toLowerCase());
      const placeholders = coreNames.map(() => '?').join(', ');
      const [result] = await pool.execute<RowDataPacket[]>(
        `SELECT c.*, l.sections as landingPageSections
         FROM companies c
         LEFT JOIN landing_pages l ON c.id = l.companyId
         WHERE c.status = 'approved'
           AND (c.category IS NULL OR LOWER(c.category) NOT IN (${placeholders}))
         ORDER BY c.isVerified DESC, c.createdAt DESC
         LIMIT 6`,
        coreNames,
      );
      rows = result;
    } else {
      const likeTerm = `%${service.searchQuery}%`;
      const [result] = await pool.execute<RowDataPacket[]>(
        `SELECT c.*, l.sections as landingPageSections
         FROM companies c
         LEFT JOIN landing_pages l ON c.id = l.companyId
         WHERE c.status = 'approved'
           AND (LOWER(c.category) = LOWER(?) OR c.category LIKE ? OR c.name LIKE ? OR c.description LIKE ?)
         ORDER BY c.isVerified DESC, c.createdAt DESC
         LIMIT 6`,
        [service.name, likeTerm, likeTerm, likeTerm],
      );
      rows = result;
    }

    companies = rows.map((c) => {
      const sections =
        typeof c.landingPageSections === 'string'
          ? JSON.parse(c.landingPageSections)
          : c.landingPageSections || [];
      const heroSection = sections.find((s: any) => s.type === 'hero');
      const aboutSection = sections.find((s: any) => s.type === 'about');
      const heroImage =
        heroSection?.image ||
        heroSection?.images?.[0] ||
        aboutSection?.image ||
        aboutSection?.images?.[0];

      return {
        _id: c.id,
        name: c.name,
        slug: c.slug,
        logo: c.logo,
        banner: heroImage || c.banner,
        category: c.category,
        address: typeof c.address === 'string' ? JSON.parse(c.address) : c.address || {},
        rating: Number(c.rating) || 0,
        reviewCount: Number(c.reviewCount) || 0,
        isVerified: Boolean(c.isVerified),
        description: c.description,
      };
    });
  } catch (e) {
    console.error('Error fetching companies for service page:', e);
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bhartiyebazar.com' },
      { '@type': 'ListItem', position: 2, name: 'All Services', item: 'https://bhartiyebazar.com/services' },
      {
        '@type': 'ListItem',
        position: 3,
        name: service.name,
        item: `https://bhartiyebazar.com/services/${service.slug}`,
      },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${service.name} Website Themes`,
    numberOfItems: matchedThemes.length,
    itemListElement: matchedThemes.map((t, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: t.name,
      url: `https://bhartiyebazar.com/themes/${t.id}`,
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar config={settings.themeConfig} featureToggles={settings.featureToggles} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <main className="flex-1 pt-5 pb-14">
        <ServiceDetailThemes
          service={service}
          companies={companies}
        />
      </main>

      <Footer config={settings} />
    </div>
  );
}

