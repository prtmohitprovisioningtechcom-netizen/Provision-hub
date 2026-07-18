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
  const defaultTitle = 'Build Stunning Company Landing Pages';
  const defaultSubtitle = 'Create beautiful, SEO-optimized landing pages for your business. Manage products, services, leads, and reviews — all from one powerful dashboard.';
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
  
  // Split title for styling (first two words highlighted)
  const titleWords = titleText.split(' ');
  const highlightText = titleWords.slice(0, 2).join(' ');
  const restText = titleWords.slice(2).join(' ');

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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            <Sparkles className="h-4 w-4" />
            Launch your business online in minutes
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
              {highlightText}
            </span>
            {restText && (
              <>
                <br />
                <span className="text-gray-900 dark:text-white">{restText}</span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            {subtitleText}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="gradient" size="lg" className="gap-2">
              <Link href={primaryLink}>
                {config?.primaryCtaText || "Start Free Trial"}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
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
