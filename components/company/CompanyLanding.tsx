'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ILandingPageSection, IProduct, IService } from '@/types';
import { ContactForm } from './ContactForm';
import { cn, formatCurrency } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CompanyLandingProps {
  sections: ILandingPageSection[];
  companyId: string;
  companyName: string;
  products?: IProduct[];
  services?: IService[];
  primaryColor?: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 },
};

function readField(item: Record<string, unknown>, key: string): string {
  const value = item[key];
  return value != null ? String(value) : '';
}

function readNumber(item: Record<string, unknown>, key: string): number {
  const value = item[key];
  return typeof value === 'number' ? value : Number(value ?? 0);
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left font-medium"
      >
        {question}
        <ChevronDown className={cn('h-5 w-5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <p className="pb-4 text-gray-600 dark:text-gray-400">{answer}</p>}
    </div>
  );
}

export function CompanyLanding({
  sections,
  companyId,
  companyName,
  products = [],
  services = [],
  primaryColor = '#6366f1',
}: CompanyLandingProps) {
  const visibleSections = [...sections]
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  if (!visibleSections.length) return null;

  const serviceNames = services.map((s) => s.name);

  return (
    <div className="space-y-0">
      {visibleSections.map((section, index) => {
        const items = (section.items || []) as Array<Record<string, string>>;

        switch (section.type) {
          case 'hero':
            return (
              <motion.section
                key={section.id}
                {...fadeUp}
                className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 to-purple-700 text-white"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)` }}
              >
                <div className="grid gap-8 p-8 md:grid-cols-2 md:p-12 lg:p-16">
                  <div className="flex flex-col justify-center">
                    <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">{section.title}</h2>
                    {section.subtitle && (
                      <p className="mt-4 text-lg text-white/90">{section.subtitle}</p>
                    )}
                    {section.content && (
                      <p className="mt-4 text-white/80">{section.content}</p>
                    )}
                  </div>
                  {section.image && (
                    <div className="relative aspect-video overflow-hidden rounded-xl">
                      <Image
                        src={section.image}
                        alt={section.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  )}
                </div>
              </motion.section>
            );

          case 'about':
            return (
              <motion.section key={section.id} {...fadeUp} className="py-16 px-4">
                <div className="mx-auto max-w-6xl grid gap-10 md:grid-cols-2 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
                    {section.subtitle && (
                      <p className="text-indigo-600 font-medium mb-4">{section.subtitle}</p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                  {section.image && (
                    <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
                      <Image
                        src={section.image}
                        alt={section.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </motion.section>
            );

          case 'services':
            return (
              <motion.section
                key={section.id}
                {...fadeUp}
                className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50"
              >
                <div className="mx-auto max-w-6xl">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">{section.title}</h2>
                    {section.subtitle && (
                      <p className="mt-2 text-gray-500">{section.subtitle}</p>
                    )}
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {(items.length
                      ? items.map((item) => ({
                          name: readField(item, 'name'),
                          description: readField(item, 'description'),
                          price: readNumber(item, 'price'),
                        }))
                      : services.map((service) => ({
                          name: service.name,
                          description: service.description,
                          price: service.price,
                        }))
                    ).map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                        >
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="mt-2 text-sm text-gray-500 line-clamp-3">{item.description}</p>
                          {item.price > 0 && (
                            <p className="mt-4 font-bold" style={{ color: primaryColor }}>
                              {formatCurrency(item.price)}
                            </p>
                          )}
                        </motion.div>
                      ))}
                  </div>
                </div>
              </motion.section>
            );

          case 'products':
            return (
              <motion.section key={section.id} {...fadeUp} className="py-16 px-4">
                <div className="mx-auto max-w-6xl">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">{section.title}</h2>
                    {section.subtitle && (
                      <p className="mt-2 text-gray-500">{section.subtitle}</p>
                    )}
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {(items.length
                      ? items.map((item) => ({
                          name: readField(item, 'name'),
                          images: Array.isArray(item.images)
                            ? (item.images as string[])
                            : [],
                          price: readNumber(item, 'price'),
                          offerPrice:
                            item.offerPrice != null ? readNumber(item, 'offerPrice') : undefined,
                        }))
                      : products.map((product) => ({
                          name: product.name,
                          images: product.images,
                          price: product.price,
                          offerPrice: product.offerPrice,
                        }))
                    ).map((product, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 }}
                          className="group overflow-hidden rounded-xl border bg-white dark:border-gray-800 dark:bg-gray-900"
                        >
                          <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-gray-400">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium truncate">{product.name}</h3>
                            <div className="mt-2 flex items-center gap-2">
                              {product.offerPrice ? (
                                <>
                                  <span className="font-bold" style={{ color: primaryColor }}>
                                    {formatCurrency(product.offerPrice)}
                                  </span>
                                  <span className="text-sm text-gray-400 line-through">
                                    {formatCurrency(product.price)}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold" style={{ color: primaryColor }}>
                                  {formatCurrency(product.price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </motion.section>
            );

          case 'gallery':
            return (
              <motion.section
                key={section.id}
                {...fadeUp}
                className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50"
              >
                <div className="mx-auto max-w-6xl">
                  <h2 className="text-3xl font-bold text-center mb-12">{section.title}</h2>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {(section.images || []).map((img, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="relative aspect-square overflow-hidden rounded-xl"
                      >
                        <Image
                          src={img}
                          alt={`Gallery ${i + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            );

          case 'testimonials':
            return (
              <motion.section key={section.id} {...fadeUp} className="py-16 px-4">
                <div className="mx-auto max-w-6xl">
                  <h2 className="text-3xl font-bold text-center mb-12">{section.title}</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item, i) => (
                      <motion.blockquote
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-xl border p-6 dark:border-gray-800"
                      >
                        <p className="text-gray-600 dark:text-gray-400 italic">
                          &ldquo;{item.quote || item.comment}&rdquo;
                        </p>
                        <footer className="mt-4 font-medium">{item.name || item.author}</footer>
                      </motion.blockquote>
                    ))}
                  </div>
                </div>
              </motion.section>
            );

          case 'faq':
            return (
              <motion.section
                key={section.id}
                {...fadeUp}
                className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50"
              >
                <div className="mx-auto max-w-3xl">
                  <h2 className="text-3xl font-bold text-center mb-12">{section.title}</h2>
                  <div>
                    {items.map((item, i) => (
                      <FAQItem
                        key={i}
                        question={String(item.question || item.title || '')}
                        answer={String(item.answer || item.content || '')}
                      />
                    ))}
                  </div>
                </div>
              </motion.section>
            );

          case 'contact':
            return (
              <motion.section key={section.id} {...fadeUp} className="py-16 px-4">
                <div className="mx-auto max-w-2xl">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold">{section.title}</h2>
                    {section.subtitle && (
                      <p className="mt-2 text-gray-500">{section.subtitle}</p>
                    )}
                  </div>
                  <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <ContactForm companyId={companyId} services={serviceNames} />
                  </div>
                </div>
              </motion.section>
            );

          case 'footer':
            return (
              <motion.footer
                key={section.id}
                {...fadeUp}
                className="py-8 px-4 border-t dark:border-gray-800 text-center text-gray-500"
              >
                <p>{section.content || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}</p>
              </motion.footer>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
