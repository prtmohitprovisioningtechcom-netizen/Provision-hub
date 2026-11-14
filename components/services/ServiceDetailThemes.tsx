'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUp, Eye, Layers, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CompanyCard } from '@/components/company/CompanyCard';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ALL_SERVICES,
  getThemesForService,
  type ServiceDefinition,
} from '@/config/service-themes';

interface CompanyItem {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  category: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  description?: string;
}

interface ServiceDetailThemesProps {
  service: ServiceDefinition;
  companies: CompanyItem[];
}

export function ServiceDetailThemes({
  service,
  companies,
}: ServiceDetailThemesProps) {
  const { t } = useLanguage();
  const boxesRef = useRef<HTMLDivElement>(null);
  const themesRef = useRef<HTMLDivElement>(null);
  const themes = getThemesForService(service.slug);
  const localizedName = t(service.nameKey);
  const serviceDisplayName =
    localizedName && localizedName !== service.nameKey ? localizedName : service.name;
  const isOther = service.slug === 'other';

  useEffect(() => {
    const timer = setTimeout(() => {
      themesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => clearTimeout(timer);
  }, [service.slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Compact Header */}
      <div ref={boxesRef} className="flex flex-wrap items-center justify-between gap-3 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{service.icon}</span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {serviceDisplayName}
          </h1>
        </div>

        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold">
          <Link href="/services">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            {t('categories.allServices') || 'All Services'}
          </Link>
        </Button>
      </div>

      {/* All Service Boxes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {ALL_SERVICES.map((item) => {
          const active = item.slug === service.slug;
          const itemThemeCount = getThemesForService(item.slug).length;
          const itemLocalName = t(item.nameKey);
          const label =
            itemLocalName && itemLocalName !== item.nameKey ? itemLocalName : item.name;
          const itemBadgeLocal = t(item.badgeKey);
          const itemBadge =
            itemBadgeLocal && itemBadgeLocal !== item.badgeKey ? itemBadgeLocal : item.badge;

          return (
            <Link
              key={item.slug}
              href={`/services/${item.slug}#service-themes`}
              onClick={() => {
                if (item.slug === service.slug) {
                  themesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`group relative flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 text-center overflow-hidden ${
                active
                  ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/60 shadow-md ring-2 ring-indigo-600/30 -translate-y-0.5'
                  : `border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-gray-900 hover:shadow-lg ${item.borderGlow} hover:-translate-y-0.5`
              }`}
            >
              {!active && (
                <div
                  className={`absolute inset-0 bg-linear-to-b ${item.gradient} opacity-30 group-hover:opacity-90 transition-opacity pointer-events-none`}
                />
              )}

              {itemBadge && (
                <span
                  className={`relative mb-1.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {itemBadge}
                </span>
              )}

              <span className="relative text-2xl sm:text-3xl select-none transition-transform duration-200 group-hover:scale-110">
                {item.icon}
              </span>

              <span
                className={`relative mt-1.5 text-xs sm:text-sm font-bold line-clamp-1 ${
                  active
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                }`}
              >
                {label}
              </span>

              <span
                className={`relative mt-1 inline-flex items-center gap-1 text-[10px] font-semibold ${
                  active
                    ? 'text-indigo-600 dark:text-indigo-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Palette className="h-2.5 w-2.5" />
                <span>{itemThemeCount} {itemThemeCount === 1 ? 'Theme' : 'Themes'}</span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* Selected Service Themes — Smooth scroll target */}
      <div
        id="service-themes"
        ref={themesRef}
        className="scroll-mt-24 space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <span>{service.icon}</span>
            <span>{serviceDisplayName} Themes ({themes.length})</span>
          </h2>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => boxesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="rounded-xl text-xs font-bold"
          >
            <ArrowUp className="h-3.5 w-3.5 mr-1.5" />
            Change Service
          </Button>
        </div>

        {themes.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((theme, idx) => {
              const isPremium = Boolean(theme.isPremium);
              const registerUrl = isOther
                ? `/register/company?template=${theme.id}`
                : `/register/company?template=${theme.id}&category=${encodeURIComponent(service.name)}`;

              return (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                >
                  <Card className="overflow-hidden group h-full flex flex-col border border-gray-200/90 dark:border-gray-800/90 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all rounded-2xl bg-white dark:bg-gray-900">
                    <div className="h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                      <img
                        src={theme.previewImg}
                        alt={theme.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <div className="absolute top-2.5 right-2.5 z-10">
                        {isPremium ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-amber-500 to-amber-600 px-2.5 py-0.5 text-[11px] font-black text-white shadow-md">
                            {t('templates.premium') || 'Premium'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                            {t('templates.included') || 'Included'}
                          </span>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors flex items-center justify-center">
                        <Button
                          asChild
                          variant="secondary"
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-xl font-bold text-xs shadow-lg"
                        >
                          <Link href={`/themes/${theme.id}`}>
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            {t('templates.viewLive') || 'Preview'}
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                          {theme.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                          {theme.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {theme.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-slate-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-semibold text-gray-700 dark:text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs font-bold flex-1"
                        >
                          <Link href={`/themes/${theme.id}`}>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Preview
                          </Link>
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex-1"
                        >
                          <Link href={registerUrl}>
                            Use Theme
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 text-center space-y-3">
            <Layers className="h-10 w-10 text-indigo-400 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              No themes available yet
            </h3>
            <Button asChild className="rounded-xl">
              <Link href="/services">All Services</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Live Businesses in this Service (shown only if available) */}
      {companies.length > 0 && (
        <section className="pt-8 border-t border-gray-200 dark:border-gray-800 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              {serviceDisplayName}
            </h2>
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold">
              <Link
                href={
                  isOther
                    ? '/search'
                    : `/search?query=${encodeURIComponent(service.searchQuery)}`
                }
              >
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, i) => (
              <CompanyCard key={company._id} company={company} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
