'use client';

import { SafeImage as Image } from '@/components/SafeImage';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { IBlog, ILandingPageSection, IProduct, IService, SocialLinks } from '@/types';
import { ContactForm } from './ContactForm';
import { NewsletterForm } from './NewsletterForm';
import { FloatingContactButtons } from './FloatingContactButtons';
import { SocialIcons, hasSocialLinks } from './SocialIcons';
import { AboutSection } from '@/components/sections/About';
import { ServicesSection } from '@/components/sections/Services';
import { WhyChooseUsSection } from '@/components/sections/WhyChooseUs';
import { ProductsSection } from '@/components/sections/Products';
import { GallerySection } from '@/components/sections/Gallery';
import { BlogsSection } from '@/components/sections/Blogs';
import { TestimonialsSection } from '@/components/sections/Testimonials';
import { FAQSection } from '@/components/sections/FAQ';
import { SubscribeSection } from '@/components/sections/Subscribe';
import { ContactSection } from '@/components/sections/Contact';
import { FooterSection } from '@/components/sections/Footer';
import { RatingSection } from '@/components/sections/Rating';
import { cn, formatCurrency } from '@/lib/utils';
import { toGoogleMapsEmbedUrl } from '@/lib/maps';
import { filterNavFooterItems } from '@/lib/nav-links';
import { SectionShell, SectionHead, staggerGrid, cardReveal, sectionReveal, ease } from '@/components/company/SectionShell';
import { WaveDivider } from '@/components/company/WaveDivider';

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
  X,
  ZoomIn,
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

type GalleryCardItem = {
  image: string;
  title: string;
  description: string;
  link: string;
  buttonText: string;
};

function GalleryGrid({
  items,
  sectionTitle,
  navy,
  gold,
  sectionButtonLink,
  sectionButtonText,
}: {
  items: GalleryCardItem[];
  sectionTitle: string;
  navy: string;
  gold: string;
  sectionButtonLink: string;
  sectionButtonText: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex != null ? items[activeIndex] : null;

  useEffect(() => {
    if (activeIndex == null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) =>
          current == null ? 0 : (current + 1) % items.length,
        );
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) =>
          current == null ? 0 : (current - 1 + items.length) % items.length,
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
  }, [activeIndex, items.length]);

  return (
    <>
      <motion.div
        variants={staggerGrid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {items.map((item, i) => {
          const itemLink = item.link || sectionButtonLink || item.image;
          const itemCta = item.buttonText || sectionButtonText || '';
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
                    alt={item.title || sectionTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-125"
                  />
                ) : (
                  <div
                    className="flex h-full items-center justify-center text-4xl font-black text-white/40"
                    style={{ backgroundColor: navy }}
                  >
                    {(item.title || 'G').charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent opacity-80 transition duration-500 group-hover:opacity-100" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-white/90 text-gray-900 opacity-0 shadow-lg transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                    <ZoomIn className="h-5 w-5" />
                  </span>
                </div>
                {item.title && (
                  <h3 className="absolute bottom-3 left-3 right-3 text-lg font-bold text-white">
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
                        className="text-sm font-bold uppercase tracking-wide transition group-hover:translate-x-0.5"
                        style={{ color: gold }}
                        target={
                          itemLink.startsWith('http') || itemLink.startsWith('/api/')
                            ? '_blank'
                            : undefined
                        }
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
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              onClick={() => setActiveIndex(null)}
            />
            <motion.div
              className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col"
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.35, ease }}
            >
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="absolute -top-2 right-0 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:-right-2"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-black shadow-2xl sm:aspect-video">
                <Image
                  src={active.image}
                  alt={active.title || sectionTitle}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
              {(active.title || active.description) && (
                <div className="mt-4 text-center text-white">
                  {active.title && (
                    <h3 className="text-xl font-bold sm:text-2xl">{active.title}</h3>
                  )}
                  {active.description && (
                    <p className="mt-1 text-sm text-white/70 sm:text-base">
                      {active.description}
                    </p>
                  )}
                </div>
              )}
              {items.length > 1 && (
                <p className="mt-3 text-center text-xs text-white/50">
                  {activeIndex + 1} / {items.length}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


export function CompanyLanding({
  sections,
  companyId,
  companyName,
  products = [],
  services = [],
  blogs = [],
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
      if (section.isVisible === false) return false;
      if (section.type === 'navbar') return false;
      if (section.type === 'services') {
        return Boolean(services.length || section.items?.length);
      }
      if (section.type === 'products') {
        return Boolean(products.length || section.items?.length);
      }
      if (section.type === 'gallery') {
        return Boolean(section.items?.length || section.images?.length);
      }
      if (section.type === 'why-choose-us') return Boolean(section.items?.length);
      if (section.type === 'blogs') {
        return Boolean(blogs.length || section.items?.length);
      }
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
                <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/65 via-black/40 to-black/20" />
                <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 py-28 sm:px-6">
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease }}
                    className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]"
                  >
                    {section.eyebrow?.trim() || companyName}
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
                        className="inline-flex items-center rounded-full bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wide shadow-[0_18px_40px_rgba(0,0,0,0.25)] transition hover:-translate-y-1"
                        style={{ color: navy }}
                      >
                        {section.buttonText}
                      </a>
                    )}
                  </motion.div>
                </div>
                <div className="absolute inset-x-0 bottom-0 z-10">
                  <WaveDivider fill="#ffffff" />
                </div>
              </section>
            );
          }



          case 'services': {
            const resolvedServices = (services.length > 0 ? services : (section.items || [])) as IService[];
            return (
              <ServicesSection 
                key={section.id} 
                section={section} 
                services={resolvedServices} 
                primaryColor={navy} 
              />
            );
          }

          case 'products': {
            const resolvedProducts = (products.length > 0 ? products : (section.items || [])) as any[];
            return (
              <ProductsSection
                key={section.id}
                section={{ ...section, items: resolvedProducts }}
                primaryColor={navy}
              />
            );
          }

          case 'why-choose-us':
            return (
              <WhyChooseUsSection
                key={section.id}
                section={section}
                primaryColor={navy}
              />
            );

          case 'about':
            return (
              <AboutSection 
                key={section.id} 
                section={section} 
                primaryColor={navy} 
              />
            );

          case 'gallery':
            return (
              <GallerySection
                key={section.id}
                section={section}
                primaryColor={navy}
              />
            );

          case 'blogs': {
            const resolvedBlogs = (blogs.length > 0 ? blogs : (section.items || [])) as IBlog[];
            return (
              <BlogsSection
                key={section.id}
                section={{ ...section, items: resolvedBlogs }}
                primaryColor={navy}
                blogs={resolvedBlogs}
              />
            );
          }

          case 'testimonials':
            return (
              <TestimonialsSection
                key={section.id}
                section={section}
                primaryColor={navy}
              />
            );

          case 'faq':
            return (
              <FAQSection
                key={section.id}
                section={section}
                primaryColor={navy}
              />
            );

          case 'subscribe':
            return (
              <SubscribeSection
                key={section.id}
                section={section}
                primaryColor={navy}
                companyId={companyId}
              />
            );

          case 'contact':
            return (
              <ContactSection
                key={section.id}
                section={section}
                primaryColor={navy}
                companyId={companyId}
                companyName={companyName}
                addressLine={addressLine}
                phone={phone}
                email={email}
              />
            );

          case 'footer':
            return (
              <FooterSection
                key={section.id}
                section={section}
                primaryColor={navy}
                companyName={companyName}
                phone={phone}
                email={email}
                addressLine={addressLine}
                socialLinks={socialLinks}
                callUrl={callUrl}
              />
            );

          case 'rating':
            return (
              <RatingSection
                key={section.id}
                section={section}
                primaryColor={navy}
                companyName={companyName}
                rating={rating}
              />
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
