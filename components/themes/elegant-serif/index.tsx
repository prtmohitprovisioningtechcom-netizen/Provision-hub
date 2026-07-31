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

export function ElegantSerifTheme(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = resolveThemePage(props);
  
  const primary = page.primaryColor || '#c5a059'; // elegant gold fallback
  
  return (
    <div className="font-serif text-[#1a1a1a] bg-[#fdfbf7] min-h-screen selection:bg-[#c5a059] selection:text-white">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-[#e8e2d2]">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link href={`/${page.slug}`} className="flex items-center gap-3">
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-2xl font-bold tracking-widest uppercase">
                {page.brandName}
              </span>
            )}
          </Link>

          <div className="hidden lg:flex items-center gap-12">
            {page.nav.map((item) => (
              <a
                key={item.link + item.label}
                href={item.link}
                className="text-sm uppercase tracking-[0.2em] hover:text-[#c5a059] transition-colors"
              >
                {item.label}
              </a>
            ))}
            {page.navCta && (
              <a
                href={page.navCta.link}
                className="px-8 py-3 text-sm uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: primary }}
              >
                {page.navCta.label}
              </a>
            )}
          </div>

          <button className="lg:hidden text-[#1a1a1a]" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        {page.hero.show && (
          <section id="home" className="relative min-h-[90vh] flex items-center px-6 lg:px-12 py-24">
            <div className="absolute inset-0 z-0">
              {page.hero.image ? (
                <img src={page.hero.image} alt="Hero" className="w-full h-full object-cover opacity-90" />
              ) : (
                <div className="w-full h-full bg-[#f4efe6]"></div>
              )}
              <div className="absolute inset-0 bg-[#fdfbf7]/80"></div>
            </div>
            
            <div className="relative z-10 mx-auto max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: "easeOut" }}>
                {page.hero.eyebrow && (
                  <span className="inline-block mb-8 text-sm uppercase tracking-[0.3em]" style={{ color: primary }}>
                    {page.hero.eyebrow}
                  </span>
                )}
                <h1 className="text-5xl lg:text-7xl font-medium leading-[1.1] mb-8">
                  {page.hero.title}
                </h1>
                <p className="text-xl lg:text-2xl text-gray-600 mb-12 font-light leading-relaxed max-w-lg">
                  {page.hero.subtitle}
                </p>
                {page.hero.buttonText && (
                  <a
                    href={page.hero.buttonLink}
                    className="inline-flex items-center justify-center px-10 py-4 text-sm uppercase tracking-[0.2em] text-white transition-all hover:bg-black"
                    style={{ backgroundColor: primary }}
                  >
                    {page.hero.buttonText}
                  </a>
                )}
              </motion.div>
              
              {page.hero.image && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2 }} className="hidden lg:block relative h-[600px]">
                  <div className="absolute inset-0 border-2 translate-x-6 translate-y-6" style={{ borderColor: primary }}></div>
                  <img src={page.hero.image} alt="Hero" className="relative w-full h-full object-cover z-10" />
                </motion.div>
              )}
            </div>
          </section>
        )}

        {/* About Section */}
        {page.about.show && (
          <section id="about" className="py-32 px-6 lg:px-12 bg-white">
            <div className="mx-auto max-w-7xl">
              <div className="grid lg:grid-cols-12 gap-16 items-center">
                <div className="lg:col-span-5 order-2 lg:order-1">
                  <h2 className="text-4xl lg:text-5xl mb-8">{page.about.title}</h2>
                  <p className="text-2xl text-gray-500 mb-10 italic font-light">{page.about.subtitle}</p>
                  <div className="prose prose-lg prose-headings:font-serif text-gray-600 font-sans font-light leading-relaxed" dangerouslySetInnerHTML={{ __html: page.about.content }} />
                </div>
                {page.about.image && (
                  <div className="lg:col-span-7 order-1 lg:order-2">
                    <img src={page.about.image} alt="About" className="w-full h-auto object-cover aspect-[4/3]" />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us */}
        {page.why.show && page.why.items.length > 0 && (
          <section className="py-32 px-6 lg:px-12 bg-[#1a1a1a] text-white">
            <div className="mx-auto max-w-7xl text-center">
              <h2 className="text-4xl lg:text-5xl mb-6">{page.why.title}</h2>
              <p className="text-xl text-gray-400 mb-20 italic font-light">{page.why.subtitle}</p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                {page.why.items.map((item, i) => (
                  <div key={i} className="text-center group">
                    <div className="w-16 h-16 mx-auto border rounded-full flex items-center justify-center mb-8 transition-colors duration-500" style={{ borderColor: primary, color: primary }}>
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl mb-4">{item.title}</h3>
                    <p className="text-gray-400 font-sans font-light leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services Section */}
        {page.services.show && page.services.items.length > 0 && (
          <section id="services" className="py-32 px-6 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-24">
                <h2 className="text-4xl lg:text-5xl mb-6">{page.services.title}</h2>
                <p className="text-xl text-gray-500 italic font-light">{page.services.subtitle}</p>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-12">
                {page.services.items.map((service, i) => {
                  const img = getServiceImage(service);
                  return (
                    <div key={service._id || i} className="bg-white border border-[#e8e2d2] hover:border-[#c5a059] transition-colors duration-500 overflow-hidden">
                      {img ? (
                        <img src={img} alt={service.name} className="aspect-[16/10] w-full object-cover" />
                      ) : (
                        <div className="px-12 pt-12">
                          <div className="text-5xl font-light opacity-20" style={{ color: primary }}>0{i + 1}</div>
                        </div>
                      )}
                      <div className="p-12">
                        <h3 className="text-3xl mb-6">{service.name}</h3>
                        <p className="text-gray-600 mb-12 font-sans font-light leading-relaxed">{service.description}</p>
                        <div className="flex justify-between items-end border-t border-[#e8e2d2] pt-8">
                          <span className="text-2xl">{formatCurrency(service.price)}</span>
                          <span className="text-sm uppercase tracking-widest text-gray-400">{service.duration}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Products Section */}
        {page.products.show && page.products.items.length > 0 && (
          <section id="products" className="py-32 px-6 lg:px-12 bg-white">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                <div>
                  <h2 className="text-4xl lg:text-5xl mb-4">{page.products.title}</h2>
                  <p className="text-xl text-gray-500 italic font-light">{page.products.subtitle}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {page.products.items.map((product, i) => (
                  <div key={product._id || i} className="group">
                    <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-[#fdfbf7]">
                      <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover transition duration-1000 group-hover:scale-105" />
                      {product.offerPrice && (
                        <div className="absolute top-6 right-6 text-white text-xs uppercase tracking-widest px-4 py-2" style={{ backgroundColor: primary }}>
                          Sale
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl mb-3 text-center">{product.name}</h3>
                    <div className="text-center font-sans">
                        {product.offerPrice ? (
                          <div className="flex justify-center items-center gap-4">
                            <span className="text-xl" style={{ color: primary }}>{formatCurrency(product.offerPrice)}</span>
                            <span className="text-sm text-gray-400 line-through">{formatCurrency(product.price)}</span>
                          </div>
                        ) : (
                          <span className="text-xl">{formatCurrency(product.price)}</span>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {page.gallery.show && page.gallery.images.length > 0 && (
          <section id="gallery" className="py-32 px-6 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-20">
                <h2 className="text-4xl lg:text-5xl mb-6">{page.gallery.title}</h2>
                <p className="text-xl text-gray-500 italic font-light">{page.gallery.subtitle}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8">
                {page.gallery.images.map((img, i) => (
                  <div key={i} className={`relative overflow-hidden group ${i % 4 === 0 || i % 4 === 3 ? 'aspect-square' : 'aspect-[4/5]'}`}>
                    <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-full object-cover transition duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                    {img.caption && (
                      <div className="absolute inset-0 bg-[#1a1a1a]/80 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center p-8 text-center">
                        <p className="text-white text-lg tracking-wide">{img.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {page.testimonials.show && page.testimonials.items.length > 0 && (
          <section id="testimonials" className="py-32 px-6 lg:px-12 bg-white border-y border-[#e8e2d2]">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-4xl lg:text-5xl mb-24 text-center">{page.testimonials.title}</h2>
              <div className="space-y-24">
                {page.testimonials.items.map((test, i) => (
                  <div key={i} className="text-center max-w-3xl mx-auto">
                    <div className="text-6xl font-serif mb-8 opacity-20" style={{ color: primary }}>"</div>
                    <p className="text-2xl md:text-3xl text-[#1a1a1a] mb-12 italic font-light leading-relaxed">"{test.comment}"</p>
                    <div className="flex justify-center gap-2 mb-6">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-5 h-5 ${j < test.rating ? 'fill-current text-[#c5a059]' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="font-bold tracking-[0.2em] uppercase text-sm text-gray-400 font-sans">{test.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {page.faq.show && page.faq.items.length > 0 && (
          <section id="faq" className="py-32 px-6 lg:px-12">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-20">
                <h2 className="text-4xl lg:text-5xl mb-6">{page.faq.title}</h2>
                <p className="text-xl text-gray-500 italic font-light">{page.faq.subtitle}</p>
              </div>
              <div className="space-y-8">
                {page.faq.items.map((faq, i) => (
                  <div key={i} className="pb-8 border-b border-[#e8e2d2]">
                    <h3 className="text-2xl mb-4">{faq.question}</h3>
                    <p className="text-gray-600 font-sans font-light leading-relaxed text-lg">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Subscribe Section */}
        {page.subscribe.show && (
          <section id="subscribe" className="py-32 px-6 lg:px-12 bg-[#1a1a1a] text-white">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl lg:text-5xl mb-6">{page.subscribe.title}</h2>
              <p className="text-xl text-gray-400 italic font-light mb-16">{page.subscribe.subtitle}</p>
              <div className="relative">
                <NewsletterForm 
                  companyId={props.company._id} 
                  buttonText={page.subscribe.buttonText} 
                  placeholder={page.subscribe.placeholder} 
                  primaryColor={primary} 
                />
                {page.subscribe.note && (
                  <p className="text-sm tracking-[0.1em] text-gray-500 mt-8 font-sans">{page.subscribe.note}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Blogs */}
        {page.blogs.show && page.blogs.items.length > 0 && (
          <section id="blogs" className="py-32 px-6 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-20">
                <h2 className="text-4xl lg:text-5xl mb-6">{page.blogs.title}</h2>
                <p className="text-xl text-gray-500 italic font-light">{page.blogs.subtitle}</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {page.blogs.items.map((blog, i) => (
                  <div key={blog._id || i} className="group cursor-pointer">
                    <div className="aspect-[3/2] overflow-hidden mb-8">
                      <img src={(blog as any).image || blog.featuredImage || '/placeholder.png'} alt={blog.title} className="w-full h-full object-cover transition duration-1000 group-hover:scale-105" />
                    </div>
                    <div className="text-sm text-gray-400 uppercase tracking-widest font-sans mb-4">{formatDate((blog as any).publishedAt || blog.createdAt)}</div>
                    <h3 className="text-2xl mb-4 group-hover:text-[#c5a059] transition-colors">{blog.title}</h3>
                    <p className="text-gray-600 font-sans font-light line-clamp-3 leading-relaxed">{blog.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        {page.contact.show && (
          <section id="contact" className="py-32 px-6 lg:px-12 bg-white border-t border-[#e8e2d2]">
            <div className="mx-auto max-w-7xl">
              <div className="grid lg:grid-cols-2 gap-20">
                <div>
                  <h2 className="text-4xl lg:text-5xl mb-6">{page.contact.title}</h2>
                  <p className="text-xl text-gray-500 italic font-light mb-16">{page.contact.subtitle}</p>
                  
                  <div className="space-y-12 font-sans">
                     {page.phone && (
                       <div>
                         <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Phone</p>
                         <p className="text-2xl font-light text-[#1a1a1a]">{page.phone}</p>
                       </div>
                     )}
                     {page.email && (
                       <div>
                         <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Email</p>
                         <p className="text-2xl font-light text-[#1a1a1a]">{page.email}</p>
                       </div>
                     )}
                     {page.addressLine && (
                       <div>
                         <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Address</p>
                         <p className="text-2xl font-light text-[#1a1a1a]">{page.addressLine}</p>
                       </div>
                     )}
                  </div>
                </div>
                
                <div className="p-12 bg-[#fdfbf7] border border-[#e8e2d2]">
                  <ContactForm companyId={props.company._id} />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-16 px-6 lg:px-12 bg-[#1a1a1a] text-gray-400 text-sm font-sans font-light">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-serif text-white mb-2">{page.brandName}</h2>
            <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
             {page.nav.map((item) => (
                <a key={item.link} href={item.link} className="uppercase tracking-widest hover:text-[#c5a059] transition-colors">{item.label}</a>
             ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
