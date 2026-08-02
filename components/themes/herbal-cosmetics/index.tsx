'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Menu, X, Send, ChevronRight, Check } from 'lucide-react';
import { ICompany, IProduct, IService, IReview, IBlog, ILandingPageSection } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { resolveThemePage } from '@/lib/resolve-theme-page';
import { ContactForm } from '@/components/company/ContactForm';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface Props {
  company: ICompany;
  products: IProduct[];
  services: IService[];
  reviews: IReview[];
  blogs: IBlog[];
  landingPage: { sections?: ILandingPageSection[]; isPublished?: boolean } | null;
  gallery: { images?: Array<{ url: string; caption?: string }> } | null;
}

export function HerbalCosmeticsTheme(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  
  const page = resolveThemePage(props);
  const primaryColor = page.primaryColor || '#bd1f2d'; // Lavish Red
  const secondaryColor = '#0d2538'; // Dark Navy

  const handleOrderNow = (product: IProduct) => {
    setSelectedProduct(product);
    setOrderModalOpen(true);
  };

  const handleOrderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: `I would like to order: ${selectedProduct?.name}\n\nAdditional Details: ${formData.get('message')}`,
      companyId: props.company._id,
      source: 'website_order',
    };

    try {
      await axios.post('/api/leads', data);
      toast.success('Order enquiry sent successfully!');
      setOrderModalOpen(false);
    } catch (error) {
      toast.error('Failed to send enquiry. Please try again.');
    }
  };

  const handleOfferSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      companyId: props.company._id,
      source: 'website_offer',
    };

    try {
      await axios.post('/api/leads', data);
      toast.success('Your details have been submitted. We will contact you with our best offer!');
      e.currentTarget.reset();
    } catch (error) {
      toast.error('Failed to submit details. Please try again.');
    }
  };

  return (
    <div className="font-sans bg-gray-50 text-gray-800 min-h-screen">
      {/* Top Bar (Red) */}
      <div className="hidden md:flex justify-between items-center px-4 py-2 text-white text-xs" style={{ backgroundColor: primaryColor }}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{page.addressLine || 'India'}</span>
          </div>
          {props.company.gst && (
            <div className="flex items-center gap-2">
              <span className="opacity-80">GST:</span>
              <span>{props.company.gst}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Phone size={14} />
            <span>CALL ON 🇮🇳 {page.phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select className="bg-white text-black text-xs px-2 py-1 border-none outline-none rounded-sm">
            <option>Select Language</option>
            <option>English</option>
            <option>Hindi</option>
          </select>
          <div className="flex items-center gap-2 text-xs font-bold">
            <a href="#" className="p-1 border border-white/30 rounded-sm hover:bg-white/20 px-2">FB</a>
            <a href="#" className="p-1 border border-white/30 rounded-sm hover:bg-white/20 px-2">TW</a>
            <a href="#" className="p-1 border border-white/30 rounded-sm hover:bg-white/20 px-2">IG</a>
            <a href="#" className="p-1 border border-white/30 rounded-sm hover:bg-white/20 px-2">IN</a>
          </div>
          <button className="flex items-center gap-2 border border-white px-3 py-1 rounded-sm hover:bg-white hover:text-red-700 transition font-medium">
            <Mail size={14} />
            SEND ENQUIRY
          </button>
        </div>
      </div>

      {/* Main Header (White) */}
      <div className="bg-white px-4 py-4 md:py-6 sticky top-0 md:static z-40 shadow-sm md:shadow-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href={`/${page.slug}`}>
            {page.logo ? (
              <img src={page.logo} alt={page.brandName} className="h-12 md:h-16 object-contain" />
            ) : (
              <span className="text-3xl font-bold text-red-700 uppercase tracking-tighter">
                {page.brandName}
              </span>
            )}
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm">
            {page.whatsapp && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-800">{page.whatsapp}</div>
                  <div className="text-xs text-gray-500 uppercase">Send WhatsApp</div>
                </div>
              </div>
            )}
            
            {page.phone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-800">{page.phone}</div>
                  <div className="text-xs text-gray-500 uppercase">Call Us On</div>
                </div>
              </div>
            )}
            
            {page.email && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-800">{page.email}</div>
                  <div className="text-xs text-gray-500 uppercase">Drop Us A Line</div>
                </div>
              </div>
            )}
          </div>
          
          <button className="md:hidden text-gray-800" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Navigation (Dark Navy) */}
      <div className="hidden md:block shadow-md sticky top-0 z-50" style={{ backgroundColor: secondaryColor }}>
        <div className="max-w-7xl mx-auto flex">
          {page.nav.map((item) => (
            <a
              key={item.label}
              href={item.link}
              className="px-6 py-4 text-white text-sm font-bold uppercase hover:bg-white/10 transition border-r border-white/10 last:border-r-0"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-100"
          >
            <div className="flex flex-col py-2">
              {page.nav.map((item) => (
                <a
                  key={item.label}
                  href={item.link}
                  onClick={() => setMenuOpen(false)}
                  className="px-6 py-3 text-sm font-bold text-gray-800 uppercase hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        {page.hero.show && (
          <section id="home" className="relative w-full h-[400px] md:h-[600px] bg-gray-100 overflow-hidden">
            {page.hero.image ? (
              <img src={page.hero.image} alt="Hero" className="w-full h-full object-cover object-center" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Hero Image Placeholder</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-6 md:px-24">
              <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <h1 className="text-4xl md:text-6xl font-serif text-white mb-4 shadow-sm" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                  {page.hero.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                  {page.hero.subtitle}
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* Feature Products Section */}
        {page.products.show && props.products.length > 0 && (
          <section id="products" className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-center gap-4 mb-12">
                <div className="h-px bg-gray-300 w-16 md:w-32"></div>
                <h2 className="text-2xl md:text-3xl font-serif text-gray-800 font-bold" style={{ color: secondaryColor }}>Feature Products</h2>
                <div className="h-px bg-gray-300 w-16 md:w-32"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {props.products.slice(0, 8).map((product) => (
                  <div key={product._id} className="border border-gray-200 bg-white group flex flex-col hover:shadow-lg transition-shadow duration-300">
                    <div className="aspect-square relative overflow-hidden bg-gray-50 p-4">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-contain group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">No Image</div>
                      )}
                      
                      {/* Decorative triangle point downward from image */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white transform rotate-45 border-r border-b border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-grow text-center relative z-20 bg-white border-t border-gray-100">
                      <h3 className="font-bold text-sm mb-3 uppercase h-10 flex items-center justify-center line-clamp-2" style={{ color: secondaryColor }}>{product.name}</h3>
                      <p className="text-xs text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-grow">{product.description || 'Premium quality product manufactured with the best ingredients.'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 border-t border-gray-200 mt-auto">
                      <button 
                        onClick={() => handleOrderNow(product)}
                        className="py-3 text-xs font-bold text-white uppercase hover:brightness-110 transition"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Order Now
                      </button>
                      <button 
                        className="py-3 text-xs font-bold text-white uppercase hover:brightness-110 transition"
                        style={{ backgroundColor: secondaryColor }}
                      >
                        View More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Offer Form Section */}
        <section className="py-16 bg-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-50 opacity-50 polygon-pattern"></div>
          
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Text Side */}
              <div className="bg-white rounded-lg shadow-sm p-8 md:p-10 border border-gray-100 relative">
                <div className="absolute -left-2 top-8 w-1 h-12 bg-red-600" style={{ backgroundColor: primaryColor }}></div>
                <ul className="space-y-6 text-gray-700 italic font-medium leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-xl">👉</span>
                    <span>We have best offers and discounted price for our clients.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-xl">👉</span>
                    <span>Explore exclusive bulk discounts and quantity purchase discounts.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-xl">👉</span>
                    <span>Contact us with your name, email, phone number and the products you are interested in.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-xl">👉</span>
                    <span>For more information, please contact us via <a href={`mailto:${page.email}`} className="text-blue-600 hover:underline">{page.email}</a> or {page.phone}, and we'll be happy to assist you.</span>
                  </li>
                </ul>
              </div>
              
              {/* Form Side */}
              <div className="bg-white shadow-xl overflow-hidden border border-gray-200">
                <div className="py-4 text-center text-white font-bold text-lg" style={{ backgroundColor: secondaryColor }}>
                  Fill This Form ↓ Get Your Best Offer Price
                </div>
                <form onSubmit={handleOfferSubmit} className="p-8 space-y-5">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">your name or company name</label>
                    <input name="name" type="text" required placeholder="Your Name" className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">your email id for receiving catalogue</label>
                    <input name="email" type="email" required placeholder="Your Email" className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">enter your 10 digit contact no.</label>
                    <input name="phone" type="tel" required placeholder="Your Mobile no" className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">write here your interset with our products/services</label>
                    <textarea name="message" required placeholder="Your requirement" rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition"></textarea>
                  </div>
                  <button type="submit" className="w-full py-3 text-white font-bold rounded-sm transition hover:brightness-110 shadow-md" style={{ backgroundColor: primaryColor }}>
                    Get Best Offer Price
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-gray-400 pt-16 pb-6 text-sm border-t-4" style={{ borderColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <h4 className="text-white font-serif text-xl mb-6 font-bold">About Company</h4>
            <p className="leading-relaxed text-gray-400">
              {page.description || 'Looking for the best products that are not only superior but affordable as well. We have you at our company for all the needs of your essential products that we manufacture. The products that you get from us are enriched with natural components for gentle care.'}
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="text-white font-serif text-xl mb-6 font-bold">Useful Links</h4>
            <ul className="space-y-3">
              {page.nav.map(item => (
                <li key={item.label}>
                  <a href={item.link} className="hover:text-white transition flex items-center gap-2">
                    <span className="text-xs">›</span> {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Products */}
          <div>
            <h4 className="text-white font-serif text-xl mb-6 font-bold">Our Products</h4>
            <ul className="space-y-3">
              {props.products.slice(0, 6).map(product => (
                <li key={product._id}>
                  <a href={`#products`} className="hover:text-white transition flex items-center gap-2">
                    <span className="text-xs">›</span> {product.name}
                  </a>
                </li>
              ))}
              <li>
                <a href={`#products`} className="hover:text-white transition flex items-center gap-2 text-blue-400">
                  <span className="text-xs">›</span> View All
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-white font-serif text-xl mb-6 font-bold">Our Contact</h4>
            <ul className="space-y-4">
              {page.phone && (
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-white" />
                  <a href={`tel:${page.phone}`} className="hover:text-white transition">{page.phone}</a>
                </li>
              )}
              {page.email && (
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-white" />
                  <a href={`mailto:${page.email}`} className="hover:text-white transition">{page.email}</a>
                </li>
              )}
              {page.addressLine && (
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-white mt-1 shrink-0" />
                  <span>{page.addressLine}</span>
                </li>
              )}
            </ul>
            
            <div className="flex items-center gap-2 mt-6 text-xs font-bold">
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-sm bg-blue-900 text-white hover:bg-blue-800">FB</a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-sm bg-blue-500 text-white hover:bg-blue-400">TW</a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-sm bg-blue-700 text-white hover:bg-blue-600">IN</a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-sm bg-pink-600 text-white hover:bg-pink-500">IG</a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>Copyright © {new Date().getFullYear()} {page.brandName}. All Rights Reserved.</p>
          <p>Promoted By Multi-Tenant Platform</p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      {page.whatsapp && (
        <a 
          href={page.whatsapp} 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 bg-green-500 text-white py-2 px-4 rounded-full flex items-center gap-2 shadow-lg hover:-translate-y-1 transition duration-300"
        >
          <div className="w-8 h-8 bg-white text-green-500 rounded-full flex items-center justify-center font-bold text-xl">
            {/* Using text for whatsapp logo as quick fallback */}
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">WhatsApp</div>
            <div className="text-[10px] leading-tight opacity-90">Click To Chat</div>
          </div>
        </a>
      )}

      {/* Order Modal */}
      <AnimatePresence>
        {orderModalOpen && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <button 
                onClick={() => setOrderModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10"
              >
                <X size={20} />
              </button>
              
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex gap-4 items-center">
                {selectedProduct.images?.[0] && (
                  <img src={selectedProduct.images[0]} alt="" loading="lazy" decoding="async" className="w-16 h-16 object-contain bg-white rounded border border-gray-200" />
                )}
                <div>
                  <h3 className="font-bold text-gray-800 line-clamp-1">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-500">Submit details to order</p>
                </div>
              </div>
              
              <form onSubmit={handleOrderSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Name</label>
                  <input name="name" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                  <input name="email" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label>
                  <input name="phone" type="tel" required className="w-full px-3 py-2 border border-gray-300 rounded focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Additional Details / Quantity</label>
                  <textarea name="message" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition"></textarea>
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full py-3 text-white font-bold rounded flex items-center justify-center gap-2 hover:brightness-110 transition" style={{ backgroundColor: primaryColor }}>
                    <Check size={18} />
                    Confirm Order Request
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
