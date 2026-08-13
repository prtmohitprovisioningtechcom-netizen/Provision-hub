import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: `Sitemap | ${siteConfig.name}`,
  description: `Navigate all pages, categories, and top companies on ${siteConfig.name}.`,
};

export const revalidate = 3600; // Cache for 1 hour

export default async function GlobalSitemapPage() {
  // Fetch categories
  const [categoryRows] = await pool.execute<RowDataPacket[]>(
    'SELECT name, slug FROM categories WHERE isActive = 1 AND (type = "business" OR type IS NULL) ORDER BY name ASC'
  );
  
  // Fetch some top companies (e.g. recently updated or top verified)
  const [companyRows] = await pool.execute<RowDataPacket[]>(
    'SELECT name, slug, category FROM companies WHERE status = "approved" ORDER BY isVerified DESC, createdAt DESC LIMIT 30'
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Platform Sitemap
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Overview of all our main pages, business categories, and top companies.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {/* Main Pages */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-6 border-b border-gray-100 pb-4 text-xl font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
                  Main Pages
                </h2>
                <ul className="space-y-3">
                  {[
                    { label: 'Home', href: '/' },
                    { label: 'Search Directory', href: '/search' },
                    { label: 'Login', href: '/login' },
                    { label: 'Register Company', href: '/register/company' },
                    { label: 'Forgot Password', href: '/forgot-password' },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href}
                        className="flex items-center text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                      >
                        <span className="mr-2 text-indigo-500">•</span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-6 border-b border-gray-100 pb-4 text-xl font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
                  Business Categories
                </h2>
                <ul className="space-y-3">
                  {categoryRows.length > 0 ? (
                    categoryRows.map((cat) => (
                      <li key={cat.slug}>
                        <Link 
                          href={`/search?category=${encodeURIComponent(cat.name)}`}
                          className="flex items-center text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                        >
                          <span className="mr-2 text-indigo-500">•</span>
                          {cat.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm">No categories found.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Top Companies */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-6 border-b border-gray-100 pb-4 text-xl font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
                  Featured Companies
                </h2>
                <ul className="space-y-3">
                  {companyRows.length > 0 ? (
                    companyRows.map((company) => (
                      <li key={company.slug}>
                        <Link 
                          href={`/${company.slug}`}
                          className="flex flex-col text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                        >
                          <div className="flex items-center">
                            <span className="mr-2 text-indigo-500">•</span>
                            <span className="font-medium">{company.name}</span>
                          </div>
                          {company.category && (
                            <span className="ml-5 text-xs text-gray-400">{company.category}</span>
                          )}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm">No companies found.</li>
                  )}
                </ul>
                {companyRows.length >= 30 && (
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Link href="/search" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                      View all companies &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
