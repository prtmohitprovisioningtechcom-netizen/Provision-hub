'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Menu, Phone, X, Star, Search, Check, Clock } from 'lucide-react';
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

function HeroSlider({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <img src="https://images.unsplash.com/photo-1618220179428-22790b461013?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
           className="w-full h-full object-cover" alt="Hero placeholder" />
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.img
        key={index}
        src={images[index]}
        alt={`Hero slide ${index + 1}`}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
    </AnimatePresence>
  );
}

export function CarpenterWorksTheme(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const page = resolveThemePage(props);
  const primary = page.primaryColor || '#6b3f2b'; // primary-brown
  const secondary = '#8b5a3e'; // secondary-brown
  const gold = '#c9a84c';

  return (
    <div className="font-sans text-slate-800 bg-[#fef9f0] min-h-screen selection:bg-[#f5e7c8] overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        :root {
            --primary-brown: ${primary};
            --secondary-brown: ${secondary};
            --gold: ${gold};
            --light-gold: #f5e7c8;
            --cream: #fef9f0;
            --dark: #2c1e16;
            --light: #faf6f0;
        }
        h1, h2, h3, h4, h5, h6 { font-family: 'Playfair Display', serif; font-weight: 700; }
        .bg-primary-brown { background-color: var(--primary-brown); }
        .text-primary-brown { color: var(--primary-brown); }
        .bg-gold { background-color: var(--gold); }
        .text-gold { color: var(--gold); }
        .border-gold { border-color: var(--gold); }
        .bg-light-gold { background-color: var(--light-gold); }
        
        .nav-link { position: relative; }
        .nav-link::after {
            content: ''; position: absolute; width: 0; height: 2px;
            background: var(--gold); bottom: -4px; left: 0; transition: 0.3s;
        }
        .nav-link:hover::after { width: 100%; }
        
        .section-title { position: relative; margin-bottom: 50px; text-align: center; }
        .section-title h2 { font-size: 2.6rem; color: var(--primary-brown); margin-bottom: 10px; }
        .section-title .title-bg {
            position: absolute; font-size: 5rem; font-weight: 800;
            color: rgba(107, 63, 43, 0.05); top: -30px; left: 0; right: 0; z-index: 0;
        }
        
        .service-card:hover .service-icon {
            background: var(--primary-brown); color: #fff; transform: rotateY(180deg);
        }
        
        .testimonial-text::before {
            content: '\\201C'; font-size: 4rem; color: var(--gold);
            opacity: 0.25; position: absolute; top: -20px; left: -8px; font-family: serif;
        }
      `}} />

      {/* Top Bar */}
      <div className="bg-primary-brown text-white py-2 text-sm hidden md:block relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            {page.phone && (
              <a href={`tel:${page.phone}`} className="flex items-center gap-2 hover:text-gold transition">
                <Phone className="w-4 h-4" /> {page.phone}
              </a>
            )}
            {page.email && (
              <a href={`mailto:${page.email}`} className="flex items-center gap-2 hover:text-gold transition">
                <Mail className="w-4 h-4" /> {page.email}
              </a>
            )}
          </div>
          <div className="flex gap-4">
             {/* Social links could go here if mapped */}
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href={`/${page.slug}`} className="flex items-baseline gap-2 shrink-0">
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-10 w-auto" />
            ) : (
              <div className="font-[Playfair_Display] text-xl xl:text-3xl font-bold text-primary-brown whitespace-nowrap">
                {page.brandName.split(' ')[0]}<span className="text-gold">{page.brandName.split(' ').slice(1).join(' ')}</span>
              </div>
            )}
            <span className="hidden xl:inline-block text-xs text-gray-500 border-l-2 border-gray-200 pl-3 ml-1 whitespace-nowrap">
              Furniture & Woodwork
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-3 xl:gap-6 overflow-x-auto hide-scrollbar">
            {page.nav.map((item) => (
              <a key={item.link} href={item.link} className="nav-link text-gray-800 font-medium whitespace-nowrap text-sm">
                {item.label}
              </a>
            ))}
            {page.navCta && (
              <a href={page.navCta.link} className="bg-gold hover:bg-[#b8983a] text-white px-5 py-2.5 rounded-md font-semibold transition shadow-md shadow-amber-500/20 hover:-translate-y-0.5 whitespace-nowrap text-sm shrink-0">
                {page.navCta.label}
              </a>
            )}
          </div>

          <button className="lg:hidden text-gray-800" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {menuOpen && (
          <div className="lg:hidden bg-white border-t p-4 absolute w-full shadow-lg">
            <div className="flex flex-col space-y-4">
              {page.nav.map((item) => (
                <a key={item.link} href={item.link} className="text-gray-800 font-medium" onClick={() => setMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main>
        {page.orderedSectionTypes.map((type) => {
          switch (type) {
            case 'hero':
              const sliderImages = page.hero.images?.length > 0 ? page.hero.images : (page.hero.image ? [page.hero.image] : []);
              return page.hero.show && (
                <section id="home" key="hero" className="relative h-[80vh] min-h-[500px] flex items-center overflow-hidden">
                  <div className="absolute inset-0 bg-black/50 z-10"></div>
                  <div className="absolute inset-0 z-0 bg-[#2c1e16]">
                    <HeroSlider images={sliderImages} />
                  </div>
                  <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
                    {page.hero.eyebrow && (
                      <span className="inline-block bg-gold text-white px-6 py-1.5 rounded-full font-semibold text-sm tracking-wide mb-4">
                        {page.hero.eyebrow}
                      </span>
                    )}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg max-w-4xl mx-auto">
                      {page.hero.title}
                    </h1>
                    <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 drop-shadow-md font-light max-w-2xl mx-auto">
                      {page.hero.subtitle}
                    </p>
                    {page.hero.buttonText && (
                      <div className="flex justify-center gap-4">
                        <a href={page.hero.buttonLink} className="bg-gold hover:bg-[#b8983a] text-white px-8 py-3.5 rounded-md font-semibold transition text-lg shadow-lg">
                          {page.hero.buttonText}
                        </a>
                      </div>
                    )}
                  </div>
                </section>
              );

            case 'services':
              return page.services.show && page.services.items.length > 0 && (
                <section id="services" key="services" className="py-12 lg:py-20 bg-[var(--cream)]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="section-title">
                      <span className="title-bg">Services</span>
                      <h2>{page.services.title}</h2>
                      <p className="text-gray-600 max-w-2xl mx-auto">{page.services.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {page.services.items.map((service, i) => {
                        const img = getServiceImage(service) || 'https://images.unsplash.com/photo-1581428982868-e410dd4b1ea2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                        return (
                          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 group flex flex-col h-full hover:-translate-y-1">
                            <div className="relative w-full aspect-[16/10] overflow-hidden">
                              <img src={img} alt={service.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-primary-brown/10 group-hover:bg-transparent transition-colors duration-500"></div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow text-center">
                              <h4 className="font-semibold text-primary-brown text-xl mb-3">{service.name}</h4>
                              <p className="text-gray-600 text-sm flex-grow mb-6">{service.description}</p>
                              {(service.price || service.duration) && (
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm font-medium">
                                  <span className="text-primary-brown font-bold">{service.price ? formatCurrency(service.price) : ''}</span>
                                  <span className="text-gray-400">{service.duration}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );

            case 'gallery':
              return page.gallery.show && page.gallery.images.length > 0 && (
                <section id="portfolio" key="portfolio" className="py-12 lg:py-20 bg-gray-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="section-title">
                      <span className="title-bg relative z-0">Portfolio</span>
                      <h2 className="relative z-10">{page.gallery.title}</h2>
                      <p className="text-gray-600 max-w-2xl mx-auto relative z-10">{page.gallery.subtitle}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                      {page.gallery.images.slice(0, 8).map((img, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden shadow-sm group bg-white flex flex-col">
                          <div className="relative overflow-hidden w-full h-64">
                            <img src={img.url} alt={img.caption || 'Gallery Image'} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                          </div>
                          {img.caption && (
                            <div className="p-4 border-t border-gray-100">
                               <p className="text-primary-brown font-medium text-center text-sm">{img.caption}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'why-choose-us':
              return page.why.show && page.why.items.length > 0 && (
                <section id="why" key="why" className="py-12 lg:py-20 bg-[var(--cream)]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="section-title">
                      <span className="title-bg">Why Us</span>
                      <h2>{page.why.title}</h2>
                      <p className="text-gray-600 max-w-2xl mx-auto">{page.why.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {page.why.items.map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300 h-full">
                           <div className="w-20 h-20 bg-light-gold text-gold rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
                             <Check className="w-8 h-8" />
                           </div>
                           <h5 className="font-bold text-primary-brown mb-3 text-lg">{item.title}</h5>
                           <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'testimonials':
              return page.testimonials.show && page.testimonials.items.length > 0 && (
                <section id="testimonials" key="testimonials" className="py-16 lg:py-24 relative bg-primary-brown/95">
                  <div className="absolute inset-0 z-0 opacity-20">
                     <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" className="w-full h-full object-cover" alt="Wood texture" />
                  </div>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                      <h2 className="text-white text-4xl mb-3">{page.testimonials.title}</h2>
                      <p className="text-white/70">{page.testimonials.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      {page.testimonials.items.slice(0,3).map((test, i) => (
                        <div key={i} className="bg-white/95 rounded-2xl p-8 text-gray-800 shadow-xl flex flex-col h-full">
                          <div className="testimonial-text relative italic mb-6 text-gray-600 z-10 pt-4">
                            "{test.comment}"
                          </div>
                          <div className="flex items-center gap-4 mt-auto">
                            <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xl text-gray-500 overflow-hidden shrink-0">
                              {test.name.charAt(0)}
                            </div>
                            <div>
                              <h6 className="font-bold mb-0 leading-tight">{test.name}</h6>
                              <div className="flex gap-1 mt-1">
                                {[...Array(5)].map((_, j) => (
                                  <Star key={j} className={`w-4 h-4 ${j < test.rating ? 'fill-gold text-gold' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'faq':
              return page.faq.show && page.faq.items.length > 0 && (
                <section id="faq" key="faq" className="py-12 lg:py-20 bg-[var(--cream)]">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="section-title">
                      <span className="title-bg">FAQ</span>
                      <h2>{page.faq.title}</h2>
                      <p className="text-gray-600 max-w-2xl mx-auto">{page.faq.subtitle}</p>
                    </div>
                    <div className="space-y-4">
                      {page.faq.items.map((item, i) => (
                        <details key={i} className="bg-white border border-gray-100 rounded-xl group shadow-sm hover:shadow-md transition">
                          <summary className="font-semibold p-6 cursor-pointer list-none flex justify-between items-center text-primary-brown text-lg">
                            {item.question}
                            <span className="group-open:rotate-180 transition duration-300 text-gold">▼</span>
                          </summary>
                          <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                            {item.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'about':
              return page.about.show && (
                <section id="about" key="about" className="py-12 lg:py-20 bg-gray-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      <div className="rounded-2xl overflow-hidden shadow-xl hover:-translate-y-1 transition duration-500">
                        <img src={page.about.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'} alt="About Us" className="w-full h-auto" />
                      </div>
                      <div>
                        <div className="section-title !text-left !mb-8">
                          <span className="title-bg !left-[-10px] !text-left">About</span>
                          <h2>{page.about.title}</h2>
                        </div>
                        <h4 className="text-xl text-gray-600 mb-6 font-sans font-medium">{page.about.subtitle}</h4>
                        <div className="prose prose-lg text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: page.about.content }} />
                        <div className="grid grid-cols-3 gap-4 mt-8">
                          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                            <div className="text-3xl font-bold text-primary-brown mb-1">1500+</div>
                            <div className="text-sm text-gray-500 font-medium">Projects Done</div>
                          </div>
                          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                            <div className="text-3xl font-bold text-primary-brown mb-1">1200+</div>
                            <div className="text-sm text-gray-500 font-medium">Happy Clients</div>
                          </div>
                          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                            <div className="text-3xl font-bold text-primary-brown mb-1">15+</div>
                            <div className="text-sm text-gray-500 font-medium">Years Exp.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'subscribe':
              return page.subscribe.show && (
                <section id="subscribe" key="subscribe" className="py-12 lg:py-20 relative bg-primary-brown/80">
                  <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1618220179428-22790b461013?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" className="w-full h-full object-cover mix-blend-overlay opacity-30" alt="Background" />
                  </div>
                  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-3xl text-white mb-4">{page.subscribe.title}</h2>
                    <p className="text-white/80 mb-8 text-lg">{page.subscribe.subtitle}</p>
                    <NewsletterForm 
                       companyId={props.company._id} 
                       buttonText={page.subscribe.buttonText} 
                       placeholder={page.subscribe.placeholder}
                       primaryColor={gold}
                    />
                  </div>
                </section>
              );

            case 'contact':
              return page.contact.show && (
                <section id="contact" key="contact" className="py-12 lg:py-20 bg-gray-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="section-title">
                      <span className="title-bg relative z-0">Contact</span>
                      <h2 className="relative z-10">{page.contact.title}</h2>
                      <p className="text-gray-600 max-w-2xl mx-auto relative z-10">{page.contact.subtitle}</p>
                    </div>
                    
                    <div className="grid lg:grid-cols-5 gap-12">
                      <div className="lg:col-span-2">
                        <div className="bg-light-gold rounded-2xl p-8 h-full">
                          <h3 className="text-2xl mb-8 text-primary-brown">Contact Information</h3>
                          
                          {page.addressLine && (
                            <div className="flex gap-4 mb-6">
                              <div className="w-12 h-12 bg-gold text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-lg text-primary-brown font-semibold mb-1 font-sans">Location</h4>
                                <p className="text-gray-700">{page.addressLine}</p>
                              </div>
                            </div>
                          )}
                          
                          {page.phone && (
                            <div className="flex gap-4 mb-6">
                              <div className="w-12 h-12 bg-gold text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                                <Phone className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-lg text-primary-brown font-semibold mb-1 font-sans">Phone</h4>
                                <p className="text-gray-700">{page.phone}</p>
                              </div>
                            </div>
                          )}
                          
                          {page.email && (
                            <div className="flex gap-4 mb-8">
                              <div className="w-12 h-12 bg-gold text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                                <Mail className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-lg text-primary-brown font-semibold mb-1 font-sans">Email</h4>
                                <p className="text-gray-700">{page.email}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="pt-8 border-t border-white/40">
                             <h4 className="text-lg text-primary-brown font-semibold mb-4 font-sans">Business Hours</h4>
                             <div className="flex items-center gap-3 text-gray-700">
                               <Clock className="w-5 h-5 text-gold" />
                               <span>Mon - Sat: 9:00 AM - 8:00 PM</span>
                             </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl p-8 shadow-sm h-full">
                           <h3 className="text-2xl mb-6 text-primary-brown">Send us a Message</h3>
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
      <footer className="bg-primary-brown text-white pt-12 lg:pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href={`/${page.slug}`} className="inline-block mb-6">
                {page.logo ? (
                  <img src={page.logo} alt={page.brandName} className="h-10 w-auto brightness-0 invert" />
                ) : (
                  <div className="font-[Playfair_Display] text-3xl font-bold text-white">
                    {page.brandName.split(' ')[0]}<span className="text-gold">{page.brandName.split(' ').slice(1).join(' ')}</span>
                  </div>
                )}
              </Link>
              <p className="text-white/70 mb-6">
                Expert woodwork and furniture solutions tailored to your needs. Serving with excellence since 2010.
              </p>
            </div>
            
            <div>
              <h4 className="text-xl mb-6 font-sans font-semibold pb-2 border-b-2 border-gold inline-block">Quick Links</h4>
              <ul className="space-y-3">
                {page.nav.map((item) => (
                  <li key={item.link}>
                    <a href={item.link} className="text-white/70 hover:text-gold transition flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-gold"></span> {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl mb-6 font-sans font-semibold pb-2 border-b-2 border-gold inline-block">Services</h4>
              <ul className="space-y-3 text-white/70">
                {page.services.items.slice(0, 5).map((service, i) => (
                  <li key={i}>{service.name}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl mb-6 font-sans font-semibold pb-2 border-b-2 border-gold inline-block">Newsletter</h4>
              <p className="text-white/70 mb-4">Subscribe to our newsletter for tips and offers.</p>
              <NewsletterForm companyId={props.company._id} placeholder="Your Email" buttonText="Subscribe" primaryColor={gold} />
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center text-white/50 text-sm">
            <p>&copy; {new Date().getFullYear()} {page.brandName}. All rights reserved.</p>
            <p className="mt-2">Promoted By Multi-Tenant Platform Provisioning Tech</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
