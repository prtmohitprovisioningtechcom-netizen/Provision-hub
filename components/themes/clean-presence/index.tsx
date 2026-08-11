'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Mail, MapPin, Menu, Phone, X, Star, ArrowRight } from 'lucide-react';
import {
  ICompany, IProduct, IService, IReview, IBlog, ILandingPageSection,
} from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
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

export function CleanPresenceTheme(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = resolveThemePage(props);
  
  const primary = page.primaryColor || '#0ea5e9'; // sky-500 fallback
  
  return (
    <div className="font-sans text-slate-800 bg-white min-h-screen selection:bg-slate-100">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link href={`/${page.slug}`} className="flex items-center gap-3">
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-xl font-medium tracking-tight text-slate-900">
                {page.brandName}
              </span>
            )}
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {page.nav.map((item) => (
              <a
                key={item.link + item.label}
                href={item.link}
                className="text-sm text-slate-500 hover:text-slate-900 transition"
              >
                {item.label}
              </a>
            ))}
            {page.navCta && (
              <a
                href={page.navCta.link}
                className="px-6 py-2.5 text-sm text-white rounded-full transition hover:opacity-90 font-medium"
                style={{ backgroundColor: primary }}
              >
                {page.navCta.label}
              </a>
            )}
          </div>

          <button className="lg:hidden text-slate-900" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {menuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 absolute w-full left-0 mt-4 px-6 py-6 shadow-xl rounded-b-2xl">
            <div className="flex flex-col space-y-6">
              {page.nav.map((item) => (
                <a
                  key={item.link + item.label}
                  href={item.link}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {page.navCta && (
                <a
                  href={page.navCta.link}
                  className="inline-block px-6 py-3 text-sm text-white rounded-full transition hover:opacity-90 font-medium text-center mt-2"
                  style={{ backgroundColor: primary }}
                  onClick={() => setMenuOpen(false)}
                >
                  {page.navCta.label}
                </a>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="pt-20">
        {page.orderedSectionTypes.map((type) => {
          switch (type) {
            case 'hero':
              return page.hero.show && (
                <section id="home" key="hero" className="py-24 lg:py-36 px-6">
                  <div className="mx-auto max-w-5xl text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                      {page.hero.eyebrow && (
                        <span className="inline-block mb-6 text-sm font-medium tracking-wide" style={{ color: primary }}>
                          {page.hero.eyebrow}
                        </span>
                      )}
                      <h1 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tight mb-8 text-slate-900 leading-tight">
                        {page.hero.title}
                      </h1>
                      <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                        {page.hero.subtitle}
                      </p>
                      {page.hero.buttonText && (
                        <a
                          href={page.hero.buttonLink}
                          className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-full transition hover:shadow-lg font-medium"
                          style={{ backgroundColor: primary }}
                        >
                          {page.hero.buttonText}
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      )}
                    </motion.div>
                    
                    {page.hero.image && (
                      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="mt-20">
                        <img
                          src={page.hero.image}
                          alt="Hero"
                          className="rounded-2xl w-full h-[60vh] object-cover border border-slate-100 shadow-sm"
                        />
                      </motion.div>
                    )}
                  </div>
                </section>
              );

            case 'about':
              return page.about.show && (
                <section id="about" key="about" className="py-16 md:py-24 px-6 bg-slate-50/50">
                  <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                      <div className="order-2 lg:order-1">
                        <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-6 text-slate-900">{page.about.title}</h2>
                        <p className="text-xl text-slate-500 mb-8 font-light">{page.about.subtitle}</p>
                        <div className="prose prose-slate prose-lg text-slate-600 font-light leading-relaxed" dangerouslySetInnerHTML={{ __html: page.about.content }} />
                      </div>
                      {page.about.image && (
                        <div className="order-1 lg:order-2">
                          <img src={page.about.image} alt="About" className="rounded-2xl w-full h-auto object-cover shadow-sm" />
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );

            case 'why-choose-us':
              return page.why.show && page.why.items.length > 0 && (
                <section id="why-choose-us" key="why-choose-us" className="py-16 md:py-24 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-20 max-w-2xl mx-auto">
                      <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-6 text-slate-900">{page.why.title}</h2>
                      <p className="text-xl text-slate-500 font-light">{page.why.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {page.why.items.map((item, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-white border border-slate-100 hover:shadow-md hover:border-slate-200 transition duration-300 group">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `${primary}10`, color: primary }}>
                            <Check className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-medium mb-3 text-slate-900">{item.title}</h3>
                          <p className="text-slate-500 font-light leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'services':
              return page.services.show && page.services.items.length > 0 && (
                <section id="services" key="services" className="py-16 md:py-24 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-20 max-w-2xl mx-auto">
                      <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-6 text-slate-900">{page.services.title}</h2>
                      <p className="text-xl text-slate-500 font-light">{page.services.subtitle}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {page.services.items.map((service, i) => {
                        const img = getServiceImage(service);
                        return (
                          <div key={service._id || i} className="rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition duration-300 overflow-hidden">
                            {img ? (
                              <img src={img} alt={service.name} className="aspect-[16/10] w-full object-cover" />
                            ) : (
                              <div className="px-8 pt-8">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primary}10`, color: primary }}>
                                  <Check className="w-5 h-5" />
                                </div>
                              </div>
                            )}
                            <div className="p-8">
                              <h3 className="text-xl font-medium mb-3 text-slate-900">{service.name}</h3>
                              <p className="text-slate-500 mb-8 font-light leading-relaxed">{service.description}</p>
                              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                                <span className="font-medium text-lg text-slate-900">{formatCurrency(service.price)}</span>
                                <span className="text-sm text-slate-400">{service.duration}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );

            case 'products':
              return page.products.show && page.products.items.length > 0 && (
                <section id="products" key="products" className="py-16 md:py-24 px-6 bg-slate-50">
                  <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 lg:mb-16 gap-6 text-center md:text-left">
                      <div className="max-w-2xl">
                        <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4 text-slate-900">{page.products.title}</h2>
                        <p className="text-xl text-slate-500 font-light">{page.products.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {page.products.items.map((product, i) => (
                        <div key={product._id || i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-md transition duration-300 group">
                          <div className="relative aspect-square overflow-hidden bg-slate-50 p-6">
                            <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition duration-500" />
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-medium mb-2 text-slate-900">{product.name}</h3>
                            <p className="text-slate-500 text-sm mb-4 font-light line-clamp-2">{product.description}</p>
                            <div>
                                {product.offerPrice ? (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-lg text-slate-900">{formatCurrency(product.offerPrice)}</span>
                                    <span className="text-sm text-slate-400 line-through">{formatCurrency(product.price)}</span>
                                  </div>
                                ) : (
                                  <span className="font-medium text-lg text-slate-900">{formatCurrency(product.price)}</span>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'gallery':
              return page.gallery.show && page.gallery.images.length > 0 && (
                <section id="gallery" key="gallery" className="py-16 md:py-24 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                      <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4 text-slate-900">{page.gallery.title}</h2>
                      <p className="text-xl text-slate-500 font-light">{page.gallery.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {page.gallery.images.map((img, i) => (
                        <div key={i} className="relative rounded-2xl overflow-hidden bg-slate-50 aspect-square group">
                          <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                          {img.caption && (
                            <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center p-6 text-center backdrop-blur-sm">
                              <p className="text-slate-900 font-medium">{img.caption}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'testimonials':
              return page.testimonials.show && page.testimonials.items.length > 0 && (
                <section id="testimonials" key="testimonials" className="py-16 md:py-24 px-6 bg-slate-50/50">
                  <div className="mx-auto max-w-7xl">
                    <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-16 text-center text-slate-900">{page.testimonials.title}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                      {page.testimonials.items.map((test, i) => (
                        <div key={i} className="bg-white p-10 rounded-2xl border border-slate-100">
                          <div className="flex gap-1 mb-6">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-4 h-4 ${j < test.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-100'}`} />
                            ))}
                          </div>
                          <p className="text-slate-600 mb-8 font-light leading-relaxed">"{test.comment}"</p>
                          <p className="font-medium text-slate-900">{test.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'faq':
              return page.faq.show && page.faq.items.length > 0 && (
                <section id="faq" key="faq" className="py-16 md:py-24 px-6">
                  <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4 text-slate-900">{page.faq.title}</h2>
                      <p className="text-xl text-slate-500 font-light">{page.faq.subtitle}</p>
                    </div>
                    <div className="space-y-4">
                      {page.faq.items.map((faq, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-slate-50/50 border border-slate-100">
                          <h3 className="text-xl font-medium mb-3 text-slate-900">{faq.question}</h3>
                          <p className="text-slate-600 font-light leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'subscribe':
              return page.subscribe.show && (
                <section id="subscribe" key="subscribe" className="py-16 md:py-24 px-6 bg-slate-50">
                  <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4 text-slate-900">{page.subscribe.title}</h2>
                    <p className="text-xl text-slate-500 font-light mb-12 max-w-2xl mx-auto">{page.subscribe.subtitle}</p>
                    <div className="max-w-md mx-auto">
                      <NewsletterForm 
                        companyId={props.company._id} 
                        buttonText={page.subscribe.buttonText} 
                        placeholder={page.subscribe.placeholder} 
                        primaryColor={primary} 
                      />
                      {page.subscribe.note && (
                        <p className="text-sm text-slate-400 mt-4">{page.subscribe.note}</p>
                      )}
                    </div>
                  </div>
                </section>
              );

            case 'blogs':
              return page.blogs.show && page.blogs.items.length > 0 && (
                <section id="blogs" key="blogs" className="py-16 md:py-24 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                      <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4 text-slate-900">{page.blogs.title}</h2>
                      <p className="text-xl text-slate-500 font-light">{page.blogs.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {page.blogs.items.map((blog, i) => (
                        <div key={blog._id || i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-md hover:border-slate-200 transition duration-300 group cursor-pointer">
                          <div className="relative aspect-[3/2] overflow-hidden bg-slate-50">
                            <img src={(blog as any).image || blog.featuredImage || '/placeholder.png'} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          </div>
                          <div className="p-8">
                            <div className="text-sm font-medium text-slate-400 mb-4">{formatDate((blog as any).publishedAt || blog.createdAt)}</div>
                            <h3 className="text-xl font-medium mb-3 text-slate-900 group-hover:text-blue-600 transition-colors" style={{ color: primary }}>{blog.title}</h3>
                            <p className="text-slate-500 font-light line-clamp-3 leading-relaxed">{blog.excerpt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'contact':
              return page.contact.show && (
                <section id="contact" key="contact" className="py-16 md:py-24 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
                      <div>
                        <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-6 text-slate-900">{page.contact.title}</h2>
                        <p className="text-xl text-slate-500 mb-12 font-light">{page.contact.subtitle}</p>
                        
                        <div className="space-y-8">
                           {page.phone && (
                             <div className="flex items-center gap-6">
                               <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center shrink-0">
                                 <Phone className="w-5 h-5 text-slate-600" />
                               </div>
                               <div>
                                 <p className="text-sm text-slate-400 mb-1">Phone</p>
                                 <p className="text-lg font-medium text-slate-900">{page.phone}</p>
                               </div>
                             </div>
                           )}
                           {page.email && (
                             <div className="flex items-center gap-6">
                               <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center shrink-0">
                                 <Mail className="w-5 h-5 text-slate-600" />
                               </div>
                               <div>
                                 <p className="text-sm text-slate-400 mb-1">Email</p>
                                 <p className="text-lg font-medium text-slate-900">{page.email}</p>
                               </div>
                             </div>
                           )}
                           {page.addressLine && (
                             <div className="flex items-center gap-6">
                               <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center shrink-0">
                                 <MapPin className="w-5 h-5 text-slate-600" />
                               </div>
                               <div>
                                 <p className="text-sm text-slate-400 mb-1">Address</p>
                                 <p className="text-lg font-medium text-slate-900">{page.addressLine}</p>
                               </div>
                             </div>
                           )}
                        </div>
                      </div>
                      
                      <div className="bg-white border border-slate-100 rounded-3xl p-8 lg:p-12 shadow-sm">
                        <ContactForm companyId={props.company._id} />
                      </div>
                    </div>
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 bg-slate-50 text-slate-500 text-sm">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            &copy; {new Date().getFullYear()} {page.brandName}. - Promoted By Multi-Tenant Platform Provisioning Tech All rights reserved.
          </div>
          <div className="flex gap-8">
             {page.nav.map((item) => (
                <a key={item.link} href={item.link} className="hover:text-slate-900 transition">{item.label}</a>
             ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
