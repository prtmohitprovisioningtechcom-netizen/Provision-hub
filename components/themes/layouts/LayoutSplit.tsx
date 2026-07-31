'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { resolveThemePage } from '@/lib/resolve-theme-page';
import { getServiceImage } from './service-image';
import type { ThemeLayoutProps } from './types';

export function LayoutSplit({ skin, ...props }: ThemeLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = resolveThemePage(props);
  const primary = page.primaryColor || skin.primary;

  return (
    <div
      className="tl-split min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: skin.bg,
        color: skin.fg,
        fontFamily: skin.bodyFont,
      }}
    >
      <link href={skin.googleFontsUrl} rel="stylesheet" />
      <style dangerouslySetInnerHTML={{
        __html: `
          .tl-split .tl-display { font-family: ${skin.displayFont}; }
          .tl-split h1, .tl-split h2, .tl-split h3, .tl-split p, .tl-split a {
            overflow-wrap: break-word; word-break: break-word; max-width: 100%;
          }
        `,
      }}
      />

      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <Link
            href={`/${page.slug}`}
            className="tl-display text-lg font-semibold md:text-xl"
            style={{ color: skin.dark || page.hero.show ? '#fff' : skin.fg }}
          >
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-9 object-contain brightness-0 invert" />
            ) : (
              page.brandName
            )}
          </Link>
          <nav className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 md:flex">
            {page.nav.map((item) => (
              <a key={item.link + item.label} href={item.link} className="hover:text-white">
                {item.label}
              </a>
            ))}
            {page.navCta && (
              <a
                href={page.navCta.link}
                className="border border-white/50 px-4 py-2 text-white transition hover:bg-white hover:text-black"
              >
                {page.navCta.label}
              </a>
            )}
          </nav>
          <button type="button" className="text-white md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="mx-4 flex flex-col gap-3 p-5 md:hidden" style={{ backgroundColor: skin.inverseBg, color: skin.inverseFg }}>
            {page.nav.map((item) => (
              <a key={item.link + item.label} href={item.link} onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
          </div>
        )}
      </header>

      {page.hero.show && (
        <section id="hero" className="grid min-h-[100svh] lg:grid-cols-2">
          <div
            className="flex flex-col justify-center px-6 py-28 md:px-12 lg:px-16"
            style={{ backgroundColor: skin.inverseBg, color: skin.inverseFg }}
          >
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }}>
              {page.hero.eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: primary }}>
                  {page.hero.eyebrow}
                </p>
              )}
              <h1 className="tl-display mt-4 text-4xl leading-[1.05] md:text-6xl lg:text-7xl">
                {page.hero.title}
              </h1>
              {page.hero.subtitle && (
                <p className="mt-6 max-w-md text-base opacity-75">{page.hero.subtitle}</p>
              )}
              {page.hero.buttonText && (
                <a
                  href={page.hero.buttonLink}
                  className="mt-10 inline-flex px-7 py-3.5 text-sm font-semibold"
                  style={{ backgroundColor: primary, color: skin.onPrimary }}
                >
                  {page.hero.buttonText}
                </a>
              )}
            </motion.div>
          </div>
          <div className="relative min-h-[42vh] lg:min-h-full">
            {page.hero.image ? (
              <img src={page.hero.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${primary}55, ${skin.inverseBg})` }} />
            )}
          </div>
        </section>
      )}

      {page.about.show && (page.about.title || page.about.content || page.about.image) && (
        <section id="about" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
          <div className={`grid items-center gap-12 lg:grid-cols-2 ${page.about.image ? '' : ''}`}>
            <div>
              {page.about.eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: primary }}>
                  {page.about.eyebrow}
                </p>
              )}
              {page.about.title && (
                <h2 className="tl-display mt-3 text-3xl md:text-5xl">{page.about.title}</h2>
              )}
              {page.about.subtitle && <p className="mt-2 text-sm" style={{ color: skin.muted }}>{page.about.subtitle}</p>}
              {page.about.content && (
                <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed" style={{ color: skin.muted }}>
                  {page.about.content}
                </p>
              )}
            </div>
            {page.about.image && (
              <img src={page.about.image} alt="" className="max-h-[28rem] w-full object-cover" />
            )}
          </div>
        </section>
      )}

      {page.why.show && (
        <section id="why" className="border-y py-20" style={{ borderColor: skin.border, backgroundColor: skin.surface }}>
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            {page.why.title && <h2 className="tl-display text-3xl md:text-4xl">{page.why.title}</h2>}
            <ul className="mt-12 space-y-8">
              {page.why.items.map((item, i) => (
                <li key={i} className="grid gap-4 border-t pt-8 md:grid-cols-[5rem_1fr]" style={{ borderColor: skin.border }}>
                  <span className="tl-display text-3xl" style={{ color: primary }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    {item.title && <h3 className="text-lg font-semibold">{item.title}</h3>}
                    {item.description && <p className="mt-1 text-sm" style={{ color: skin.muted }}>{item.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {page.services.show && (
        <section id="services" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
          {page.services.title && <h2 className="tl-display text-3xl md:text-5xl">{page.services.title}</h2>}
          {page.services.subtitle && (
            <p className="mt-3 max-w-lg text-sm" style={{ color: skin.muted }}>{page.services.subtitle}</p>
          )}
          <div className="mt-14 divide-y" style={{ borderColor: skin.border }}>
            {page.services.items.map((service: any, index: number) => {
              const img = getServiceImage(service);
              return (
                <motion.article
                  key={service._id || service.id || service.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`grid gap-6 py-12 md:grid-cols-2 md:items-center ${index % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
                >
                  <div>
                    <span className="tl-display text-4xl opacity-30">{String(index + 1).padStart(2, '0')}</span>
                    {service.name && <h3 className="tl-display mt-2 text-2xl md:text-3xl">{service.name}</h3>}
                    {service.description && (
                      <p className="mt-3 text-sm leading-relaxed" style={{ color: skin.muted }}>{service.description}</p>
                    )}
                    {Number(service.price) > 0 && (
                      <p className="mt-4 text-lg font-semibold" style={{ color: primary }}>{formatCurrency(service.price)}</p>
                    )}
                  </div>
                  {img ? (
                    <img
                      src={img}
                      alt={service.name || ''}
                      className="aspect-[4/3] w-full object-cover"
                      style={{ borderRadius: skin.radius }}
                    />
                  ) : (
                    <div
                      className="min-h-[12rem] border"
                      style={{
                        borderColor: skin.border,
                        background: `linear-gradient(135deg, ${primary}22, transparent)`,
                        borderRadius: skin.radius,
                      }}
                    />
                  )}
                </motion.article>
              );
            })}
          </div>
        </section>
      )}

      {page.products.show && (
        <section id="products" className="py-24" style={{ backgroundColor: skin.surface }}>
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            {page.products.title && <h2 className="tl-display text-3xl md:text-4xl">{page.products.title}</h2>}
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {page.products.items.map((product: any) => (
                <div key={product._id || product.id || product.name} className="grid gap-4 sm:grid-cols-[1.1fr_1fr] sm:items-center">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name || ''} className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <div className="aspect-[4/3]" style={{ backgroundColor: `${primary}18` }} />
                  )}
                  <div>
                    {product.name && <h3 className="tl-display text-xl">{product.name}</h3>}
                    {product.description && (
                      <p className="mt-2 line-clamp-4 text-sm" style={{ color: skin.muted }}>{product.description}</p>
                    )}
                    {Number(product.price) > 0 && (
                      <p className="mt-3 font-semibold">{formatCurrency(product.price)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {page.gallery.show && (
        <section id="gallery" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
          {page.gallery.title && <h2 className="tl-display mb-8 text-3xl">{page.gallery.title}</h2>}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {page.gallery.images.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt={img.caption || ''}
                className={`object-cover ${i % 3 === 0 ? 'aspect-[4/5]' : 'aspect-square'}`}
              />
            ))}
          </div>
        </section>
      )}

      {page.testimonials.show && (
        <section id="testimonials" className="py-24" style={{ backgroundColor: skin.inverseBg, color: skin.inverseFg }}>
          <div className="mx-auto max-w-4xl px-5 md:px-8">
            {page.testimonials.title && (
              <h2 className="tl-display text-3xl md:text-4xl">{page.testimonials.title}</h2>
            )}
            <div className="mt-12 grid gap-10 md:grid-cols-2">
              {page.testimonials.items.map((review, i) => (
                <blockquote key={i} className="border-l-2 pl-5" style={{ borderColor: primary }}>
                  {review.comment && <p className="text-lg leading-relaxed">“{review.comment}”</p>}
                  {review.name && <footer className="mt-4 text-sm opacity-60">{review.name}</footer>}
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {page.faq.show && (
        <section id="faq" className="mx-auto max-w-3xl px-5 py-24 md:px-8">
          {page.faq.title && <h2 className="tl-display text-3xl">{page.faq.title}</h2>}
          <div className="mt-10 space-y-6">
            {page.faq.items.map((item, i) => (
              <div key={i} className="border-b pb-6" style={{ borderColor: skin.border }}>
                {item.question && <h3 className="font-semibold">{item.question}</h3>}
                {item.answer && <p className="mt-2 text-sm" style={{ color: skin.muted }}>{item.answer}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {page.blogs.show && (
        <section id="blogs" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
          {page.blogs.title && <h2 className="tl-display text-3xl">{page.blogs.title}</h2>}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {page.blogs.items.map((blog: any) => (
              <Link
                key={blog._id || blog.slug}
                href={`/${page.slug}/blog/${blog.slug}`}
                className="border p-6 transition hover:opacity-80"
                style={{ borderColor: skin.border }}
              >
                <span className="tl-display text-xl">{blog.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {page.contact.show && (
        <footer id="contact" className="grid lg:grid-cols-2" style={{ backgroundColor: skin.inverseBg, color: skin.inverseFg }}>
          <div className="px-6 py-24 md:px-12">
            {(page.contact.title || page.footer.title) && (
              <h2 className="tl-display text-3xl md:text-5xl">{page.contact.title || page.footer.title}</h2>
            )}
            {(page.contact.subtitle || page.contact.content || page.footer.content) && (
              <p className="mt-4 max-w-md text-sm opacity-70">
                {page.contact.subtitle || page.contact.content || page.footer.content}
              </p>
            )}
            {page.footer.items.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm opacity-60">
                {page.footer.items.map((item) => (
                  <a key={item.link + item.label} href={item.link}>{item.label}</a>
                ))}
              </div>
            )}
            <p className="mt-16 text-xs opacity-40">© {new Date().getFullYear()} {page.brandName}</p>
          </div>
          <div className="flex flex-col justify-center gap-5 border-t px-6 py-16 lg:border-l lg:border-t-0 md:px-12" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
            {page.phone && (
              <a href={`tel:${page.phone}`} className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4" style={{ color: primary }} /> {page.phone}
              </a>
            )}
            {page.email && (
              <a href={`mailto:${page.email}`} className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4" style={{ color: primary }} /> {page.email}
              </a>
            )}
            {page.addressLine && (
              <p className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: primary }} /> {page.addressLine}
              </p>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
