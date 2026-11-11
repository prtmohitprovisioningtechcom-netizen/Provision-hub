import { Metadata } from 'next';
import Link from 'next/link';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { siteConfig } from '@/config/site';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { PLATFORM_THEMES } from '@/server/services/seo.service';
import {
  Sparkles,
  Smartphone,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Eye,
  Store,
} from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // 1 hour

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug).toLowerCase();

  try {
    const [seoRows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM seo_records WHERE type = 'theme' AND (slug = ? OR targetId = ?) LIMIT 1`,
      [cleanSlug, cleanSlug],
    );

    if (seoRows.length > 0) {
      const s = seoRows[0];
      const title = s.metaTitle || `${s.targetName} | Bhartiyebazar`;
      const description = s.metaDescription || `Explore ${s.targetName} on Bhartiyebazar.`;
      const keywords = typeof s.secondaryKeywords === 'string' ? JSON.parse(s.secondaryKeywords) : s.secondaryKeywords || [];

      return {
        title,
        description,
        keywords: [s.focusKeyword, ...keywords].filter(Boolean),
        alternates: {
          canonical: s.canonicalUrl || `https://bhartiyebazar.com/themes/${cleanSlug}`,
        },
        openGraph: {
          title,
          description,
          url: `https://bhartiyebazar.com/themes/${cleanSlug}`,
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
  } catch (e) {
    console.error('Theme metadata error:', e);
  }

  const themeObj = PLATFORM_THEMES.find((t) => t.slug === cleanSlug);
  return {
    title: themeObj ? `${themeObj.name} - Website Template | Bhartiyebazar` : 'Theme Showcase | Bhartiyebazar',
    description: themeObj ? themeObj.desc : 'Explore professional website themes on Bhartiyebazar.',
  };
}

export default async function ThemeShowcasePage({ params }: Props) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug).toLowerCase();

  const themeMeta = PLATFORM_THEMES.find((t) => t.slug === cleanSlug) || {
    slug: cleanSlug,
    name: cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    category: 'Business & Commerce',
    desc: 'High-performance, modern business theme with instant lead capture and mobile-first design.',
  };

  let metaTitle = `${themeMeta.name} - Modern ${themeMeta.category} Website Template`;
  let metaDescription = themeMeta.desc;
  let h1 = `${themeMeta.name} - Premium ${themeMeta.category} Theme`;
  let h2 = `Designed for High Search Engine Visibility & Mobile Speed`;
  let contentBody = `<p>${themeMeta.desc} Built on a responsive mobile grid with zero-delay loading, verified security badges, and built-in WhatsApp inquiry modules.</p>`;
  let faqs: Array<{ question: string; answer: string }> = [
    {
      question: `Is ${themeMeta.name} compatible with smartphones and mobile browsers?`,
      answer: `Yes, ${themeMeta.name} is engineered with modern responsive layout techniques, ensuring optimal display and ultra-fast touch interactions across all mobile screens.`,
    },
    {
      question: `Can I customize colors, logo, and sections in ${themeMeta.name}?`,
      answer: `Absolutely! Bhartiyebazar provides full visual customization for banners, typography, business hours, product catalogs, and WhatsApp contact buttons.`,
    },
  ];
  let customSchema: any = null;

  try {
    const [seoRows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM seo_records WHERE type = 'theme' AND (slug = ? OR targetId = ?) LIMIT 1`,
      [cleanSlug, cleanSlug],
    );

    if (seoRows.length > 0) {
      const s = seoRows[0];
      metaTitle = s.metaTitle || metaTitle;
      metaDescription = s.metaDescription || metaDescription;
      h1 = s.h1 || h1;
      h2 = s.h2 || h2;
      contentBody = s.contentBody || contentBody;
      faqs = typeof s.faqs === 'string' ? JSON.parse(s.faqs) : s.faqs || faqs;
      customSchema = typeof s.customSchema === 'string' ? JSON.parse(s.customSchema) : s.customSchema || null;
    }
  } catch (e) {
    console.error('Error fetching theme SEO:', e);
  }

  const jsonLd = customSchema || {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: themeMeta.name,
    description: metaDescription,
    category: themeMeta.category,
    brand: { '@type': 'Brand', name: 'Bhartiyebazar' },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

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
        name: 'Themes',
        item: 'https://bhartiyebazar.com/vyapari-software',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: themeMeta.name,
        item: `https://bhartiyebazar.com/themes/${cleanSlug}`,
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main className="flex-1 pt-24 pb-16">
        {/* Theme Hero Section */}
        <section className="bg-linear-to-b from-indigo-950 via-slate-900 to-slate-950 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/50">
          <div className="mx-auto max-w-5xl text-center space-y-4">
            {/* Breadcrumb Navigation for SEO */}
            <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-indigo-300">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/vyapari-software" className="hover:text-white transition-colors">Themes</Link>
              <span>/</span>
              <span className="text-white font-bold">{themeMeta.name}</span>
            </nav>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3.5 py-1 text-xs font-black uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Official Website Template</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{h1}</h1>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300">
              {metaDescription}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm h-11 px-6 shadow-lg">
                <Link href={`/register/company?theme=${cleanSlug}`}>
                  Launch My Website With This Theme <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          {/* Key Advantages Grid */}
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 mb-3">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">100% Mobile Responsive</h3>
              <p className="text-xs text-gray-500 mt-1">
                Optimized for Indian mobile shoppers on 4G and 5G connections with fluid typography.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mb-3">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Built-in SEO &amp; Rich Schema</h3>
              <p className="text-xs text-gray-500 mt-1">
                Automatic canonical tags, meta titles, Google rich snippets, and XML sitemap registration.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 mb-3">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">1-Click WhatsApp Lead Capture</h3>
              <p className="text-xs text-gray-500 mt-1">
                Direct WhatsApp contact button so clients can connect instantly without friction.
              </p>
            </div>
          </section>

          {/* Rich Content & Description */}
          {contentBody && (
            <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm space-y-3">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">{h2}</h2>
              <div
                className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: contentBody }}
              />
            </section>
          )}

          {/* FAQs */}
          {faqs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-600" />
                Frequently Asked Questions ({themeMeta.name})
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs"
                  >
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">{faq.question}</h3>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Internal Linking: Explore Other Themes */}
          <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Explore Other Industry-Specific Website Themes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {PLATFORM_THEMES.filter((t) => t.slug !== cleanSlug).map((t) => (
                <Link
                  key={t.slug}
                  href={`/themes/${t.slug}`}
                  className="p-3 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 dark:bg-gray-800 dark:hover:bg-indigo-950/60 dark:hover:border-indigo-800 text-xs font-semibold text-gray-800 dark:text-gray-200 transition-colors border border-gray-200/60 dark:border-gray-700/60 block"
                >
                  <div className="font-extrabold text-indigo-600 dark:text-indigo-400">{t.name}</div>
                  <div className="text-[10px] text-gray-500 truncate mt-0.5">{t.category}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="rounded-3xl bg-linear-to-r from-indigo-600 to-purple-700 text-white p-6 sm:p-8 text-center space-y-3 shadow-xl">
            <h2 className="text-xl sm:text-2xl font-black">Ready to build your business website with {themeMeta.name}?</h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-lg mx-auto">
              Get your custom sub-domain or custom domain, full catalog management, and automated SEO in minutes.
            </p>
            <Button asChild className="rounded-xl bg-white text-indigo-900 hover:bg-slate-100 font-extrabold text-xs h-10 px-6">
              <Link href={`/register/company?theme=${cleanSlug}`}>Start Free Trial Today</Link>
            </Button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

