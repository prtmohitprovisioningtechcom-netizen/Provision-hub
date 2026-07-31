'use client';

import { motion } from 'framer-motion';
import { ILandingPageSection } from '@/types';

interface AboutSectionProps {
  section: ILandingPageSection;
  primaryColor: string;
}

export function AboutSection({ section, primaryColor }: AboutSectionProps) {
  const variant = section.designVariant || 'variant-1';

  // Variant 1: Image Left, Text Right (Modern Split)
  if (variant === 'variant-1') {
    return (
      <section id="about" className="py-24 px-6 bg-white overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {section.image && (
              <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="order-2 lg:order-1 relative">
                <img src={section.image} alt="About" className="rounded-[3rem] w-full h-[600px] object-cover shadow-xl" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center -z-10"></div>
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="order-1 lg:order-2">
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6 text-gray-900">{section.title}</h2>
              <p className="text-xl text-gray-500 mb-8 font-light" style={{ color: primaryColor }}>{section.subtitle}</p>
              <div className="prose prose-lg text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: section.content || '' }} />
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 2: Text Left, Grid of Images Right
  if (variant === 'variant-2') {
    return (
      <section id="about" className="py-24 px-6 bg-gray-50 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-1 w-12" style={{ backgroundColor: primaryColor }}></div>
                <h2 className="text-4xl font-bold tracking-tight text-gray-900">{section.title}</h2>
              </div>
              <p className="text-2xl text-gray-800 mb-8 font-medium leading-snug">{section.subtitle}</p>
              <div className="prose prose-lg text-gray-600 mb-10" dangerouslySetInnerHTML={{ __html: section.content || '' }} />
            </motion.div>
            
            {section.image && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative h-[600px]">
                <img src={section.image} alt="About" className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-2xl" />
                <div className="absolute -inset-4 border-2 rounded-3xl -z-10" style={{ borderColor: primaryColor, opacity: 0.3 }}></div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Variant 3: Centered Storyteller Layout
  return (
    <section id="about" className="py-32 px-6 bg-white overflow-hidden">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <h2 className="text-sm font-bold tracking-widest uppercase mb-4" style={{ color: primaryColor }}>{section.title}</h2>
          <p className="text-4xl lg:text-5xl font-serif text-gray-900 mb-12 leading-tight">
            {section.subtitle}
          </p>
        </motion.div>
        
        {section.image && (
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="mb-16">
            <img src={section.image} alt="Our Story" className="rounded-full w-64 h-64 mx-auto object-cover shadow-2xl border-8 border-gray-50" />
          </motion.div>
        )}
        
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.4 }}>
          <div className="prose prose-xl mx-auto text-gray-600 font-light leading-relaxed" dangerouslySetInnerHTML={{ __html: section.content || '' }} />
        </motion.div>
      </div>
    </section>
  );
}
