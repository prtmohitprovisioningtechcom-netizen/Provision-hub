'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero({
  config,
  showTemplates = true,
}: {
  config?: any;
  showTemplates?: boolean;
}) {
  const defaultTitle = 'Har Dukan Ki Shaan, Har Vyapari Ka Naam';
  const defaultSubtitle =
    'Chhota vyapar ho ya bada karobaar — Bhartiyebazar par banayein apni verified digital pehchan. Google par rank karein, WhatsApp se seedhe grahak paayein, aur apne business ko banayein local brand.';
  const titleText = config?.title || defaultTitle;
  const subtitleText = config?.subtitle || defaultSubtitle;
  const primaryLink =
    !config?.primaryCtaLink || config.primaryCtaLink === '/register'
      ? '/register/company'
      : config.primaryCtaLink;
  const configuredSecondaryLink =
    !config?.secondaryCtaLink || config.secondaryCtaLink === '#demo'
      ? '#templates'
      : config.secondaryCtaLink;
  const secondaryLink =
    configuredSecondaryLink === '#templates' && !showTemplates
      ? '/search'
      : configuredSecondaryLink;
  const secondaryText =
    secondaryLink === '/search' && config?.secondaryCtaText === 'View Demo'
      ? 'Browse Companies'
      : config?.secondaryCtaText || 'Explore Companies';
  
  let highlightText = '';
  let restText = '';
  if (titleText.includes(',')) {
    const parts = titleText.split(',');
    highlightText = parts[0].trim() + ',';
    restText = parts.slice(1).join(',').trim();
  } else {
    const titleWords = titleText.split(' ');
    const half = Math.ceil(titleWords.length / 2);
    highlightText = titleWords.slice(0, half).join(' ');
    restText = titleWords.slice(half).join(' ');
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />

      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-linear-to-r from-amber-50 to-orange-50 px-4 py-1.5 text-sm font-semibold text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300 shadow-xs font-display">
            <span className="text-base select-none">🇮🇳</span>
            <span className="tracking-wide font-medium">Chhota ho ya bada kaam, Bhartiyebazar par hoga har vyapari ka naam</span>
          </div>

          <h1 className="font-display text-4xl font-black tracking-[-0.03em] sm:text-6xl lg:text-7xl leading-[1.08]">
            <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-amber-600 dark:from-indigo-400 dark:via-purple-300 dark:to-amber-300 bg-clip-text text-transparent">
              {highlightText}
            </span>
            {restText && (
              <>
                <br />
                <span className="text-gray-900 dark:text-white drop-shadow-xs">{restText}</span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-gray-600 dark:text-gray-300 font-normal leading-relaxed tracking-[-0.01em]">
            {subtitleText}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 font-display">
            <Button asChild variant="gradient" size="lg" className="gap-2 rounded-2xl font-bold tracking-wide">
              <Link href={primaryLink}>
                {config?.primaryCtaText || "Start Free Trial"}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl font-bold tracking-wide">
              <Link href={secondaryLink}>
                {secondaryText}
              </Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: 'No-code', label: 'Easy builder' },
              { value: 'SEO-ready', label: 'Built to rank' },
              { value: 'Responsive', label: 'Every screen' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
