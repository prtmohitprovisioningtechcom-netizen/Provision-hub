import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { PLATFORM_THEMES } from '@/server/services/seo.service';

export const metadata: Metadata = {
  title: `HTML Sitemap | ${siteConfig.name}`,
  description: `Browse all categories, website themes, top companies, and main sections on ${siteConfig.name}.`,
};

export const revalidate = 3600; // Cache for 1 hour

export default async function GlobalSitemapPage() {
  // Fetch active categories
  const [categoryRows] = await pool.execute<RowDataPacket[]>(
    'SELECT name, slug FROM categories WHERE isActive = 1 AND (type = "business" OR type IS NULL) ORDER BY name ASC'
  );

  // Fetch approved companies
  const [companyRows] = await pool.execute<RowDataPacket[]>(
    'SELECT name, slug, category FROM companies WHERE status = "approved" ORDER BY isVerified DESC, createdAt DESC LIMIT 30'
  );

  const topCities = [
    { name: 'Delhi', slug: 'delhi' },
    { name: 'Mumbai', slug: 'mumbai' },
    { name: 'Bengaluru', slug: 'bengaluru' },
    { name: 'Hyderabad', slug: 'hyderabad' },
    { name: 'Chennai', slug: 'chennai' },
    { name: 'Kolkata', slug: 'kolkata' },
    { name: 'Pune', slug: 'pune' },
    { name: 'Ahmedabad', slug: 'ahmedabad' },
    { name: 'Jaipur', slug: 'jaipur' },
    { name: 'Lucknow', slug: 'lucknow' },
    { name: 'Noida', slug: 'noida' },
    { name: 'Gurugram', slug: 'gurugram' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="flex-1 pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300">
              Navigation Directory
            </span>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Platform Sitemap
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Direct index of all verified categories, official website themes, popular cities, and registered companies on Bhartiyebazar.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Main Pages */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 border-b border-gray-100 pb-3 text-lg font-black text-gray-900 dark:border-gray-800 dark:text-white">
                  Main Platform Pages
                </h2>
                <ul className="space-y-2.5 text-xs sm:text-sm">
                  {[
                    { label: 'Home Page', href: '/' },
                    { label: 'Search Business Directory', href: '/search' },
                    { label: 'Post Business Requirement', href: '/post-requirement' },
                    { label: 'Vyapari Software Hub', href: '/vyapari-software' },
                    { label: 'Merchant Login', href: '/login' },
                    { label: 'Register Free Business', href: '/register/company' },
                    { label: 'XML Sitemap Feed', href: '/sitemap.xml' },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                      >
                        <span className="mr-2 text-indigo-500 font-bold">•</span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Business Categories */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 border-b border-gray-100 pb-3 text-lg font-black text-gray-900 dark:border-gray-800 dark:text-white">
                  Verified Categories ({categoryRows.length})
                </h2>
                <ul className="space-y-2.5 text-xs sm:text-sm max-h-[360px] overflow-y-auto pr-1">
                  {categoryRows.length > 0 ? (
                    categoryRows.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          href={`/category/${cat.slug}`}
                          className="flex items-center text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                        >
                          <span className="mr-2 text-indigo-500 font-bold">•</span>
                          {cat.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-xs">No categories found.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Website Themes */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 border-b border-gray-100 pb-3 text-lg font-black text-gray-900 dark:border-gray-800 dark:text-white">
                  Official Themes ({PLATFORM_THEMES.length})
                </h2>
                <ul className="space-y-2.5 text-xs sm:text-sm max-h-[360px] overflow-y-auto pr-1">
                  {PLATFORM_THEMES.map((theme) => (
                    <li key={theme.slug}>
                      <Link
                        href={`/themes/${theme.slug}`}
                        className="flex flex-col text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                      >
                        <div className="flex items-center">
                          <span className="mr-2 text-indigo-500 font-bold">•</span>
                          <span className="font-semibold">{theme.name}</span>
                        </div>
                        <span className="ml-4 text-[10px] text-gray-400">{theme.category}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Top Companies & Cities */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 border-b border-gray-100 pb-3 text-lg font-black text-gray-900 dark:border-gray-800 dark:text-white">
                  Explore Top Cities
                </h2>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {topCities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/explore/${city.slug}/construction`}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>

                <h3 className="mb-3 border-b border-gray-100 pb-2 text-xs font-black uppercase text-gray-400 dark:border-gray-800 dark:text-gray-500">
                  Featured Stores
                </h3>
                <ul className="space-y-2 text-xs max-h-[160px] overflow-y-auto pr-1">
                  {companyRows.slice(0, 15).map((comp) => (
                    <li key={comp.slug}>
                      <Link
                        href={`/${comp.slug}`}
                        className="flex items-center text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 truncate"
                      >
                        <span className="mr-1.5 text-indigo-500">•</span>
                        <span className="truncate">{comp.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
