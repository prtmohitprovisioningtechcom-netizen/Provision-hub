import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Search, Compass, Home, PhoneCall, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NotFound() {
  let categories: { name: string; slug: string }[] = [];

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT name, slug FROM categories WHERE isActive = 1 ORDER BY createdAt DESC LIMIT 8',
    );
    categories = rows.map((r) => ({ name: r.name, slug: r.slug }));
  } catch (e) {
    // fallback categories if DB error
    categories = [
      { name: 'Construction', slug: 'construction' },
      { name: 'Healthcare', slug: 'healthcare' },
      { name: 'Education', slug: 'education' },
      { name: 'Travel & Tourism', slug: 'travel-tourism' },
      { name: 'Interior Design', slug: 'interior-design' },
      { name: 'Business Services', slug: 'business-services' },
    ];
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-radial from-indigo-50/50 via-white to-gray-50 px-4 py-16 text-center dark:from-gray-900 dark:via-gray-950 dark:to-black">
      <div className="max-w-2xl w-full mx-auto">
        <BrandLogo className="mb-6 justify-center" imageClassName="h-12" iconClassName="h-12 w-12" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-4 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" />
          404 • Page Not Found
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight dark:text-white mb-3">
          Ye Page Maujood Nahi Hai
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg mb-8 max-w-lg mx-auto">
          Aap jis URL ko dhoondh rahe hain wo move ho chuka hai ya URL galat hai. Aap neeche diye gaye popular categories me search kar sakte hain.
        </p>

        {/* Live Search Form */}
        <form action="/search" method="GET" className="relative max-w-md mx-auto mb-10">
          <input
            type="text"
            name="q"
            placeholder="Search businesses, services, or vyaparis..."
            className="w-full h-12 pl-11 pr-24 rounded-2xl border border-gray-300 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:border-gray-800 dark:text-white"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <Button
            type="submit"
            className="absolute right-1.5 top-1.5 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4"
          >
            Search
          </Button>
        </form>

        {/* Popular Categories (Internal Linking for SEO Equity) */}
        {categories.length > 0 && (
          <div className="mb-10 text-left bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3.5 flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-indigo-500" />
              Popular Categories On Bhartiyebazar
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-gray-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 shadow-md gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button asChild variant="outline" className="rounded-xl font-bold h-11 px-5 border-gray-300 dark:border-gray-700 gap-2">
            <Link href="/search">
              <Compass className="h-4 w-4 text-gray-500" />
              Explore All Businesses
            </Link>
          </Button>

          <Button asChild variant="ghost" className="rounded-xl font-semibold h-11 px-4 text-gray-600 dark:text-gray-400 gap-1.5">
            <Link href="/contact">
              <PhoneCall className="h-4 w-4" />
              Help & Support
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
