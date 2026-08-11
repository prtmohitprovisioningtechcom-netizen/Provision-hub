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

export function WarmShowcaseTheme(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = resolveThemePage(props);
  
  const primary = page.primaryColor || '#d97706'; // amber-600 fallback
  
  return (
    <div className="font-serif text-[#4a3f35] bg-[#fffbf5] min-h-screen">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-[#fffbf5]/90 backdrop-blur-md border-b border-[#f3e8d6]">
        <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-6">
          <Link href={`/${page.slug}`} className="flex items-center gap-3">
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-12 w-auto object-contain" />
            ) : (
              <span className="text-3xl font-bold tracking-tight" style={{ color: primary }}>
                {page.brandName}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {page.nav.map((item) => (
              <a
                key={item.link + item.label}
                href={item.link}
                className="text-sm font-medium hover:text-[#d97706] transition"
              >
                {item.label}
              </a>
            ))}
            {page.navCta && (
              <a
                href={page.navCta.link}
                className="px-6 py-3 text-sm text-white rounded-md transition hover:opacity-90 shadow-sm"
                style={{ backgroundColor: primary }}
              >
                {page.navCta.label}
              </a>
            )}
          </div>

          <button className="md:hidden text-[#4a3f35]" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-[#f3e8d6] bg-[#fffbf5] shadow-lg absolute w-full">
            <div className="flex flex-col px-6 py-6 space-y-4">
              {page.nav.map((item) => (
                <a
                  key={item.link + item.label}
                  href={item.link}
                  className="text-lg font-medium hover:text-[#d97706] transition"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {page.navCta && (
                <a
                  href={page.navCta.link}
                  className="inline-block px-6 py-3 text-sm text-white rounded-md transition text-center w-full"
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

      <main className="pt-24">
        {page.orderedSectionTypes.map((type) => {
          switch (type) {
            case 'hero':
              return page.hero.show && (
                <section id="home" key="hero" className="py-20 md:py-32 px-6">
                  <div className="mx-auto max-w-4xl text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                      {page.hero.eyebrow && (
                        <span className="block text-sm uppercase tracking-[0.2em] mb-6 font-sans" style={{ color: primary }}>
                          {page.hero.eyebrow}
                        </span>
                      )}
                      <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-8 text-[#2d241c] leading-tight">
                        {page.hero.title}
                      </h1>
                      <p className="text-xl md:text-2xl text-[#6b5a4a] mb-12 font-light max-w-3xl mx-auto">
                        {page.hero.subtitle}
                      </p>
                      {page.hero.buttonText && (
                        <a
                          href={page.hero.buttonLink}
                          className="inline-block px-10 py-4 text-white rounded-md transition hover:scale-105"
                          style={{ backgroundColor: primary }}
                        >
                          {page.hero.buttonText}
                        </a>
                      )}
                    </motion.div>
                  </div>
                  
                  {page.hero.image && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.3 }} className="mx-auto max-w-6xl mt-20">
                      <img
                        src={page.hero.image}
                        alt="Hero"
                        className="rounded-t-[4rem] w-full h-[500px] object-cover shadow-2xl border-8 border-white"
                      />
                    </motion.div>
                  )}
                </section>
              );

            case 'about':
              return page.about.show && (
                <section id="about" key="about" className="py-16 md:py-24 px-6 bg-white border-y border-[#f3e8d6]">
                  <div className="mx-auto max-w-5xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#2d241c]">{page.about.title}</h2>
                    <p className="text-xl text-[#d97706] mb-12 italic">{page.about.subtitle}</p>
                    
                    <div className="prose prose-lg mx-auto text-[#6b5a4a] leading-relaxed" dangerouslySetInnerHTML={{ __html: page.about.content }} />
                    
                    {page.about.image && (
                      <div className="mt-16 relative">
                        <div className="absolute inset-0 border border-[#f3e8d6] -m-4 rounded-xl"></div>
                        <img src={page.about.image} alt="About" className="rounded-lg w-full h-auto object-cover" />
                      </div>
                    )}
                  </div>
                </section>
              );

            case 'why-choose-us':
              return page.why.show && page.why.items.length > 0 && (
                <section id="why-choose-us" key="why-choose-us" className="py-16 md:py-24 px-6 bg-[#fffbf5]">
                  <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16 md:mb-20">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#2d241c]">{page.why.title}</h2>
                      <p className="text-lg text-[#6b5a4a] max-w-2xl mx-auto">{page.why.subtitle}</p>
                      <div className="w-16 h-1 mx-auto mt-8" style={{ backgroundColor: primary }}></div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                      {page.why.items.map((item, i) => (
                        <div key={i} className="p-8">
                          <div className="w-16 h-16 mx-auto rounded-full border border-[#f3e8d6] bg-white flex items-center justify-center mb-6" style={{ color: primary }}>
                            <Check className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                          <p className="text-[#6b5a4a] text-sm leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'services':
              return page.services.show && page.services.items.length > 0 && (
                <section id="services" key="services" className="py-16 md:py-24 px-6">
                  <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16 md:mb-20">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#2d241c]">{page.services.title}</h2>
                      <p className="text-lg text-[#6b5a4a] max-w-2xl mx-auto">{page.services.subtitle}</p>
                      <div className="w-16 h-1 mx-auto mt-8" style={{ backgroundColor: primary }}></div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-12">
                      {page.services.items.map((service, i) => {
                        const img = getServiceImage(service);
                        return (
                          <div key={service._id || i} className="bg-white rounded-xl border border-[#f3e8d6] overflow-hidden">
                            {img && (
                              <img src={img} alt={service.name} className="aspect-[16/10] w-full object-cover" />
                            )}
                            <div className="flex gap-6 items-start p-8">
                              {!img && (
                                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${primary}15`, color: primary }}>
                                  <Check className="w-6 h-6" />
                                </div>
                              )}
                              <div>
                                <h3 className="text-2xl font-bold mb-3">{service.name}</h3>
                                <p className="text-[#6b5a4a] mb-4">{service.description}</p>
                                <div className="flex gap-4 items-center text-sm font-sans">
                                  <span className="font-bold text-lg" style={{ color: primary }}>{formatCurrency(service.price)}</span>
                                  <span className="text-[#8c7b6a]">•</span>
                                  <span className="text-[#8c7b6a]">{service.duration}</span>
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
                <section id="products" key="products" className="py-16 md:py-24 px-6 bg-[#2d241c] text-[#fffbf5]">
                  <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16 md:mb-20">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">{page.products.title}</h2>
                      <p className="text-lg text-[#d3c5b8] max-w-2xl mx-auto">{page.products.subtitle}</p>
                      <div className="w-16 h-1 mx-auto mt-8" style={{ backgroundColor: primary }}></div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                      {page.products.items.map((product, i) => (
                        <div key={product._id || i} className="bg-[#3a3027] rounded-lg overflow-hidden group border border-[#4a3f35]">
                          <div className="relative h-72 overflow-hidden">
                            <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover group-hover:opacity-80 transition duration-500" />
                          </div>
                          <div className="p-6 text-center">
                            <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                            <p className="text-[#a89b8d] text-sm mb-4 line-clamp-2">{product.description}</p>
                            <div className="font-sans">
                                {product.offerPrice ? (
                                  <div className="flex items-center justify-center gap-3">
                                    <span className="text-sm text-[#8c7b6a] line-through">{formatCurrency(product.price)}</span>
                                    <span className="font-bold text-xl" style={{ color: primary }}>{formatCurrency(product.offerPrice)}</span>
                                  </div>
                                ) : (
                                  <span className="font-bold text-xl" style={{ color: primary }}>{formatCurrency(product.price)}</span>
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
                <section id="gallery" key="gallery" className="py-16 md:py-24 px-6 bg-white border-b border-[#f3e8d6]">
                  <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-12 md:mb-16">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">{page.gallery.title}</h2>
                      <p className="text-lg text-[#6b5a4a]">{page.gallery.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {page.gallery.images.map((img, i) => (
                        <div key={i} className={`relative overflow-hidden rounded-md group ${i % 3 === 0 ? 'col-span-2 row-span-2 md:col-span-1 md:row-span-1' : ''}`}>
                          <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-full object-cover min-h-[250px] transition duration-700 group-hover:scale-110" />
                          {img.caption && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center p-6 text-center">
                              <p className="text-white font-sans text-sm tracking-widest uppercase">{img.caption}</p>
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
                <section id="testimonials" key="testimonials" className="py-16 md:py-24 px-6">
                  <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16 md:mb-20">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">{page.testimonials.title}</h2>
                      <div className="w-16 h-1 mx-auto mt-6" style={{ backgroundColor: primary }}></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12">
                      {page.testimonials.items.map((test, i) => (
                        <div key={i} className="text-center px-8">
                          <div className="flex justify-center gap-1 mb-6">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-5 h-5 ${j < test.rating ? 'fill-current text-[#d97706]' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <p className="text-xl md:text-2xl text-[#4a3f35] mb-8 leading-relaxed">"{test.comment}"</p>
                          <p className="font-bold text-sm tracking-widest uppercase font-sans">{test.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'faq':
              return page.faq.show && page.faq.items.length > 0 && (
                <section id="faq" key="faq" className="py-16 md:py-24 px-6 bg-[#fffbf5]">
                  <div className="mx-auto max-w-4xl">
                    <div className="text-center mb-12 md:mb-16">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#2d241c]">{page.faq.title}</h2>
                      <p className="text-lg text-[#6b5a4a]">{page.faq.subtitle}</p>
                    </div>
                    <div className="space-y-6">
                      {page.faq.items.map((faq, i) => (
                        <div key={i} className="p-8 bg-white border border-[#f3e8d6] rounded-xl shadow-sm">
                          <h3 className="text-xl font-bold mb-4 text-[#2d241c]">{faq.question}</h3>
                          <p className="text-[#6b5a4a] leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'subscribe':
              return page.subscribe.show && (
                <section id="subscribe" key="subscribe" className="py-16 md:py-24 px-6 bg-white border-y border-[#f3e8d6]">
                  <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#2d241c]">{page.subscribe.title}</h2>
                    <p className="text-lg text-[#6b5a4a] mb-12 max-w-2xl mx-auto">{page.subscribe.subtitle}</p>
                    <div className="max-w-md mx-auto">
                      <NewsletterForm 
                        companyId={props.company._id} 
                        buttonText={page.subscribe.buttonText} 
                        placeholder={page.subscribe.placeholder} 
                        primaryColor={primary} 
                      />
                      {page.subscribe.note && (
                        <p className="text-sm text-[#8c7b6a] mt-4 font-sans">{page.subscribe.note}</p>
                      )}
                    </div>
                  </div>
                </section>
              );

            case 'blogs':
              return page.blogs.show && page.blogs.items.length > 0 && (
                <section id="blogs" key="blogs" className="py-16 md:py-24 px-6 bg-white border-y border-[#f3e8d6]">
                  <div className="mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 border-b border-[#f3e8d6] pb-6 gap-4">
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">{page.blogs.title}</h2>
                        <p className="text-lg text-[#6b5a4a]">{page.blogs.subtitle}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {page.blogs.items.map((blog) => (
                        <Link key={blog._id} href={`/${page.slug}/blog/${blog.slug}`} className="group block">
                          <div className="overflow-hidden mb-6 aspect-video">
                            <img src={blog.featuredImage || '/placeholder.png'} alt={blog.title} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-sm text-[#8c7b6a] font-sans mb-3">{formatDate(blog.createdAt)}</p>
                          <h3 className="text-2xl font-bold mb-3 group-hover:text-[#d97706] transition">{blog.title}</h3>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'contact':
              return page.contact.show && (
                <section id="contact" key="contact" className="py-16 md:py-24 px-6">
                  <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-12 md:mb-16">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">{page.contact.title}</h2>
                      <p className="text-lg text-[#6b5a4a]">{page.contact.subtitle}</p>
                    </div>
                    
                    <div className="bg-white p-8 md:p-12 border border-[#f3e8d6] shadow-xl">
                      <div className="grid md:grid-cols-3 gap-12 mb-12 border-b border-[#f3e8d6] pb-12 text-center">
                         {page.phone && (
                           <div>
                             <Phone className="w-6 h-6 mx-auto mb-4" style={{ color: primary }} />
                             <p className="font-bold mb-1">Phone</p>
                             <p className="text-[#6b5a4a] font-sans">{page.phone}</p>
                           </div>
                         )}
                         {page.email && (
                           <div>
                             <Mail className="w-6 h-6 mx-auto mb-4" style={{ color: primary }} />
                             <p className="font-bold mb-1">Email</p>
                             <p className="text-[#6b5a4a] font-sans">{page.email}</p>
                           </div>
                         )}
                         {page.addressLine && (
                           <div>
                             <MapPin className="w-6 h-6 mx-auto mb-4" style={{ color: primary }} />
                             <p className="font-bold mb-1">Address</p>
                             <p className="text-[#6b5a4a] font-sans">{page.addressLine}</p>
                           </div>
                         )}
                      </div>
                      
                      <div className="max-w-2xl mx-auto font-sans">
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
      <footer className="bg-[#2d241c] text-[#fffbf5] py-16 px-6 text-center">
        <div className="mx-auto max-w-6xl">
          <div className="text-3xl font-bold mb-6">
            {page.brandName}
          </div>
          <div className="flex justify-center gap-6 mb-12 font-sans text-sm text-[#a89b8d]">
             {page.nav.map((item) => (
                <a key={item.link} href={item.link} className="hover:text-white transition">{item.label}</a>
             ))}
          </div>
          <div className="text-[#6b5a4a] text-sm font-sans border-t border-[#3a3027] pt-8">
            &copy; {new Date().getFullYear()} {page.brandName}. - Promoted By Multi-Tenant Platform Provisioning Tech All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
