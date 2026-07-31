'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ILandingPageSection } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SectionShell, SectionHead } from '@/components/company/SectionShell';
import { readField } from '@/lib/read-field';
import { ZoomIn, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface GallerySectionProps {
  section: ILandingPageSection;
  primaryColor: string;
}

type GalleryCardItem = {
  image: string;
  title: string;
  description: string;
  link: string;
  buttonText: string;
};

const ease = [0.16, 1, 0.3, 1];
const cardReveal: any = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
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

export function GallerySection({ section, primaryColor }: GallerySectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const variant = section.designVariant || 'variant-1';

  // Parse items
  const galleryItems: GalleryCardItem[] = (
    section.items?.length
      ? (section.items as Array<Record<string, unknown>>)
      : (section.images || []).map((image) => ({
          image,
          title: '',
          description: '',
        }))
  ).map((item) => ({
    image: readField(item, 'image') || (typeof item === 'string' ? item : ''),
    title: readField(item, 'title') || readField(item, 'name') || '',
    description: readField(item, 'description'),
    link: readField(item, 'link'),
    buttonText: readField(item, 'buttonText'),
  }));

  const active = activeIndex != null ? galleryItems[activeIndex] : null;

  // Lightbox keyboard navigation
  useEffect(() => {
    if (activeIndex == null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) =>
          current == null ? 0 : (current + 1) % galleryItems.length,
        );
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) =>
          current == null ? 0 : (current - 1 + galleryItems.length) % galleryItems.length,
        );
      }
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [activeIndex, galleryItems.length]);

  const Lightbox = () => (
    <AnimatePresence>
      {active?.image && activeIndex != null && (
        <motion.div
          key="gallery-lightbox"
          className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label="Close gallery zoom"
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setActiveIndex(null)}
          />
          <motion.div
            className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col"
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.35, ease: ease as any }}
          >
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="absolute -top-12 right-0 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:-right-12 sm:top-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-black shadow-[0_0_80px_rgba(0,0,0,0.5)] sm:aspect-video">
              <Image
                src={active.image}
                alt={active.title || section.title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            </div>
            {galleryItems.length > 1 && (
              <div className="absolute inset-y-0 -left-4 -right-4 flex items-center justify-between pointer-events-none sm:-left-16 sm:-right-16">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((activeIndex - 1 + galleryItems.length) % galleryItems.length);
                  }}
                  className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-110"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((activeIndex + 1) % galleryItems.length);
                  }}
                  className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-110"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
            {(active.title || active.description) && (
              <div className="mt-4 sm:mt-6 text-center text-white">
                {active.title && <h3 className="text-xl font-bold">{active.title}</h3>}
                {active.description && <p className="mt-2 text-sm text-white/70">{active.description}</p>}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ---------------------------------------------------------------------------
  // Variant 1: Classic Masonry-ish Grid
  // ---------------------------------------------------------------------------
  if (variant === 'variant-1') {
    return (
      <SectionShell id={section.type} tone="white" navy={primaryColor} withBottomWave>
        <SectionHead
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          accent="#f5b301" // gold
        />
        <motion.div
          variants={staggerGrid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {galleryItems.map((item, i) => {
            const itemLink = item.link || section.buttonLink || item.image;
            const itemCta = item.buttonText || section.buttonText || '';
            return (
              <motion.article
                key={i}
                variants={cardReveal}
                whileHover={{ y: -8 }}
                className="group overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100"
              >
                <button
                  type="button"
                  onClick={() => item.image && setActiveIndex(i)}
                  className="relative block w-full aspect-4/3 overflow-hidden bg-gray-100 text-left"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title || section.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-125"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl font-black text-white/40" style={{ backgroundColor: primaryColor }}>
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-white/90 text-gray-900 opacity-0 shadow-lg transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                      <ZoomIn className="h-5 w-5" />
                    </span>
                  </div>
                  {item.title && (
                    <h3 className="absolute bottom-3 left-3 right-3 text-lg font-bold text-white opacity-0 transition duration-500 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                      {item.title}
                    </h3>
                  )}
                </button>
                {(item.description || (itemCta && itemLink)) && (
                  <div className="p-5">
                    {item.description && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                        {item.description}
                      </p>
                    )}
                    {itemCta && itemLink && (
                      <div className="mt-4 flex items-center justify-end">
                        <a
                          href={safeLandingLink(itemLink, item.image || '#contact')}
                          className="text-sm font-bold uppercase tracking-wide transition hover:opacity-80"
                          style={{ color: primaryColor }}
                        >
                          {itemCta}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </motion.article>
            );
          })}
        </motion.div>
        <Lightbox />
      </SectionShell>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 2: Horizontal Scrolling / Slider Layout
  // ---------------------------------------------------------------------------
  if (variant === 'variant-2') {
    return (
      <section id={section.type} className="relative py-24 sm:py-32 overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
            accent={primaryColor}
          />
        </div>
        
        <div className="mt-12 flex gap-6 overflow-x-auto pb-12 pt-4 px-4 sm:px-6 md:px-12 snap-x snap-mandatory hide-scrollbar">
          {galleryItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="relative w-[85vw] max-w-md shrink-0 snap-center sm:w-[60vw] md:w-96 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5"
            >
              <div className="aspect-[3/4] sm:aspect-square relative group">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title || section.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-width: 768px) 85vw, 384px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-80" />
                
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white z-10">
                  <h3 className="text-2xl font-black mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="line-clamp-3 text-sm text-gray-300 mb-6">{item.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-auto">
                    <button
                      onClick={() => setActiveIndex(i)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-900 shadow-xl transition hover:scale-110"
                    >
                      <ZoomIn className="h-5 w-5" />
                    </button>
                    {item.buttonText && (
                       <a
                         href={safeLandingLink(item.link, '#contact')}
                         className="flex h-12 items-center rounded-full px-6 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white/20 border border-white/30 backdrop-blur-md"
                       >
                         {item.buttonText}
                       </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <Lightbox />
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 3: Cinematic Grid with Hover Zoom
  // ---------------------------------------------------------------------------
  return (
    <SectionShell id={section.type} tone="navySoft" navy={primaryColor}>
      <div className="text-center max-w-3xl mx-auto mb-16">
        {section.eyebrow && (
          <span className="mb-4 inline-block rounded-full bg-gray-900/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-600">
            {section.eyebrow}
          </span>
        )}
        <h2 className="text-4xl font-black text-gray-900 sm:text-6xl tracking-tight">
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {section.subtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {galleryItems.map((item, i) => {
          // Make some items span 2 rows/cols for visual interest
          const isFeatured = i % 5 === 0;
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={cn(
                "relative group overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer bg-gray-100",
                isFeatured ? "col-span-2 row-span-2 aspect-square" : "col-span-1 row-span-1 aspect-square"
              )}
              onClick={() => item.image && setActiveIndex(i)}
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title || section.title}
                  fill
                  className="object-cover transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:rotate-1"
                  sizes={isFeatured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-gray-300" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gray-900/0 transition-colors duration-500 group-hover:bg-gray-900/60" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center opacity-0 transition-all duration-500 group-hover:opacity-100">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
                  <ZoomIn className="h-6 w-6" />
                </span>
                {item.title && (
                  <h3 className="text-xl font-bold text-white translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
                    {item.title}
                  </h3>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      <Lightbox />
    </SectionShell>
  );
}
