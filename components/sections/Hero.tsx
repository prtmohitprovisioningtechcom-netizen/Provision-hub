'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ILandingPageSection } from '@/types';

interface HeroSectionProps {
  section: ILandingPageSection;
  primaryColor: string;
}

export function HeroSection({ section, primaryColor }: HeroSectionProps) {
  const variant = section.designVariant || 'variant-1';

  // Variant 1: Modern Split (Text Left, Image Right with Blob/Border)
  if (variant === 'variant-1') {
    return (
      <section id="hero" className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 px-6 overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              {section.eyebrow && (
                <span 
                  className="inline-block py-1 px-3 rounded-full bg-white shadow-sm text-sm font-bold tracking-widest mb-6" 
                  style={{ color: primaryColor }}
                >
                  {section.eyebrow}
                </span>
              )}
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-6">
                {section.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg leading-relaxed">
                {section.subtitle}
              </p>
              {section.buttonText && (
                <a
                  href={section.buttonLink || '#contact'}
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white rounded-full transition hover:scale-105 shadow-xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  {section.buttonText}
                  <ArrowRight className="w-5 h-5" />
                </a>
              )}
            </motion.div>
            
            {section.image && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <div className="relative">
                  <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-3xl" style={{ backgroundColor: primaryColor, opacity: 0.2 }}></div>
                  <img
                    src={section.image}
                    alt="Hero"
                    className="relative z-10 rounded-3xl w-full h-auto object-cover shadow-2xl"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Variant 2: Centered Hero with Background Image Overlay
  if (variant === 'variant-2') {
    return (
      <section id="hero" className="relative pt-32 pb-40 px-6 flex items-center justify-center min-h-[80vh] overflow-hidden">
        {section.image && (
          <div className="absolute inset-0 z-0">
            <img src={section.image} alt="Hero Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
          </div>
        )}
        <div className="relative z-10 mx-auto max-w-4xl text-center text-white">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {section.eyebrow && (
              <span className="inline-block py-1 px-4 rounded-full bg-white/10 backdrop-blur-sm text-sm font-bold tracking-widest mb-6 border border-white/20">
                {section.eyebrow}
              </span>
            )}
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight mb-6">
              {section.title}
            </h1>
            <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              {section.subtitle}
            </p>
            {section.buttonText && (
              <a
                href={section.buttonLink || '#contact'}
                className="inline-flex items-center gap-2 px-10 py-4 text-base font-bold text-white rounded-full transition hover:scale-105 shadow-xl"
                style={{ backgroundColor: primaryColor }}
              >
                {section.buttonText}
                <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  // Variant 3: Clean Minimalist Center (No Background Image, large typography)
  return (
    <section id="hero" className="relative pt-32 pb-24 px-6 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {section.eyebrow && (
            <p className="text-sm font-bold tracking-widest uppercase mb-4" style={{ color: primaryColor }}>
              {section.eyebrow}
            </p>
          )}
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-none mb-8">
            {section.title}
          </h1>
          <p className="text-2xl text-gray-500 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            {section.subtitle}
          </p>
          {section.buttonText && (
            <a
              href={section.buttonLink || '#contact'}
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-white transition hover:opacity-90 rounded-xl"
              style={{ backgroundColor: primaryColor }}
            >
              {section.buttonText}
            </a>
          )}
        </motion.div>
        
        {section.image && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-16">
            <img
              src={section.image}
              alt="Hero"
              className="rounded-[2rem] w-full h-[60vh] object-cover shadow-2xl"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
