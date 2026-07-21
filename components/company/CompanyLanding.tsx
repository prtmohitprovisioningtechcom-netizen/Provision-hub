'use client';

import { SafeImage as Image } from '@/components/SafeImage';
import { motion, type Variants } from 'framer-motion';
import { IBlog, ILandingPageSection, IProduct, IService } from '@/types';
import { ContactForm } from './ContactForm';
import { NewsletterForm } from './NewsletterForm';
import { ReviewForm } from './ReviewForm';
import { FloatingContactButtons } from './FloatingContactButtons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn, formatCurrency } from '@/lib/utils';
import { toGoogleMapsEmbedUrl } from '@/lib/maps';
import { filterNavFooterItems } from '@/lib/nav-links';
import {
  ChevronDown,
  Headphones,
  Mail,
  MapPin,
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
}: {
  id: string;
  tone?: 'white' | 'soft' | 'navy' | 'navySoft';
  navy: string;
  children: ReactNode;
  className?: string;
  withTopWave?: boolean;
  withBottomWave?: boolean;
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
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">{children}</div>
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
  showFloatingContact = true,
}: CompanyLandingProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
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
            const roundedRating = Math.round(rating);
            return (
              <SectionShell id={sectionId} key={section.id} tone="soft" navy={navy} className="py-0!">
                <div className="flex flex-col items-center justify-between gap-10 py-4 md:flex-row md:py-2">
                  <div className="text-center md:text-left">
                    {section.eyebrow?.trim() && (
                      <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: gold }}>
                        {section.eyebrow}
                      </p>
                    )}
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-950 sm:text-4xl">
                      {section.title}
                    </h2>
                    {section.subtitle && <p className="mt-2 text-gray-500">{section.subtitle}</p>}
                  </div>
                  <motion.div
                    variants={staggerGrid}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="flex items-center gap-6"
                  >
                    <motion.div
                      variants={cardReveal}
                      className="flex h-28 w-28 flex-col items-center justify-center rounded-full text-white shadow-2xl"
                      style={{
                        background: `linear-gradient(145deg, ${navy}, #163b7a)`,
                        boxShadow: `0 20px 50px ${navy}44`,
                      }}
                    >
                      <span className="text-4xl font-black">
                        {rating > 0 ? rating.toFixed(1) : '—'}
                      </span>
                      {rating > 0 && (
                        <span className="text-[10px] uppercase tracking-widest text-white/70">
                          / 5
                        </span>
                      )}
                    </motion.div>
                    <motion.div variants={cardReveal}>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-6 w-6',
                              star <= roundedRating
                                ? 'fill-current text-current'
                                : 'text-gray-200',
                            )}
                            style={
                              star <= roundedRating ? { color: navy } : undefined
                            }
                          />
                        ))}
                      </div>
                      <p className="mt-2 font-semibold text-gray-800">
                        {reviewCount > 0
                          ? `${reviewCount} verified review${reviewCount === 1 ? '' : 's'}`
                          : 'Be the first to review'}
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
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
              : (section.images || []).map((image, imageIndex) => ({
                  image,
                  title: `Gallery ${imageIndex + 1}`,
                  description: '',
                }));
            return (
              <SectionShell id={sectionId} key={section.id} tone="soft" navy={navy} withTopWave>
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
                  className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
                >
                  {galleryItems.map((item, i) => {
                    const image = readField(item, 'image');
                    const title = readField(item, 'title');
                    return (
                      <motion.a
                        key={i}
                        variants={cardReveal}
                        href={image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'group relative overflow-hidden rounded-2xl bg-gray-200',
                          i % 5 === 0
                            ? 'aspect-square md:col-span-2 md:row-span-2'
                            : 'aspect-square',
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt={title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/65 to-transparent p-4 opacity-0 transition duration-300 group-hover:opacity-100">
                          <span className="text-sm font-semibold text-white">{title}</span>
                        </div>
                      </motion.a>
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
                  className="grid gap-6 lg:grid-cols-2"
                >
                  <motion.div
                    variants={cardReveal}
                    className="rounded-2xl bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100"
                  >
                    <div className="space-y-5">
                      {addressLine && (
                        <div className="flex gap-3">
                          <MapPin className="mt-0.5 h-5 w-5 shrink-0" style={{ color: gold }} />
                          <p className="text-sm text-gray-600">{addressLine}</p>
                        </div>
                      )}
                      {phone && (
                        <div className="flex gap-3">
                          <Phone className="mt-0.5 h-5 w-5 shrink-0" style={{ color: gold }} />
                          <a
                            href={callUrl || '#'}
                            className="text-sm text-gray-600 hover:underline"
                          >
                            {phone}
                          </a>
                        </div>
                      )}
                      {email && (
                        <div className="flex gap-3">
                          <Mail className="mt-0.5 h-5 w-5 shrink-0" style={{ color: gold }} />
                          <a
                            href={`mailto:${email}`}
                            className="text-sm text-gray-600 hover:underline"
                          >
                            {email}
                          </a>
                        </div>
                      )}
                    </div>
                    {whatsappUrl && section.buttonText?.trim() && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-8 inline-flex rounded-full px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
                        style={{ backgroundColor: gold }}
                      >
                        {section.buttonText}
                      </a>
                    )}
                  </motion.div>
                  <motion.div
                    variants={cardReveal}
                    className="rounded-2xl bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100"
                  >
                    <ContactForm companyId={companyId} services={serviceNames} />
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

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="Review"
            className="fixed bottom-24 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl transition hover:-translate-y-0.5"
            style={{ backgroundColor: navy }}
          >
            <Star className="h-5 w-5 fill-white" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>{companyName}</DialogTitle>
          </DialogHeader>
          <ReviewForm
            companyId={companyId}
            onSuccess={() => setIsReviewOpen(false)}
            className="mt-4"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
