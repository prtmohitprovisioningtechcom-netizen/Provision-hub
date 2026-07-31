'use client';

import { ILandingPageSection } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Heart, Shield, Clock, Award, Star, Zap, ThumbsUp, CheckCircle } from 'lucide-react';
import { SectionShell, SectionHead } from '@/components/company/SectionShell';
import { readField } from '@/lib/read-field';

interface WhyChooseUsSectionProps {
  section: ILandingPageSection;
  primaryColor: string;
}

const WHY_ICONS = [Shield, Clock, Heart, Award, Star, Zap, ThumbsUp, CheckCircle];

const cardReveal: any = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const staggerGrid: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export function WhyChooseUsSection({ section, primaryColor }: WhyChooseUsSectionProps) {
  const items = Array.isArray(section.items) ? (section.items as Array<Record<string, unknown>>) : [];
  const variant = section.designVariant || 'variant-1';

  // ---------------------------------------------------------------------------
  // Variant 1: Clean Grid with Colorful Icons (Classic)
  // ---------------------------------------------------------------------------
  if (variant === 'variant-1') {
    return (
      <SectionShell id={section.type} tone="navySoft" navy={primaryColor} withTopWave>
        <SectionHead
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          accent="#f5b301" // gold
        />
        <motion.div
          variants={staggerGrid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {items.map((item, itemIndex) => {
            const Icon = WHY_ICONS[itemIndex % WHY_ICONS.length];
            return (
              <motion.article
                key={itemIndex}
                variants={cardReveal}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-white/70 bg-white/90 p-7 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur transition-all duration-300"
              >
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:rotate-3"
                  style={{ background: `linear-gradient(145deg, ${primaryColor}, #1a4a8c)` }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-950">
                  {readField(item, 'title')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {readField(item, 'description')}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </SectionShell>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 2: Left-Right Alternating Layout (Storytelling)
  // ---------------------------------------------------------------------------
  if (variant === 'variant-2') {
    return (
      <SectionShell id={section.type} tone="white" navy={primaryColor}>
        <SectionHead
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          accent={primaryColor}
        />
        <div className="mt-16 space-y-16">
          {items.map((item, itemIndex) => {
            const Icon = WHY_ICONS[itemIndex % WHY_ICONS.length];
            const isEven = itemIndex % 2 === 0;
            return (
              <motion.div
                key={itemIndex}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                  "flex flex-col gap-8 md:items-center",
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                )}
              >
                <div className="flex-1 md:w-1/2">
                  <div className="group relative aspect-4/3 overflow-hidden rounded-3xl bg-gray-50 shadow-2xl">
                    <div className="absolute inset-0 bg-linear-to-br from-white/40 to-transparent z-10" />
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
                      <Icon className="h-32 w-32 opacity-20 transition-transform duration-700 group-hover:scale-110" style={{ color: primaryColor }} />
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-5 md:w-1/2 md:px-12">
                  <div 
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-extrabold tracking-tight text-gray-900">
                    {readField(item, 'title')}
                  </h3>
                  <div className="h-1 w-12 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <p className="text-lg leading-relaxed text-gray-600">
                    {readField(item, 'description')}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionShell>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 3: Sleek Modern Dark Glassmorphism Cards
  // ---------------------------------------------------------------------------
  return (
    <section id={section.type} className="relative py-24 sm:py-32" style={{ backgroundColor: '#0f172a' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {section.eyebrow && (
            <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
              {section.eyebrow}
            </span>
          )}
          <h2 className="text-3xl font-black text-white sm:text-5xl tracking-tight">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="mt-6 text-lg leading-8 text-gray-300">
              {section.subtitle}
            </p>
          )}
        </div>
        <motion.div
          variants={staggerGrid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item, itemIndex) => {
            const Icon = WHY_ICONS[itemIndex % WHY_ICONS.length];
            return (
              <motion.article
                key={itemIndex}
                variants={cardReveal}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
              >
                <div 
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40" 
                  style={{ backgroundColor: primaryColor }} 
                />
                <Icon className="relative z-10 mb-6 h-10 w-10 text-white opacity-80" />
                <h3 className="relative z-10 text-xl font-bold text-white">
                  {readField(item, 'title')}
                </h3>
                <p className="relative z-10 mt-3 text-sm leading-relaxed text-gray-300">
                  {readField(item, 'description')}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
