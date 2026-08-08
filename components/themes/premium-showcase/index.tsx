'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Mail, MapPin, Menu, Phone, X, Star, ChevronRight } from 'lucide-react';
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

export function PremiumShowcaseTheme(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = resolveThemePage(props);
  
  const primary = page.primaryColor || '#d4af37'; // gold fallback
  
  return (
    <div className="font-sans text-gray-200 bg-[#050505] min-h-screen">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-[#050505]/70 backdrop-blur-2xl border-b border-white/5">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link href={`/${page.slug}`} className="flex items-center gap-3">
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-2xl font-serif tracking-wider uppercase text-white">
                {page.brandName}
              </span>
            )}
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {page.nav.map((item) => (
              <a
                key={item.link + item.label}
                href={item.link}
                className="text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-white transition"
              >
                {item.label}
              </a>
            ))}
            {page.navCta && (
              <a
                href={page.navCta.link}
                className="px-8 py-3 text-xs tracking-[0.2em] uppercase text-black font-semibold transition hover:bg-white"
                style={{ backgroundColor: primary }}
              >
                {page.navCta.label}
              </a>
            )}
          </div>

          <button className="lg:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <main>
        {page.orderedSectionTypes.map((type) => {
          switch (type) {
            case 'hero':
              return page.hero.show && (
                <section id="home" key="hero" className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 z-0">
                     {page.hero.image ? (
                       <>
                         <img src={page.hero.image} alt="Hero" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
                       </>
                     ) : (
                       <div className="w-full h-full bg-[#0a0a0a]"></div>
                     )}
                  </div>
                  
                  <div className="relative z-10 w-full max-w-7xl px-6 text-center mt-20">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: "easeOut" }}>
                      {page.hero.eyebrow && (
                        <span className="block text-sm tracking-[0.3em] uppercase mb-8" style={{ color: primary }}>
                          {page.hero.eyebrow}
                        </span>
                      )}
                      <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-tight">
                        {page.hero.title}
                      </h1>
                      <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                        {page.hero.subtitle}
                      </p>
                      {page.hero.buttonText && (
                        <a
                          href={page.hero.buttonLink}
                          className="inline-flex items-center gap-4 px-10 py-5 text-sm tracking-[0.2em] uppercase text-black font-semibold hover:bg-white transition duration-500"
                          style={{ backgroundColor: primary }}
                        >
                          {page.hero.buttonText}
                          <ChevronRight className="w-4 h-4" />
                        </a>
                      )}
                    </motion.div>
                  </div>
                </section>
              );

            case 'about':
              return page.about.show && (
                <section id="about" key="about" className="py-32 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                      <div className="order-2 lg:order-1 relative">
                        <div className="absolute -inset-4 border border-white/10 z-0"></div>
                        {page.about.image && (
                          <img src={page.about.image} alt="About" className="relative z-10 w-full h-[700px] object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition duration-1000" />
                        )}
                      </div>
                      <div className="order-1 lg:order-2">
                        <h2 className="text-4xl lg:text-6xl font-serif text-white mb-8">{page.about.title}</h2>
                        <p className="text-2xl text-gray-400 mb-12 font-light italic">{page.about.subtitle}</p>
                        <div className="prose prose-invert prose-lg text-gray-400 font-light leading-loose" dangerouslySetInnerHTML={{ __html: page.about.content }} />
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'why-choose-us':
              return page.why.show && page.why.items.length > 0 && (
                <section id="why-choose-us" key="why-choose-us" className="py-32 px-6 bg-[#0a0a0a]">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-24">
                      <h2 className="text-4xl lg:text-6xl font-serif text-white mb-6">{page.why.title}</h2>
                      <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">{page.why.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                      {page.why.items.map((item, i) => (
                        <div key={i} className="group border-t border-white/10 pt-8 hover:border-white/40 transition duration-500">
                          <div className="text-3xl font-serif text-white/20 mb-6 group-hover:text-white transition duration-500">0{i + 1}</div>
                          <h3 className="text-2xl font-medium text-white mb-4">{item.title}</h3>
                          <p className="text-gray-400 font-light leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'services':
              return page.services.show && page.services.items.length > 0 && (
                <section id="services" key="services" className="py-32 px-6 bg-[#0a0a0a]">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-24">
                      <h2 className="text-4xl lg:text-6xl font-serif text-white mb-6">{page.services.title}</h2>
                      <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">{page.services.subtitle}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                      {page.services.items.map((service, i) => {
                        const img = getServiceImage(service);
                        return (
                          <div key={service._id || i} className="group cursor-pointer">
                            <div className="flex gap-8 items-start pb-12 border-b border-white/10 group-hover:border-white/30 transition duration-500">
                              <div className="text-3xl font-serif text-white/20 group-hover:text-white transition duration-500">0{i + 1}</div>
                              <div className="flex-1">
                                {img && (
                                  <img src={img} alt={service.name} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover mb-6" />
                                )}
                                <h3 className="text-2xl font-serif text-white mb-4">{service.name}</h3>
                                <p className="text-gray-400 mb-8 font-light leading-relaxed">{service.description}</p>
                                <div className="flex justify-between items-center text-sm tracking-widest uppercase">
                                  <span style={{ color: primary }}>{formatCurrency(service.price)}</span>
                                  <span className="text-gray-600">{service.duration}</span>
                                </div>
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
                <section id="products" key="products" className="py-32 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-6">
                      <div className="max-w-2xl">
                        <h2 className="text-4xl lg:text-6xl font-serif text-white mb-6">{page.products.title}</h2>
                        <p className="text-xl text-gray-400 font-light">{page.products.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-12">
                      {page.products.items.map((product, i) => (
                        <div key={product._id || i} className="group">
                          <div className="relative aspect-[3/4] overflow-hidden mb-8">
                            <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-cover transition duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition duration-500"></div>
                          </div>
                          <h3 className="text-xl font-serif text-white mb-3">{product.name}</h3>
                          <p className="text-gray-400 text-sm mb-6 font-light">{product.description}</p>
                          <div className="tracking-widest uppercase text-sm">
                              {product.offerPrice ? (
                                <div className="flex items-center gap-4">
                                  <span style={{ color: primary }}>{formatCurrency(product.offerPrice)}</span>
                                  <span className="text-gray-600 line-through">{formatCurrency(product.price)}</span>
                                </div>
                              ) : (
                                <span style={{ color: primary }}>{formatCurrency(product.price)}</span>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'gallery':
              return page.gallery.show && page.gallery.images.length > 0 && (
                <section id="gallery" key="gallery" className="py-32 px-6 bg-[#0a0a0a]">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-24">
                      <h2 className="text-4xl lg:text-6xl font-serif text-white mb-6">{page.gallery.title}</h2>
                      <p className="text-xl text-gray-400 font-light">{page.gallery.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 lg:gap-8">
                      {page.gallery.images.map((img, i) => (
                        <div key={i} className={`relative overflow-hidden group ${i % 3 === 0 ? 'col-span-2 aspect-[21/9]' : 'col-span-1 aspect-square'}`}>
                          <img src={img.url} alt={img.caption || 'Gallery'} loading="lazy" decoding="async" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-1000 group-hover:scale-105" />
                          {img.caption && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end justify-center pb-12">
                              <p className="text-white text-sm tracking-[0.2em] uppercase">{img.caption}</p>
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
                <section id="testimonials" key="testimonials" className="py-32 px-6">
                  <div className="mx-auto max-w-7xl">
                    <h2 className="text-4xl lg:text-6xl font-serif text-white mb-24 text-center">{page.testimonials.title}</h2>
                    <div className="grid lg:grid-cols-2 gap-16">
                      {page.testimonials.items.map((test, i) => (
                        <div key={i} className="flex flex-col items-center text-center px-8">
                          <div className="text-4xl font-serif mb-8 opacity-20" style={{ color: primary }}>"</div>
                          <p className="text-2xl text-gray-300 mb-12 font-light leading-relaxed">"{test.comment}"</p>
                          <div className="flex gap-1 mb-6">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-4 h-4 ${j < test.rating ? 'fill-current text-white' : 'text-gray-800'}`} />
                            ))}
                          </div>
                          <p className="font-bold tracking-[0.2em] uppercase text-xs text-gray-500">{test.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'faq':
              return page.faq.show && page.faq.items.length > 0 && (
                <section id="faq" key="faq" className="py-32 px-6 bg-[#0a0a0a]">
                  <div className="mx-auto max-w-4xl">
                    <div className="text-center mb-24">
                      <h2 className="text-4xl lg:text-6xl font-serif text-white mb-6">{page.faq.title}</h2>
                      <p className="text-xl text-gray-400 font-light">{page.faq.subtitle}</p>
                    </div>
                    <div className="space-y-12">
                      {page.faq.items.map((faq, i) => (
                        <div key={i} className="border-b border-white/10 pb-12">
                          <h3 className="text-2xl font-serif text-white mb-6">{faq.question}</h3>
                          <p className="text-gray-400 font-light leading-relaxed text-lg">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'subscribe':
              return page.subscribe.show && (
                <section id="subscribe" key="subscribe" className="py-32 px-6">
                  <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-4xl lg:text-6xl font-serif text-white mb-6">{page.subscribe.title}</h2>
                    <p className="text-xl text-gray-400 font-light mb-16 max-w-2xl mx-auto">{page.subscribe.subtitle}</p>
                    <div className="max-w-md mx-auto relative">
                      <NewsletterForm 
                        companyId={props.company._id} 
                        buttonText={page.subscribe.buttonText} 
                        placeholder={page.subscribe.placeholder} 
                        primaryColor={primary} 
                      />
                      {page.subscribe.note && (
                        <p className="text-xs tracking-[0.2em] text-gray-600 mt-8 uppercase">{page.subscribe.note}</p>
                      )}
                    </div>
                  </div>
                </section>
              );

            case 'blogs':
              return page.blogs.show && page.blogs.items.length > 0 && (
                <section id="blogs" key="blogs" className="py-32 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-24">
                      <h2 className="text-4xl lg:text-6xl font-serif text-white mb-6">{page.blogs.title}</h2>
                      <p className="text-xl text-gray-400 font-light">{page.blogs.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                      {page.blogs.items.map((blog, i) => (
                        <div key={blog._id || i} className="group cursor-pointer">
                          <div className="relative aspect-[3/4] overflow-hidden mb-8 border border-white/5 group-hover:border-white/20 transition duration-500">
                            <img src={(blog as any).image || blog.featuredImage || '/placeholder.png'} alt={blog.title} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition duration-1000" />
                          </div>
                          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">{formatDate((blog as any).publishedAt || blog.createdAt)}</div>
                          <h3 className="text-2xl font-serif text-white mb-4 group-hover:text-gray-300 transition duration-300">{blog.title}</h3>
                          <p className="text-gray-400 font-light leading-relaxed line-clamp-3">{blog.excerpt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'contact':
              return page.contact.show && (
                <section id="contact" key="contact" className="py-32 px-6 bg-[#0a0a0a]">
                  <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-24">
                      <div>
                        <h2 className="text-4xl lg:text-6xl font-serif text-white mb-8">{page.contact.title}</h2>
                        <p className="text-xl text-gray-400 mb-16 font-light">{page.contact.subtitle}</p>
                        
                        <div className="space-y-12">
                           {page.phone && (
                             <div>
                               <p className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-3">Telephone</p>
                               <p className="text-2xl font-light text-white">{page.phone}</p>
                             </div>
                           )}
                           {page.email && (
                             <div>
                               <p className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-3">Email</p>
                               <p className="text-2xl font-light text-white">{page.email}</p>
                             </div>
                           )}
                           {page.addressLine && (
                             <div>
                               <p className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-3">Atelier</p>
                               <p className="text-xl font-light text-white leading-relaxed max-w-sm">{page.addressLine}</p>
                             </div>
                           )}
                        </div>
                      </div>
                      
                      <div className="bg-[#050505] border border-white/5 p-12 relative">
                        <div className="absolute top-0 left-12 w-24 h-[1px]" style={{ backgroundColor: primary }}></div>
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
      <footer className="py-24 px-6 border-t border-white/5">
        <div className="mx-auto max-w-7xl flex flex-col items-center text-center gap-12">
          <div className="text-3xl font-serif text-white">
            {page.brandName}
          </div>
          <div className="flex gap-8 flex-wrap justify-center">
             {page.nav.map((item) => (
                <a key={item.link} href={item.link} className="text-xs tracking-[0.2em] uppercase text-gray-500 hover:text-white transition">{item.label}</a>
             ))}
          </div>
          <div className="text-gray-700 text-xs tracking-widest uppercase mt-12">
            &copy; {new Date().getFullYear()} {page.brandName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
