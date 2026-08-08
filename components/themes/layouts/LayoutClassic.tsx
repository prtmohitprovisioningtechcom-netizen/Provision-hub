'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { resolveThemePage } from '@/lib/resolve-theme-page';
import { getServiceImage } from './service-image';
import type { ThemeLayoutProps } from './types';

export function LayoutClassic({ skin, ...props }: ThemeLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = resolveThemePage(props);
  const primary = page.primaryColor || skin.primary;

  return (
    <div
      className="tl-classic min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: skin.bg,
        color: skin.fg,
        fontFamily: skin.bodyFont,
        ['--tl-primary' as string]: primary,
        ['--tl-radius' as string]: skin.radius,
      }}
    >
      <link href={skin.googleFontsUrl} rel="stylesheet" />
      <style dangerouslySetInnerHTML={{
        __html: `
          .tl-classic .tl-display { font-family: ${skin.displayFont}; }
          .tl-classic h1, .tl-classic h2, .tl-classic h3, .tl-classic p, .tl-classic a {
            overflow-wrap: break-word; word-break: break-word; max-width: 100%;
          }
        `,
      }}
      />

      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          backgroundColor: skin.dark ? `${skin.bg}cc` : `${skin.surface}ee`,
          borderColor: skin.border,
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link href={`/${page.slug}`} className="tl-display text-xl font-semibold md:text-2xl">
            {page.logo ? (
              <img
                src={page.logo}
                alt={page.brandName}
                className={`h-9 object-contain ${skin.dark ? 'brightness-0 invert' : ''}`}
              />
            ) : (
              page.brandName
            )}
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" style={{ color: skin.muted }}>
            {page.nav.map((item) => (
              <a key={item.link + item.label} href={item.link} className="transition hover:opacity-80">
                {item.label}
              </a>
            ))}
            {page.navCta && (
              <a
                href={page.navCta.link}
                className="px-5 py-2 text-sm font-semibold transition hover:opacity-90"
                style={{
                  backgroundColor: primary,
                  color: skin.onPrimary,
                  borderRadius: skin.radius,
                }}
              >
                {page.navCta.label}
              </a>
            )}
          </nav>
          <button type="button" className="md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="flex flex-col gap-3 border-t px-5 py-4 md:hidden" style={{ borderColor: skin.border }}>
            {page.nav.map((item) => (
              <a key={item.link + item.label} href={item.link} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {page.orderedSectionTypes.map((type) => {
        switch (type) {
          case 'hero':
            return page.hero.show && (
              <section id="hero" key="hero" className="relative min-h-[88svh] overflow-hidden">
                {page.hero.image ? (
                  <img src={page.hero.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${skin.inverseBg}, ${primary})` }} />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background: page.hero.image
                      ? 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.7) 100%)'
                      : undefined,
                  }}
                />
                <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-6xl flex-col justify-center px-5 py-24 text-white md:px-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    {page.hero.eyebrow && (
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] opacity-80">
                        {page.hero.eyebrow}
                      </p>
                    )}
                    <h1 className="tl-display max-w-3xl text-4xl font-semibold leading-tight md:text-6xl lg:text-7xl">
                      {page.hero.title}
                    </h1>
                    {page.hero.subtitle && (
                      <p className="mt-5 max-w-xl text-base text-white/80 md:text-lg">{page.hero.subtitle}</p>
                    )}
                    {page.hero.buttonText && (
                      <a
                        href={page.hero.buttonLink}
                        className="mt-8 inline-flex px-7 py-3 text-sm font-semibold transition hover:opacity-90"
                        style={{ backgroundColor: primary, color: skin.onPrimary, borderRadius: skin.radius }}
                      >
                        {page.hero.buttonText}
                      </a>
                    )}
                  </motion.div>
                </div>
              </section>
            );

          case 'about':
            return page.about.show && (page.about.title || page.about.content || page.about.image) && (
              <section id="about" key="about" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
                <div className="mx-auto max-w-3xl text-center">
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
                  {page.about.image && (
                    <img src={page.about.image} alt="" className="mx-auto mt-12 max-h-96 w-full object-cover" style={{ borderRadius: skin.radius }} />
                  )}
                </div>
              </section>
            );

          case 'why-choose-us':
            return page.why.show && (
              <section id="why" key="why" className="py-24" style={{ backgroundColor: skin.surface }}>
                <div className="mx-auto max-w-6xl px-5 md:px-8">
                  {page.why.title && <h2 className="tl-display text-center text-3xl md:text-4xl">{page.why.title}</h2>}
                  {page.why.subtitle && (
                    <p className="mx-auto mt-3 max-w-lg text-center text-sm" style={{ color: skin.muted }}>{page.why.subtitle}</p>
                  )}
                  <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {page.why.items.map((item, i) => (
                      <div key={i} className="text-center">
                        {item.title && <h3 className="tl-display text-xl font-semibold">{item.title}</h3>}
                        {item.description && (
                          <p className="mt-2 text-sm leading-relaxed" style={{ color: skin.muted }}>{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'services':
            return page.services.show && (
              <section id="services" key="services" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
                {page.services.title && <h2 className="tl-display text-center text-3xl md:text-5xl">{page.services.title}</h2>}
                {page.services.subtitle && (
                  <p className="mx-auto mt-3 max-w-lg text-center text-sm" style={{ color: skin.muted }}>{page.services.subtitle}</p>
                )}
                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {page.services.items.map((service: any) => {
                    const img = getServiceImage(service);
                    return (
                      <article
                        key={service._id || service.id || service.name}
                        className="overflow-hidden border"
                        style={{ borderColor: skin.border, backgroundColor: skin.surface, borderRadius: skin.radius }}
                      >
                        {img ? (
                          <img src={img} alt={service.name || ''} className="aspect-[16/10] w-full object-cover" />
                        ) : (
                          <div
                            className="aspect-[16/10] w-full"
                            style={{ background: `linear-gradient(135deg, ${primary}33, ${skin.bg})` }}
                          />
                        )}
                        <div className="p-6">
                          {service.name && <h3 className="tl-display text-xl font-semibold">{service.name}</h3>}
                          {service.description && (
                            <p className="mt-2 text-sm leading-relaxed" style={{ color: skin.muted }}>{service.description}</p>
                          )}
                          {Number(service.price) > 0 && (
                            <p className="mt-4 font-semibold" style={{ color: primary }}>{formatCurrency(service.price)}</p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );

          case 'products':
            return page.products.show && (
              <section id="products" key="products" className="py-24" style={{ backgroundColor: skin.surface }}>
                <div className="mx-auto max-w-6xl px-5 md:px-8">
                  {page.products.title && <h2 className="tl-display text-center text-3xl md:text-4xl">{page.products.title}</h2>}
                  <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {page.products.items.map((product: any) => (
                      <div key={product._id || product.id || product.name} className="overflow-hidden border" style={{ borderColor: skin.border, borderRadius: skin.radius }}>
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt={product.name || ''} className="aspect-[16/10] w-full object-cover" />
                        )}
                        <div className="p-5">
                          {product.name && <h3 className="tl-display text-lg font-semibold">{product.name}</h3>}
                          {product.description && (
                            <p className="mt-2 line-clamp-3 text-sm" style={{ color: skin.muted }}>{product.description}</p>
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
            );

          case 'gallery':
            return page.gallery.show && (
              <section id="gallery" key="gallery" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
                {page.gallery.title && <h2 className="tl-display mb-10 text-3xl md:text-4xl">{page.gallery.title}</h2>}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {page.gallery.images.map((img, i) => (
                    <img key={i} src={img.url} alt={img.caption || ''} className="aspect-square object-cover" style={{ borderRadius: skin.radius }} />
                  ))}
                </div>
              </section>
            );

          case 'testimonials':
            return page.testimonials.show && (
              <section id="testimonials" key="testimonials" className="py-24" style={{ backgroundColor: skin.inverseBg, color: skin.inverseFg }}>
                <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
                  {page.testimonials.title && (
                    <h2 className="tl-display text-3xl md:text-4xl">{page.testimonials.title}</h2>
                  )}
                  <div className="mt-12 space-y-12">
                    {page.testimonials.items.map((review, i) => (
                      <blockquote key={i}>
                        {review.comment && <p className="tl-display text-xl italic md:text-2xl">“{review.comment}”</p>}
                        {review.name && <footer className="mt-4 text-sm opacity-70">{review.name}</footer>}
                      </blockquote>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'faq':
            return page.faq.show && (
              <section id="faq" key="faq" className="mx-auto max-w-3xl px-5 py-24 md:px-8">
                {page.faq.title && <h2 className="tl-display text-center text-3xl">{page.faq.title}</h2>}
                <div className="mt-10 space-y-6">
                  {page.faq.items.map((item, i) => (
                    <div key={i} className="border-b pb-6" style={{ borderColor: skin.border }}>
                      {item.question && <h3 className="font-semibold">{item.question}</h3>}
                      {item.answer && <p className="mt-2 text-sm" style={{ color: skin.muted }}>{item.answer}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'blogs':
            return page.blogs.show && (
              <section id="blogs" key="blogs" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
                {page.blogs.title && <h2 className="tl-display text-3xl">{page.blogs.title}</h2>}
                <div className="mt-8 divide-y" style={{ borderColor: skin.border }}>
                  {page.blogs.items.map((blog: any) => (
                    <Link
                      key={blog._id || blog.slug}
                      href={`/${page.slug}/blog/${blog.slug}`}
                      className="block py-5 transition hover:opacity-70"
                    >
                      <span className="tl-display text-xl">{blog.title}</span>
                    </Link>
                  ))}
                </div>
              </section>
            );

          case 'contact':
            return page.contact.show && (
              <footer id="contact" key="contact" className="py-24" style={{ backgroundColor: skin.inverseBg, color: skin.inverseFg }}>
                <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2 md:px-8">
                  <div>
                    {(page.contact.title || page.footer.title) && (
                      <h2 className="tl-display text-3xl md:text-4xl">{page.contact.title || page.footer.title}</h2>
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
                  </div>
                  <div className="space-y-4 text-sm opacity-80">
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
                </div>
                <p className="mx-auto mt-16 max-w-6xl border-t px-5 pt-8 text-center text-xs opacity-40 md:px-8" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                  © {new Date().getFullYear()} {page.brandName}
                </p>
              </footer>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
