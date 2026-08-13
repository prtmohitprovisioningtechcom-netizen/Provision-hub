'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Mail, MapPin, Menu, Phone, X, Star, ArrowRight } from 'lucide-react';
import {
  ICompany, IProduct, IService, IReview, IBlog, ILandingPageSection,
} from '@/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
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

export function NeonDarkTheme(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = resolveThemePage(props);
  
  const primary = page.primaryColor || '#00ffcc'; // neon cyan fallback
  
  return (
    <div className="font-sans text-slate-300 bg-slate-950 min-h-screen selection:bg-primary/30 selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href={`/${page.slug}`} className="flex items-center gap-3 group">
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-10 w-auto object-contain transition-all" />
            ) : (
              <span className="text-xl lg:text-2xl font-black tracking-tight text-white transition-all drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                {page.brandName}
              </span>
            )}
          </Link>

          <div className="hidden lg:flex items-center gap-6 lg:gap-8">
            {page.nav.map((item) => (
              <a
                key={item.link + item.label}
                href={item.link}
                className="text-sm font-medium hover:text-white transition-all hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              >
                {item.label}
              </a>
            ))}
            {page.navCta && (
              <a
                href={page.navCta.link}
                className="px-6 py-2.5 text-sm font-bold text-slate-900 rounded-full transition-all hover:scale-105"
                style={{ backgroundColor: primary, boxShadow: `0 0 20px ${primary}66` }}
              >
                {page.navCta.label}
              </a>
            )}
          </div>

          <button className="lg:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {menuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-white/10 px-6 py-4 absolute w-full shadow-2xl">
            <div className="flex flex-col space-y-4">
              {page.nav.map((item) => (
                <a
                  key={item.link + item.label}
                  href={item.link}
                  className="text-base font-medium text-slate-300 hover:text-white transition-colors py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {page.navCta && (
                <a
                  href={page.navCta.link}
                  className="inline-block px-6 py-3 text-sm font-bold text-slate-900 rounded-xl transition-all text-center mt-4"
                  style={{ backgroundColor: primary, boxShadow: `0 0 15px ${primary}40` }}
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
                <section id="home" key="hero" className="relative min-h-screen flex items-center px-6 lg:px-8 py-24 overflow-hidden">
                  {/* Glowing background orb */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: primary }}></div>
                  
                  <div className="relative z-10 mx-auto max-w-7xl w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                      {page.hero.eyebrow && (
                        <span className="inline-block mb-6 text-sm font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" style={{ color: primary }}>
                          {page.hero.eyebrow}
                        </span>
                      )}
                      <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-white leading-tight">
                        {page.hero.title}
                      </h1>
                      <p className="text-lg lg:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
                        {page.hero.subtitle}
                      </p>
                      {page.hero.buttonText && (
                        <a
                          href={page.hero.buttonLink}
                          className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-slate-900 rounded-full transition-all hover:scale-105 group"
                          style={{ backgroundColor: primary, boxShadow: `0 0 30px ${primary}40` }}
                        >
                          {page.hero.buttonText}
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                      )}
                    </motion.div>
                    
                    {page.hero.image && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative h-[500px] lg:h-[600px] rounded-[2.5rem] overflow-hidden group border border-white/10 shadow-2xl">
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 mix-blend-overlay z-20" style={{ background: `linear-gradient(to top right, ${primary}, transparent)` }}></div>
                        <img src={page.hero.image} alt="Hero" className="relative w-full h-full object-cover z-10 transition-transform duration-700 group-hover:scale-105" />
                      </motion.div>
                    )}
                  </div>
                </section>
              );

            case 'about':
              return page.about.show && (
                <section id="about" key="about" className="py-20 lg:py-32 px-6 lg:px-8 bg-slate-900 relative">
                  <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                      <div className="order-2 lg:order-1 relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                        {page.about.image ? (
                          <img src={page.about.image} alt="About" className="absolute inset-0 w-full h-full object-cover transition duration-700 hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 bg-white/5"></div>
                        )}
                      </div>
                      <div className="order-1 lg:order-2">
                        {page.about.eyebrow && (
                           <span className="inline-block mb-4 text-sm font-bold tracking-widest uppercase" style={{ color: primary }}>
                             {page.about.eyebrow}
                           </span>
                        )}
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-8 text-white">{page.about.title}</h2>
                        <p className="text-xl text-slate-300 mb-8 font-medium leading-relaxed">{page.about.subtitle}</p>
                        <div className="prose prose-invert prose-lg text-slate-400" dangerouslySetInnerHTML={{ __html: page.about.content }} />
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'why-choose-us':
              return page.why.show && page.why.items.length > 0 && (
                <section id="why-choose-us" key="why-choose-us" className="py-20 lg:py-32 px-6 lg:px-8 relative overflow-hidden">
                  <div className="mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-white">{page.why.title}</h2>
                      <p className="text-lg text-slate-400 leading-relaxed">{page.why.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {page.why.items.map((item, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-white/20 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                          <div className="w-14 h-14 mb-6 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${primary}20`, color: primary }}>
                            <Check className="w-7 h-7" />
                          </div>
                          <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                          <p className="text-slate-400 leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'services':
              return page.services.show && page.services.items.length > 0 && (
                <section id="services" key="services" className="py-20 lg:py-32 px-6 lg:px-8 bg-slate-900 relative">
                  <div className="mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-white">{page.services.title}</h2>
                      <p className="text-lg text-slate-400 leading-relaxed">{page.services.subtitle}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {page.services.items.map((service, i) => {
                        const img = getServiceImage(service);
                        return (
                          <div key={service._id || i} className="bg-slate-950 border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-300 group shadow-xl hover:shadow-2xl hover:-translate-y-2">
                            {img ? (
                              <div className="aspect-[16/10] overflow-hidden relative">
                                <img src={img} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors duration-500"></div>
                              </div>
                            ) : (
                              <div className="px-8 pt-8">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${primary}15`, color: primary }}>
                                  <Star className="w-8 h-8" />
                                </div>
                              </div>
                            )}
                            <div className="p-8">
                              <h3 className="text-2xl font-bold mb-3 text-white">{service.name}</h3>
                              <p className="text-slate-400 mb-8 leading-relaxed line-clamp-3">{service.description}</p>
                              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                <span className="text-xl font-bold text-white">{formatCurrency(service.price)}</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-3 py-1 rounded-full">{service.duration}</span>
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
                <section id="products" key="products" className="py-20 lg:py-32 px-6 lg:px-8">
                  <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                      <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-white">{page.products.title}</h2>
                        <p className="text-lg text-slate-400 leading-relaxed">{page.products.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {page.products.items.map((product, i) => (
                        <div key={product._id || i} className="group bg-white/5 rounded-3xl border border-white/10 overflow-hidden hover:border-white/20 transition-all hover:shadow-2xl hover:-translate-y-1">
                          <div className="relative aspect-square overflow-hidden bg-slate-900">
                            <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            {product.offerPrice && (
                              <div className="absolute top-4 left-4 text-slate-900 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full" style={{ backgroundColor: primary, boxShadow: `0 0 15px ${primary}66` }}>
                                Sale
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <h3 className="font-bold text-xl mb-2 text-white truncate">{product.name}</h3>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                            <div className="flex items-center gap-3">
                                {product.offerPrice ? (
                                  <>
                                    <span className="font-bold text-lg" style={{ color: primary }}>{formatCurrency(product.offerPrice)}</span>
                                    <span className="text-sm text-slate-500 line-through">{formatCurrency(product.price)}</span>
                                  </>
                                ) : (
                                  <span className="font-bold text-lg text-white">{formatCurrency(product.price)}</span>
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
                <section id="gallery" key="gallery" className="py-20 lg:py-32 px-6 lg:px-8 bg-slate-900">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-white">{page.gallery.title}</h2>
                      <p className="text-lg text-slate-400 leading-relaxed">{page.gallery.subtitle}</p>
                    </div>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                      {page.gallery.images.map((img, i) => (
                        <div key={i} className="relative group overflow-hidden border border-white/10 rounded-3xl break-inside-avoid">
                          <img src={img.url} alt={img.caption || 'Gallery Image'} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
                          {img.caption && (
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                              <p className="text-white font-bold text-lg">{img.caption}</p>
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
                <section id="testimonials" key="testimonials" className="py-20 lg:py-32 px-6 lg:px-8">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-white">{page.testimonials.title}</h2>
                      <p className="text-lg text-slate-400 leading-relaxed">{page.testimonials.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {page.testimonials.items.map((test, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl relative hover:border-white/20 transition-all hover:-translate-y-1">
                          <div className="flex gap-1 mb-6">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-5 h-5 ${j < test.rating ? 'fill-current' : 'text-slate-800'}`} style={{ color: j < test.rating ? primary : undefined }} />
                            ))}
                          </div>
                          <p className="text-slate-300 text-lg leading-relaxed mb-6 font-medium">"{test.comment}"</p>
                          <p className="text-white font-bold">{test.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'faq':
              return page.faq.show && page.faq.items.length > 0 && (
                <section id="faq" key="faq" className="py-20 lg:py-32 px-6 lg:px-8 bg-slate-900">
                  <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-white">{page.faq.title}</h2>
                      <p className="text-lg text-slate-400 leading-relaxed">{page.faq.subtitle}</p>
                    </div>
                    <div className="space-y-4">
                      {page.faq.items.map((faq, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                          <h3 className="text-lg font-bold text-white mb-3" style={{ color: primary }}>{faq.question}</h3>
                          <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'subscribe':
              return page.subscribe.show && (
                <section id="subscribe" key="subscribe" className="py-20 lg:py-32 px-6 lg:px-8 relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-[80px] pointer-events-none rounded-full"></div>
                  <div className="mx-auto max-w-2xl text-center relative z-10 bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 lg:p-16 rounded-[3rem] shadow-2xl">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-6 text-white">{page.subscribe.title}</h2>
                    <p className="text-lg text-slate-400 leading-relaxed mb-10">{page.subscribe.subtitle}</p>
                    <div className="max-w-md mx-auto">
                      <NewsletterForm 
                        companyId={props.company._id} 
                        buttonText={page.subscribe.buttonText} 
                        placeholder={page.subscribe.placeholder} 
                        primaryColor={primary} 
                      />
                    </div>
                    {page.subscribe.note && (
                      <p className="text-sm text-slate-500 mt-6 font-medium">{page.subscribe.note}</p>
                    )}
                  </div>
                </section>
              );

            case 'blogs':
              return page.blogs.show && page.blogs.items.length > 0 && (
                <section id="blogs" key="blogs" className="py-20 lg:py-32 px-6 lg:px-8 bg-slate-900">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-white">{page.blogs.title}</h2>
                      <p className="text-lg text-slate-400 leading-relaxed">{page.blogs.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {page.blogs.items.map((blog, i) => (
                        <div key={blog._id || i} className="group border border-white/10 bg-slate-950 rounded-3xl overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-2xl">
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <img src={(blog as any).image || blog.featuredImage || '/placeholder.png'} alt={blog.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/10 px-4 py-1.5">
                              <span className="text-xs font-bold" style={{ color: primary }}>{formatDate((blog as any).publishedAt || blog.createdAt)}</span>
                            </div>
                          </div>
                          <div className="p-8">
                            <h3 className="text-2xl font-bold mb-4 text-white line-clamp-2">{blog.title}</h3>
                            <p className="text-slate-400 leading-relaxed line-clamp-3">{blog.excerpt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'contact':
              return page.contact.show && (
                <section id="contact" key="contact" className="py-20 lg:py-32 px-6 lg:px-8 relative overflow-hidden">
                  <div className="mx-auto max-w-7xl relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                      <div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-white">{page.contact.title}</h2>
                        <p className="text-lg text-slate-400 leading-relaxed mb-12">{page.contact.subtitle}</p>
                        
                        <div className="space-y-8">
                           {page.phone && (
                             <div className="flex items-start gap-4">
                               <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white/5 border border-white/10">
                                 <Phone className="w-5 h-5 text-white" />
                               </div>
                               <div>
                                 <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Call Us</p>
                                 <p className="text-xl text-white font-medium">{page.phone}</p>
                               </div>
                             </div>
                           )}
                           {page.email && (
                             <div className="flex items-start gap-4">
                               <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white/5 border border-white/10">
                                 <Mail className="w-5 h-5 text-white" />
                               </div>
                               <div>
                                 <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Email Us</p>
                                 <p className="text-xl text-white font-medium">{page.email}</p>
                               </div>
                             </div>
                           )}
                           {page.addressLine && (
                             <div className="flex items-start gap-4">
                               <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white/5 border border-white/10">
                                 <MapPin className="w-5 h-5 text-white" />
                               </div>
                               <div>
                                 <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Visit Us</p>
                                 <p className="text-xl text-white font-medium">{page.addressLine}</p>
                               </div>
                             </div>
                           )}
                        </div>
                      </div>
                      
                      <div className="p-8 lg:p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-[2.5rem] pointer-events-none"></div>
                        <div className="relative z-10">
                          <h3 className="text-2xl font-bold text-white mb-8">Send a Message</h3>
                          <ContactForm companyId={props.company._id} />
                        </div>
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
      <footer className="py-12 px-6 lg:px-8 border-t border-white/5 bg-slate-900">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left font-bold text-slate-400">
            &copy; {new Date().getFullYear()} {page.brandName} - Promoted By Multi-Tenant Platform Provisioning Tech All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-6">
             {page.nav.map((item) => (
                <a key={item.link} href={item.link} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">{item.label}</a>
             ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
