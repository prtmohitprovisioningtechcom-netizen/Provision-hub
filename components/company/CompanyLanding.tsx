'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ILandingPageSection, IProduct, IService } from '@/types';
import { ContactForm } from './ContactForm';
import { cn, formatCurrency } from '@/lib/utils';
import { ChevronDown, Eye } from 'lucide-react';
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

function safeLandingLink(link: string | undefined, fallback: string) {
  if (!link) return fallback;
  if (link.startsWith('#') || link.startsWith('/') || link.startsWith('https://')) {
    return link;
  }
  return fallback;
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
    .filter((section) => {
      if (!section.isVisible) return false;
      if (section.type === 'services') {
        return Boolean(section.items?.length || services.length);
      }
      if (section.type === 'products') {
        return Boolean(section.items?.length || products.length);
      }
      if (section.type === 'gallery') return Boolean(section.images?.length);
      if (section.type === 'faq' || section.type === 'testimonials') {
        return Boolean(section.items?.length);
      }
      return true;
    })
    .sort((a, b) => a.order - b.order);

  if (!visibleSections.length) return null;

  const serviceNames = services.map((s) => s.name);
  const hasContactSection = visibleSections.some((section) => section.type === 'contact');

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
                className="relative min-h-150 overflow-hidden bg-gray-900 flex items-center"
              >
                {/* Background image or gradient */}
                {section.image ? (
                  <div className="absolute inset-0">
                    <Image
                      src={section.image}
                      alt={section.title}
                      fill
                      className="object-cover opacity-40"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/60 to-transparent" />
                  </div>
                ) : (
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primaryColor}, #1e1b4b)` }} />
                )}

                <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center text-white">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h2 className="mb-6 bg-linear-to-r from-white to-gray-300 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
                      {section.title}
                    </h2>
                  </motion.div>
                  {section.subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="mx-auto mt-6 max-w-2xl text-xl text-gray-200 font-light"
                    >
                      {section.subtitle}
                    </motion.p>
                  )}
                  {section.content && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="mx-auto mt-4 max-w-2xl text-md text-gray-400"
                    >
                      {section.content}
                    </motion.p>
                  )}
                  {(section.buttonText || hasContactSection) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.75 }}
                      className="mt-9"
                    >
                      <a
                        href={safeLandingLink(
                          section.buttonLink,
                          hasContactSection ? '#contact' : '/',
                        )}
                        className="inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-gray-900 shadow-xl transition hover:-translate-y-0.5 hover:bg-gray-100"
                      >
                        {section.buttonText || 'Get in touch'}
                      </a>
                    </motion.div>
                  )}
                </div>
              </motion.section>
            );

          case 'about':
            return (
              <motion.section key={section.id} {...fadeUp} className="py-24 px-4 bg-white dark:bg-gray-950 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-50 dark:bg-indigo-950/20 rounded-full blur-3xl -z-10 transform -translate-x-1/2 -translate-y-1/2" />
                <div className="mx-auto max-w-7xl grid gap-16 md:grid-cols-2 items-center">
                  <div className="space-y-6">
                    <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                      {section.title}
                    </h2>
                    {section.subtitle && (
                      <p className="text-lg font-semibold uppercase tracking-widest" style={{ color: primaryColor }}>
                        {section.subtitle}
                      </p>
                    )}
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                  {section.image && (
                    <div className="group relative aspect-4/5 overflow-hidden rounded-3xl shadow-2xl md:aspect-square">
                      <Image
                        src={section.image}
                        alt={section.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
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
                className="py-24 px-4 bg-gray-50 dark:bg-gray-900/40 relative"
              >
                <div className="mx-auto max-w-7xl">
                  <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl font-extrabold tracking-tight">{section.title}</h2>
                    {section.subtitle && (
                      <p className="mx-auto max-w-2xl text-xl text-gray-500">{section.subtitle}</p>
                    )}
                  </div>
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {(items.length
                      ? items.map((item) => ({
                          name: readField(item, 'name'),
                          description: readField(item, 'description'),
                          price: readNumber(item, 'price'),
                          image: readField(item, 'image'),
                        }))
                      : services.map((service) => ({
                          name: service.name,
                          description: service.description,
                          price: service.price,
                          image: service.gallery?.[0] || '',
                        }))
                    ).map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="group relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-950"
                        >
                          {item.image && (
                            <div className="relative -mx-8 -mt-8 mb-6 h-48 overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                          )}
                          <div className="mb-4 h-12 w-12 rounded-xl flex items-center justify-center text-white" style={{ background: primaryColor }}>
                            {/* Abstract icon based on index */}
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={i % 2 === 0 ? "M13 10V3L4 14h7v7l9-11h-7z" : "M5 13l4 4L19 7"} />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                          <p className="mt-4 text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">{item.description}</p>
                          {item.price > 0 && (
                            <p className="mt-6 text-2xl font-black" style={{ color: primaryColor }}>
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
              <motion.section key={section.id} {...fadeUp} className="py-24 px-4 relative">
                <div className="mx-auto max-w-7xl">
                  <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl font-extrabold tracking-tight">{section.title}</h2>
                    {section.subtitle && (
                      <p className="mx-auto max-w-2xl text-xl text-gray-500">{section.subtitle}</p>
                    )}
                  </div>
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {(items.length
                      ? items.map((item) => ({
                          name: readField(item, 'name'),
                          description: readField(item, 'description'),
                          images: Array.isArray(item.images)
                            ? (item.images as string[])
                            : [],
                          price: readNumber(item, 'price'),
                          offerPrice:
                            item.offerPrice != null ? readNumber(item, 'offerPrice') : undefined,
                        }))
                      : products.map((product) => ({
                          name: product.name,
                          description: product.description,
                          images: product.images,
                          price: product.price,
                          offerPrice: product.offerPrice,
                        }))
                    ).map((product, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          whileInView={{ opacity: 1, scale: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 }}
                          className="group flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="relative aspect-4/5 overflow-hidden bg-gray-100 dark:bg-gray-900">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-gray-400">
                                No image
                              </div>
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          </div>
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
                            {product.description && (
                              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500">
                                {product.description}
                              </p>
                            )}
                            <div className="mt-4 flex flex-wrap items-baseline gap-2">
                              {product.offerPrice ? (
                                <>
                                  <span className="text-2xl font-black" style={{ color: primaryColor }}>
                                    {formatCurrency(product.offerPrice)}
                                  </span>
                                  <span className="text-sm font-medium text-gray-400 line-through">
                                    {formatCurrency(product.price)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-2xl font-black" style={{ color: primaryColor }}>
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
                className="py-24 px-4 bg-gray-950 text-white relative"
              >
                <div className="mx-auto max-w-7xl">
                  <h2 className="text-4xl font-extrabold text-center mb-16">{section.title}</h2>
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {(section.images || []).map((img, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="relative overflow-hidden rounded-2xl break-inside-avoid group cursor-pointer"
                      >
                        {/* Using standard img for masonry to natural aspect ratio */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={img} 
                          alt={`Gallery ${i + 1}`} 
                          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 delay-100" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            );

          case 'testimonials':
            return (
              <motion.section key={section.id} {...fadeUp} className="py-24 px-4 bg-indigo-50/50 dark:bg-indigo-950/10">
                <div className="mx-auto max-w-7xl">
                  <h2 className="text-4xl font-extrabold text-center mb-16">{section.title}</h2>
                  {section.subtitle && (
                    <p className="-mt-12 mb-16 text-center text-lg text-gray-500">
                      {section.subtitle}
                    </p>
                  )}
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item, i) => (
                      <motion.blockquote
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="relative rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900"
                      >
                        <div className="absolute -top-4 -left-2 text-6xl text-indigo-200 dark:text-indigo-900/40 font-serif">
                          &ldquo;
                        </div>
                        <p className="relative z-10 text-lg text-gray-700 dark:text-gray-300 italic font-medium leading-relaxed">
                          {item.quote || item.comment}
                        </p>
                        <footer className="mt-8 flex items-center gap-4">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={String(item.image)}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-purple-500 font-bold text-white">
                              {(item.name || item.author || 'A').charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{item.name || item.author}</p>
                            <p className="text-sm text-gray-500">
                              {item.role || 'Verified Customer'}
                            </p>
                          </div>
                        </footer>
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
                  {section.subtitle && (
                    <p className="-mt-8 mb-12 text-center text-gray-500">
                      {section.subtitle}
                    </p>
                  )}
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
              <motion.section id="contact" key={section.id} {...fadeUp} className="scroll-mt-20 py-16 px-4">
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
