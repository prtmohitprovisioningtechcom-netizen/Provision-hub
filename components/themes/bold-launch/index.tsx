'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Mail, MapPin, Menu, Phone, X, Star, ArrowUpRight } from 'lucide-react';
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

export function BoldLaunchTheme(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = resolveThemePage(props);
  
  const primary = page.primaryColor || '#4f46e5'; // indigo-600 fallback
  
  return (
    <div className="font-sans text-gray-100 bg-[#0a0a0a] min-h-screen selection:bg-white selection:text-black">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href={`/${page.slug}`} className="flex items-center gap-3">
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-xl font-bold tracking-tight uppercase" style={{ color: primary }}>
                {page.brandName}
              </span>
            )}
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {page.nav.map((item) => (
              <a
                key={item.link + item.label}
                href={item.link}
                className="text-sm font-medium text-gray-300 hover:text-white transition"
              >
                {item.label}
              </a>
            ))}
            {page.navCta && (
              <a
                href={page.navCta.link}
                className="px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
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

      <main className="pt-20">
        {page.orderedSectionTypes.map((type) => {
          switch (type) {
            case 'hero':
              return page.hero.show && (
                <section id="home" key="hero" className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 px-6 border-b border-white/10">
                  {/* Grid background */}
                  <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '64px 64px' }}></div>
                  
                  <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        {page.hero.eyebrow && (
                          <span className="inline-block px-3 py-1 text-xs font-mono tracking-widest uppercase mb-8 border border-white/20" style={{ color: primary }}>
                            {page.hero.eyebrow}
                          </span>
                        )}
                        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-white uppercase">
                          {page.hero.title}
                        </h1>
                        <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
                          {page.hero.subtitle}
                        </p>
                        {page.hero.buttonText && (
                          <a
                            href={page.hero.buttonLink}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-black uppercase tracking-widest transition hover:bg-white"
                            style={{ backgroundColor: primary }}
                          >
                            {page.hero.buttonText}
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        )}
                      </motion.div>
                      
                      {page.hero.image && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
                          <div className="aspect-square bg-white/5 border border-white/10 overflow-hidden relative">
                            <img
                              src={page.hero.image}
                              alt="Hero"
                              className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition duration-700"
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
                <section id="about" key="about" className="py-24 lg:py-40 px-6 border-b border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent z-0"></div>
                  <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                      <div className="lg:col-span-5">
                        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase mb-6">{page.about.title}</h2>
                      </div>
                      <div className="lg:col-span-7">
                        <p className="text-2xl text-white mb-8 font-medium">{page.about.subtitle}</p>
                        <div className="text-gray-400 text-lg leading-relaxed space-y-6" dangerouslySetInnerHTML={{ __html: page.about.content }} />
                      </div>
                    </div>
                    {page.about.image && (
                      <div className="mt-20">
                        <img src={page.about.image} alt="About" className="w-full h-[60vh] object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition duration-700" />
                      </div>
                    )}
                  </div>
                </section>
              );

            case 'why-choose-us':
              return page.why.show && page.why.items.length > 0 && (
                <section id="why-choose-us" key="why-choose-us" className="py-24 lg:py-40 px-6 border-b border-white/10">
                  <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-8">
                      <div className="max-w-2xl">
                        <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">{page.why.title}</h2>
                        <p className="text-xl text-gray-400">{page.why.subtitle}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
                      {page.why.items.map((item, i) => (
                        <div key={i} className="bg-[#0a0a0a] p-10 group hover:bg-[#111] transition duration-300">
                          <div className="w-12 h-12 mb-8 flex items-center justify-center border border-white/20">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold mb-4 uppercase">{item.title}</h3>
                          <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'services':
              return page.services.show && page.services.items.length > 0 && (
                <section id="services" key="services" className="py-24 lg:py-40 px-6 border-b border-white/10">
                  <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
                      <div className="max-w-2xl">
                        <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">{page.services.title}</h2>
                        <p className="text-xl text-gray-400">{page.services.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
                      {page.services.items.map((service, i) => {
                        const img = getServiceImage(service);
                        return (
                          <div key={service._id || i} className="bg-[#0a0a0a] group hover:bg-[#111] transition duration-300 overflow-hidden">
                            {img ? (
                              <img src={img} alt={service.name} className="aspect-[16/10] w-full object-cover" />
                            ) : (
                              <div className="px-10 pt-10">
                                <div className="text-4xl font-black text-white/10 font-mono">0{i + 1}</div>
                              </div>
                            )}
                            <div className="p-10">
                              <h3 className="text-2xl font-bold mb-4 uppercase">{service.name}</h3>
                              <p className="text-gray-400 mb-12">{service.description}</p>
                              <div className="flex justify-between items-center pt-8 border-t border-white/10">
                                <span className="font-mono text-xl text-white">{formatCurrency(service.price)}</span>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{service.duration}</span>
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
                <section id="products" key="products" className="py-24 lg:py-40 px-6 border-b border-white/10 bg-white text-black">
                  <div className="mx-auto max-w-7xl">
                    <div className="mb-20">
                      <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">{page.products.title}</h2>
                      <p className="text-xl text-gray-600 max-w-2xl">{page.products.subtitle}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {page.products.items.map((product, i) => (
                        <div key={product._id || i} className="group">
                          <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-gray-100">
                            <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500" />
                            {product.offerPrice && (
                              <div className="absolute top-4 right-4 bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">Sale</div>
                            )}
                          </div>
                          <h3 className="text-lg font-bold mb-2 uppercase">{product.name}</h3>
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                          <div className="font-mono">
                              {product.offerPrice ? (
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-lg">{formatCurrency(product.offerPrice)}</span>
                                  <span className="text-sm text-gray-400 line-through">{formatCurrency(product.price)}</span>
                                </div>
                              ) : (
                                <span className="font-bold text-lg">{formatCurrency(product.price)}</span>
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
                <section id="gallery" key="gallery" className="py-24 lg:py-40 px-6 border-b border-white/10">
                  <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-20">
                      <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">{page.gallery.title}</h2>
                      <p className="text-xl text-gray-400">{page.gallery.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {page.gallery.images.map((img, i) => (
                        <div key={i} className={`relative overflow-hidden group ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                          <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-full object-cover min-h-[300px] grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition duration-500" />
                          {img.caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition duration-300">
                              <p className="text-white font-mono text-sm">{img.caption}</p>
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
                <section id="testimonials" key="testimonials" className="py-24 lg:py-40 px-6 border-b border-white/10">
                  <div className="mx-auto max-w-7xl">
                    <h2 className="text-5xl font-black tracking-tighter uppercase mb-20">{page.testimonials.title}</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {page.testimonials.items.map((test, i) => (
                        <div key={i} className="border border-white/10 p-10 flex flex-col justify-between">
                          <div>
                            <div className="flex gap-1 mb-8">
                              {[...Array(test.rating)].map((_, j) => (
                                <Star key={j} className="w-4 h-4 fill-white text-white" />
                              ))}
                            </div>
                            <p className="text-gray-300 mb-8 text-lg">"{test.comment}"</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10"></div>
                            <p className="font-bold uppercase tracking-widest text-sm">{test.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'faq':
              return page.faq.show && page.faq.items.length > 0 && (
                <section id="faq" key="faq" className="py-24 lg:py-40 px-6 border-b border-white/10">
                  <div className="mx-auto max-w-4xl">
                    <div className="mb-20">
                      <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">{page.faq.title}</h2>
                      <p className="text-xl text-gray-400">{page.faq.subtitle}</p>
                    </div>
                    <div className="space-y-8">
                      {page.faq.items.map((faq, i) => (
                        <div key={i} className="border-b border-white/10 pb-8">
                          <h3 className="text-2xl font-bold mb-4 uppercase">{faq.question}</h3>
                          <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'subscribe':
              return page.subscribe.show && (
                <section id="subscribe" key="subscribe" className="py-24 lg:py-40 px-6 border-b border-white/10 bg-white text-black">
                  <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-5xl font-black tracking-tighter uppercase mb-6">{page.subscribe.title}</h2>
                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">{page.subscribe.subtitle}</p>
                    <div className="max-w-md mx-auto">
                      <NewsletterForm 
                        companyId={props.company._id} 
                        buttonText={page.subscribe.buttonText} 
                        placeholder={page.subscribe.placeholder} 
                        primaryColor="#0a0a0a" 
                      />
                      {page.subscribe.note && (
                        <p className="text-sm text-gray-500 mt-4 uppercase tracking-widest font-bold">{page.subscribe.note}</p>
                      )}
                    </div>
                  </div>
                </section>
              );

            case 'blogs':
              return page.blogs.show && page.blogs.items.length > 0 && (
                <section id="blogs" key="blogs" className="py-24 lg:py-40 px-6 border-b border-white/10">
                  <div className="mx-auto max-w-7xl">
                    <div className="mb-20">
                      <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">{page.blogs.title}</h2>
                      <p className="text-xl text-gray-400">{page.blogs.subtitle}</p>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-8">
                      {page.blogs.items.map((blog, i) => (
                        <Link key={blog._id} href={`/${page.slug}/blog/${blog.slug}`} className="group flex flex-col md:flex-row gap-8 items-center border border-white/10 p-4 hover:border-white/30 transition">
                          <div className="w-full md:w-1/2 aspect-video overflow-hidden">
                            <img src={blog.featuredImage || '/placeholder.png'} alt={blog.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500" />
                          </div>
                          <div className="w-full md:w-1/2 p-4 md:p-0">
                            <p className="text-xs font-mono text-gray-500 mb-3">{formatDate(blog.createdAt)}</p>
                            <h3 className="text-2xl font-bold uppercase mb-4 leading-tight">{blog.title}</h3>
                            <span className="text-xs font-bold tracking-widest uppercase border-b border-white pb-1">Read Article</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'contact':
              return page.contact.show && (
                <section id="contact" key="contact" className="py-24 lg:py-40 px-6 bg-white text-black">
                  <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-20">
                      <div>
                        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase mb-8">{page.contact.title}</h2>
                        <p className="text-xl text-gray-600 mb-16">{page.contact.subtitle}</p>
                        
                        <div className="space-y-10 font-mono text-sm uppercase tracking-widest">
                           {page.phone && (
                             <div>
                               <p className="text-gray-400 mb-2">Phone</p>
                               <p className="text-xl font-bold">{page.phone}</p>
                             </div>
                           )}
                           {page.email && (
                             <div>
                               <p className="text-gray-400 mb-2">Email</p>
                               <p className="text-xl font-bold">{page.email}</p>
                             </div>
                           )}
                           {page.addressLine && (
                             <div>
                               <p className="text-gray-400 mb-2">Location</p>
                               <p className="text-lg font-bold leading-relaxed">{page.addressLine}</p>
                             </div>
                           )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-100 p-8 lg:p-12">
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
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-xs uppercase tracking-widest text-gray-500">
          <div>
            &copy; {new Date().getFullYear()} {page.brandName}. - Promoted By Multi-Tenant Platform Provisioning Tech
          </div>
          <div className="flex gap-6">
             {page.nav.map((item) => (
                <a key={item.link} href={item.link} className="hover:text-white transition">{item.label}</a>
             ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
