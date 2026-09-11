'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import axios from 'axios';
import { CompanyCard } from '@/components/company/CompanyCard';
import { THEME_OPTIONS } from '@/components/themes/ThemeRenderer';
import { Skeleton } from '@/components/ui/skeleton';

export function Templates({ config }: { config?: any }) {
  const [liveCompanies, setLiveCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Read admin config for enabled themes
  const displayThemes = config?.enabledThemeIds 
    ? THEME_OPTIONS.filter(t => config.enabledThemeIds.includes(t.id))
    : THEME_OPTIONS;

  useEffect(() => {
    const fetchLiveCompanies = async () => {
      try {
        // Fetch 3 most recent approved/live companies
        const res = await axios.get('/api/companies/search?limit=3&newest=true');
        if (res.data?.success && res.data?.data) {
          setLiveCompanies(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch live companies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveCompanies();
  }, []);

  return (
    <section id="templates" className="py-10 sm:py-14 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/70 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 mb-2">
            <span>🎨</span>
            <span>Available Themes & Templates</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {config?.title || 'Available Themes'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {config?.subtitle || 'Choose from professionally designed themes with Free and Premium options'}
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8 sm:mb-10">
          {displayThemes.map((template: any, i: number) => {
            const isPremium =
              template.id === 'premium-showcase' ||
              template.id === 'royal-glow' ||
              template.id === 'sleek-glass' ||
              template.id === 'neon-dark';

            return (
              <motion.div
                key={template.id || i}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
              >
                <Card className="overflow-hidden group cursor-pointer h-full flex flex-col border border-gray-200/80 dark:border-gray-800/80 hover:shadow-xl transition-all rounded-2xl">
                  <div className="h-44 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                    {template.previewImg && (
                      <img
                        src={template.previewImg}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {/* Premium / Included badge */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      {isPremium ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-amber-500 to-amber-600 px-2.5 py-0.5 text-[11px] font-black text-white shadow-md">
                          ⭐ Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                          ✓ Included
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Button
                        asChild
                        variant="secondary"
                        className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 rounded-xl font-bold text-xs"
                      >
                        <Link href="/search">View Live Pages</Link>
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80 pt-2.5 text-xs font-semibold">
                      <span className={isPremium ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>
                        {isPremium ? '⭐ Premium Plan' : '✓ All Plans'}
                      </span>
                      <Link
                        href={`/register/company?template=${template.id}`}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-bold inline-flex items-center gap-1 hover:underline"
                      >
                        Use Theme →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8 mt-8 sm:mt-10"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50/70 px-3 py-1 text-xs font-bold text-purple-700 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 mb-2">
            <span>⚡</span>
            <span>Real Businesses Using Our Themes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Live Examples
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            See how businesses build their brand presence with our templates
          </p>
        </motion.div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden h-[340px] rounded-2xl">
                <Skeleton className="h-40 w-full rounded-none" />
                <CardContent className="p-4 space-y-3">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : liveCompanies.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {liveCompanies.map((company, i) => (
              <motion.div
                key={company._id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <CompanyCard company={company} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200/60 dark:border-gray-800 text-sm">
            More live examples coming soon!
          </div>
        )}

        <div className="text-center mt-8 sm:mt-10">
          <Button asChild variant="gradient" className="h-11 rounded-2xl px-6 font-bold text-sm shadow-md shadow-indigo-500/25">
            <Link href="/register/company">
              Start Building with Templates
            </Link>
          </Button>
          <p className="mt-2.5 text-xs text-gray-500">
            Or <Link href="/search" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">browse the full directory</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
