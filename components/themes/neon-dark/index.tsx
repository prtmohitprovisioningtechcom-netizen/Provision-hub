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
    <div className="font-mono text-gray-300 bg-[#050505] min-h-screen selection:bg-[#00ffcc] selection:text-black">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link href={`/${page.slug}`} className="flex items-center gap-3 group">
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-8 w-auto object-contain group-hover:drop-shadow-[0_0_10px_rgba(0,255,204,0.5)] transition-all" />
            ) : (
              <span className="text-xl font-bold tracking-tighter text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#00ffcc] transition-all">
                {page.brandName}
              </span>
            )}
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {page.nav.map((item) => (
              <a
                key={item.link + item.label}
                href={item.link}
                className="text-xs uppercase tracking-[0.2em] hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              >
                {item.label}
              </a>
            ))}
            {page.navCta && (
              <a
                href={page.navCta.link}
                className="px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:shadow-[0_0_20px_rgba(0,255,204,0.4)]"
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
        {/* Hero Section */}
        {page.hero.show && (
          <section id="home" className="relative min-h-screen flex items-center px-6 lg:px-12 py-24 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#00ffcc]/10 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10 mx-auto max-w-7xl w-full grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                {page.hero.eyebrow && (
                  <span className="inline-block mb-6 text-sm uppercase tracking-[0.3em] border border-white/10 px-4 py-2 bg-white/5" style={{ color: primary }}>
                    {page.hero.eyebrow}
                  </span>
                )}
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-8 text-white uppercase leading-[1.1]">
                  {page.hero.title}
                </h1>
                <p className="text-lg lg:text-xl text-gray-400 mb-12 font-sans font-light leading-relaxed max-w-lg">
                  {page.hero.subtitle}
                </p>
                {page.hero.buttonText && (
                  <a
                    href={page.hero.buttonLink}
                    className="inline-flex items-center justify-center px-10 py-4 text-sm uppercase tracking-[0.2em] font-bold text-black transition-all hover:scale-105"
                    style={{ backgroundColor: primary, boxShadow: `0 0 30px ${primary}40` }}
                  >
                    {page.hero.buttonText}
                  </a>
                )}
              </motion.div>
              
              {page.hero.image && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="hidden lg:block relative h-[600px] group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#00ffcc] to-purple-600 opacity-20 group-hover:opacity-40 transition-opacity duration-700 mix-blend-overlay z-20"></div>
                  <img src={page.hero.image} alt="Hero" className="relative w-full h-full object-cover z-10 filter grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 border border-white/10 z-30"></div>
                  
                  {/* Decorative neon corners */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 z-40 transition-all duration-500 group-hover:w-16 group-hover:h-16" style={{ borderColor: primary }}></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 z-40 transition-all duration-500 group-hover:w-16 group-hover:h-16" style={{ borderColor: primary }}></div>
                </motion.div>
              )}
            </div>
          </section>
        )}

        {/* About Section */}
        {page.about.show && (
          <section id="about" className="py-24 px-6 lg:px-12 bg-[#0a0a0a] border-y border-white/5 relative">
            <div className="mx-auto max-w-7xl">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1 relative h-[500px] overflow-hidden group">
                  {page.about.image ? (
                    <img src={page.about.image} alt="About" className="absolute inset-0 w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition duration-700" />
                  ) : (
                    <div className="absolute inset-0 bg-white/5"></div>
                  )}
                  <div className="absolute inset-0 border border-white/10"></div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-px w-12" style={{ backgroundColor: primary }}></div>
                    <span className="uppercase tracking-[0.2em] text-xs font-bold" style={{ color: primary }}>Initialize</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-8 text-white uppercase">{page.about.title}</h2>
                  <p className="text-xl text-gray-400 mb-10 font-sans">{page.about.subtitle}</p>
                  <div className="prose prose-invert prose-lg font-sans font-light leading-relaxed text-gray-500" dangerouslySetInnerHTML={{ __html: page.about.content }} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us */}
        {page.why.show && page.why.items.length > 0 && (
          <section className="py-32 px-6 lg:px-12 relative overflow-hidden">
            <div className="mx-auto max-w-7xl relative z-10">
              <div className="text-center mb-20">
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6 text-white uppercase">{page.why.title}</h2>
                <p className="text-lg text-gray-500 font-sans max-w-2xl mx-auto">{page.why.subtitle}</p>
              </div>
              <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
                {page.why.items.map((item, i) => (
                  <div key={i} className="bg-[#050505] border border-white/10 p-8 hover:border-white/30 transition-all duration-300 relative group">
                    <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full transition-all duration-500" style={{ backgroundColor: primary }}></div>
                    <div className="w-12 h-12 mb-6 border border-white/10 flex items-center justify-center text-white group-hover:text-black transition-colors duration-300" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primary} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-tight">{item.title}</h3>
                    <p className="text-gray-500 font-sans font-light leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services Section */}
        {page.services.show && page.services.items.length > 0 && (
          <section id="services" className="py-32 px-6 lg:px-12 relative overflow-hidden">
            <div className="mx-auto max-w-7xl relative z-10">
              <div className="text-center mb-20">
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6 text-white uppercase">{page.services.title}</h2>
                <p className="text-lg text-gray-500 font-sans max-w-2xl mx-auto">{page.services.subtitle}</p>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-6">
                {page.services.items.map((service, i) => (
                  <div key={service._id || i} className="bg-[#0a0a0a] border border-white/5 p-10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" style={{ backgroundColor: primary }}></div>
                    <div className="text-5xl font-black mb-8 opacity-10 group-hover:opacity-30 transition-opacity" style={{ color: primary }}>0{i + 1}</div>
                    <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight">{service.name}</h3>
                    <p className="text-gray-500 mb-12 font-sans font-light leading-relaxed">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white">{formatCurrency(service.price)}</span>
                      <span className="text-xs uppercase tracking-widest text-gray-600 bg-white/5 px-3 py-1">{service.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Products Section */}
        {page.products.show && page.products.items.length > 0 && (
          <section id="products" className="py-32 px-6 lg:px-12 bg-[#0a0a0a] border-y border-white/5">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-4 text-white uppercase">{page.products.title}</h2>
                  <p className="text-lg text-gray-500 font-sans">{page.products.subtitle}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {page.products.items.map((product, i) => (
                  <div key={product._id || i} className="group relative">
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#050505] border border-white/5 mb-4 group-hover:border-white/20 transition-colors">
                      <img src={product.images[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition duration-700" />
                      {product.offerPrice && (
                        <div className="absolute top-4 left-4 text-black text-xs font-bold uppercase tracking-widest px-3 py-1" style={{ backgroundColor: primary, boxShadow: `0 0 10px ${primary}80` }}>
                          SALE
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-white uppercase tracking-tight truncate">{product.name}</h3>
                      <div className="flex items-center gap-3">
                          {product.offerPrice ? (
                            <>
                              <span className="font-bold" style={{ color: primary }}>{formatCurrency(product.offerPrice)}</span>
                              <span className="text-sm text-gray-600 line-through">{formatCurrency(product.price)}</span>
                            </>
                          ) : (
                            <span className="font-bold text-white">{formatCurrency(product.price)}</span>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {page.gallery.show && page.gallery.images.length > 0 && (
          <section id="gallery" className="py-32 px-6 lg:px-12 relative overflow-hidden">
            <div className="mx-auto max-w-7xl relative z-10">
              <div className="text-center mb-20">
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6 text-white uppercase">{page.gallery.title}</h2>
                <p className="text-lg text-gray-500 font-sans max-w-2xl mx-auto">{page.gallery.subtitle}</p>
              </div>
              <div className="columns-2 lg:columns-3 gap-6 space-y-6">
                {page.gallery.images.map((img, i) => (
                  <div key={i} className="relative group overflow-hidden border border-white/5 break-inside-avoid">
                    <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-auto object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition duration-700" />
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#050505]/90 backdrop-blur p-4 border-t border-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-white text-sm uppercase tracking-widest font-bold" style={{ color: primary }}>{img.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {page.testimonials.show && page.testimonials.items.length > 0 && (
          <section id="testimonials" className="py-32 px-6 lg:px-12 bg-[#0a0a0a] border-y border-white/5">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-20">
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6 text-white uppercase">{page.testimonials.title}</h2>
                <p className="text-lg text-gray-500 font-sans max-w-2xl mx-auto">{page.testimonials.subtitle}</p>
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                {page.testimonials.items.map((test, i) => (
                  <div key={i} className="bg-[#050505] border border-white/10 p-8 relative group">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ borderColor: primary }}></div>
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-4 h-4 ${j < test.rating ? 'fill-current' : 'text-gray-800'}`} style={{ color: j < test.rating ? primary : undefined }} />
                      ))}
                    </div>
                    <p className="text-gray-400 font-sans font-light leading-relaxed mb-8">"{test.comment}"</p>
                    <p className="text-white uppercase tracking-widest font-bold text-xs">{test.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {page.faq.show && page.faq.items.length > 0 && (
          <section id="faq" className="py-32 px-6 lg:px-12 relative overflow-hidden">
            <div className="mx-auto max-w-4xl relative z-10">
              <div className="text-center mb-20">
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6 text-white uppercase">{page.faq.title}</h2>
                <p className="text-lg text-gray-500 font-sans">{page.faq.subtitle}</p>
              </div>
              <div className="space-y-6">
                {page.faq.items.map((faq, i) => (
                  <div key={i} className="bg-[#0a0a0a] border border-white/5 p-8 hover:border-white/20 transition-colors group">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-4 group-hover:text-[#00ffcc] transition-colors" style={{ color: primary }}>{faq.question}</h3>
                    <p className="text-gray-500 font-sans font-light leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Subscribe Section */}
        {page.subscribe.show && (
          <section id="subscribe" className="py-32 px-6 lg:px-12 bg-[#0a0a0a] border-y border-white/5 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
            <div className="mx-auto max-w-3xl text-center relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6 text-white uppercase" style={{ textShadow: `0 0 20px ${primary}40` }}>{page.subscribe.title}</h2>
              <p className="text-lg text-gray-500 font-sans mb-12">{page.subscribe.subtitle}</p>
              <div className="bg-[#050505] p-2 border border-white/10">
                <NewsletterForm 
                  companyId={props.company._id} 
                  buttonText={page.subscribe.buttonText} 
                  placeholder={page.subscribe.placeholder} 
                  primaryColor={primary} 
                />
              </div>
              {page.subscribe.note && (
                <p className="text-xs text-gray-600 mt-6 uppercase tracking-[0.2em]">{page.subscribe.note}</p>
              )}
            </div>
          </section>
        )}

        {/* Blogs */}
        {page.blogs.show && page.blogs.items.length > 0 && (
          <section id="blogs" className="py-32 px-6 lg:px-12 relative overflow-hidden">
            <div className="mx-auto max-w-7xl relative z-10">
              <div className="text-center mb-20">
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6 text-white uppercase">{page.blogs.title}</h2>
                <p className="text-lg text-gray-500 font-sans max-w-2xl mx-auto">{page.blogs.subtitle}</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {page.blogs.items.map((blog, i) => (
                  <div key={blog._id || i} className="group border border-white/10 bg-[#0a0a0a] overflow-hidden hover:border-white/30 transition-colors">
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#050505]">
                      <img src={(blog as any).image || blog.featuredImage || '/placeholder.png'} alt={blog.title} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition duration-700" />
                      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur border border-white/10 px-3 py-1">
                        <span className="text-xs uppercase tracking-widest font-bold" style={{ color: primary }}>{formatDate((blog as any).publishedAt || blog.createdAt)}</span>
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight line-clamp-2">{blog.title}</h3>
                      <p className="text-gray-500 font-sans font-light leading-relaxed line-clamp-3">{blog.excerpt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        {page.contact.show && (
          <section id="contact" className="py-32 px-6 lg:px-12 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#00ffcc]/10 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="mx-auto max-w-7xl relative z-10">
              <div className="grid lg:grid-cols-2 gap-20">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6 text-white uppercase">{page.contact.title}</h2>
                  <p className="text-lg text-gray-500 font-sans mb-16">{page.contact.subtitle}</p>
                  
                  <div className="space-y-10">
                     {page.phone && (
                       <div className="group">
                         <p className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-bold group-hover:text-white transition-colors">Comm_Link / Voice</p>
                         <p className="text-2xl font-light text-white" style={{ textShadow: `0 0 10px ${primary}40` }}>{page.phone}</p>
                       </div>
                     )}
                     {page.email && (
                       <div className="group">
                         <p className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-bold group-hover:text-white transition-colors">Comm_Link / Data</p>
                         <p className="text-2xl font-light text-white" style={{ textShadow: `0 0 10px ${primary}40` }}>{page.email}</p>
                       </div>
                     )}
                     {page.addressLine && (
                       <div className="group">
                         <p className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-bold group-hover:text-white transition-colors">Location / Geo</p>
                         <p className="text-2xl font-light text-white font-sans">{page.addressLine}</p>
                       </div>
                     )}
                  </div>
                </div>
                
                <div className="p-10 bg-[#0a0a0a] border border-white/10 relative group">
                  <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-1000 blur-sm pointer-events-none" style={{ background: `linear-gradient(45deg, transparent, ${primary}40, transparent)` }}></div>
                  <div className="relative z-10">
                    <ContactForm companyId={props.company._id} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 border-t border-white/5 bg-[#030303] text-gray-600 text-xs uppercase tracking-widest">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left font-bold">
            &copy; {new Date().getFullYear()} {page.brandName} // ALL_SYSTEMS_NOMINAL
          </div>
          <div className="flex flex-wrap justify-center gap-8">
             {page.nav.map((item) => (
                <a key={item.link} href={item.link} className="hover:text-white transition-colors">{item.label}</a>
             ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
