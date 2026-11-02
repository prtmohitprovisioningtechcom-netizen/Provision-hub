'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function WatchHero({
  config,
  showTemplates = true,
}: {
  config?: {
    title?: string;
    subtitle?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
  };
  showTemplates?: boolean;
}) {
  const { t } = useLanguage();

  const titleLine1 = t('hero.titleLine1');
  const titleLine2 = t('hero.titleLine2');
  const subtitleText = t('hero.subtitle');
  const badgeText = t('hero.badge');

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

  const primaryText = t('hero.startTrial');
  const secondaryText =
    secondaryLink === '#templates' ? t('hero.availableThemes') : 'Browse Companies';

  return (
    <section className="relative overflow-hidden min-h-[480px] sm:min-h-[560px] lg:min-h-[640px] flex items-center py-6 sm:py-10 lg:py-14">
      {/* 1. Full Hero Background Image - Positioned from top right so head/store are NEVER cut by navbar */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-700 select-none"
        style={{
          backgroundImage: "url('/hero-vyapari-bg.jpg')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'right 0% top 0%',
        }}
      />

      {/* 2. Responsive Scrim: Smooth left-to-right fade leaving merchant vivid and text 100% readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 sm:via-slate-950/55 lg:via-slate-950/25 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent sm:hidden pointer-events-none" />
      
      {/* Bottom feathering into VyapariTicker */}
      <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none" />

      {/* Subtle Ambient Accent Glow Behind Left Text */}
      <div className="absolute top-1/4 left-4 sm:left-12 w-64 sm:w-96 h-64 sm:h-96 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-6 left-1/4 w-48 sm:w-80 h-48 sm:h-80 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

      {/* 3. Hero Content Container: Strictly One-Sided (Left-Aligned), 100% Responsive */}
      <div className="relative z-10 mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left Column: Headline, Subtitle, CTAs & Features */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-8 xl:col-span-7 flex flex-col items-start text-left max-w-full"
          >
            {/* Live Glowing Beacon Badge */}
            <div className="mb-2.5 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-slate-900/85 backdrop-blur-md px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm text-amber-300 font-bold shadow-lg shadow-black/40 max-w-full">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs sm:text-sm select-none shrink-0">🇮🇳</span>
              <span className="leading-snug tracking-wide font-medium break-words text-amber-200">
                {badgeText}
              </span>
            </div>

            {/* 3D Cursive Flowing Headline - Strictly 2 Lines, Responsive Fluid Font */}
            <h1 className="font-cursive text-[clamp(1.45rem,5.6vw,4.25rem)] font-bold leading-[1.18] sm:leading-[1.12] tracking-tight py-0.5 sm:py-1 select-none text-left max-w-full overflow-hidden">
              <span className="block whitespace-nowrap bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent text-3d-gradient animate-gradient-flow pr-2 drop-shadow-md">
                {titleLine1}
              </span>
              <span className="block whitespace-nowrap text-white text-3d-solid pr-2 mt-0.5 sm:mt-1 drop-shadow-lg">
                {titleLine2}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-2 sm:mt-3.5 max-w-xl text-left text-xs sm:text-base md:text-lg leading-relaxed text-slate-200/90 font-normal tracking-[-0.01em] drop-shadow-sm">
              {subtitleText}
            </p>

            {/* CTAs: Side-by-side on Mobile and Desktop */}
            <div className="mt-3.5 sm:mt-6 flex flex-row items-center justify-start gap-2 sm:gap-3.5 w-full sm:w-auto font-display">
              <Button
                asChild
                variant="gradient"
                className="flex-1 sm:flex-initial h-10 sm:h-12 rounded-xl sm:rounded-2xl px-3 sm:px-7 font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 hover:scale-[1.02] active:scale-95 transition-all tracking-tight sm:tracking-wide shrink-0 border border-indigo-400/30"
              >
                <Link href={primaryLink} className="inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300 shrink-0" />
                  <span>{primaryText}</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="flex-1 sm:flex-initial h-10 sm:h-12 rounded-xl sm:rounded-2xl border-white/20 bg-slate-900/75 backdrop-blur-md px-3 sm:px-6 font-bold text-xs sm:text-sm text-white hover:bg-slate-800/90 hover:border-amber-400/50 shadow-md hover:scale-[1.02] active:scale-95 transition-all tracking-tight sm:tracking-wide shrink-0"
              >
                <Link href={secondaryLink} className="inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap">
                  <span>🎨</span>
                  <span>{secondaryText}</span>
                </Link>
              </Button>
            </div>

            {/* Trust Indicator */}
            <div className="mt-2.5 sm:mt-4 flex items-center justify-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-slate-300/90 tracking-tight flex-wrap text-left">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{t('hero.trialNote')}</span>
            </div>

            {/* 3 Glassmorphic Feature Cards (Aligned Left) */}
            <div className="mt-4 sm:mt-7 grid grid-cols-3 gap-1.5 sm:gap-3 w-full max-w-lg">
              {[
                { value: t('hero.stat1.val'), label: t('hero.stat1.lbl'), emoji: '🎨' },
                { value: t('hero.stat2.val'), label: t('hero.stat2.lbl'), emoji: '⚡' },
                { value: t('hero.stat3.val'), label: t('hero.stat3.lbl'), emoji: '⭐' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl sm:rounded-2xl border border-white/15 bg-slate-900/60 p-2 sm:p-2.5 backdrop-blur-md shadow-md hover:border-amber-400/40 hover:bg-slate-900/80 transition-all text-left"
                >
                  <div className="font-display text-xs sm:text-sm md:text-base font-extrabold text-amber-300 flex items-center justify-start gap-1 tracking-tight">
                    <span className="text-xs sm:text-sm select-none">{stat.emoji}</span>
                    <span>{stat.value}</span>
                  </div>
                  <div className="text-[9px] sm:text-xs text-slate-300 font-medium leading-snug mt-0.5 tracking-tight line-clamp-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Open space to highlight the merchant and store visual */}
          <div className="hidden lg:flex lg:col-span-4 xl:col-span-5 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
