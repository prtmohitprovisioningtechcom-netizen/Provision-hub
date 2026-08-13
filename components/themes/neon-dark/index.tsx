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
  
  const primary = page.primaryColor || '#00ffcc'; // primary brand color
  
  return (
    <div className="font-sans text-slate-600 bg-white min-h-screen selection:bg-primary/20 selection:text-slate-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href={`/${page.slug}`} className="flex items-center gap-3">
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-10 w-auto object-contain transition-all" />
            ) : (
              <span className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
                {page.brandName}
              </span>
            )}
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {page.nav.map((item) => (
              <a
                key={item.link + item.label}
                href={item.link}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </a>
            ))}
            {page.navCta && (
              <a
                href={page.navCta.link}
                className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 shadow-sm"
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
          <div className="lg:hidden bg-white border-b border-gray-200 px-6 py-4 absolute w-full shadow-lg">
            <div className="flex flex-col space-y-4">
              {page.nav.map((item) => (
                <a
                  key={item.link + item.label}
                  href={item.link}
                  className="text-base font-semibold text-slate-600 hover:text-slate-900 transition-colors py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {page.navCta && (
                <a
                  href={page.navCta.link}
                  className="inline-block px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all text-center mt-4 shadow-sm"
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
                <section id="home" key="hero" className="relative flex items-center px-6 lg:px-8 py-20 lg:py-32 overflow-hidden bg-slate-900">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at 80% 20%, ${primary}, transparent 50%)` }}></div>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
                  
                  <div className="relative z-10 mx-auto max-w-7xl w-full grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                      {page.hero.eyebrow && (
                        <span className="inline-block mb-6 text-xs sm:text-sm font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/10" style={{ color: primary, backgroundColor: `${primary}15` }}>
                          {page.hero.eyebrow}
                        </span>
                      )}
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-white leading-[1.15] break-words">
                        {page.hero.title}
                      </h1>
                      <p className="text-lg lg:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl">
                        {page.hero.subtitle}
                      </p>
                      {page.hero.buttonText && (
                        <a
                          href={page.hero.buttonLink}
                          className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-bold text-slate-900 rounded-lg transition-all hover:scale-105 shadow-lg"
                          style={{ backgroundColor: primary }}
                        >
                          {page.hero.buttonText}
                          <ArrowRight className="w-5 h-5" />
                        </a>
                      )}
                    </motion.div>
                    
                    {page.hero.image && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative h-[300px] sm:h-[400px] lg:h-[550px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mt-8 lg:mt-0">
                        <img src={page.hero.image} alt="Hero" className="relative w-full h-full object-cover z-10" />
                      </motion.div>
                    )}
                  </div>
                </section>
              );

            case 'about':
              return page.about.show && (
                <section id="about" key="about" className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50 border-y border-gray-200">
                  <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
                      <div className="order-2 lg:order-1 relative h-[300px] sm:h-[400px] lg:h-[450px] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                        {page.about.image ? (
                          <img src={page.about.image} alt="About" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-slate-200"></div>
                        )}
                      </div>
                      <div className="order-1 lg:order-2">
                        {page.about.eyebrow && (
                           <span className="inline-block mb-3 text-xs sm:text-sm font-semibold tracking-widest uppercase" style={{ color: primary }}>
                             {page.about.eyebrow}
                           </span>
                        )}
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-6 text-slate-900 break-words">{page.about.title}</h2>
                        <p className="text-lg sm:text-xl text-slate-700 mb-6 font-medium">{page.about.subtitle}</p>
                        <div className="prose prose-base sm:prose-lg text-slate-600" dangerouslySetInnerHTML={{ __html: page.about.content }} />
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'why-choose-us':
              return page.why.show && page.why.items.length > 0 && (
                <section id="why-choose-us" key="why-choose-us" className="py-20 lg:py-28 px-6 lg:px-8 bg-white">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-10 sm:mb-16 max-w-3xl mx-auto">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 break-words">{page.why.title}</h2>
                      <p className="text-base sm:text-lg text-slate-500">{page.why.subtitle}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                      {page.why.items.map((item, i) => (
                        <div key={i} className="p-8 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-colors shadow-sm">
                          <div className="w-12 h-12 mb-6 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primary}15`, color: primary }}>
                            <Check className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                          <p className="text-slate-600 leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'services':
              return page.services.show && page.services.items.length > 0 && (
                <section id="services" key="services" className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50 border-y border-gray-200">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-10 sm:mb-16 max-w-3xl mx-auto">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 break-words">{page.services.title}</h2>
                      <p className="text-base sm:text-lg text-slate-500">{page.services.subtitle}</p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {page.services.items.map((service, i) => {
                        const img = getServiceImage(service);
                        return (
                          <div key={service._id || i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                            {img ? (
                              <div className="aspect-[16/10] overflow-hidden">
                                <img src={img} alt={service.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="px-8 pt-8">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primary}15`, color: primary }}>
                                  <Star className="w-6 h-6" />
                                </div>
                              </div>
                            )}
                            <div className="p-6 sm:p-8">
                              <h3 className="text-lg sm:text-xl font-bold mb-3 text-slate-900 break-words">{service.name}</h3>
                              <p className="text-sm sm:text-base text-slate-600 mb-6 line-clamp-3">{service.description}</p>
                              <div className="flex flex-col gap-4 pt-6 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2 justify-between items-center">
                                  <span className="text-lg sm:text-xl font-bold text-slate-900">{formatCurrency(service.price)}</span>
                                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-md">{service.duration}</span>
                                </div>
                                {((service.description && service.description.length > 80) || (service.gallery && service.gallery.length > 0)) && (
                                  <Link 
                                    href={`/${page.slug}/service/${service.slug}`}
                                    className="w-full text-center py-3 px-4 rounded-lg font-bold text-white transition-all hover:opacity-90 shadow-sm"
                                    style={{ backgroundColor: primary }}
                                  >
                                    Read More
                                  </Link>
                                )}
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
                <section id="products" key="products" className="py-20 lg:py-28 px-6 lg:px-8 bg-white">
                  <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                      <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900">{page.products.title}</h2>
                        <p className="text-lg text-slate-500">{page.products.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {page.products.items.map((product, i) => (
                        <div key={product._id || i} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all">
                          <div className="relative aspect-square overflow-hidden bg-slate-100">
                            <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {product.offerPrice && (
                              <div className="absolute top-4 left-4 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded shadow-sm" style={{ backgroundColor: primary }}>
                                Sale
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <h3 className="font-bold text-lg mb-1 text-slate-900 truncate">{product.name}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                            <div className="flex items-center gap-3">
                                {product.offerPrice ? (
                                  <>
                                    <span className="font-bold text-lg text-slate-900">{formatCurrency(product.offerPrice)}</span>
                                    <span className="text-sm text-slate-400 line-through">{formatCurrency(product.price)}</span>
                                  </>
                                ) : (
                                  <span className="font-bold text-lg text-slate-900">{formatCurrency(product.price)}</span>
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
                <section id="gallery" key="gallery" className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50 border-y border-gray-200">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900">{page.gallery.title}</h2>
                      <p className="text-lg text-slate-500">{page.gallery.subtitle}</p>
                    </div>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                      {page.gallery.images.map((img, i) => (
                        <div key={i} className="relative group overflow-hidden rounded-2xl break-inside-avoid border border-gray-200 bg-white">
                          <img src={img.url} alt={img.caption || 'Gallery Image'} className="w-full h-auto object-cover" />
                          {img.caption && (
                            <div className="p-4 border-t border-gray-100 bg-white">
                              <p className="text-slate-900 font-semibold">{img.caption}</p>
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
                <section id="testimonials" key="testimonials" className="py-20 lg:py-28 px-6 lg:px-8 bg-white">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900">{page.testimonials.title}</h2>
                      <p className="text-lg text-slate-500">{page.testimonials.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {page.testimonials.items.map((test, i) => (
                        <div key={i} className="bg-slate-50 border border-gray-200 p-8 rounded-2xl relative">
                          <div className="flex gap-1 mb-6">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-5 h-5 ${j < test.rating ? 'fill-current' : 'text-slate-300'}`} style={{ color: j < test.rating ? primary : undefined }} />
                            ))}
                          </div>
                          <p className="text-slate-700 leading-relaxed mb-6">"{test.comment}"</p>
                          <p className="text-slate-900 font-bold">{test.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'faq':
              return page.faq.show && page.faq.items.length > 0 && (
                <section id="faq" key="faq" className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50 border-y border-gray-200">
                  <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900">{page.faq.title}</h2>
                      <p className="text-lg text-slate-500">{page.faq.subtitle}</p>
                    </div>
                    <div className="space-y-4">
                      {page.faq.items.map((faq, i) => (
                        <div key={i} className="bg-white border border-gray-200 p-6 rounded-2xl">
                          <h3 className="text-lg font-bold text-slate-900 mb-3">{faq.question}</h3>
                          <p className="text-slate-600">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'subscribe':
              return page.subscribe.show && (
                <section id="subscribe" key="subscribe" className="py-20 lg:py-28 px-6 lg:px-8 bg-white">
                  <div className="mx-auto max-w-4xl text-center bg-slate-900 border border-slate-800 p-10 lg:p-16 rounded-[2rem] shadow-xl">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">{page.subscribe.title}</h2>
                    <p className="text-lg text-slate-300 mb-10">{page.subscribe.subtitle}</p>
                    <div className="max-w-md mx-auto">
                      <NewsletterForm 
                        companyId={props.company._id} 
                        buttonText={page.subscribe.buttonText} 
                        placeholder={page.subscribe.placeholder} 
                        primaryColor={primary} 
                      />
                    </div>
                    {page.subscribe.note && (
                      <p className="text-sm text-slate-400 mt-6">{page.subscribe.note}</p>
                    )}
                  </div>
                </section>
              );

            case 'blogs':
              return page.blogs.show && page.blogs.items.length > 0 && (
                <section id="blogs" key="blogs" className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50 border-t border-gray-200">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900">{page.blogs.title}</h2>
                      <p className="text-lg text-slate-500">{page.blogs.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {page.blogs.items.map((blog, i) => (
                        <div key={blog._id || i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                            <img src={(blog as any).image || blog.featuredImage || '/placeholder.png'} alt={blog.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-6">
                            <div className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">{formatDate((blog as any).publishedAt || blog.createdAt)}</div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900 line-clamp-2">{blog.title}</h3>
                            <p className="text-slate-600 line-clamp-3">{blog.excerpt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'contact': {
              let mapSrc = page.contact.mapUrl || '';
              if (mapSrc.includes('<iframe')) {
                const match = mapSrc.match(/src="([^"]+)"/);
                if (match) mapSrc = match[1];
              } else if (mapSrc && !mapSrc.includes('embed') && !mapSrc.includes('output=embed')) {
                // Not an embeddable URL, ignore it
                mapSrc = '';
              }
              
              if (!mapSrc && page.addressLine) {
                mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(page.addressLine)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
              }
              
              return page.contact.show && (
                <section id="contact" key="contact" className="py-20 lg:py-28 px-6 lg:px-8 bg-white">
                  <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-slate-900">{page.contact.title}</h2>
                        <p className="text-lg text-slate-500 mb-10">{page.contact.subtitle}</p>
                        
                        <div className="space-y-6 sm:space-y-8">
                           {page.phone && (
                             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                               <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 border border-gray-200">
                                 <Phone className="w-5 h-5 text-slate-700" />
                               </div>
                               <div>
                                 <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Call Us</p>
                                 <p className="text-base sm:text-lg text-slate-900 font-semibold break-words">{page.phone}</p>
                               </div>
                             </div>
                           )}
                           {page.email && (
                             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                               <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 border border-gray-200">
                                 <Mail className="w-5 h-5 text-slate-700" />
                               </div>
                               <div>
                                 <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Email Us</p>
                                 <p className="text-base sm:text-lg text-slate-900 font-semibold break-words">{page.email}</p>
                               </div>
                             </div>
                           )}
                           {page.addressLine && (
                             <div className="flex items-start gap-4">
                               <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 border border-gray-200">
                                 <MapPin className="w-5 h-5 text-slate-700" />
                               </div>
                               <div>
                                 <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Visit Us</p>
                                 <p className="text-lg text-slate-900 font-semibold">{page.addressLine}</p>
                               </div>
                             </div>
                           )}
                        </div>
                        
                        {mapSrc && (
                          <div className="mt-12 w-full h-[250px] lg:h-[300px] rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative group">
                            <iframe src={mapSrc} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="relative z-10 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"></iframe>
                            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-0">
                               <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-8 lg:p-10 bg-slate-50 border border-gray-200 rounded-2xl shadow-sm lg:sticky lg:top-24">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Send a Message</h3>
                        <ContactForm companyId={props.company._id} />
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            default:
              return null;
          }
        })}
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left text-sm font-medium text-slate-500">
            &copy; {new Date().getFullYear()} {page.brandName}. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-6">
             {page.nav.map((item, idx) => (
                <a key={item.link + item.label + idx} href={item.link} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">{item.label}</a>
             ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
