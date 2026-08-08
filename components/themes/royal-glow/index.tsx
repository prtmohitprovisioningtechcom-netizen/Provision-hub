'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Check,
  Mail,
  MapPin,
  Menu,
  Phone,
  Star,
  X,
} from 'lucide-react';
import {
  IBlog,
  ICompany,
  ILandingPageSection,
  IProduct,
  IReview,
  IService,
} from '@/types';
import { formatCurrency } from '@/lib/utils';
import { resolveThemePage } from '@/lib/resolve-theme-page';
import { ContactForm } from '@/components/company/ContactForm';
import { NewsletterForm } from '@/components/company/NewsletterForm';
import { getServiceImage } from '@/components/themes/layouts/service-image';

interface Props {
  company: ICompany;
  products: IProduct[];
  services: IService[];
  reviews: IReview[];
  blogs: IBlog[];
  landingPage: { sections?: ILandingPageSection[]; isPublished?: boolean } | null;
  gallery: { images?: Array<{ url: string; caption?: string }> } | null;
}

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&family=Mukta:wght@300;400;500;600&display=swap';

const MAROON = '#800020';
const GOLD = '#D4AF37';
const IVORY = '#FFFFF0';
const DEEP_GREEN = '#013220';

function WaveDivider() {
  return (
    <div
      className="my-10 h-12 w-full bg-cover bg-no-repeat sm:my-14 sm:h-14"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'><path d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' fill='%23800020'></path><path d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.5' fill='%23800020'></path><path d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' fill='%23D4AF37'></path></svg>")`,
      }}
      aria-hidden
    />
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-12 text-center">
      <h2
        className="relative mb-4 inline-block pb-4 text-3xl font-semibold sm:text-4xl"
        style={{ color: MAROON, fontFamily: "'Cinzel', 'Playfair Display', serif" }}
      >
        {title}
        <span
          className="absolute bottom-0 left-1/2 h-[3px] w-20 -translate-x-1/2"
          style={{ backgroundColor: GOLD }}
        />
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function packageFeatures(description?: string): string[] {
  if (!description?.trim()) return [];
  return description
    .split(/\n|•|▪|●/)
    .map((line) => line.replace(/^[-–]\s*/, '').trim())
    .filter(Boolean);
}

export function RoyalGlowTheme(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = resolveThemePage(props);
  const primary = page.primaryColor || MAROON;
  const social = props.company.socialLinks || {};
  const popularIndex =
    page.products.items.length >= 3 ? Math.floor(page.products.items.length / 2) : -1;

  return (
    <div
      className="min-h-screen overflow-x-hidden selection:bg-[#800020] selection:text-white"
      style={{
        backgroundColor: IVORY,
        color: '#1a1a1a',
        fontFamily: "'Poppins', 'Mukta', sans-serif",
      }}
    >
      <link href={FONTS_URL} rel="stylesheet" />

      {/* Top bar */}
      {(page.phone || page.email || page.whatsapp || social.instagram || social.facebook) && (
        <div className="px-4 py-2 text-sm text-white" style={{ backgroundColor: primary }}>
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {page.phone ? (
                <a href={`tel:${page.phone}`} className="inline-flex items-center gap-2 hover:opacity-90">
                  <Phone className="h-3.5 w-3.5" />
                  {page.phone}
                </a>
              ) : null}
              {page.whatsapp ? (
                <a
                  href={page.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:opacity-90"
                >
                  WhatsApp
                </a>
              ) : null}
              {page.email ? (
                <a href={`mailto:${page.email}`} className="inline-flex items-center gap-2 hover:opacity-90">
                  <Mail className="h-3.5 w-3.5" />
                  {page.email}
                </a>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              {social.instagram ? (
                <a href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                  <InstagramIcon className="h-4 w-4" />
                </a>
              ) : null}
              {social.facebook ? (
                <a href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                  <FacebookIcon className="h-4 w-4" />
                </a>
              ) : null}
              {social.youtube ? (
                <a href={social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
                  <YoutubeIcon className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[72px] sm:px-6">
          <Link href={`/${page.slug}`} className="flex min-w-0 items-center gap-3">
            {page.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.logo} alt={page.brandName} className="h-10 w-auto object-contain sm:h-12" />
            ) : null}
            <span
              className="truncate text-base font-semibold sm:text-lg"
              style={{ color: primary, fontFamily: "'Cinzel', 'Playfair Display', serif" }}
            >
              {page.brandName}
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {page.nav.map((item) => (
              <a
                key={item.link + item.label}
                href={item.link}
                className="group relative mx-2 px-1 py-2 text-sm font-medium transition"
                style={{ color: primary }}
              >
                {item.label}
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-0 transition-all group-hover:w-full"
                  style={{ backgroundColor: GOLD }}
                />
              </a>
            ))}
            {page.navCta ? (
              <a
                href={page.navCta.link}
                className="ml-3 rounded-full px-5 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(45deg, ${primary}, ${DEEP_GREEN})`,
                }}
              >
                {page.navCta.label}
              </a>
            ) : null}
          </div>

          <button
            type="button"
            className="lg:hidden"
            style={{ color: primary }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-black/5 bg-white px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              {page.nav.map((item) => (
                <a
                  key={item.link + item.label}
                  href={item.link}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium"
                  style={{ color: primary }}
                >
                  {item.label}
                </a>
              ))}
              {page.navCta ? (
                <a
                  href={page.navCta.link}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full px-5 py-2 text-center text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(45deg, ${primary}, ${DEEP_GREEN})` }}
                >
                  {page.navCta.label}
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </nav>

      <main>
        {page.orderedSectionTypes.map((type, index) => {
          switch (type) {
            case 'hero':
              return page.hero.show && (
                <section id="home" key="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden">
                  <div className="absolute inset-0">
                    {page.hero.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={page.hero.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${primary}, ${DEEP_GREEN})` }} />
                    )}
                    <div className="absolute inset-0 bg-black/40" />
                  </div>
      
                  <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center text-white">
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      {page.hero.eyebrow ? (
                        <p className="mb-4 text-sm tracking-[0.25em] uppercase text-white/85">
                          {page.hero.eyebrow}
                        </p>
                      ) : null}
                      <h1
                        className="mb-4 text-4xl leading-tight font-semibold drop-shadow-md sm:text-5xl md:text-6xl lg:text-7xl"
                        style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
                      >
                        {page.hero.title}
                      </h1>
                      {page.hero.subtitle ? (
                        <p className="mb-10 text-lg text-white/90 drop-shadow sm:text-xl md:text-2xl">
                          {page.hero.subtitle}
                        </p>
                      ) : null}
                      <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                        {page.hero.buttonText ? (
                          <a
                            href={page.hero.buttonLink}
                            className="rounded-full px-8 py-3.5 text-sm font-semibold shadow transition hover:-translate-y-0.5 hover:bg-white"
                            style={{ backgroundColor: GOLD, color: primary }}
                          >
                            {page.hero.buttonText}
                          </a>
                        ) : null}
                        {page.services.show ? (
                          <a
                            href="#services"
                            className="rounded-full border-2 border-white px-8 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#800020]"
                          >
                            {page.services.title}
                          </a>
                        ) : null}
                      </div>
                    </motion.div>
                  </div>
                </section>
              );

            case 'about':
              return page.about.show && (
                <div key="about">
                  {index > 0 && <WaveDivider />}
                  <section id="about" className="px-4 py-16 sm:px-6 sm:py-20">
                    <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
                      {page.about.image ? (
                        <div className="overflow-hidden rounded-xl shadow-lg">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={page.about.image} alt="" className="aspect-[4/3] w-full object-cover" />
                        </div>
                      ) : null}
                      <div>
                        {page.about.title ? <SectionHeading title={page.about.title} subtitle={page.about.subtitle} /> : null}
                        {page.about.content ? (
                          <div
                            className="prose max-w-none text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: page.about.content }}
                          />
                        ) : null}
                      </div>
                    </div>
                  </section>
                </div>
              );

            case 'services':
              return page.services.show && (
                <div key="services">
                  {index > 0 && <WaveDivider />}
                  <section id="services" className="px-4 py-16 sm:px-6 sm:py-20">
                    <div className="mx-auto max-w-7xl">
                      <SectionHeading title={page.services.title} subtitle={page.services.subtitle} />
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {page.services.items.map((service, i) => {
                          const img = getServiceImage(service);
                          return (
                            <motion.article
                              key={service._id || i}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: Math.min(i * 0.05, 0.3) }}
                              className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(128,0,32,0.18)]"
                            >
                              {img ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={img}
                                  alt={service.name}
                                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                />
                              ) : (
                                <div
                                  className="flex h-40 items-end p-6 text-4xl font-semibold text-white/30"
                                  style={{
                                    background: `linear-gradient(135deg, ${primary}, ${DEEP_GREEN})`,
                                    fontFamily: "'Cinzel', serif",
                                  }}
                                >
                                  {String(i + 1).padStart(2, '0')}
                                </div>
                              )}
                              <div className="flex flex-1 flex-col p-5">
                                <h3
                                  className="mb-2 text-xl font-bold"
                                  style={{ color: primary, fontFamily: "'Cinzel', serif" }}
                                >
                                  {service.name}
                                </h3>
                                {service.description ? (
                                  <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">
                                    {service.description}
                                  </p>
                                ) : null}
                                <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                                  <div>
                                    {service.price != null ? (
                                      <p className="font-semibold" style={{ color: GOLD }}>
                                        {formatCurrency(service.price)}
                                      </p>
                                    ) : null}
                                    {service.duration ? (
                                      <p className="text-xs text-gray-500">{service.duration}</p>
                                    ) : null}
                                  </div>
                                  {page.contact.show || page.hero.buttonLink ? (
                                    <a
                                      href={page.hero.buttonLink || '#contact'}
                                      className="rounded-full px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                                      style={{ backgroundColor: primary }}
                                    >
                                      {page.navCta?.label || 'Book'}
                                    </a>
                                  ) : null}
                                </div>
                              </div>
                            </motion.article>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                </div>
              );

            case 'products':
              return page.products.show && (
                <div key="products">
                  {index > 0 && <WaveDivider />}
                  <section id="packages" className="bg-white/70 px-4 py-16 sm:px-6 sm:py-20">
                    <div className="mx-auto max-w-7xl">
                      <SectionHeading title={page.products.title} subtitle={page.products.subtitle} />
                      <div className="grid items-stretch gap-6 lg:grid-cols-3">
                        {page.products.items.map((product, i) => {
                          const features = packageFeatures(product.description);
                          const popular = i === popularIndex;
                          return (
                            <article
                              key={product._id || i}
                              className="relative flex h-full flex-col overflow-hidden rounded-xl border bg-white p-8 transition"
                              style={{
                                borderColor: popular ? GOLD : 'rgba(0,0,0,0.1)',
                                borderWidth: popular ? 2 : 1,
                                boxShadow: popular
                                  ? '0 10px 30px rgba(212,175,55,0.2)'
                                  : '0 5px 15px rgba(0,0,0,0.04)',
                                transform: popular ? 'scale(1.02)' : undefined,
                              }}
                            >
                              {popular ? (
                                <span
                                  className="absolute top-4 -right-8 rotate-45 px-8 py-1 text-[10px] font-bold tracking-wide"
                                  style={{ backgroundColor: GOLD, color: primary }}
                                >
                                  Popular
                                </span>
                              ) : null}
                              <h3
                                className="mb-3 text-2xl font-bold"
                                style={{ color: primary, fontFamily: "'Cinzel', serif" }}
                              >
                                {product.name}
                              </h3>
                              <p className="mb-6 text-3xl font-bold" style={{ color: GOLD }}>
                                {formatCurrency(product.offerPrice ?? product.price)}
                              </p>
                              {features.length ? (
                                <ul className="mb-8 flex-1 space-y-2.5">
                                  {features.map((feature) => (
                                    <li key={feature} className="flex gap-2 text-sm text-gray-700">
                                      <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : product.description ? (
                                <p className="mb-8 flex-1 text-sm leading-relaxed text-gray-600">
                                  {product.description}
                                </p>
                              ) : (
                                <div className="mb-8 flex-1" />
                              )}
                              <a
                                href={page.hero.buttonLink || '#contact'}
                                className="mt-auto block rounded-full py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
                                style={{ backgroundColor: primary }}
                              >
                                {page.navCta?.label || page.hero.buttonText || 'Book'}
                              </a>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                </div>
              );

            case 'why-choose-us':
              return page.why.show && (
                <div key="why-choose-us">
                  {index > 0 && <WaveDivider />}
                  <section id="why" className="px-4 py-16 sm:px-6 sm:py-20">
                    <div className="mx-auto max-w-7xl">
                      <SectionHeading title={page.why.title} subtitle={page.why.subtitle} />
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {page.why.items.map((item, i) => (
                          <div
                            key={i}
                            className="rounded-xl bg-white p-6 text-center shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(128,0,32,0.1)]"
                          >
                            <div
                              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold"
                              style={{ backgroundColor: `${GOLD}22`, color: GOLD }}
                            >
                              {String(i + 1).padStart(2, '0')}
                            </div>
                            <h3
                              className="mb-2 text-lg font-semibold"
                              style={{ color: primary, fontFamily: "'Cinzel', serif" }}
                            >
                              {item.title}
                            </h3>
                            {item.description ? (
                              <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              );

            case 'testimonials':
              return page.testimonials.show && (
                <div key="testimonials">
                  {index > 0 && <WaveDivider />}
                  <section id="testimonials" className="bg-white/70 px-4 py-16 sm:px-6 sm:py-20">
                    <div className="mx-auto max-w-7xl">
                      <SectionHeading title={page.testimonials.title} subtitle={page.testimonials.subtitle} />
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {page.testimonials.items.map((item, i) => (
                          <article
                            key={i}
                            className="rounded-xl bg-white p-8 shadow-[0_5px_15px_rgba(0,0,0,0.05)]"
                          >
                            <div className="mb-4 flex gap-1" style={{ color: GOLD }}>
                              {Array.from({ length: Math.max(1, Math.min(5, item.rating || 5)) }).map(
                                (_, star) => (
                                  <Star key={star} className="h-4 w-4 fill-current" />
                                ),
                              )}
                            </div>
                            <p className="mb-6 text-sm leading-relaxed text-gray-600 italic">
                              “{item.comment}”
                            </p>
                            <p className="font-semibold" style={{ color: primary }}>
                              {item.name}
                            </p>
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              );

            case 'gallery':
              return page.gallery.show && (
                <div key="gallery">
                  {index > 0 && <WaveDivider />}
                  <section id="gallery" className="px-4 py-16 sm:px-6 sm:py-20">
                    <div className="mx-auto max-w-7xl">
                      <SectionHeading title={page.gallery.title} subtitle={page.gallery.subtitle} />
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {page.gallery.images.map((image, i) => (
                          <div
                            key={image.url + i}
                            className="group relative h-72 overflow-hidden rounded-xl"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image.url}
                              alt={image.caption || ''}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                            />
                            {image.caption ? (
                              <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-[#800020]/85 to-transparent p-5 text-white opacity-0 transition group-hover:opacity-100">
                                <h5 className="font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>
                                  {image.caption}
                                </h5>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              );

            case 'faq':
              return page.faq.show && (
                <div key="faq">
                  {index > 0 && <WaveDivider />}
                  <section id="faq" className="px-4 py-16 sm:px-6 sm:py-20">
                    <div className="mx-auto max-w-3xl">
                      <SectionHeading title={page.faq.title} subtitle={page.faq.subtitle} />
                      <div className="space-y-4">
                        {page.faq.items.map((item, i) => (
                          <details
                            key={i}
                            className="group rounded-xl border border-black/5 bg-white p-5 open:shadow-md"
                          >
                            <summary
                              className="cursor-pointer list-none font-semibold"
                              style={{ color: primary, fontFamily: "'Cinzel', serif" }}
                            >
                              {item.question}
                            </summary>
                            <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.answer}</p>
                          </details>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              );

            case 'blogs':
              return page.blogs.show && (
                <div key="blogs">
                  {index > 0 && <WaveDivider />}
                  <section id="blogs" className="px-4 py-16 sm:px-6 sm:py-20">
                    <div className="mx-auto max-w-7xl">
                      <SectionHeading title={page.blogs.title} subtitle={page.blogs.subtitle} />
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {page.blogs.items.map((blog, i) => (
                          <article
                            key={blog._id || i}
                            className="overflow-hidden rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.06)]"
                          >
                            {blog.featuredImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={blog.featuredImage}
                                alt={blog.title}
                                className="aspect-[16/10] w-full object-cover"
                              />
                            ) : null}
                            <div className="p-5">
                              <h3
                                className="mb-2 text-xl font-semibold"
                                style={{ color: primary, fontFamily: "'Cinzel', serif" }}
                              >
                                {blog.title}
                              </h3>
                              {blog.excerpt ? (
                                <p className="line-clamp-3 text-sm text-gray-600">{blog.excerpt}</p>
                              ) : null}
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              );

            case 'contact':
              return page.contact.show && (
                <div key="contact">
                  {index > 0 && <WaveDivider />}
                  <section id="contact" className="px-4 py-16 sm:px-6 sm:py-20">
                    <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-2">
                      <div>
                        {page.contact.title ? (
                          <SectionHeading title={page.contact.title} subtitle={page.contact.subtitle} />
                        ) : null}
                        {page.contact.content ? (
                          <div
                            className="mb-8 prose max-w-none text-gray-600"
                            dangerouslySetInnerHTML={{ __html: page.contact.content }}
                          />
                        ) : null}
                        <div className="space-y-4 text-sm">
                          {page.phone ? (
                            <p className="flex items-center gap-3">
                              <Phone className="h-4 w-4" style={{ color: GOLD }} />
                              <a href={`tel:${page.phone}`}>{page.phone}</a>
                            </p>
                          ) : null}
                          {page.email ? (
                            <p className="flex items-center gap-3">
                              <Mail className="h-4 w-4" style={{ color: GOLD }} />
                              <a href={`mailto:${page.email}`}>{page.email}</a>
                            </p>
                          ) : null}
                          {page.addressLine ? (
                            <p className="flex items-start gap-3">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                              <span>{page.addressLine}</span>
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white p-6 shadow-[0_5px_30px_rgba(0,0,0,0.1)] sm:p-8">
                        <ContactForm
                          companyId={props.company._id}
                          primaryColor={primary}
                          services={page.services.items.map((s) => s.name).filter(Boolean)}
                        />
                      </div>
                    </div>
                  </section>
                </div>
              );

            case 'subscribe':
              return page.subscribe.show && (
                <div key="subscribe">
                  {index > 0 && <WaveDivider />}
                  <section
                    id="subscribe"
                    className="px-4 py-16 text-white sm:px-6 sm:py-20"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${DEEP_GREEN})` }}
                  >
                    <div className="mx-auto max-w-xl text-center">
                      <h2
                        className="mb-3 text-3xl font-semibold"
                        style={{ fontFamily: "'Cinzel', serif", color: GOLD }}
                      >
                        {page.subscribe.title}
                      </h2>
                      {page.subscribe.subtitle ? (
                        <p className="mb-8 text-white/85">{page.subscribe.subtitle}</p>
                      ) : null}
                      <NewsletterForm
                        companyId={props.company._id}
                        buttonText={page.subscribe.buttonText}
                        placeholder={page.subscribe.placeholder}
                        primaryColor={GOLD}
                      />
                      {page.subscribe.note ? (
                        <p className="mt-4 text-xs text-white/70">{page.subscribe.note}</p>
                      ) : null}
                    </div>
                  </section>
                </div>
              );

            default:
              return null;
          }
        })}
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] px-4 pt-16 text-white sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3
              className="mb-4 text-xl font-semibold"
              style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
            >
              {page.footer.title}
            </h3>
            {page.footer.content ? (
              <p className="text-sm leading-relaxed text-gray-300">{page.footer.content}</p>
            ) : null}
            <div className="mt-5 flex gap-3">
              {social.instagram ? (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:-translate-y-1 hover:bg-[#D4AF37] hover:text-[#800020]"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              ) : null}
              {social.facebook ? (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:-translate-y-1 hover:bg-[#D4AF37] hover:text-[#800020]"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
              ) : null}
              {social.youtube ? (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:-translate-y-1 hover:bg-[#D4AF37] hover:text-[#800020]"
                >
                  <YoutubeIcon className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div>
            <h3
              className="mb-4 text-xl font-semibold"
              style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
            >
              Links
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {(page.footer.items.length ? page.footer.items : page.nav).map((item) => (
                <li key={item.link + item.label}>
                  <a href={item.link} className="transition hover:text-[#D4AF37]">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="mb-4 text-xl font-semibold"
              style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
            >
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              {page.addressLine ? (
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                  {page.addressLine}
                </li>
              ) : null}
              {page.phone ? (
                <li className="flex gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                  {page.phone}
                </li>
              ) : null}
              {page.email ? (
                <li className="flex gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                  {page.email}
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            {page.subscribe.show ? (
              <>
                <h3
                  className="mb-4 text-xl font-semibold"
                  style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
                >
                  {page.subscribe.title}
                </h3>
                {page.subscribe.subtitle ? (
                  <p className="mb-4 text-sm text-gray-300">{page.subscribe.subtitle}</p>
                ) : null}
                <NewsletterForm
                  companyId={props.company._id}
                  buttonText={page.subscribe.buttonText}
                  placeholder={page.subscribe.placeholder}
                  primaryColor={GOLD}
                />
              </>
            ) : page.footer.subtitle ? (
              <p className="text-sm text-gray-300">{page.footer.subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 py-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {page.brandName} - Promoted By Multi-Tenant Platform Provisioning Tech
        </div>
      </footer>

      {/* WhatsApp float */}
      {page.whatsapp ? (
        <a
          href={page.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-lg transition hover:scale-110 hover:bg-[#128C7E]"
          aria-label="WhatsApp"
        >
          <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden>
            <path d="M16.04 4C9.67 4 4.5 9.16 4.5 15.52c0 2.03.54 4.01 1.56 5.76L4.4 28l6.9-1.8a11.5 11.5 0 0 0 4.74 1.02h.01c6.37 0 11.54-5.16 11.54-11.52C27.59 9.16 22.41 4 16.04 4zm6.67 16.3c-.28.79-1.63 1.45-2.27 1.54-.58.08-1.32.12-2.13-.13-.49-.15-1.12-.36-1.93-.71-3.4-1.47-5.61-4.9-5.78-5.13-.17-.23-1.38-1.84-1.38-3.51 0-1.67.88-2.49 1.19-2.83.31-.34.68-.43.9-.43h.65c.21 0 .49-.08.76.58.28.68.95 2.33 1.03 2.5.08.17.14.37.03.6-.11.23-.17.37-.34.57-.17.2-.35.44-.5.59-.17.17-.34.35-.15.69.2.34.88 1.45 1.89 2.35 1.3 1.15 2.4 1.51 2.74 1.68.34.17.54.14.74-.08.2-.23.85-.99 1.08-1.33.23-.34.45-.28.76-.17.31.11 1.97.93 2.31 1.1.34.17.57.25.65.39.08.14.08.82-.2 1.61z" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}
