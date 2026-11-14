'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import axios from 'axios';
import { CompanyCard } from '@/components/company/CompanyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ALL_SERVICES,
  THEME_OPTIONS,
  getThemesForService,
  getThemeServiceNames,
  isOtherTheme,
} from '@/config/service-themes';
import { ArrowRight, Layers } from 'lucide-react';

export function Templates({ config }: { config?: any }) {
  const { t } = useLanguage();
  const [liveCompanies, setLiveCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('all');

  const enabledIds: string[] | undefined =
    config?.enabledThemeIds?.length > 0 ? config.enabledThemeIds : undefined;

  const displayThemes =
    selectedService === 'all'
      ? enabledIds
        ? THEME_OPTIONS.filter((theme) => enabledIds.includes(theme.id))
        : [...THEME_OPTIONS]
      : getThemesForService(selectedService, enabledIds);

  useEffect(() => {
    const controller = new AbortController();
    const fetchLiveCompanies = async () => {
      try {
        const res = await axios.get('/api/companies/search?limit=3&newest=true', {
          timeout: 15000,
          signal: controller.signal,
        });
        if (res.data?.success && res.data?.data) {
          setLiveCompanies(res.data.data);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.warn('Live companies preview unavailable right now.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchLiveCompanies();
    return () => controller.abort();
  }, []);

  return (
    <section id="templates" className="py-6 sm:py-14 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4 sm:mb-6"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/70 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 mb-2">
            <span>🎨</span>
            <span>{t('templates.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {t('templates.title')}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('templates.subtitle')}
          </p>
        </motion.div>

        {/* Service-Wise Filter Tabs */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSelectedService('all')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
              selectedService === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-indigo-300'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Themes</span>
            <span
              className={`rounded-full px-1.5 text-[10px] font-black ${
                selectedService === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200/80 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {getThemesForService('all', enabledIds).length}
            </span>
          </button>

          {ALL_SERVICES.map((service) => {
            const count = getThemesForService(service.slug, enabledIds).length;
            const active = selectedService === service.slug;
            const localizedName = t(service.nameKey);
            const label =
              localizedName && localizedName !== service.nameKey ? localizedName : service.name;

            return (
              <button
                key={service.slug}
                type="button"
                onClick={() => setSelectedService(service.slug)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-indigo-300'
                }`}
              >
                <span>{service.icon}</span>
                <span>{label}</span>
                <span
                  className={`rounded-full px-1.5 text-[10px] font-black ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200/80 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8 sm:mb-10">
          {displayThemes.map((template: any, i: number) => {
            const isPremium =
              template.isPremium ||
              template.id === 'premium-showcase' ||
              template.id === 'royal-glow' ||
              template.id === 'sleek-glass' ||
              template.id === 'neon-dark';
            const serviceNames = getThemeServiceNames(template);
            const isAutoOther = isOtherTheme(template);

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
                    {/* Service Category Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/75 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        {isAutoOther ? '✨ Other' : serviceNames.slice(0, 2).join(' • ')}
                      </span>
                    </div>

                    {/* Premium / Included badge */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      {isPremium ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-amber-500 to-amber-600 px-2.5 py-0.5 text-[11px] font-black text-white shadow-md">
                          {t('templates.premium')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                          {t('templates.included')}
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Button
                        asChild
                        variant="secondary"
                        className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 rounded-xl font-bold text-xs"
                      >
                        <Link href={`/themes/${template.id}`}>{t('templates.viewLive')}</Link>
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
                      <div className="mt-2 flex flex-wrap gap-1">
                        {serviceNames.slice(0, 3).map((sName) => (
                          <span
                            key={sName}
                            className="rounded-md bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300"
                          >
                            {sName}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80 pt-2.5 text-xs font-semibold">
                      <span className={isPremium ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>
                        {isPremium ? t('templates.premiumPlan') : t('templates.allPlans')}
                      </span>
                      <Link
                        href={`/register/company?template=${template.id}`}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-bold inline-flex items-center gap-1 hover:underline"
                      >
                        {t('templates.useTheme')}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {selectedService !== 'all' && (
          <div className="mb-8 text-center">
            <Button asChild variant="outline" className="rounded-2xl font-bold text-xs">
              <Link href={`/services/${selectedService}`}>
                Open Dedicated {ALL_SERVICES.find((s) => s.slug === selectedService)?.name} Themes Page
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4 sm:mb-8 mt-5 sm:mt-10"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50/70 px-3 py-1 text-xs font-bold text-purple-700 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 mb-2">
            <span>⚡</span>
            <span>{t('templates.liveExamplesBadge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {t('templates.liveExamplesTitle')}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {t('templates.liveExamplesSubtitle')}
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
              {t('templates.startBuilding')}
            </Link>
          </Button>
          <p className="mt-2.5 text-xs text-gray-500">
            {t('templates.or')}{' '}
            <Link href="/services" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Browse All Services &amp; Themes
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
