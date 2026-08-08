'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { resolveThemePage } from '@/lib/resolve-theme-page';
import { getServiceImage } from './service-image';
import type { ThemeLayoutProps } from './types';

export function LayoutBands({ skin, ...props }: ThemeLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = resolveThemePage(props);
  const primary = page.primaryColor || skin.primary;

  return (
    <div
      className="tl-bands min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: skin.bg,
        color: skin.fg,
        fontFamily: skin.bodyFont,
      }}
    >
      <link href={skin.googleFontsUrl} rel="stylesheet" />
      <style dangerouslySetInnerHTML={{
        __html: `
          .tl-bands .tl-display { font-family: ${skin.displayFont}; }
          .tl-bands h1, .tl-bands h2, .tl-bands h3, .tl-bands p, .tl-bands a {
            overflow-wrap: break-word; word-break: break-word; max-width: 100%;
          }
        `,
      }}
      />

      <header className="absolute inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-white md:px-8">
          <Link href={`/${page.slug}`} className="text-xs font-semibold uppercase tracking-[0.28em]">
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-8 object-contain brightness-0 invert" />
            ) : (
              page.brandName
            )}
          </Link>
          <nav className="hidden gap-8 text-[11px] font-semibold uppercase tracking-[0.22em] md:flex">
            {page.nav.map((item) => (
              <a key={item.link + item.label} href={item.link} className="hover:opacity-70">{item.label}</a>
            ))}
            {page.navCta && <a href={page.navCta.link} className="hover:opacity-70">{page.navCta.label}</a>}
          </nav>
          <button type="button" className="md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-center gap-6 px-8" style={{ backgroundColor: skin.inverseBg, color: skin.inverseFg }}>
          {page.nav.map((item) => (
            <a
              key={item.link + item.label}
              href={item.link}
              onClick={() => setMenuOpen(false)}
              className="tl-display text-3xl"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}

      {page.hero.show && (
        <section id="hero" className="relative min-h-[100svh] overflow-hidden">
          {page.hero.image ? (
            <img src={page.hero.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${skin.inverseBg}, ${primary}88)` }} />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.75) 100%)',
            }}
          />
          <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-32 text-white md:px-8 md:pb-24">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="tl-display text-5xl leading-none md:text-7xl lg:text-8xl">{page.brandName}</p>
              <div className="mt-4 h-1 w-24" style={{ backgroundColor: primary }} />
              {page.hero.eyebrow && (
                <p className="mt-6 text-xs uppercase tracking-[0.3em] text-white/70">{page.hero.eyebrow}</p>
              )}
              {page.hero.title && page.hero.title !== page.brandName && (
                <h1 className="tl-display mt-3 max-w-3xl text-2xl md:text-4xl">{page.hero.title}</h1>
              )}
              {page.hero.subtitle && (
                <p className="mt-4 max-w-lg text-sm text-white/75 md:text-base">{page.hero.subtitle}</p>
              )}
              {page.hero.buttonText && (
                <a
                  href={page.hero.buttonLink}
                  className="mt-8 inline-flex px-8 py-3 text-sm font-semibold"
                  style={{ backgroundColor: primary, color: skin.onPrimary }}
                >
                  {page.hero.buttonText}
                </a>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {page.about.show && (page.about.title || page.about.content) && (
        <section id="about" className="px-5 py-24 md:px-8" style={{ backgroundColor: skin.surface }}>
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              {page.about.eyebrow && (
                <p className="text-xs uppercase tracking-[0.28em]" style={{ color: primary }}>{page.about.eyebrow}</p>
              )}
              {page.about.title && (
                <h2 className="tl-display mt-3 text-4xl md:text-5xl">{page.about.title}</h2>
              )}
            </div>
            <div className="md:col-span-8">
              {page.about.subtitle && <p className="text-sm" style={{ color: skin.muted }}>{page.about.subtitle}</p>}
              {page.about.content && (
                <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed md:text-lg" style={{ color: skin.muted }}>
                  {page.about.content}
                </p>
              )}
              {page.about.image && (
                <img src={page.about.image} alt="" className="mt-10 max-h-80 w-full object-cover" />
              )}
            </div>
          </div>
        </section>
      )}

      {page.why.show && (
        <section id="why" className="py-20" style={{ backgroundColor: skin.inverseBg, color: skin.inverseFg }}>
          <div className="mx-auto flex max-w-6xl flex-wrap gap-x-10 gap-y-4 overflow-hidden px-5 md:px-8">
            {page.why.title && (
              <h2 className="tl-display w-full text-3xl md:text-4xl">{page.why.title}</h2>
            )}
            <div className="mt-8 flex w-full flex-wrap gap-3">
              {page.why.items.map((item, i) => (
                <span
                  key={i}
                  className="border px-4 py-2 text-sm"
                  style={{ borderColor: `${primary}88` }}
                >
                  {item.title}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {page.services.show && (
        <section id="services">
          {page.services.title && (
            <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
              <h2 className="tl-display text-4xl md:text-6xl">{page.services.title}</h2>
              {page.services.subtitle && (
                <p className="mt-3 max-w-lg text-sm" style={{ color: skin.muted }}>{page.services.subtitle}</p>
              )}
            </div>
          )}
          {page.services.items.map((service: any, index: number) => {
            const darkBand = index % 2 === 0;
            const img = getServiceImage(service);
            return (
              <motion.article
                key={service._id || service.id || service.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="px-5 py-16 md:px-8"
                style={{
                  backgroundColor: darkBand ? skin.inverseBg : skin.bg,
                  color: darkBand ? skin.inverseFg : skin.fg,
                }}
              >
                <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center">
                  {img ? (
                    <img
                      src={img}
                      alt={service.name || ''}
                      className={`aspect-[16/10] w-full object-cover ${index % 2 === 1 ? 'md:order-2' : ''}`}
                    />
                  ) : (
                    <div
                      className={`aspect-[16/10] w-full ${index % 2 === 1 ? 'md:order-2' : ''}`}
                      style={{ background: `linear-gradient(135deg, ${primary}44, transparent)` }}
                    />
                  )}
                  <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                    <span className="tl-display text-5xl opacity-40" style={{ color: primary }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {service.name && <h3 className="tl-display mt-2 text-3xl md:text-4xl">{service.name}</h3>}
                    {service.description && (
                      <p className="mt-3 max-w-xl text-sm opacity-75">{service.description}</p>
                    )}
                    {Number(service.price) > 0 && (
                      <p className="tl-display mt-5 text-2xl" style={{ color: primary }}>{formatCurrency(service.price)}</p>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>
      )}

      {page.products.show && (
        <section id="products" className="py-24" style={{ backgroundColor: skin.surface }}>
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            {page.products.title && <h2 className="tl-display text-4xl">{page.products.title}</h2>}
            <div className="mt-12 space-y-0 divide-y" style={{ borderColor: skin.border }}>
              {page.products.items.map((product: any) => (
                <div key={product._id || product.id || product.name} className="grid gap-6 py-10 md:grid-cols-[1fr_1.2fr] md:items-center">
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.name || ''} className="aspect-[16/10] w-full object-cover" />
                  )}
                  <div>
                    {product.name && <h3 className="tl-display text-2xl">{product.name}</h3>}
                    {product.description && (
                      <p className="mt-2 text-sm" style={{ color: skin.muted }}>{product.description}</p>
                    )}
                    {Number(product.price) > 0 && (
                      <p className="mt-4 font-semibold">{formatCurrency(product.price)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {page.gallery.show && (
        <section id="gallery">
          {page.gallery.title && (
            <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
              <h2 className="tl-display text-4xl">{page.gallery.title}</h2>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4">
            {page.gallery.images.map((img, i) => (
              <img key={i} src={img.url} alt={img.caption || ''} className="aspect-[3/4] w-full object-cover" />
            ))}
          </div>
        </section>
      )}

      {page.testimonials.show && (
        <section id="testimonials" className="py-28" style={{ backgroundColor: skin.inverseBg, color: skin.inverseFg }}>
          <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
            {page.testimonials.title && (
              <h2 className="tl-display text-3xl md:text-4xl">{page.testimonials.title}</h2>
            )}
            <div className="mt-16 space-y-16">
              {page.testimonials.items.map((review, i) => (
                <blockquote key={i}>
                  {review.comment && (
                    <p className="tl-display text-2xl italic leading-relaxed md:text-4xl">“{review.comment}”</p>
                  )}
                  {review.name && (
                    <footer className="mt-6 text-xs uppercase tracking-[0.25em] opacity-50">{review.name}</footer>
                  )}
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {page.faq.show && (
        <section id="faq" className="mx-auto max-w-3xl px-5 py-24 md:px-8">
          {page.faq.title && <h2 className="tl-display text-3xl">{page.faq.title}</h2>}
          <div className="mt-10 space-y-8">
            {page.faq.items.map((item, i) => (
              <div key={i}>
                {item.question && <h3 className="text-lg font-semibold">{item.question}</h3>}
                {item.answer && <p className="mt-2 text-sm" style={{ color: skin.muted }}>{item.answer}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {page.blogs.show && (
        <section id="blogs" className="border-y py-20" style={{ borderColor: skin.border, backgroundColor: skin.surface }}>
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            {page.blogs.title && <h2 className="tl-display text-3xl">{page.blogs.title}</h2>}
            <div className="mt-8 flex flex-col">
              {page.blogs.items.map((blog: any) => (
                <Link
                  key={blog._id || blog.slug}
                  href={`/${page.slug}/blog/${blog.slug}`}
                  className="border-t py-6 text-2xl transition hover:opacity-70"
                  style={{ borderColor: skin.border, fontFamily: skin.displayFont }}
                >
                  {blog.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {page.contact.show && (
        <footer id="contact" className="py-24" style={{ backgroundColor: skin.inverseBg, color: skin.inverseFg }}>
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <p className="tl-display text-5xl md:text-7xl">{page.brandName}</p>
            <div className="mt-3 h-1 w-20" style={{ backgroundColor: primary }} />
            {(page.contact.title || page.footer.content) && (
              <p className="mt-8 max-w-lg text-sm opacity-70">
                {page.contact.title || page.contact.content || page.footer.content}
              </p>
            )}
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <div className="space-y-3 text-sm opacity-80">
                {page.phone && (
                  <a href={`tel:${page.phone}`} className="flex items-center gap-3">
                    <Phone className="h-4 w-4" style={{ color: primary }} /> {page.phone}
                  </a>
                )}
                {page.email && (
                  <a href={`mailto:${page.email}`} className="flex items-center gap-3">
                    <Mail className="h-4 w-4" style={{ color: primary }} /> {page.email}
                  </a>
                )}
                {page.addressLine && (
                  <p className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: primary }} /> {page.addressLine}
                  </p>
                )}
              </div>
              {page.footer.items.length > 0 && (
                <div className="flex flex-wrap content-start gap-x-6 gap-y-2 text-sm opacity-60">
                  {page.footer.items.map((item) => (
                    <a key={item.link + item.label} href={item.link}>{item.label}</a>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-16 text-xs opacity-40">© {new Date().getFullYear()} {page.brandName} - Promoted By Multi-Tenant Platform Provisioning Tech</p>
          </div>
        </footer>
      )}
    </div>
  );
}
