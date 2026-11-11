import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { siteConfig } from '@/config/site';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import {
  Store,
  MapPin,
  Star,
  CheckCircle2,
  Phone,
  MessageCircle,
  ArrowRight,
  HelpCircle,
  Tag,
  Shield,
} from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // 1 hour

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug).toLowerCase();

  try {
    // 1. Look for custom SEO record
    const [seoRows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM seo_records WHERE type = 'category' AND (slug = ? OR targetId = ?) LIMIT 1`,
      [cleanSlug, cleanSlug],
    );

    if (seoRows.length > 0) {
      const s = seoRows[0];
      const title = s.metaTitle || `${s.targetName} | Bhartiyebazar`;
      const description = s.metaDescription || `Browse verified ${s.targetName} on Bhartiyebazar.`;
      const keywords = typeof s.secondaryKeywords === 'string' ? JSON.parse(s.secondaryKeywords) : s.secondaryKeywords || [];

      return {
        title,
        description,
        keywords: [s.focusKeyword, ...keywords].filter(Boolean),
        alternates: {
          canonical: s.canonicalUrl || `https://bhartiyebazar.com/category/${cleanSlug}`,
        },
        openGraph: {
          title,
          description,
          url: `https://bhartiyebazar.com/category/${cleanSlug}`,
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

    // 2. Fallback to category table
    const [catRows] = await pool.execute<RowDataPacket[]>(
      'SELECT name, description FROM categories WHERE slug = ? LIMIT 1',
      [cleanSlug],
    );

    if (catRows.length > 0) {
      const cat = catRows[0];
      const title = `Top ${cat.name} Services & Verified Companies in India | Bhartiyebazar`;
      const description = `Find verified ${cat.name} businesses, suppliers, and dealers across India. Compare reviews, get quotes, and chat directly on WhatsApp.`;
      return {
        title,
        description,
        alternates: { canonical: `https://bhartiyebazar.com/category/${cleanSlug}` },
      };
    }
  } catch (err) {
    console.error('Error in category generateMetadata:', err);
  }

  return {
    title: `Business Directory | ${siteConfig.name}`,
    description: 'Find verified local businesses across India on Bhartiyebazar.',
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug).toLowerCase();

  // 1. Fetch category & SEO details
  let categoryName = cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  let metaTitle = `Verified ${categoryName} Services in India`;
  let metaDescription = `Find top-rated, certified ${categoryName} professionals on Bhartiyebazar.`;
  let h1 = `Verified ${categoryName} Services`;
  let h2 = `Top Recommended ${categoryName} Companies`;
  let contentBody = `<p>Connect with genuine, top-rated <strong>${categoryName}</strong> specialists across India. Verified by Bhartiyebazar for reliable service and authentic customer ratings.</p>`;
  let faqs: Array<{ question: string; answer: string }> = [];
  let schemaData: any = null;

  try {
    const [seoRows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM seo_records WHERE type = 'category' AND (slug = ? OR targetId = ?) LIMIT 1`,
      [cleanSlug, cleanSlug],
    );

    if (seoRows.length > 0) {
      const s = seoRows[0];
      categoryName = s.targetName || categoryName;
      metaTitle = s.metaTitle || metaTitle;
      metaDescription = s.metaDescription || metaDescription;
      h1 = s.h1 || h1;
      h2 = s.h2 || h2;
      contentBody = s.contentBody || contentBody;
      faqs = typeof s.faqs === 'string' ? JSON.parse(s.faqs) : s.faqs || [];
      schemaData = typeof s.customSchema === 'string' ? JSON.parse(s.customSchema) : s.customSchema || null;
    } else {
      const [catRows] = await pool.execute<RowDataPacket[]>(
        'SELECT name, description FROM categories WHERE slug = ? LIMIT 1',
        [cleanSlug],
      );
      if (catRows.length > 0) {
        categoryName = catRows[0].name;
        h1 = `Verified ${categoryName} Services in India`;
      }
    }
  } catch (e) {
    console.error('Error fetching category SEO:', e);
  }

  // 2. Fetch businesses in this category
  let companies: any[] = [];
  try {
    const [compRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, slug, logo, banner, address, phone, whatsapp, isVerified, rating, reviewCount 
       FROM companies 
       WHERE status = 'approved' AND (LOWER(category) = LOWER(?) OR LOWER(category) LIKE ?) 
       ORDER BY isVerified DESC, rating DESC LIMIT 12`,
      [categoryName, `%${cleanSlug}%`],
    );
    companies = compRows.map((c) => ({
      ...c,
      city: typeof c.address === 'string' ? (JSON.parse(c.address)?.city || 'India') : (c.address?.city || 'India'),
    }));
  } catch (e) {
    console.error('Error fetching category companies:', e);
  }

  // Construct JSON-LD Schema
  const jsonLd = schemaData || {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} Directory`,
    description: metaDescription,
    url: `https://bhartiyebazar.com/category/${cleanSlug}`,
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
        name: 'Categories',
        item: 'https://bhartiyebazar.com/search',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `https://bhartiyebazar.com/category/${cleanSlug}`,
      },
    ],
  };

  const faqJsonLd =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar />

      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <main className="flex-1 pt-24 pb-16">
        {/* Category Hero Section */}
        <section className="bg-linear-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-indigo-900">
          <div className="mx-auto max-w-6xl text-center space-y-4">
            {/* Breadcrumb Navigation for SEO & UX */}
            <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-indigo-200">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/search" className="hover:text-white transition-colors">Categories</Link>
              <span>/</span>
              <span className="text-white font-bold">{categoryName}</span>
            </nav>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
              <Tag className="h-3.5 w-3.5" />
              <span>Verified Category Directory</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{h1}</h1>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300">
              {metaDescription}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          {/* Companies Listing Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                  {h2}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing verified {categoryName} service providers and enterprises
                </p>
              </div>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {companies.length} Listings
              </span>
            </div>

            {companies.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 p-12 text-center space-y-3 bg-white dark:bg-gray-900">
                <Store className="h-10 w-10 mx-auto text-gray-400" />
                <h3 className="font-bold text-base">New merchants joining soon</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Be the first verified {categoryName} provider in this category to get direct client inquiries.
                </p>
                <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                  <Link href="/register/company">Register My Business Free</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {companies.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {c.logo ? (
                            <img
                              src={c.logo}
                              alt={`${c.name} - Verified ${categoryName} in ${c.city}`}
                              className="h-10 w-10 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-gray-800"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-100 dark:border-indigo-900">
                              {c.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 className="font-extrabold text-base text-gray-900 dark:text-white line-clamp-1">
                              {c.name}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                              <span>{c.city}</span>
                            </div>
                          </div>
                        </div>
                        {Boolean(c.isVerified) && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-black uppercase shrink-0">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </div>

                      {c.rating > 0 && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{Number(c.rating).toFixed(1)}</span>
                          <span className="text-gray-400">({c.reviewCount || 0} reviews)</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                      <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-bold flex-1">
                        <Link href={`/${c.slug}`}>View Store</Link>
                      </Button>
                      {c.phone && (
                        <Button
                          asChild
                          size="sm"
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          <a
                            href={`https://wa.me/91${String(c.whatsapp || c.phone).replace(/\D/g, '')}?text=Namaste%20I%20found%20your%20business%20on%20Bhartiyebazar`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Rich SEO Content Section */}
          {contentBody && (
            <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-600" />
                About {categoryName} Services on Bhartiyebazar
              </h2>
              <div
                className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{ __html: contentBody }}
              />
            </section>
          )}

          {/* Interactive FAQs Section (Google Rich Snippets) */}
          {faqs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-600" />
                Frequently Asked Questions ({categoryName})
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs"
                  >
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Internal Linking: Find in Major Indian Cities */}
          <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" />
              Find {categoryName} in Major Indian Cities
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { city: 'Delhi', slug: 'delhi' },
                { city: 'Mumbai', slug: 'mumbai' },
                { city: 'Bengaluru', slug: 'bengaluru' },
                { city: 'Hyderabad', slug: 'hyderabad' },
                { city: 'Chennai', slug: 'chennai' },
                { city: 'Kolkata', slug: 'kolkata' },
                { city: 'Pune', slug: 'pune' },
                { city: 'Ahmedabad', slug: 'ahmedabad' },
                { city: 'Jaipur', slug: 'jaipur' },
                { city: 'Lucknow', slug: 'lucknow' },
                { city: 'Noida', slug: 'noida' },
                { city: 'Gurugram', slug: 'gurugram' },
              ].map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/explore/${loc.slug}/${cleanSlug}`}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-gray-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors border border-gray-200/60 dark:border-gray-700/60"
                >
                  {categoryName} in {loc.city}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

