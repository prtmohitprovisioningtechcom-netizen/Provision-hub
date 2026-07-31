'use client';

import { ILandingPageSection } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SectionShell, SectionHead } from '@/components/company/SectionShell';
import { NewsletterForm } from '@/components/company/NewsletterForm';
import { WaveDivider } from '@/components/company/WaveDivider';
import { Mail, Send } from 'lucide-react';

interface SubscribeSectionProps {
  section: ILandingPageSection;
  primaryColor: string;
  companyId: string;
}

export function SubscribeSection({ section, primaryColor, companyId }: SubscribeSectionProps) {
  const variant = section.designVariant || 'variant-1';

  // ---------------------------------------------------------------------------
  // Variant 1: Simple Centered Form with Vibrant Background
  // ---------------------------------------------------------------------------
  if (variant === 'variant-1') {
    return (
      <section id={section.type} className="relative scroll-mt-24">
        <WaveDivider fill={primaryColor} />
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden px-4 py-24 text-center text-white sm:px-6"
          style={{ backgroundColor: primaryColor }}
        >
          <div
            className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
            style={{ backgroundColor: '#f5b301' }}
          />
          <div className="relative mx-auto max-w-3xl">
            {section.eyebrow && (
              <span className="mb-6 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
                {section.eyebrow}
              </span>
            )}
            <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="mx-auto mt-4 mb-10 max-w-2xl text-lg text-white/90">
                {section.subtitle}
              </p>
            )}
            
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-md max-w-xl mx-auto shadow-2xl">
              <NewsletterForm
                companyId={companyId}
                buttonText={section.buttonText || undefined}
                placeholder={section.placeholder || undefined}
                primaryColor={primaryColor}
              />
            </div>
            
            {section.note?.trim() && (
              <p className="mt-6 text-sm font-medium text-white/70">{section.note}</p>
            )}
          </div>
        </motion.div>
        <WaveDivider fill="#f4f7fb" flip />
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 2: Split Layout (Text Left, Floating Form Right)
  // ---------------------------------------------------------------------------
  if (variant === 'variant-2') {
    return (
      <SectionShell id={section.type} tone="white" navy={primaryColor} withTopWave>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-gray-900 grid lg:grid-cols-2 relative">
            
            {/* Background elements */}
            <div className="absolute inset-0 opacity-20" 
                 style={{ 
                   backgroundImage: 'radial-gradient(circle at 100% 0%, #ffffff 0%, transparent 50%)',
                 }} 
            />
            
            <div className="p-12 lg:p-16 flex flex-col justify-center relative z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl mb-8" style={{ backgroundColor: primaryColor }}>
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
                {section.title}
              </h2>
              {section.subtitle && (
                <p className="text-lg text-gray-300 mb-8 max-w-md leading-relaxed">
                  {section.subtitle}
                </p>
              )}
              {section.note?.trim() && (
                <div className="mt-auto pt-8 border-t border-white/10">
                  <p className="text-sm font-medium text-gray-400">{section.note}</p>
                </div>
              )}
            </div>
            
            <div className="p-8 sm:p-12 lg:p-16 flex items-center bg-gray-800/50 backdrop-blur-sm relative z-10 border-t lg:border-t-0 lg:border-l border-white/10">
              <div className="w-full max-w-md mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Subscribe Now</h3>
                  <p className="text-gray-400">Join our newsletter to stay updated.</p>
                </div>
                
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                  <NewsletterForm
                    companyId={companyId}
                    buttonText={section.buttonText || undefined}
                    placeholder={section.placeholder || undefined}
                    primaryColor={primaryColor}
                  />
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </SectionShell>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 3: Minimalist Dark Mode Form with Glowing Inputs
  // ---------------------------------------------------------------------------
  return (
    <SectionShell id={section.type} tone="navySoft" navy={primaryColor} withBottomWave>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-[3rem] bg-[#0f172a] p-10 sm:p-16 text-center shadow-2xl ring-1 ring-white/10 overflow-hidden relative"
        >
          {/* Glowing orbs */}
          <div 
            className="absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-30 blur-[80px]" 
            style={{ backgroundColor: primaryColor }} 
          />
          <div 
            className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full opacity-20 blur-[80px]" 
            style={{ backgroundColor: '#f5b301' }} 
          />
          
          <div className="relative z-10">
            {section.eyebrow && (
              <span className="mb-6 inline-block text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
                {section.eyebrow}
              </span>
            )}
            <h2 className="text-3xl font-black text-white sm:text-5xl tracking-tight mb-6">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="mx-auto max-w-2xl text-lg text-gray-400 mb-12">
                {section.subtitle}
              </p>
            )}
            
            <div className="max-w-xl mx-auto">
              {/* Note: We rely on NewsletterForm to render the actual inputs, but we've placed it in a dark mode context */}
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-xl">
                <NewsletterForm
                  companyId={companyId}
                  buttonText={section.buttonText || undefined}
                  placeholder={section.placeholder || undefined}
                  primaryColor={primaryColor}
                />
              </div>
            </div>
            
            {section.note?.trim() && (
              <p className="mt-8 text-sm font-medium text-gray-500">{section.note}</p>
            )}
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}
