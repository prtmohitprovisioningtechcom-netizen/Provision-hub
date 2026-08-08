'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Mail, MapPin, Menu, Phone, X, Star } from 'lucide-react';
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

export function SleekGlassTheme(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = resolveThemePage(props);
  
  const primary = page.primaryColor || '#3b82f6';
  
  return (
    <div className="font-sans text-slate-800 bg-[#f8fafc] min-h-screen selection:bg-blue-100 overflow-hidden relative">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px]"></div>
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] rounded-full bg-cyan-400/20 blur-[100px]"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed inset-x-4 top-4 z-50 bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href={`/${page.slug}`} className="flex items-center gap-3">
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-xl font-semibold tracking-tight">
                {page.brandName}
              </span>
            )}
          </Link>

          <div className="hidden lg:flex items-center gap-8 bg-white/50 px-6 py-2 rounded-full border border-white/60">
            {page.nav.map((item) => (
              <a
                key={item.link + item.label}
                href={item.link}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
          
          <div className="hidden lg:flex">
            {page.navCta && (
              <a
                href={page.navCta.link}
                className="px-6 py-2 text-sm font-semibold text-white rounded-full transition-transform hover:scale-105 shadow-md shadow-blue-500/20"
                style={{ backgroundColor: primary }}
              >
                {page.navCta.label}
              </a>
            )}
          </div>

          <button className="lg:hidden text-slate-800" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <main className="relative z-10 pt-32">
        {page.orderedSectionTypes.map((type) => {
          switch (type) {
            case 'hero':
              return page.hero.show && (
                <section id="home" key="hero" className="px-6 lg:px-12 py-12 lg:py-24">
                  <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex-1 text-center lg:text-left">
                        {page.hero.eyebrow && (
                          <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/50 text-sm font-semibold mb-6 shadow-sm" style={{ color: primary }}>
                            {page.hero.eyebrow}
                          </span>
                        )}
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight text-slate-900">
                          {page.hero.title}
                        </h1>
                        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                          {page.hero.subtitle}
                        </p>
                        {page.hero.buttonText && (
                          <a
                            href={page.hero.buttonLink}
                            className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-full font-semibold transition-transform hover:scale-105 shadow-xl shadow-blue-500/20"
                            style={{ backgroundColor: primary }}
                          >
                            {page.hero.buttonText}
                          </a>
                        )}
                      </motion.div>
                      
                      {page.hero.image && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="flex-1 w-full relative">
                          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-3xl transform rotate-3 scale-105 blur-xl"></div>
                          <img src={page.hero.image} alt="Hero" className="relative w-full h-[500px] object-cover rounded-3xl shadow-2xl border border-white/50" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </section>
              );

            case 'about':
              return page.about.show && (
                <section id="about" key="about" className="py-24 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[3rem] p-8 lg:p-16 shadow-xl shadow-slate-200/50">
                      <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {page.about.image && (
                          <div className="order-2 lg:order-1 relative h-full min-h-[400px] rounded-3xl overflow-hidden border border-white/50 shadow-md">
                            <img src={page.about.image} alt="About" className="absolute inset-0 w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="order-1 lg:order-2">
                          <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">{page.about.title}</h2>
                          <p className="text-xl text-slate-500 mb-8 font-medium">{page.about.subtitle}</p>
                          <div className="prose prose-slate prose-lg font-normal leading-relaxed text-slate-600" dangerouslySetInnerHTML={{ __html: page.about.content }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'why-choose-us':
              return page.why.show && page.why.items.length > 0 && (
                <section id="why-choose-us" key="why-choose-us" className="py-24 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                      <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">{page.why.title}</h2>
                      <p className="text-xl text-slate-500">{page.why.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {page.why.items.map((item, i) => (
                        <div key={i} className="bg-white/60 backdrop-blur-md border border-white/80 rounded-[2rem] p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-blue-50 text-blue-500 shadow-inner">
                            <Check className="w-6 h-6" style={{ color: primary }} />
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
                <section id="services" key="services" className="py-24 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                      <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">{page.services.title}</h2>
                      <p className="text-xl text-slate-500">{page.services.subtitle}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {page.services.items.map((service, i) => {
                        const img = getServiceImage(service);
                        return (
                          <div key={service._id || i} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group">
                            {img ? (
                              <img src={img} alt={service.name} className="aspect-[16/10] w-full object-cover" />
                            ) : (
                              <div className="px-8 pt-8">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-white to-slate-100 border border-white shadow-sm text-blue-500 group-hover:scale-110 transition-transform duration-500">
                                  <Check className="w-6 h-6" style={{ color: primary }} />
                                </div>
                              </div>
                            )}
                            <div className="p-8">
                              <h3 className="text-2xl font-semibold mb-3 text-slate-900">{service.name}</h3>
                              <p className="text-slate-500 mb-8 leading-relaxed">{service.description}</p>
                              <div className="flex justify-between items-center pt-6 border-t border-slate-200/50">
                                <span className="text-xl font-bold text-slate-900">{formatCurrency(service.price)}</span>
                                <span className="text-sm font-medium text-slate-400 bg-slate-100/50 px-3 py-1 rounded-full">{service.duration}</span>
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
                <section id="products" key="products" className="py-24 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                      <div>
                        <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">{page.products.title}</h2>
                        <p className="text-xl text-slate-500">{page.products.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {page.products.items.map((product, i) => (
                        <div key={product._id || i} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                          <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100">
                            <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {product.offerPrice && (
                              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-white/50 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm" style={{ color: primary }}>
                                SALE
                              </div>
                            )}
                          </div>
                          <div className="px-2 pb-2">
                            <h3 className="font-semibold text-lg mb-1 text-slate-900">{product.name}</h3>
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
                <section id="gallery" key="gallery" className="py-24 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                      <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">{page.gallery.title}</h2>
                      <p className="text-xl text-slate-500">{page.gallery.subtitle}</p>
                    </div>
                    <div className="columns-2 md:columns-3 gap-6 space-y-6">
                      {page.gallery.images.map((img, i) => (
                        <div key={i} className="relative rounded-3xl overflow-hidden break-inside-avoid border border-white/50 shadow-sm group">
                          <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-auto object-cover transition duration-500 group-hover:scale-105" />
                          {img.caption && (
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                              <p className="text-white font-medium text-lg">{img.caption}</p>
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
                <section id="testimonials" key="testimonials" className="py-24 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                      <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">{page.testimonials.title}</h2>
                      <p className="text-xl text-slate-500">{page.testimonials.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      {page.testimonials.items.map((test, i) => (
                        <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-8 shadow-sm">
                          <div className="flex gap-1 mb-6">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-5 h-5 ${j < test.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                          <p className="text-slate-700 text-lg mb-8 leading-relaxed font-medium">"{test.comment}"</p>
                          <p className="font-bold text-slate-900">{test.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'faq':
              return page.faq.show && page.faq.items.length > 0 && (
                <section id="faq" key="faq" className="py-24 px-6">
                  <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-16">
                      <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">{page.faq.title}</h2>
                      <p className="text-xl text-slate-500">{page.faq.subtitle}</p>
                    </div>
                    <div className="space-y-4">
                      {page.faq.items.map((faq, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm">
                          <h3 className="text-lg font-bold mb-3 text-slate-900">{faq.question}</h3>
                          <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'subscribe':
              return page.subscribe.show && (
                <section id="subscribe" key="subscribe" className="py-24 px-6">
                  <div className="mx-auto max-w-4xl text-center">
                    <div className="bg-gradient-to-tr from-blue-50 to-purple-50 rounded-[3rem] p-12 lg:p-16 border border-white shadow-xl shadow-blue-500/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none"></div>
                      <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900 relative z-10">{page.subscribe.title}</h2>
                      <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto relative z-10">{page.subscribe.subtitle}</p>
                      <div className="max-w-md mx-auto relative z-10">
                        <NewsletterForm 
                          companyId={props.company._id} 
                          buttonText={page.subscribe.buttonText} 
                          placeholder={page.subscribe.placeholder} 
                          primaryColor={primary} 
                        />
                        {page.subscribe.note && (
                          <p className="text-sm font-medium text-slate-400 mt-6">{page.subscribe.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'blogs':
              return page.blogs.show && page.blogs.items.length > 0 && (
                <section id="blogs" key="blogs" className="py-24 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                      <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">{page.blogs.title}</h2>
                      <p className="text-xl text-slate-500">{page.blogs.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {page.blogs.items.map((blog, i) => (
                        <div key={blog._id || i} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all duration-500 group">
                          <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                            <img src={(blog as any).image || blog.featuredImage || '/placeholder.png'} alt={blog.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                          </div>
                          <div className="p-8">
                            <div className="text-sm font-bold text-slate-400 mb-4" style={{ color: primary }}>{formatDate((blog as any).publishedAt || blog.createdAt)}</div>
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">{blog.title}</h3>
                            <p className="text-slate-600 leading-relaxed line-clamp-3">{blog.excerpt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'contact':
              return page.contact.show && (
                <section id="contact" key="contact" className="py-24 px-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="bg-slate-900 rounded-[3rem] p-8 lg:p-16 text-white relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] pointer-events-none"></div>
                      <div className="grid lg:grid-cols-2 gap-16 relative z-10">
                        <div>
                          <h2 className="text-4xl font-bold tracking-tight mb-6">{page.contact.title}</h2>
                          <p className="text-xl text-slate-300 mb-12">{page.contact.subtitle}</p>
                          
                          <div className="space-y-8">
                             {page.phone && (
                               <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                                   <Phone className="w-6 h-6 text-blue-400" />
                                 </div>
                                 <div>
                                   <p className="text-sm text-slate-400 mb-1">Phone</p>
                                   <p className="text-xl font-medium">{page.phone}</p>
                                 </div>
                               </div>
                             )}
                             {page.email && (
                               <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                                   <Mail className="w-6 h-6 text-purple-400" />
                                 </div>
                                 <div>
                                   <p className="text-sm text-slate-400 mb-1">Email</p>
                                   <p className="text-xl font-medium">{page.email}</p>
                                 </div>
                               </div>
                             )}
                          </div>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10">
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
      <footer className="py-12 px-6 border-t border-slate-200 bg-white/40 backdrop-blur-xl relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 font-medium">
          <div>
            &copy; {new Date().getFullYear()} {page.brandName}. All rights reserved.
          </div>
          <div className="flex gap-8">
             {page.nav.map((item) => (
                <a key={item.link} href={item.link} className="hover:text-slate-900 transition-colors">{item.label}</a>
             ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
