'use client';

import { SafeImage as Image } from '@/components/SafeImage';
import { motion, type Variants } from 'framer-motion';
import { IBlog, ILandingPageSection, IProduct, IService, SocialLinks } from '@/types';
import { ContactForm } from './ContactForm';
import { NewsletterForm } from './NewsletterForm';
import { FloatingContactButtons } from './FloatingContactButtons';
import { SocialIcons } from './SocialIcons';
import { cn, formatCurrency } from '@/lib/utils';
import { toGoogleMapsEmbedUrl } from '@/lib/maps';
import { filterNavFooterItems } from '@/lib/nav-links';
import {
  ChevronDown,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  Sparkles,
  Star,
  Wallet,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

interface CompanyLandingProps {
  sections: ILandingPageSection[];
  companyId: string;
  companyName: string;
  products?: IProduct[];
  services?: IService[];
  blogs?: IBlog[];
  primaryColor?: string;
  accentColor?: string;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  email?: string;
  addressLine?: string;
  whatsappUrl?: string | null;
  socialLinks?: SocialLinks | null;
  showFloatingContact?: boolean;
}

const ease = [0.22, 1, 0.36, 1] as const;

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

const staggerGrid: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease },
  },
};

const WHY_ICONS = [Headphones, Shield, Sparkles, Wallet];

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
  if (
    link.startsWith('#') ||
    link.startsWith('/') ||
    link.startsWith('https://') ||
    link.startsWith('tel:') ||
    link.startsWith('mailto:')
  ) {
    return link;
  }
  return fallback;
}

function WaveDivider({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <div className={cn('pointer-events-none leading-none', flip && 'rotate-180')} aria-hidden>
      <svg viewBox="0 0 1440 64" className="block h-10 w-full md:h-14" preserveAspectRatio="none">
        <path
          fill={fill}
          d="M0,32 C240,64 480,0 720,24 C960,48 1200,64 1440,24 L1440,64 L0,64 Z"
        />
      </svg>
    </div>
  );
}

function SectionShell({
  id,
  tone = 'white',
  navy,
  children,
  className,
  withTopWave = false,
  withBottomWave = false,
  compact = false,
}: {
  id: string;
  tone?: 'white' | 'soft' | 'navy' | 'navySoft';
  navy: string;
  children: ReactNode;
  className?: string;
  withTopWave?: boolean;
  withBottomWave?: boolean;
  compact?: boolean;
}) {
  const bg =
    tone === 'soft'
      ? '#f4f7fb'
      : tone === 'navy'
        ? navy
        : tone === 'navySoft'
          ? undefined
          : '#ffffff';

  return (
    <motion.section
      id={id}
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className={cn('relative scroll-mt-24', className)}
      style={
        tone === 'navySoft'
          ? { background: `linear-gradient(180deg, ${navy}0f 0%, #ffffff 70%)` }
          : { backgroundColor: bg }
      }
    >
      {withTopWave && <WaveDivider fill={tone === 'soft' ? '#ffffff' : '#f4f7fb'} />}
      <div
        className={cn(
          'relative mx-auto max-w-7xl px-4 sm:px-6',
          compact ? 'py-5 md:py-7' : 'py-16 md:py-24',
        )}
      >
        {children}
      </div>
      {withBottomWave && (
        <WaveDivider fill={tone === 'white' ? '#f4f7fb' : '#ffffff'} flip />
      )}
    </motion.section>
  );
}

function HeroSlideshow({
  images,
  title,
  navy,
  gold,
}: {
  images: string[];
  title: string;
  navy: string;
  gold: string;
}) {
  const [active, setActive] = useState(0);
  const slides = images.filter(Boolean).slice(0, 5);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${gold}55, transparent 40%), linear-gradient(135deg, ${navy}, #163b7a 55%, #0a1f45)`,
        }}
      />
    );
  }

  return (
    <>
      {slides.map((src, slideIndex) => (
        <div
          key={`${src}-${slideIndex}`}
          className={cn(
            'absolute inset-0 z-0 transition-opacity duration-1400 ease-in-out',
            slideIndex === active ? 'opacity-100' : 'opacity-0',
          )}
          style={{ backgroundColor: navy }}
        >
          <Image
            src={src}
            alt={`${title} slide ${slideIndex + 1}`}
            fill
            className="object-cover object-center"
            priority={slideIndex === 0}
            sizes="100vw"
          />
        </div>
      ))}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
          {slides.map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              aria-label={`Go to slide ${dotIndex + 1}`}
              onClick={() => setActive(dotIndex)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-500',
                dotIndex === active ? 'w-8 bg-white' : 'w-1.5 bg-white/45 hover:bg-white/75',
              )}
            />
          ))}
        </div>
      )}
    </>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold text-gray-900"
      >
        <span>{question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-300',
          open ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <p className="overflow-hidden text-gray-600">{answer}</p>
      </div>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  subtitle,
  accent,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  accent: string;
  light?: boolean;
}) {
  return (
    <motion.div
      variants={cardReveal}
      className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
    >
      {eyebrow && (
        <p
          className="mb-3 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]"
          style={{ color: accent, backgroundColor: light ? 'rgba(255,255,255,0.12)' : `${accent}18` }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl',
          light ? 'text-white' : 'text-gray-950',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn('mx-auto mt-4 max-w-2xl text-base sm:text-lg', light ? 'text-white/75' : 'text-gray-500')}>
          {subtitle}
        </p>
      )}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease }}
        className="mx-auto mt-5 h-1 w-16 origin-center rounded-full"
        style={{ backgroundColor: accent }}
      />
    </motion.div>
  );
}

export function CompanyLanding({
  sections,
  companyId,
  companyName,
  products = [],
  services = [],
  primaryColor = '#0b2a5b',
  accentColor = '#0b2a5b',
  rating = 0,
  reviewCount = 0,
  phone,
  email,
  addressLine,
  whatsappUrl,
  socialLinks,
  showFloatingContact = true,
}: CompanyLandingProps) {
  const visibleSections = [...sections]
    .filter((section) => {
      if (!section.isVisible) return false;
      if (section.type === 'navbar') return false;
      if (section.type === 'services') return Boolean(section.items?.length);
      if (section.type === 'products') return Boolean(section.items?.length);
      if (section.type === 'gallery') {
        return Boolean(section.items?.length || section.images?.length);
      }
      if (section.type === 'why-choose-us') return Boolean(section.items?.length);
      if (section.type === 'blogs') return Boolean(section.items?.length);
      if (section.type === 'faq' || section.type === 'testimonials') {
        return Boolean(section.items?.length);
      }
      return true;
    })
    .sort((a, b) => a.order - b.order);

  if (!visibleSections.length) return null;

  const serviceNames = services.map((s) => s.name);
  const hasContactSection = visibleSections.some((section) => section.type === 'contact');
  const callUrl = phone ? `tel:${phone.replace(/\s/g, '')}` : null;
  const navy = primaryColor || '#0b2a5b';
  // No yellow accents on the public landing — use navy for CTAs and labels.
  const gold = navy;

  return (
    <div
      className="overflow-x-hidden bg-white text-gray-900 antialiased"
      style={{
        ['--brand' as string]: navy,
        ['--accent' as string]: gold,
      }}
    >
      {visibleSections.map((section) => {
        const rawItems = (section.items || []) as Array<Record<string, string>>;
        const items =
          section.type === 'navbar' || section.type === 'footer'
            ? (filterNavFooterItems(rawItems) as Array<Record<string, string>>)
            : rawItems;
        const sectionId = section.type;

        switch (section.type) {
          case 'hero': {
            const heroImages = [
              ...(section.images || []),
              ...(section.image ? [section.image] : []),
            ].filter((src, i, arr) => src && arr.indexOf(src) === i);
            return (
              <section
                id={sectionId}
                key={section.id}
                className="relative min-h-[88vh] scroll-mt-24 overflow-hidden"
              >
                <HeroSlideshow images={heroImages} title={section.title} navy={navy} gold={gold} />
                <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 py-28 sm:px-6">
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease }}
                    className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]"
                  >
                    {companyName}
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.08, ease }}
                    className="max-w-4xl text-4xl font-black uppercase leading-[1.05] text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-7xl"
                  >
                    {section.title}
                  </motion.h1>
                  {section.subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.18, ease }}
                      className="mt-6 max-w-2xl text-lg text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.5)] sm:text-xl"
                    >
                      {section.subtitle}
                    </motion.p>
                  )}
                  {section.content && (
                    <motion.p
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.65, delay: 0.26, ease }}
                      className="mt-3 max-w-2xl text-base text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]"
                    >
                      {section.content}
                    </motion.p>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.34, ease }}
                    className="mt-10 flex flex-wrap gap-3"
                  >
                    {section.buttonText?.trim() && (
                      <a
                        href={safeLandingLink(
                          section.buttonLink,
                          hasContactSection ? '#contact' : '#services',
                        )}
                        className="inline-flex items-center rounded-full px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_18px_40px_rgba(0,0,0,0.25)] transition hover:-translate-y-1"
                        style={{ backgroundColor: gold }}
                      >
                        {section.buttonText}
                      </a>
                    )}
                  </motion.div>
                </div>
                <div className="absolute inset-x-0 bottom-0">
                  <WaveDivider fill="#ffffff" />
                </div>
              </section>
            );
          }

          case 'rating': {
            const manualScore = Number.parseFloat(String(section.note || '').trim());
            const displayRating =
              Number.isFinite(manualScore) && manualScore > 0
                ? Math.min(5, manualScore)
                : rating > 0
                  ? rating
                  : 0;
            const badges = (section.items || [])
              .map((item) => ({
                label: readField(item as Record<string, string>, 'label'),
                link: readField(item as Record<string, string>, 'link'),
              }))
              .filter((item) => item.label);
            const brandName = section.title?.trim() || companyName;
            const fullStars = Math.floor(displayRating);
            const partial = Math.max(0, Math.min(1, displayRating - fullStars));

            return (
              <SectionShell id={sectionId} key={section.id} tone="white" navy={navy} compact>
                <motion.div
                  variants={cardReveal}
                  className="mx-auto max-w-3xl text-center"
                >
                  <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
                    {badges.length > 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-x-1.5">
                        {badges.map((badge, index) => (
                          <span key={`${badge.label}-${index}`} className="flex items-center gap-1.5">
                            {index > 0 && (
                              <span className="text-sm text-gray-300" aria-hidden>
                                |
                              </span>
                            )}
                            {badge.link ? (
                              <a
                                href={safeLandingLink(badge.link, '#')}
                                target={badge.link.startsWith('http') ? '_blank' : undefined}
                                rel={
                                  badge.link.startsWith('http')
                                    ? 'noopener noreferrer'
                                    : undefined
                                }
                                className={cn(
                                  'text-xl font-bold tracking-tight sm:text-2xl',
                                  /google/i.test(badge.label)
                                    ? 'bg-linear-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent'
                                    : /facebook/i.test(badge.label)
                                      ? 'text-[#1877F2]'
                                      : 'text-gray-800',
                                )}
                                style={
                                  !/google|facebook/i.test(badge.label)
                                    ? { color: navy }
                                    : undefined
                                }
                              >
                                {badge.label}
                              </a>
                            ) : (
                              <span
                                className={cn(
                                  'text-xl font-bold tracking-tight sm:text-2xl',
                                  /google/i.test(badge.label)
                                    ? 'bg-linear-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent'
                                    : /facebook/i.test(badge.label)
                                      ? 'text-[#1877F2]'
                                      : 'text-gray-800',
                                )}
                                style={
                                  !/google|facebook/i.test(badge.label)
                                    ? { color: navy }
                                    : undefined
                                }
                              >
                                {badge.label}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    {displayRating > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
                          {displayRating.toFixed(1)}
                          <span className="text-lg font-bold text-gray-500 sm:text-xl">/5</span>
                        </span>
                        <div className="flex items-center gap-0.5" aria-label={`${displayRating} out of 5`}>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const fill =
                              star <= fullStars ? 1 : star === fullStars + 1 ? partial : 0;
                            return (
                              <span key={star} className="relative inline-block h-5 w-5 sm:h-6 sm:w-6">
                                <Star className="absolute inset-0 h-full w-full text-gray-200" />
                                <span
                                  className="absolute inset-0 overflow-hidden"
                                  style={{ width: `${fill * 100}%` }}
                                >
                                  <Star className="h-full w-full fill-[#f5b301] text-[#f5b301]" />
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <h2
                    className="mt-3 text-3xl font-black uppercase tracking-wide sm:mt-4 sm:text-4xl md:text-5xl"
                    style={{ color: navy }}
                  >
                    {brandName}
                  </h2>
                  {section.subtitle?.trim() && (
                    <p className="mx-auto mt-1.5 max-w-2xl font-serif text-base text-gray-800 sm:mt-2 sm:text-lg">
                      {section.subtitle}
                    </p>
                  )}
                  {section.content?.trim() && (
                    <p className="mx-auto mt-1 max-w-xl text-sm text-gray-500">
                      {section.content}
                    </p>
                  )}
                </motion.div>
              </SectionShell>
            );
          }

          case 'services':
            return (
              <SectionShell id={sectionId} key={section.id} tone="white" navy={navy} withBottomWave>
                <SectionHead
                  eyebrow={section.eyebrow}
                  title={section.title}
                  subtitle={section.subtitle}
                  accent={gold}
                />
                <motion.div
                  variants={staggerGrid}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-40px' }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {items.map((item, i) => {
                    const name = readField(item, 'name');
                    const description = readField(item, 'description');
                    const image = readField(item, 'image');
                    const price = readNumber(item, 'price');
                    const itemLink = readField(item, 'link') || section.buttonLink || '';
                    const itemCta = readField(item, 'buttonText') || section.buttonText || '';
                    return (
                      <motion.article
                        key={i}
                        variants={cardReveal}
                        whileHover={{ y: -8 }}
                        className="group overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100"
                      >
                        <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
                          {image ? (
                            <Image
                              src={image}
                              alt={name}
                              fill
                              sizes="(max-width: 768px) 100vw, 25vw"
                              className="object-cover transition duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div
                              className="flex h-full items-center justify-center text-4xl font-black text-white/40"
                              style={{ backgroundColor: navy }}
                            >
                              {name.charAt(0)}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />
                          <h3 className="absolute bottom-3 left-3 right-3 text-lg font-bold text-white">
                            {name}
                          </h3>
                        </div>
                        <div className="p-5">
                          <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                            {description}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            {price > 0 ? (
                              <span className="font-bold" style={{ color: navy }}>
                                {formatCurrency(price)}
                              </span>
                            ) : (
                              <span />
                            )}
                            {itemCta && itemLink && (
                              <a
                                href={safeLandingLink(itemLink, '#contact')}
                                className="text-sm font-bold uppercase tracking-wide transition group-hover:translate-x-0.5"
                                style={{ color: gold }}
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

          case 'products':
            return (
              <SectionShell id={sectionId} key={section.id} tone="soft" navy={navy}>
                <SectionHead
                  eyebrow={section.eyebrow}
                  title={section.title}
                  subtitle={section.subtitle}
                  accent={gold}
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
                    const offerPrice =
                      item.offerPrice != null ? readNumber(item, 'offerPrice') : undefined;
                    const itemLink = readField(item, 'link') || section.buttonLink || '';
                    const itemCta = readField(item, 'buttonText') || section.buttonText || '';
                    return (
                      <motion.article
                        key={i}
                        variants={cardReveal}
                        whileHover={{ y: -8 }}
                        className="overflow-hidden rounded-2xl bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] ring-1 ring-gray-100"
                      >
                        <div className="relative aspect-16/10 overflow-hidden bg-gray-100">
                          {images[0] ? (
                            <Image
                              src={images[0]}
                              alt={name}
                              fill
                              className="object-cover transition duration-700 hover:scale-105"
                              sizes="33vw"
                            />
                          ) : null}
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-950">{name}</h3>
                          <p className="mt-2 line-clamp-3 text-sm text-gray-600">{description}</p>
                          <div className="mt-5 flex items-center justify-between gap-3">
                            <div>
                              {offerPrice ? (
                                <>
                                  <span className="text-xl font-black" style={{ color: navy }}>
                                    {formatCurrency(offerPrice)}
                                  </span>
                                  <span className="ml-2 text-sm text-gray-400 line-through">
                                    {formatCurrency(price)}
                                  </span>
                                </>
                              ) : price > 0 ? (
                                <span className="text-xl font-black" style={{ color: navy }}>
                                  {formatCurrency(price)}
                                </span>
                              ) : null}
                            </div>
                            {itemCta && itemLink && (
                              <a
                                href={safeLandingLink(itemLink, '#contact')}
                                className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:brightness-110"
                                style={{ backgroundColor: gold }}
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

          case 'why-choose-us':
            return (
              <SectionShell id={sectionId} key={section.id} tone="navySoft" navy={navy} withTopWave>
                <SectionHead
                  eyebrow={section.eyebrow}
                  title={section.title}
                  subtitle={section.subtitle}
                  accent={gold}
                />
                <motion.div
                  variants={staggerGrid}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {items.map((item, itemIndex) => {
                    const Icon = WHY_ICONS[itemIndex % WHY_ICONS.length];
                    return (
                      <motion.article
                        key={itemIndex}
                        variants={cardReveal}
                        whileHover={{ y: -6 }}
                        className="rounded-2xl border border-white/70 bg-white/90 p-7 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur"
                      >
                        <div
                          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
                          style={{ background: `linear-gradient(145deg, ${navy}, #1a4a8c)` }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="mt-5 text-lg font-bold text-gray-950">
                          {readField(item, 'title')}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-500">
                          {readField(item, 'description')}
                        </p>
                      </motion.article>
                    );
                  })}
                </motion.div>
              </SectionShell>
            );

          case 'about':
            return (
              <SectionShell id={sectionId} key={section.id} tone="white" navy={navy}>
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                  <motion.div variants={cardReveal}>
                    {section.eyebrow?.trim() && (
                      <p
                        className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]"
                        style={{ color: gold, backgroundColor: `${gold}18` }}
                      >
                        {section.eyebrow}
                      </p>
                    )}
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-950 sm:text-4xl md:text-5xl">
                      {section.title}
                    </h2>
                    <div className="mt-4 h-1 w-16 rounded-full" style={{ backgroundColor: gold }} />
                    {section.subtitle && (
                      <p className="mt-5 text-lg font-semibold" style={{ color: navy }}>
                        {section.subtitle}
                      </p>
                    )}
                    <p className="mt-4 text-base leading-relaxed text-gray-600">{section.content}</p>
                    {section.buttonText?.trim() && (
                      <a
                        href={safeLandingLink(section.buttonLink, '#contact')}
                        className="mt-8 inline-flex rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:-translate-y-0.5"
                        style={{ backgroundColor: gold }}
                      >
                        {section.buttonText}
                      </a>
                    )}
                  </motion.div>
                  {section.image && (
                    <motion.div
                      variants={cardReveal}
                      className="relative aspect-4/3 overflow-hidden rounded-4xl shadow-[0_30px_80px_rgba(11,42,91,0.2)]"
                    >
                      <Image
                        src={section.image}
                        alt={section.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div
                        className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full opacity-80 blur-2xl"
                        style={{ backgroundColor: gold }}
                      />
                    </motion.div>
                  )}
                </div>
              </SectionShell>
            );

          case 'gallery': {
            const galleryItems = section.items?.length
              ? (section.items as Array<Record<string, unknown>>)
              : (section.images || []).map((image) => ({
                  image,
                  title: '',
                  description: '',
                }));
            return (
              <SectionShell id={sectionId} key={section.id} tone="white" navy={navy} withBottomWave>
                <SectionHead
                  eyebrow={section.eyebrow}
                  title={section.title}
                  subtitle={section.subtitle}
                  accent={gold}
                />
                <motion.div
                  variants={staggerGrid}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-40px' }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {galleryItems.map((item, i) => {
                    const image = readField(item, 'image');
                    const name =
                      readField(item, 'title') ||
                      readField(item, 'name') ||
                      '';
                    const description = readField(item, 'description');
                    const itemLink = readField(item, 'link') || section.buttonLink || image;
                    const itemCta = readField(item, 'buttonText') || section.buttonText || '';
                    return (
                      <motion.article
                        key={i}
                        variants={cardReveal}
                        whileHover={{ y: -8 }}
                        className="group overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100"
                      >
                        <a
                          href={image || '#'}
                          target={image ? '_blank' : undefined}
                          rel={image ? 'noopener noreferrer' : undefined}
                          className="relative block aspect-4/3 overflow-hidden bg-gray-100"
                        >
                          {image ? (
                            <Image
                              src={image}
                              alt={name || section.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 25vw"
                              className="object-cover transition duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div
                              className="flex h-full items-center justify-center text-4xl font-black text-white/40"
                              style={{ backgroundColor: navy }}
                            >
                              {(name || 'G').charAt(0)}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />
                          {name && (
                            <h3 className="absolute bottom-3 left-3 right-3 text-lg font-bold text-white">
                              {name}
                            </h3>
                          )}
                        </a>
                        {(description || (itemCta && itemLink)) && (
                          <div className="p-5">
                            {description && (
                              <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                                {description}
                              </p>
                            )}
                            {itemCta && itemLink && (
                              <div className="mt-4 flex items-center justify-end">
                                <a
                                  href={safeLandingLink(itemLink, image || '#contact')}
                                  className="text-sm font-bold uppercase tracking-wide transition group-hover:translate-x-0.5"
                                  style={{ color: gold }}
                                  target={itemLink.startsWith('http') || itemLink.startsWith('/api/') ? '_blank' : undefined}
                                  rel={
                                    itemLink.startsWith('http') || itemLink.startsWith('/api/')
                                      ? 'noopener noreferrer'
                                      : undefined
                                  }
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
              </SectionShell>
            );
          }

          case 'blogs':
            return (
              <SectionShell id={sectionId} key={section.id} tone="white" navy={navy}>
                <SectionHead title={section.title} subtitle={section.subtitle} accent={gold} />
                <motion.div
                  variants={staggerGrid}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid gap-6 md:grid-cols-3"
                >
                  {items.map((item, itemIndex) => (
                    <motion.article
                      key={itemIndex}
                      variants={cardReveal}
                      whileHover={{ y: -6 }}
                      className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100"
                    >
                      {item.image && (
                        <div className="relative aspect-16/10 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={readField(item, 'image')}
                            alt={readField(item, 'title')}
                            className="h-full w-full object-cover transition duration-500 hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-950">
                          {readField(item, 'title')}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                          {readField(item, 'description')}
                        </p>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </SectionShell>
            );

          case 'testimonials':
            return (
              <section id={sectionId} key={section.id} className="relative scroll-mt-24">
                <WaveDivider fill={navy} />
                <motion.div
                  variants={sectionReveal}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-60px' }}
                  className="px-4 py-20 sm:px-6 md:py-24"
                  style={{ backgroundColor: navy }}
                >
                  <div className="mx-auto max-w-7xl">
                    <SectionHead
                      title={section.title}
                      subtitle={section.subtitle}
                      accent={gold}
                      light
                    />
                    <motion.div
                      variants={staggerGrid}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      className="grid gap-6 md:grid-cols-3"
                    >
                      {items.map((item, i) => (
                        <motion.blockquote
                          key={i}
                          variants={cardReveal}
                          whileHover={{ y: -6 }}
                          className="rounded-2xl bg-white/95 p-7 shadow-2xl backdrop-blur"
                        >
                          <div className="mb-4 flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="h-4 w-4"
                                style={{ color: navy, fill: navy }}
                              />
                            ))}
                          </div>
                          <p className="text-sm leading-relaxed text-gray-700 italic">
                            “{item.quote || item.comment}”
                          </p>
                          <footer className="mt-6 flex items-center gap-3">
                            <div
                              className="flex h-11 w-11 items-center justify-center rounded-full font-bold text-white"
                              style={{ backgroundColor: gold }}
                            >
                              {(item.name || item.author || 'A').charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-950">
                                {item.name || item.author}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.role || 'Traveler'}
                              </p>
                            </div>
                          </footer>
                        </motion.blockquote>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
                <WaveDivider fill="#ffffff" flip />
              </section>
            );

          case 'faq':
            return (
              <SectionShell id={sectionId} key={section.id} tone="white" navy={navy}>
                <SectionHead title={section.title} subtitle={section.subtitle} accent={gold} />
                <motion.div
                  variants={cardReveal}
                  className="mx-auto max-w-3xl rounded-2xl bg-white px-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100"
                >
                  {items.map((item, i) => (
                    <FAQItem
                      key={i}
                      question={String(item.question || item.title || '')}
                      answer={String(item.answer || item.content || '')}
                    />
                  ))}
                </motion.div>
              </SectionShell>
            );

          case 'subscribe':
            return (
              <section id={sectionId} key={section.id} className="relative scroll-mt-24">
                <WaveDivider fill={navy} />
                <motion.div
                  variants={sectionReveal}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="relative overflow-hidden px-4 py-20 text-center text-white sm:px-6"
                  style={{ backgroundColor: navy }}
                >
                  <div
                    className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
                    style={{ backgroundColor: gold }}
                  />
                  <div className="relative mx-auto max-w-3xl">
                    <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
                      {section.title}
                    </h2>
                    {section.subtitle && (
                      <p className="mx-auto mt-4 max-w-2xl text-white/75">{section.subtitle}</p>
                    )}
                    <NewsletterForm
                      companyId={companyId}
                      buttonText={section.buttonText || undefined}
                      placeholder={section.placeholder || undefined}
                      primaryColor={gold}
                    />
                    {section.note?.trim() && (
                      <p className="mt-3 text-xs text-white/50">{section.note}</p>
                    )}
                  </div>
                </motion.div>
                <WaveDivider fill="#f4f7fb" flip />
              </section>
            );

          case 'contact': {
            const mapSrc = toGoogleMapsEmbedUrl(section.mapUrl || addressLine);
            const leftHeading = section.note?.trim() || companyName;
            const leftIntro = section.content?.trim() || '';
            return (
              <SectionShell id="contact" key={section.id} tone="soft" navy={navy}>
                <SectionHead
                  eyebrow={section.eyebrow}
                  title={section.title}
                  subtitle={section.subtitle}
                  accent={gold}
                />
                <motion.div
                  variants={staggerGrid}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid gap-6 lg:grid-cols-2 lg:gap-8"
                >
                  <motion.div
                    variants={cardReveal}
                    className="flex flex-col rounded-2xl bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100 sm:p-8"
                  >
                    <h3 className="text-xl font-extrabold text-gray-950 sm:text-2xl">
                      {leftHeading}
                    </h3>
                    {leftIntro && (
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">{leftIntro}</p>
                    )}

                    <div className="mt-7 space-y-4">
                      {addressLine && (
                        <div className="flex gap-3 rounded-xl bg-[#f4f7fb] p-3.5">
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: navy }}
                          >
                            <MapPin className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Address
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-gray-800">{addressLine}</p>
                          </div>
                        </div>
                      )}
                      {phone && (
                        <a
                          href={callUrl || '#'}
                          className="flex gap-3 rounded-xl bg-[#f4f7fb] p-3.5 transition hover:bg-gray-100"
                        >
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: navy }}
                          >
                            <Phone className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Phone
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-gray-800">{phone}</p>
                          </div>
                        </a>
                      )}
                      {email && (
                        <a
                          href={`mailto:${email}`}
                          className="flex gap-3 rounded-xl bg-[#f4f7fb] p-3.5 transition hover:bg-gray-100"
                        >
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: navy }}
                          >
                            <Mail className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Email
                            </p>
                            <p className="mt-0.5 break-all text-sm font-medium text-gray-800">
                              {email}
                            </p>
                          </div>
                        </a>
                      )}
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-7">
                      {callUrl && (
                        <a
                          href={callUrl}
                          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:-translate-y-0.5"
                          style={{ backgroundColor: navy }}
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Call
                        </a>
                      )}
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:-translate-y-0.5"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          {section.buttonText?.trim() || 'WhatsApp'}
                        </a>
                      )}
                      {email && (
                        <a
                          href={`mailto:${email}`}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-700 transition hover:-translate-y-0.5 hover:bg-gray-50"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Email
                        </a>
                      )}
                    </div>

                    {socialLinks && (
                      <div className="mt-6 border-t border-gray-100 pt-5">
                        <SocialIcons links={socialLinks} />
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    variants={cardReveal}
                    className="rounded-2xl bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100 sm:p-8"
                  >
                    {section.placeholder?.trim() && (
                      <h3 className="mb-5 text-xl font-extrabold text-gray-950">
                        {section.placeholder}
                      </h3>
                    )}
                    <ContactForm
                      companyId={companyId}
                      services={serviceNames}
                      primaryColor={navy}
                    />
                  </motion.div>
                </motion.div>
                {mapSrc && (
                  <motion.div
                    variants={cardReveal}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100"
                  >
                    <iframe
                      title={`${companyName} location map`}
                      src={mapSrc}
                      className="h-72 w-full border-0 md:h-96"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </motion.div>
                )}
              </SectionShell>
            );
          }

          case 'footer':
            return (
              <footer id={sectionId} key={section.id} className="relative text-white">
                <WaveDivider fill={navy} />
                <div className="px-4 py-14 sm:px-6" style={{ backgroundColor: navy }}>
                  <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-lg font-extrabold">{companyName}</p>
                      {section.subtitle?.trim() && (
                        <p className="mt-3 text-sm leading-relaxed text-white/70">
                          {section.subtitle}
                        </p>
                      )}
                    </div>
                    {items.length > 0 && (
                      <div>
                        {section.eyebrow?.trim() && (
                          <h4 className="font-bold text-white">{section.eyebrow}</h4>
                        )}
                        <nav className={cn('flex flex-col gap-2', section.eyebrow?.trim() && 'mt-4')}>
                          {items.map((item, itemIndex) => (
                            <a
                              key={itemIndex}
                              href={safeLandingLink(readField(item, 'link'), '/')}
                              className="text-sm text-white/75 transition hover:text-white"
                            >
                              {readField(item, 'label')}
                            </a>
                          ))}
                        </nav>
                      </div>
                    )}
                    <div>
                      {section.title?.trim() && (
                        <h4 className="font-bold text-white">{section.title}</h4>
                      )}
                      <div className={cn('space-y-2 text-sm text-white/75', section.title?.trim() && 'mt-4')}>
                        {addressLine && <p>{addressLine}</p>}
                        {phone && <p>{phone}</p>}
                        {email && <p>{email}</p>}
                      </div>
                      {section.buttonText?.trim() && callUrl && (
                        <a
                          href={callUrl}
                          className="mt-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                        >
                          {section.buttonText}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-white/50">
                    {section.content?.trim() ||
                      `© ${new Date().getFullYear()} ${companyName}`}
                  </div>
                </div>
              </footer>
            );

          default:
            return null;
        }
      })}

      {showFloatingContact && (
        <FloatingContactButtons
          phone={phone}
          email={email}
          whatsappUrl={whatsappUrl}
          accentColor={gold}
        />
      )}
    </div>
  );
}
