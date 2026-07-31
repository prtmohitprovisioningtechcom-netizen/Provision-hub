'use client';

import { useState } from 'react';
import { ILandingPageSection } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SectionShell, SectionHead } from '@/components/company/SectionShell';
import { readField } from '@/lib/read-field';
import { ChevronDown, Plus, Minus, HelpCircle } from 'lucide-react';

interface FAQSectionProps {
  section: ILandingPageSection;
  primaryColor: string;
}

const staggerGrid: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardReveal: any = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

function AccordionItem({
  question,
  answer,
  isOpen,
  onClick,
  primaryColor,
  variant = 'classic'
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  primaryColor: string;
  variant?: 'classic' | 'modern';
}) {
  if (variant === 'modern') {
    return (
      <div 
        className={cn(
          "overflow-hidden rounded-2xl transition-all duration-300",
          isOpen ? "bg-white shadow-xl ring-1 ring-gray-100" : "bg-gray-50 hover:bg-white hover:shadow-md"
        )}
      >
        <button
          onClick={onClick}
          className="flex w-full items-center justify-between p-6 text-left"
        >
          <span className="text-lg font-bold text-gray-900 pr-8">{question}</span>
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
              isOpen ? "rotate-180 text-white shadow-md" : "bg-gray-200 text-gray-600"
            )}
            style={{ backgroundColor: isOpen ? primaryColor : undefined }}
          >
            <ChevronDown className="h-5 w-5" />
          </span>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="px-6 pb-6 pt-2 text-gray-600 leading-relaxed">
                {answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-6 text-left group"
      >
        <span className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
          {question}
        </span>
        <span
          className="ml-6 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-transform duration-300"
          style={{ 
            borderColor: isOpen ? primaryColor : '#e5e7eb',
            color: isOpen ? primaryColor : '#9ca3af',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' 
          }}
        >
          <Plus className="h-4 w-4" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="pb-6 text-gray-600 leading-relaxed pr-12">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection({ section, primaryColor }: FAQSectionProps) {
  const items = Array.isArray(section.items) ? (section.items as Array<Record<string, unknown>>) : [];
  const variant = section.designVariant || 'variant-1';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) return null;

  // ---------------------------------------------------------------------------
  // Variant 1: Classic Accordion
  // ---------------------------------------------------------------------------
  if (variant === 'variant-1') {
    return (
      <SectionShell id={section.type} tone="white" navy={primaryColor}>
        <SectionHead
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          accent="#f5b301"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl mt-12 rounded-3xl bg-white p-8 sm:p-12 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100"
        >
          {items.map((item, i) => {
            const question = readField(item, 'question') || readField(item, 'title') || '';
            const answer = readField(item, 'answer') || readField(item, 'content') || '';
            return (
              <AccordionItem
                key={i}
                question={question}
                answer={answer}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                primaryColor={primaryColor}
                variant="classic"
              />
            );
          })}
        </motion.div>
      </SectionShell>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 2: Side-by-Side (Questions on Left, Answers on Right)
  // ---------------------------------------------------------------------------
  if (variant === 'variant-2') {
    return (
      <SectionShell id={section.type} tone="soft" navy={primaryColor}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
            <div className="lg:col-span-5 lg:pr-8">
              <div className="sticky top-32">
                {section.eyebrow && (
                  <span className="mb-4 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: primaryColor }}>
                    {section.eyebrow}
                  </span>
                )}
                <h2 className="text-3xl font-black text-gray-900 sm:text-5xl tracking-tight mb-6">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    {section.subtitle}
                  </p>
                )}
                <div className="hidden lg:block w-32 h-1 rounded-full bg-gray-200" />
              </div>
            </div>
            
            <div className="lg:col-span-7">
              <div className="space-y-4">
                {items.map((item, i) => {
                  const question = readField(item, 'question') || readField(item, 'title') || '';
                  const answer = readField(item, 'answer') || readField(item, 'content') || '';
                  return (
                    <AccordionItem
                      key={i}
                      question={question}
                      answer={answer}
                      isOpen={openIndex === i}
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      primaryColor={primaryColor}
                      variant="modern"
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 3: Grid of Cards for Quick Reading
  // ---------------------------------------------------------------------------
  return (
    <SectionShell id={section.type} tone="navySoft" navy={primaryColor} withTopWave>
      <div className="text-center max-w-3xl mx-auto mb-16">
        {section.eyebrow && (
          <span className="mb-4 inline-block rounded-full bg-white/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-700 backdrop-blur-md">
            {section.eyebrow}
          </span>
        )}
        <h2 className="text-3xl font-black text-gray-900 sm:text-5xl tracking-tight">
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="mt-6 text-lg text-gray-600">
            {section.subtitle}
          </p>
        )}
      </div>

      <motion.div
        variants={staggerGrid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4 sm:px-6"
      >
        {items.map((item, i) => {
          const question = readField(item, 'question') || readField(item, 'title') || '';
          const answer = readField(item, 'answer') || readField(item, 'content') || '';
          return (
            <motion.article
              key={i}
              variants={cardReveal}
              whileHover={{ y: -6 }}
              className="flex flex-col rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5"
            >
              <div 
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {question}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {answer}
              </p>
            </motion.article>
          );
        })}
      </motion.div>
    </SectionShell>
  );
}
