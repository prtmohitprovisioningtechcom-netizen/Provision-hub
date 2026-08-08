'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Mail, MapPin, Menu, Phone, X, ArrowRight, MessageCircle, Star } from 'lucide-react';
import {
  ICompany, IProduct, IService, IReview, IBlog, ILandingPageSection,
} from '@/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { resolveThemePage } from '@/lib/resolve-theme-page';
import { ContactForm } from '@/components/company/ContactForm';
import { NewsletterForm } from '@/components/company/NewsletterForm';
import { ReviewForm } from '@/components/company/ReviewForm';
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

export function CreativeStudioTheme(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = resolveThemePage(props);
  
  const primary = page.primaryColor || '#ec4899'; // pink-500 fallback
  
  return (
    <div className="font-sans text-gray-900 bg-[#f8fafc] overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href={`/${page.slug}`} className="flex items-center gap-3">
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-2xl font-black tracking-tighter" style={{ color: primary }}>
                {page.brandName}
              </span>
            )}
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {page.nav.map((item) => (
              <a
                key={item.link + item.label}
                href={item.link}
                className="text-sm font-bold text-gray-600 hover:text-gray-900 uppercase tracking-widest transition"
              >
                {item.label}
              </a>
            ))}
            {page.navCta && (
              <a
                href={page.navCta.link}
                className="px-6 py-2.5 text-sm font-bold text-white rounded-full transition hover:opacity-90 shadow-lg"
                style={{ backgroundColor: primary, boxShadow: `0 4px 14px 0 ${primary}66` }}
              >
                {page.navCta.label}
              </a>
            )}
          </div>

          <button className="lg:hidden text-gray-900" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 space-y-4">
             {page.nav.map((item) => (
              <a
                key={item.link}
                href={item.link}
                className="block text-base font-bold text-gray-600"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      <main className="pt-20">
        {page.orderedSectionTypes.map((type) => {
          switch (type) {
            case 'hero':
              return page.hero.show && (
                <section id="home" key="hero" className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 px-6 overflow-hidden">
                  <div className="absolute inset-0 z-0">
                     {/* Creative blobs */}
                     <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                     <div className="absolute top-0 right-48 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                     <div className="absolute -bottom-8 left-20 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
                  </div>
                  
                  <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                        {page.hero.eyebrow && (
                          <span className="inline-block py-1 px-3 rounded-full bg-white shadow-sm text-sm font-bold tracking-widest mb-6" style={{ color: primary }}>
                            {page.hero.eyebrow}
                          </span>
                        )}
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-6 text-gray-900">
                          {page.hero.title}
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
                          {page.hero.subtitle}
                        </p>
                        {page.hero.buttonText && (
                          <a
                            href={page.hero.buttonLink}
                            className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white rounded-full transition hover:scale-105 shadow-xl"
                            style={{ backgroundColor: primary }}
                          >
                            {page.hero.buttonText}
                            <ArrowRight className="w-5 h-5" />
                          </a>
                        )}
                      </motion.div>
                      
                      {page.hero.image && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                          <div className="relative">
                            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-3xl" style={{ backgroundColor: primary }}></div>
                            <img
                              src={page.hero.image}
                              alt="Hero"
                              className="relative z-10 rounded-3xl w-full h-auto object-cover shadow-2xl border-4 border-white"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </section>
              );

            case 'about':
              return page.about.show && (
                <section id="about" key="about" className="py-24 px-6 bg-white">
                  <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                      {page.about.image && (
                        <div className="order-2 lg:order-1 relative">
                          <img src={page.about.image} alt="About" className="rounded-[3rem] w-full h-[600px] object-cover" />
                          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center -z-10"></div>
                        </div>
                      )}
                      <div className="order-1 lg:order-2">
                        <h2 className="text-4xl font-black tracking-tight mb-6">{page.about.title}</h2>
                        <p className="text-xl text-gray-500 mb-8 font-light">{page.about.subtitle}</p>
                        <div className="prose prose-lg text-gray-600" dangerouslySetInnerHTML={{ __html: page.about.content }} />
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'why-choose-us':
              return page.why.show && page.why.items.length > 0 && (
                <section id="why-choose-us" key="why-choose-us" className="py-24 px-6 bg-[#f8fafc]">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                      <h2 className="text-4xl font-black tracking-tight mb-6">{page.why.title}</h2>
                      <p className="text-xl text-gray-500">{page.why.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {page.why.items.map((item, i) => (
                        <div key={i} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${primary}15`, color: primary }}>
                            <Check className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{item.description}</p>
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
                    <div className="text-center max-w-3xl mx-auto mb-16">
                      <h2 className="text-4xl font-black tracking-tight mb-6">{page.services.title}</h2>
                      <p className="text-xl text-gray-500">{page.services.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {page.services.items.map((service, i) => {
                        const img = getServiceImage(service);
                        return (
                          <div key={service._id || i} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 translate-y-0 hover:-translate-y-2">
                            {img ? (
                              <img src={img} alt={service.name} className="aspect-[16/10] w-full object-cover" />
                            ) : (
                              <div className="px-8 pt-8">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${primary}15`, color: primary }}>
                                  <Check className="w-8 h-8" />
                                </div>
                              </div>
                            )}
                            <div className="p-8">
                              <h3 className="text-2xl font-bold mb-4">{service.name}</h3>
                              <p className="text-gray-600 mb-6">{service.description}</p>
                              <div className="flex justify-between items-center mt-auto pt-6 border-t border-gray-100">
                                <span className="font-black text-xl" style={{ color: primary }}>{formatCurrency(service.price)}</span>
                                <span className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{service.duration}</span>
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
                <section id="products" key="products" className="py-24 px-6 bg-gray-900 text-white">
                  <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                      <div className="max-w-2xl">
                        <h2 className="text-4xl font-black tracking-tight mb-4">{page.products.title}</h2>
                        <p className="text-xl text-gray-400">{page.products.subtitle}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {page.products.items.map((product, i) => (
                        <div key={product._id || i} className="bg-gray-800 rounded-3xl overflow-hidden group">
                          <div className="relative h-64 overflow-hidden">
                            <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <div>
                                {product.offerPrice ? (
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg" style={{ color: primary }}>{formatCurrency(product.offerPrice)}</span>
                                    <span className="text-sm text-gray-500 line-through">{formatCurrency(product.price)}</span>
                                  </div>
                                ) : (
                                  <span className="font-bold text-lg" style={{ color: primary }}>{formatCurrency(product.price)}</span>
                                )}
                              </div>
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
                <section id="gallery" key="gallery" className="py-24 px-6 bg-white overflow-hidden">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                      <h2 className="text-4xl font-black tracking-tight mb-4">{page.gallery.title}</h2>
                      <p className="text-xl text-gray-500">{page.gallery.subtitle}</p>
                    </div>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                      {page.gallery.images.map((img, i) => (
                        <div key={i} className="break-inside-avoid relative rounded-2xl overflow-hidden group">
                          <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-auto object-cover transition duration-500 group-hover:scale-105" />
                          {img.caption && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-6">
                              <p className="text-white font-bold">{img.caption}</p>
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
                <section id="testimonials" key="testimonials" className="py-24 px-6 bg-[#f8fafc]">
                  <div className="mx-auto max-w-7xl">
                    <h2 className="text-4xl font-black tracking-tight mb-16 text-center">{page.testimonials.title}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                      {page.testimonials.items.map((test, i) => (
                        <div key={i} className="bg-white p-10 rounded-3xl shadow-sm relative">
                          <div className="text-4xl text-gray-200 absolute top-6 right-8 font-serif">"</div>
                          <div className="flex gap-1 mb-6">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-5 h-5 ${j < test.rating ? 'fill-current text-yellow-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                          <p className="text-lg text-gray-600 mb-8 font-medium">"{test.comment}"</p>
                          <p className="font-bold">{test.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'faq':
              return page.faq.show && page.faq.items.length > 0 && (
                <section id="faq" key="faq" className="py-24 px-6 bg-white">
                  <div className="mx-auto max-w-4xl">
                    <div className="text-center mb-16">
                      <h2 className="text-4xl font-black tracking-tight mb-6">{page.faq.title}</h2>
                      <p className="text-xl text-gray-500">{page.faq.subtitle}</p>
                    </div>
                    <div className="space-y-6">
                      {page.faq.items.map((faq, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-[#f8fafc] border border-gray-100">
                          <h3 className="text-xl font-bold mb-4">{faq.question}</h3>
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'subscribe':
              return page.subscribe.show && (
                <section id="subscribe" key="subscribe" className="py-24 px-6 bg-[#f8fafc]">
                  <div className="mx-auto max-w-4xl bg-white rounded-[3rem] p-12 text-center shadow-sm border border-gray-100">
                    <h2 className="text-4xl font-black tracking-tight mb-6">{page.subscribe.title}</h2>
                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">{page.subscribe.subtitle}</p>
                    <div className="max-w-md mx-auto">
                      <NewsletterForm 
                        companyId={props.company._id} 
                        buttonText={page.subscribe.buttonText} 
                        placeholder={page.subscribe.placeholder} 
                        primaryColor={primary} 
                      />
                      {page.subscribe.note && (
                        <p className="text-sm text-gray-400 mt-4">{page.subscribe.note}</p>
                      )}
                    </div>
                  </div>
                </section>
              );

            case 'blogs':
              return page.blogs.show && page.blogs.items.length > 0 && (
                <section id="blogs" key="blogs" className="py-24 px-6 bg-white">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                      <h2 className="text-4xl font-black tracking-tight mb-4">{page.blogs.title}</h2>
                      <p className="text-xl text-gray-500">{page.blogs.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      {page.blogs.items.map((blog) => (
                        <Link key={blog._id} href={`/${page.slug}/blog/${blog.slug}`} className="group block">
                          <div className="rounded-3xl overflow-hidden bg-gray-50 mb-6">
                            <img src={blog.featuredImage || '/placeholder.png'} alt={blog.title} className="w-full h-64 object-cover group-hover:scale-105 transition duration-500" />
                          </div>
                          <span className="text-sm font-bold uppercase tracking-wider mb-2 block" style={{ color: primary }}>{blog.category}</span>
                          <h3 className="text-2xl font-bold mb-3 group-hover:text-gray-600 transition">{blog.title}</h3>
                          <p className="text-gray-500">{formatDate(blog.createdAt)}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'contact':
              return page.contact.show && (
                <section id="contact" key="contact" className="py-24 px-6 bg-gray-900 text-white">
                  <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16">
                      <div>
                        <h2 className="text-4xl font-black tracking-tight mb-6">{page.contact.title}</h2>
                        <p className="text-xl text-gray-400 mb-12">{page.contact.subtitle}</p>
                        
                        <div className="space-y-8">
                          {page.phone && (
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <Phone className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Call Us</p>
                                <p className="text-lg">{page.phone}</p>
                              </div>
                            </div>
                          )}
                          {page.email && (
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Email Us</p>
                                <p className="text-lg">{page.email}</p>
                              </div>
                            </div>
                          )}
                          {page.addressLine && (
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Visit Us</p>
                                <p className="text-lg">{page.addressLine}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-white text-gray-900 rounded-3xl p-8 lg:p-12 shadow-2xl">
                        <h3 className="text-2xl font-bold mb-8">Send a Message</h3>
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
      <footer className="bg-black text-white py-12 px-6 border-t border-white/10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black tracking-tighter">
            {page.brandName}
          </div>
          <div className="text-gray-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} {page.brandName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
