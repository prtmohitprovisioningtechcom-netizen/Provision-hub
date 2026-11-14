'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CORE_SERVICES } from '@/config/service-themes';

export function PopularCategories() {
  const { t } = useLanguage();

  return (
    <section className="relative pt-4 pb-6 sm:py-12 bg-linear-to-b from-white via-slate-50/70 to-white dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950 border-b border-gray-200/70 dark:border-gray-800/80 overflow-hidden">
      {/* Soft ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Title & All Services button */}
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div className="flex flex-col items-start gap-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/90 bg-indigo-50/80 dark:border-indigo-800/80 dark:bg-indigo-950/50 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t('categories.badge')}</span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white"
            >
              {t('categories.title')}
            </motion.h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xl">
              {t('categories.subtitle')}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <Menu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('categories.allServices')}</span>
              <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
          </motion.div>
        </div>

        {/* Categories Grid (2 rows of 6 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5 md:gap-4.5">
          {CORE_SERVICES.map((cat, index) => {
            const name = t(cat.nameKey);
            const badge = t(cat.badgeKey);

            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.025 }}
              >
                <Link
                  href={`/services/${cat.slug}#service-themes`}
                  className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xs shadow-xs hover:shadow-xl ${cat.borderGlow} hover:-translate-y-1.5 transition-all duration-300 text-center h-full overflow-hidden`}
                >
                  {/* Subtle top background gradient per category */}
                  <div
                    className={`absolute inset-0 bg-linear-to-b ${cat.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                  />

                  {/* Micro badge */}
                  {badge && (
                    <span className="relative mb-2 inline-block rounded-full bg-slate-100 dark:bg-gray-800/80 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                      {badge}
                    </span>
                  )}

                  {/* Icon with float & scale animation on hover */}
                  <span className="relative text-3xl sm:text-4xl select-none transition-transform duration-300 group-hover:scale-120 group-hover:rotate-3 drop-shadow-xs">
                    {cat.icon}
                  </span>

                  <span className="relative mt-2.5 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight line-clamp-1">
                    {name}
                  </span>

                  <span className="relative mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span>{t('categories.explore')}</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
