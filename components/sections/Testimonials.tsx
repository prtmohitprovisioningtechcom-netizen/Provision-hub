'use client';

import { ILandingPageSection } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SectionShell, SectionHead } from '@/components/company/SectionShell';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { readField } from '@/lib/read-field';
import { WaveDivider } from '@/components/company/WaveDivider';
import { useState } from 'react';

interface TestimonialsSectionProps {
  section: ILandingPageSection;
  primaryColor: string;
}

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

export function TestimonialsSection({ section, primaryColor }: TestimonialsSectionProps) {
  const items = Array.isArray(section.items) ? (section.items as Array<Record<string, unknown>>) : [];
  const variant = section.designVariant || 'variant-1';
  const [activeIndex, setActiveIndex] = useState(0);

  if (items.length === 0) return null;

  // ---------------------------------------------------------------------------
  // Variant 1: Slider Carousel with Large Quotes
  // ---------------------------------------------------------------------------
  if (variant === 'variant-1') {
    const activeItem = items[activeIndex];
    const name = readField(activeItem, 'name') || readField(activeItem, 'author') || 'Anonymous';
    const role = readField(activeItem, 'role') || 'Customer';
    const comment = readField(activeItem, 'quote') || readField(activeItem, 'comment') || readField(activeItem, 'content');
    
    return (
      <SectionShell id={section.type} tone="white" navy={primaryColor}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div>
              {section.eyebrow && (
                <p className="mb-4 text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
                  {section.eyebrow}
                </p>
              )}
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl lg:text-6xl tracking-tight leading-tight mb-6">
                {section.title}
              </h2>
              {section.subtitle && (
                <p className="text-lg text-gray-600 mb-8 max-w-lg">
                  {section.subtitle}
                </p>
              )}
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveIndex((prev) => (prev - 1 + items.length) % items.length)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setActiveIndex((prev) => (prev + 1) % items.length)}
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:brightness-110 shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="relative">
              <Quote className="absolute -top-10 -left-10 h-32 w-32 text-gray-100 -z-10 rotate-180" />
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl bg-white p-8 sm:p-12 shadow-2xl ring-1 ring-gray-100"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5" style={{ color: '#f5b301', fill: '#f5b301' }} />
                  ))}
                </div>
                <p className="text-xl sm:text-2xl leading-relaxed text-gray-700 italic mb-10">
                  "{comment}"
                </p>
                <div className="flex items-center gap-4">
                  <div 
                    className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white shadow-inner"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{name}</h4>
                    <p className="text-gray-500">{role}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 2: Classic Grid of Review Cards
  // ---------------------------------------------------------------------------
  if (variant === 'variant-2') {
    return (
      <section id={section.type} className="relative scroll-mt-24">
        <WaveDivider fill={primaryColor} />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="px-4 py-24 sm:px-6"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="mx-auto max-w-7xl">
            <SectionHead
              eyebrow={section.eyebrow}
              title={section.title}
              subtitle={section.subtitle}
              accent="#f5b301" // gold
              inverse
            />
            <motion.div
              variants={staggerGrid}
              className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {items.map((item, i) => {
                const name = readField(item, 'name') || readField(item, 'author') || 'Anonymous';
                const role = readField(item, 'role') || 'Customer';
                const comment = readField(item, 'quote') || readField(item, 'comment') || readField(item, 'content');

                return (
                  <motion.blockquote
                    key={i}
                    variants={cardReveal}
                    className="flex flex-col rounded-2xl bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-1"
                  >
                    <div className="mb-5 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4"
                          style={{ color: primaryColor, fill: primaryColor }}
                        />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700 italic flex-1">
                      “{comment}”
                    </p>
                    <footer className="mt-8 flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full font-bold text-white shadow-md"
                        style={{ backgroundColor: '#f5b301' }}
                      >
                        {name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-950">{name}</p>
                        <p className="text-xs text-gray-500">{role}</p>
                      </div>
                    </footer>
                  </motion.blockquote>
                );
              })}
            </motion.div>
          </div>
        </motion.div>
        <WaveDivider fill="#ffffff" flip />
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 3: Masonry / Pinterest Style Layout with Dark Mode
  // ---------------------------------------------------------------------------
  return (
    <SectionShell id={section.type} tone="navySoft" navy={primaryColor} withTopWave>
      <div className="text-center max-w-3xl mx-auto mb-16">
        {section.eyebrow && (
          <span className="mb-4 inline-block rounded-full bg-white/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-700 backdrop-blur-md">
            {section.eyebrow}
          </span>
        )}
        <h2 className="text-4xl font-black text-gray-900 sm:text-5xl tracking-tight">
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="mt-6 text-lg text-gray-600">
            {section.subtitle}
          </p>
        )}
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
        {items.map((item, i) => {
          const name = readField(item, 'name') || readField(item, 'author') || 'Anonymous';
          const role = readField(item, 'role') || 'Customer';
          const comment = readField(item, 'quote') || readField(item, 'comment') || readField(item, 'content');
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="break-inside-avoid relative rounded-3xl bg-[#0f172a] p-8 shadow-xl text-white group"
            >
              <div 
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{ backgroundColor: primaryColor }}
              />
              <Quote className="h-10 w-10 text-white/20 mb-6 rotate-180" />
              <p className="text-lg leading-relaxed text-gray-300 mb-8 relative z-10">
                "{comment}"
              </p>
              
              <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
                <div>
                  <p className="font-bold text-white text-lg">{name}</p>
                  <p className="text-sm text-gray-400">{role}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" style={{ color: '#f5b301', fill: '#f5b301' }} />
                  <span className="text-sm font-bold ml-1">5.0</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}
