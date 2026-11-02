'use client';

import { motion } from 'framer-motion';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FAQConfig {
  title?: string;
  subtitle?: string;
  items?: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQ({ config }: { config?: FAQConfig }) {
  const { t } = useLanguage();

  const defaultFaqs = [
    {
      question: t('faq.q1'),
      answer: t('faq.a1'),
    },
    {
      question: t('faq.q2'),
      answer: t('faq.a2'),
    },
    {
      question: t('faq.q3'),
      answer: t('faq.a3'),
    },
    {
      question: t('faq.q4'),
      answer: t('faq.a4'),
    },
    {
      question: t('faq.q5'),
      answer: t('faq.a5'),
    },
  ];

  const title = t('faq.title');
  const subtitle = t('faq.subtitle');
  const items = defaultFaqs;

  return (
    <section id="faq" className="py-10 sm:py-16 bg-slate-50/70 dark:bg-gray-900/60 border-t border-gray-200/80 dark:border-gray-800/80">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-10"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 mb-2.5 shadow-2xs">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{t('faq.badge')}</span>
          </div>
          <h2 className="text-3xl font-black sm:text-4xl text-gray-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        <Accordion.Root type="single" collapsible className="space-y-3.5">
          {items.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Accordion.Item
                value={`item-${i}`}
                className="rounded-2xl border border-gray-200/90 bg-white dark:border-gray-800/90 dark:bg-gray-950/90 overflow-hidden shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <Accordion.Trigger className="flex w-full items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-gray-900 dark:text-white hover:bg-gray-50/60 dark:hover:bg-gray-900/60 transition-colors group cursor-pointer">
                  <span>{faq.question}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-indigo-600 transition-transform group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800/80 pt-3">
                    {faq.answer}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </motion.div>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
