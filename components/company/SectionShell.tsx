'use client';

import { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WaveDivider } from './WaveDivider';

export const ease = [0.22, 1, 0.36, 1] as const;

export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

export const staggerGrid: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease },
  },
};

export function SectionShell({
  id,
  tone = 'white',
  navy,
  children,
  className,
  withTopWave = false,
  withBottomWave = false,
  compact = false,
}: {
  id: string;
  tone?: 'white' | 'soft' | 'navy' | 'navySoft';
  navy: string;
  children: ReactNode;
  className?: string;
  withTopWave?: boolean;
  withBottomWave?: boolean;
  compact?: boolean;
}) {
  const bg =
    tone === 'soft'
      ? '#f4f7fb'
      : tone === 'navy'
        ? navy
        : tone === 'navySoft'
          ? undefined
          : '#ffffff';

  return (
    <motion.section
      id={id}
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className={cn('relative scroll-mt-24', className)}
      style={
        tone === 'navySoft'
          ? { background: `linear-gradient(180deg, ${navy}0f 0%, #ffffff 70%)` }
          : { backgroundColor: bg }
      }
    >
      {withTopWave && <WaveDivider fill={tone === 'soft' ? '#ffffff' : '#f4f7fb'} />}
      <div
        className={cn(
          'relative mx-auto max-w-7xl px-4 sm:px-6',
          compact ? 'py-5 md:py-7' : 'py-16 md:py-24',
        )}
      >
        {children}
      </div>
      {withBottomWave && (
        <WaveDivider fill={tone === 'white' ? '#f4f7fb' : '#ffffff'} flip />
      )}
    </motion.section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  accent,
  light = false,
  inverse = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  accent: string;
  light?: boolean;
  inverse?: boolean;
}) {
  return (
    <motion.div
      variants={cardReveal}
      className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
    >
      {eyebrow && (
        <p
          className="mb-3 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]"
          style={{ color: accent, backgroundColor: light ? 'rgba(255,255,255,0.12)' : `${accent}18` }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl',
          light || inverse ? 'text-white' : 'text-gray-950',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn('mx-auto mt-4 max-w-2xl text-base sm:text-lg', light || inverse ? 'text-white/75' : 'text-gray-500')}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
