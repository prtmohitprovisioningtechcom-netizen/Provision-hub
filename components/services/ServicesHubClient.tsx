'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUp, Eye, Layers, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ALL_SERVICES,
  getServiceBySlug,
  getThemesForService,
  type ServiceDefinition,
} from '@/config/service-themes';

export function ServicesHubClient() {
  const { t } = useLanguage();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const boxesRef = useRef<HTMLDivElement>(null);
  const themesRef = useRef<HTMLDivElement>(null);

  const selectedService = selectedSlug ? getServiceBySlug(selectedSlug) : undefined;
  const selectedThemes = selectedService ? getThemesForService(selectedService.slug) : [];

  const handleSelectService = (service: ServiceDefinition) => {
    setSelectedSlug(service.slug);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/services/${service.slug}`);
    }
    requestAnimationFrame(() => {
      setTimeout(() => {
        themesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    });
  };

  const renderServiceBox = (service: ServiceDefinition, index: number) => {
    const isOther = service.slug === 'other';
    const isSelected = selectedSlug === service.slug;
    const themes = getThemesForService(service.slug);
    const localizedName = t(service.nameKey);
    const name = localizedName && localizedName !== service.nameKey ? localizedName : service.name;
    const localizedBadge = t(service.badgeKey);
    const badge = localizedBadge && localizedBadge !== service.badgeKey ? localizedBadge : service.badge;

    return (
      <motion.div
        key={service.slug}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.02 }}
      >
        <button
          type="button"
          onClick={() => handleSelectService(service)}
          className={`w-full group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 text-center h-full overflow-hidden cursor-pointer ${
            isSelected
              ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/60 shadow-lg ring-2 ring-indigo-600/30 -translate-y-1'
              : `${
                  isOther
                    ? 'border-indigo-300/90 dark:border-indigo-700/80'
                    : 'border-slate-200/90 dark:border-slate-800/90'
                } bg-white/95 dark:bg-gray-900/85 shadow-xs hover:shadow-xl ${service.borderGlow} hover:-translate-y-1`
          }`}
        >
          {!isSelected && (
            <div
              className={`absolute inset-0 bg-linear-to-b ${service.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
            />
          )}

          {badge && (
            <span
              className={`relative mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                isSelected
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
              }`}
            >
              {badge}
            </span>
          )}

          <span className="relative text-4xl select-none transition-transform duration-300 group-hover:scale-115 group-hover:rotate-3 drop-shadow-xs">
            {service.icon}
          </span>

          <h2
            className={`relative mt-2.5 text-sm sm:text-base font-bold transition-colors tracking-tight line-clamp-1 ${
              isSelected
                ? 'text-indigo-700 dark:text-indigo-300'
                : 'text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
            }`}
          >
            {name}
          </h2>

          <span className="relative mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600/90 dark:text-indigo-400">
            <Palette className="h-3 w-3" />
            <span>
              {themes.length} {themes.length === 1 ? 'Theme' : 'Themes'}
            </span>
            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </button>
      </motion.div>
    );
  };

  const selectedLocalizedName = selectedService ? t(selectedService.nameKey) : '';
  const selectedDisplayName =
    selectedService && selectedLocalizedName && selectedLocalizedName !== selectedService.nameKey
      ? selectedLocalizedName
      : selectedService?.name || '';

  return (
    <div className="space-y-8">
      <div ref={boxesRef} className="space-y-5 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {t('categories.allServices') || 'All Services'}
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {ALL_SERVICES.map((service, index) => renderServiceBox(service, index))}
        </div>
      </div>

      {/* Selected Service Themes — Smoothly scrolls here when any service box is clicked */}
      {selectedService && (
        <div
          id="service-themes"
          ref={themesRef}
          className="scroll-mt-24 space-y-5 pt-6 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
              <span>{selectedService.icon}</span>
              <span>
                {selectedDisplayName} Themes ({selectedThemes.length})
              </span>
            </h2>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => boxesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="rounded-xl text-xs font-bold"
            >
              <ArrowUp className="h-3.5 w-3.5 mr-1.5" />
              All Services
            </Button>
          </div>

          {selectedThemes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {selectedThemes.map((theme, idx) => {
                const isPremium = Boolean(theme.isPremium);
                const isOther = selectedService.slug === 'other';
                const registerUrl = isOther
                  ? `/register/company?template=${theme.id}`
                  : `/register/company?template=${theme.id}&category=${encodeURIComponent(selectedService.name)}`;

                return (
                  <motion.div
                    key={`${selectedService.slug}-${theme.id}`}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
