'use client';

import Image from 'next/image';
import { ILandingPageSection } from '@/types';
import { motion } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import { SectionShell, SectionHead } from '@/components/company/SectionShell';
import { readField, readNumber } from '@/lib/read-field';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface ProductsSectionProps {
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

function safeLandingLink(link: string | undefined | null, fallback = '#contact') {
  if (!link) return fallback;
  if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:')) {
    return link;
  }
  return link.startsWith('#') ? link : `#${link}`;
}

export function ProductsSection({ section, primaryColor }: ProductsSectionProps) {
  const items = Array.isArray(section.items) ? (section.items as Array<Record<string, unknown>>) : [];
  const variant = section.designVariant || 'variant-1';

  // ---------------------------------------------------------------------------
  // Variant 1: Clean E-commerce Grid (Classic)
  // ---------------------------------------------------------------------------
  if (variant === 'variant-1') {
    return (
      <SectionShell id={section.type} tone="soft" navy={primaryColor}>
        <SectionHead
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          accent="#f5b301"
        />
        <motion.div
          variants={staggerGrid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-7 md:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item, i) => {
            const name = readField(item, 'name');
            const description = readField(item, 'description');
            const images = Array.isArray(item.images) ? (item.images as string[]) : [];
            const price = readNumber(item, 'price');
            const offerPrice = item.offerPrice != null ? readNumber(item, 'offerPrice') : undefined;
            const itemLink = readField(item, 'link') || section.buttonLink || '';
            const itemCta = readField(item, 'buttonText') || section.buttonText || '';

            return (
              <motion.article
                key={i}
                variants={cardReveal}
                whileHover={{ y: -8 }}
                className="group overflow-hidden rounded-2xl bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] ring-1 ring-gray-100 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-gray-100">
                  {images[0] ? (
                    <Image
                      src={images[0]}
                      alt={name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-50">
                      <ShoppingBag className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  {offerPrice && (
                    <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                      Sale
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-950">{name}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-600">{description}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div>
                      {offerPrice ? (
                        <>
                          <span className="text-xl font-black" style={{ color: primaryColor }}>
                            {formatCurrency(offerPrice)}
                          </span>
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            {formatCurrency(price)}
                          </span>
                        </>
                      ) : price > 0 ? (
                        <span className="text-xl font-black" style={{ color: primaryColor }}>
                          {formatCurrency(price)}
                        </span>
                      ) : null}
                    </div>
                    {itemCta && itemLink && (
                      <a
                        href={safeLandingLink(itemLink, '#contact')}
                        className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:brightness-110"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {itemCta}
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </SectionShell>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 2: Premium List View (Detailed)
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
        <div className="mx-auto max-w-4xl space-y-8 mt-12">
          {items.map((item, i) => {
            const name = readField(item, 'name');
            const description = readField(item, 'description');
            const images = Array.isArray(item.images) ? (item.images as string[]) : [];
            const price = readNumber(item, 'price');
            const offerPrice = item.offerPrice != null ? readNumber(item, 'offerPrice') : undefined;
            const itemLink = readField(item, 'link') || section.buttonLink || '';
            const itemCta = readField(item, 'buttonText') || section.buttonText || '';

            return (
              <motion.article
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5 sm:flex-row transition-all hover:shadow-2xl"
              >
                <div className="relative h-64 w-full shrink-0 overflow-hidden sm:h-auto sm:w-72">
                  {images[0] ? (
                    <Image
                      src={images[0]}
                      alt={name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, 288px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100">
                      <ShoppingBag className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-center p-8 sm:p-10">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className="text-2xl font-black text-gray-900">{name}</h3>
                    <div className="flex items-baseline gap-2">
                      {offerPrice ? (
                        <>
                          <span className="text-2xl font-black" style={{ color: primaryColor }}>
                            {formatCurrency(offerPrice)}
                          </span>
                          <span className="text-sm font-medium text-gray-400 line-through">
                            {formatCurrency(price)}
                          </span>
                        </>
                      ) : price > 0 ? (
                        <span className="text-2xl font-black" style={{ color: primaryColor }}>
                          {formatCurrency(price)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="my-6 h-px w-full bg-gray-100" />
                  <p className="text-base leading-relaxed text-gray-600 line-clamp-3">
                    {description}
                  </p>
                  {itemCta && itemLink && (
                    <div className="mt-8">
                      <a
                        href={safeLandingLink(itemLink, '#contact')}
                        className="inline-flex items-center gap-2 font-bold uppercase tracking-wider transition-colors hover:opacity-80"
                        style={{ color: primaryColor }}
                      >
                        {itemCta} <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </SectionShell>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 3: Minimalist Card Grid with Dark Overlays
  // ---------------------------------------------------------------------------
  return (
    <SectionShell id={section.type} tone="navySoft" navy={primaryColor}>
      <SectionHead
        eyebrow={section.eyebrow}
        title={section.title}
        subtitle={section.subtitle}
        accent="#f5b301"
      />
      <motion.div
        variants={staggerGrid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
      >
        {items.map((item, i) => {
          const name = readField(item, 'name');
          const description = readField(item, 'description');
          const images = Array.isArray(item.images) ? (item.images as string[]) : [];
          const price = readNumber(item, 'price');
          const offerPrice = item.offerPrice != null ? readNumber(item, 'offerPrice') : undefined;
          const itemLink = readField(item, 'link') || section.buttonLink || '';
          const itemCta = readField(item, 'buttonText') || section.buttonText || '';

          return (
            <motion.article
              key={i}
              variants={cardReveal}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-900 shadow-lg"
            >
              {images[0] ? (
                <Image
                  src={images[0]}
                  alt={name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-60"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <ShoppingBag className="h-12 w-12 text-gray-600" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-linear-to-t from-gray-900/95 via-gray-900/40 to-transparent" />
              
              <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6">
                <div className="translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                  <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                  <p className="line-clamp-2 text-sm text-gray-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100 mb-4">
                    {description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      {offerPrice ? (
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-white">{formatCurrency(offerPrice)}</span>
                          <span className="text-xs text-gray-400 line-through">{formatCurrency(price)}</span>
                        </div>
                      ) : price > 0 ? (
                        <span className="text-lg font-black text-white">{formatCurrency(price)}</span>
                      ) : null}
                    </div>
                    {itemCta && itemLink && (
                      <a
                        href={safeLandingLink(itemLink, '#contact')}
                        className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-md transition hover:bg-white hover:text-gray-900"
                      >
                        {itemCta}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </SectionShell>
  );
}
