'use client';

import { motion } from 'framer-motion';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQConfig {
  title: string;
  subtitle: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQ({ config }: { config?: FAQConfig }) {
  const defaultFaqs = [
    {
      question: 'How quickly can I set up my landing page?',
      answer: 'You can have a professional landing page live in under 10 minutes. Register your company, customize sections, and publish.',
    },
    {
      question: 'Can I use my own domain?',
      answer: 'Yes! Starter plans and above include custom domain support. Connect your domain in the settings dashboard.',
    },
    {
      question: 'Is there a free plan available?',
      answer: 'Absolutely. Our free plan includes a basic landing page, up to 5 products, 3 services, and basic analytics.',
    },
    {
      question: 'How does lead management work?',
      answer: 'When customers submit enquiries through your landing page, leads are saved to your dashboard with email notifications.',
    },
    {
      question: 'Can customers leave reviews?',
      answer: 'Yes. Registered customers can leave reviews with ratings and images. You approve reviews before they appear publicly.',
    },
  ];

  const title = config?.title || 'Frequently Asked Questions';
  const subtitle = config?.subtitle || '';
  const items = config?.items && config.items.length > 0 ? config.items : defaultFaqs;

  return (
    <section id="faq" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        <Accordion.Root type="single" collapsible className="space-y-4">
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
                className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 overflow-hidden"
              >
                <Accordion.Trigger className="flex w-full items-center justify-between p-5 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                  {faq.question}
                  <ChevronDown className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="px-5 pb-5 text-gray-600 dark:text-gray-400">{faq.answer}</div>
                </Accordion.Content>
              </Accordion.Item>
            </motion.div>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
