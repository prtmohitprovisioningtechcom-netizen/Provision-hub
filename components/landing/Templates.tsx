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
    <section id="templates" className="py-24 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 dark:text-white">
            {config?.title || 'Available Themes'}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {config?.subtitle || 'Choose from professionally designed themes for every industry'}
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-24">
          {displayThemes.map((template: any, i: number) => (
            <motion.div
              key={template.id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className="overflow-hidden group cursor-pointer h-full flex flex-col">
                <div className={`h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden`}>
                  {template.previewImg && (
                    <img src={template.previewImg} alt={template.name} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Button
                      asChild
                      variant="secondary"
                      className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Link href="/search">View live pages</Link>
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 mt-20"
        >
          <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 dark:text-white">
            Live Examples
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            See how real businesses are using our themes to grow online
          </p>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden h-[400px]">
                <Skeleton className="h-48 w-full rounded-none" />
                <CardContent className="p-4 space-y-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : liveCompanies.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {liveCompanies.map((company, i) => (
              <motion.div
                key={company._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <CompanyCard company={company} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
            More live examples coming soon!
          </div>
        )}

        <div className="text-center mt-16">
          <Button asChild variant="gradient" size="lg">
            <Link href="/register/company">
              Start Building with Templates
            </Link>
          </Button>
          <p className="mt-4 text-sm text-gray-500">
            Or <Link href="/search" className="text-indigo-600 hover:underline">browse the full directory</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
