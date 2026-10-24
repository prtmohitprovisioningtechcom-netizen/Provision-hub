'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Star,
  ShieldCheck,
  MapPin,
  Check,
} from 'lucide-react';

interface PurposeItem {
  id: string;
  tabTitle: string;
  tabSubtitle: string;
  tabLabel: string;
  tabEmoji: string;
  badge: string;
  shortTag: string;
  headline: string;
  subheadline: string;
  taglineBanner: string;
  gradient: string;
  lightGradient: string;
  borderHover: string;
  statBadge: string;
  whatYouCanDo: string[];
  preview: {
    storeName: string;
    category: string;
    location: string;
    rating: string;
    reviewCount: string;
    verifiedText: string;
    actionButtonText: string;
    sampleOffer: string;
    sampleProducts: Array<{ name: string; price: string; tag: string }>;
    liveActivity: string;
  };
}

const PURPOSES: PurposeItem[] = [
  {
    id: 'retail',
    tabTitle: 'Retail & Kirana',
    tabSubtitle: 'Dukan Live',
    tabLabel: 'Retail & Kirana Dukan Live',
    tabEmoji: '🏬',
    badge: 'Kirana, Kapda & Retail',
    shortTag: 'Online Store',
    headline: 'Dukan Bane Poore Shehar Ka Brand',
    subheadline:
      'Kirana, kapda ya general store — bina kisi coder ke 2 minute me apni dukan live karein.',
    taglineBanner: 'Dukan aapki, pehchaan poore shehar me',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    lightGradient: 'from-amber-500/10 via-orange-500/10 to-red-500/10 dark:from-amber-950/30 dark:to-orange-950/20',
    borderHover: 'border-amber-300 dark:border-amber-700',
    statBadge: '⚡ 2 Min Setup',
    whatYouCanDo: [
      'Products aur rate list photo ke sath live karein',
      'Grahak phone se stock aur offers dekh sakein',
      'WhatsApp order link aur location Google par live karein',
      'Counter ke liye QR Standee download karein',
    ],
    preview: {
      storeName: 'Gupta Ji Superstore',
      category: 'Kirana & Daily Needs Store',
      location: 'Main Market, Sector 14, Delhi NCR',
      rating: '4.9',
      reviewCount: '194+ Grahak',
      verifiedText: '100% Verified Dukan',
      actionButtonText: 'WhatsApp Order Karein',
      sampleOffer: '🔥 5kg Aata Par ₹30 Ki Chhut',
      sampleProducts: [
        { name: 'Fortune Sunlite Refined Oil 1L', price: '₹142', tag: 'Bestseller' },
        { name: 'Aashirvaad Shudh Chakki Atta 10kg', price: '₹410', tag: 'Fresh Stock' },
        { name: 'Tata Premium Tea Gold 500g', price: '₹285', tag: 'Hot Deal' },
      ],
      liveActivity: '🟢 18 grahakon ne dukan dekhi',
    },
  },
  {
    id: 'whatsapp',
    tabTitle: 'WhatsApp Orders',
    tabSubtitle: '0% Cut',
    tabLabel: 'WhatsApp Orders 0% Commission',
    tabEmoji: '📲',
    badge: 'Mithai, Bakery & Food',
    shortTag: 'Direct UPI',
    headline: '100% Munafa Aapka, 0% Commission',
    subheadline:
      'Delivery apps ko commission mat dijiye. Direct order aur payment WhatsApp par paayein.',
    taglineBanner: 'Direct grahak, 0% commission, 100% munafa',
    gradient: 'from-emerald-500 via-teal-500 to-green-600',
    lightGradient: 'from-emerald-500/10 via-teal-500/10 to-green-500/10 dark:from-emerald-950/30 dark:to-teal-950/20',
    borderHover: 'border-emerald-300 dark:border-emerald-700',
    statBadge: '💰 0% Commission',
    whatYouCanDo: [
      'Direct WhatsApp order aur item list aapke chat par',
      '100% payment direct aapke UPI / QR par',
      'Grahak ka mobile number hamesha aapke paas',
      'Tyohar par offers broadcast karke sales badhayein',
    ],
    preview: {
      storeName: 'Bikaner Sweets & Namkeen',
      category: 'Mithai, Namkeen & Food',
      location: 'Station Road, Ward No. 5',
      rating: '5.0',
      reviewCount: '480+ Orders',
      verifiedText: 'Pure Desi Ghee Verified',
      actionButtonText: 'Order on WhatsApp',
      sampleOffer: '🎉 Kaju Katli par 10% Chhut',
      sampleProducts: [
        { name: 'Kaju Katli Special (500g)', price: '₹460', tag: 'Top Rated' },
        { name: 'Desi Ghee Motichoor Ladoo 1kg', price: '₹380', tag: 'Fresh Daily' },
        { name: 'Special Khasta Kachori (Set of 4)', price: '₹90', tag: 'Crispy' },
      ],
      liveActivity: '🟢 Instant WhatsApp Chat',
    },
  },
  {
    id: 'services',
    tabTitle: 'Services & Karigar',
    tabSubtitle: 'Daily Calls',
    tabLabel: 'Services & Karigar Daily Calls',
    tabEmoji: '🔧',
    badge: 'Repairs & Home Services',
    shortTag: 'Direct Client',
    headline: 'Shehar Bhar Se Paayein Direct Calls',
    subheadline:
      'AC repair, electrician, plumber ya salon — daily direct customer calls aana shuru.',
    taglineBanner: 'Har karigar ka hunar, shehar me mashhoor',
    gradient: 'from-blue-600 via-indigo-600 to-sky-600',
    lightGradient: 'from-blue-500/10 via-indigo-500/10 to-sky-500/10 dark:from-blue-950/30 dark:to-indigo-950/20',
    borderHover: 'border-blue-300 dark:border-blue-700',
    statBadge: '📞 Direct Calls',
    whatYouCanDo: [
      'Local search me aapka profile sabse upar dikhe',
      'Grahak direct "Call Now" dabakar contact kare',
      'Kaam ki photos aur customer reviews share karein',
      'Verified Karigar badge se vishwas badhayein',
    ],
    preview: {
      storeName: 'Sharmaji Electricals',
      category: 'AC & Wiring Service Expert',
      location: 'Home Service Across Entire City',
      rating: '4.9',
      reviewCount: '135+ Homes',
      verifiedText: 'Verified Master Karigar',
      actionButtonText: 'Call Now: 98XXX XXXXX',
      sampleOffer: '⚡ Split AC Jet Service @ ₹499',
      sampleProducts: [
        { name: 'Split AC Full Jet Service', price: '₹499', tag: '30-Day Guarantee' },
        { name: 'Inverter & Battery Wiring Fitting', price: '₹350', tag: 'Same Day' },
        { name: 'Emergency Fuse & Power Trip Repair', price: '₹200', tag: '30 Min Reach' },
      ],
      liveActivity: '🟢 9 direct calls aaj aayi',
    },
  },
  {
    id: 'professional',
    tabTitle: 'Clinic & Doctor',
    tabSubtitle: 'Appointments',
    tabLabel: 'Doctor & Clinic Appointments',
    tabEmoji: '🩺',
    badge: 'Doctor, CA & Lawyers',
    shortTag: 'Digital Profile',
    headline: 'Digital Pehchaan & Direct Booking',
    subheadline:
      'Doctors, CA aur professionals — apni profile banakar clients ka vishwas jeetein.',
    taglineBanner: 'Vishwas aur pratishtha, har grahak tak',
    gradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
    lightGradient: 'from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 dark:from-purple-950/30 dark:to-pink-950/20',
    borderHover: 'border-purple-300 dark:border-purple-700',
    statBadge: '🛡️ Verified Profile',
    whatYouCanDo: [
      'Timings, consultation fees aur OPD days display karein',
      'Patients direct WhatsApp par slot confirm karein',
      'Certifications aur degrees showcase karein',
      'Digital visiting card 1-click me share karein',
    ],
    preview: {
      storeName: 'Dr. Verma Child Clinic',
      category: 'Child Specialist (MBBS, MD)',
      location: 'Civil Lines, Near City Hospital',
      rating: '4.9',
      reviewCount: '320+ Patients',
      verifiedText: 'MCI & State Council Verified',
      actionButtonText: 'Book on WhatsApp',
      sampleOffer: '🩺 OPD: 10:00 AM - 02:00 PM | 05:00 PM - 08:30 PM',
      sampleProducts: [
        { name: 'Child Health Consultation', price: '₹400', tag: 'Regular OPD' },
        { name: 'Vaccination & Growth Tracking', price: '₹600', tag: 'Package' },
        { name: 'Emergency Pediatric Checkup', price: '₹500', tag: 'On-Call' },
      ],
      liveActivity: '🟢 14 slots booked aaj',
    },
  },
  {
    id: 'wholesale',
    tabTitle: 'Wholesale & Mandi',
    tabSubtitle: 'Pan-India',
    tabLabel: 'Wholesale & Mandi B2B Vyapar',
    tabEmoji: '🏭',
    badge: 'Manufacturer & Wholesale',
    shortTag: 'Bulk Orders',
    headline: 'Desh Bhar Se Paayein Bulk Orders',
    subheadline:
      'Manufacturer ya distributor — poore desh ke retailers se direct judein.',
    taglineBanner: 'Bade orders, desh bhar ke vyapari',
    gradient: 'from-rose-600 via-red-600 to-amber-600',
    lightGradient: 'from-rose-500/10 via-red-500/10 to-amber-500/10 dark:from-rose-950/30 dark:to-amber-950/20',
    borderHover: 'border-rose-300 dark:border-rose-700',
    statBadge: '📦 Bulk Inquiries',
    whatYouCanDo: [
      'Bulk catalog aur MOQ rates share karein',
      'Retailers se direct WhatsApp par bulk inquiries lein',
      'GST Verified Vyapari badge se trust banayein',
      'Naye sheharon me buyers aur distributors jodein',
    ],
    preview: {
      storeName: 'Bharat Textile Mills',
      category: 'B2B Garments Manufacturer',
      location: 'Textile Market, Surat / Delhi',
      rating: '4.9',
      reviewCount: '520+ Shipments',
      verifiedText: 'GST & MSME Verified',
      actionButtonText: 'Get Bulk Rate Sheet',
      sampleOffer: '🚛 Pan-India Transport Delivery',
      sampleProducts: [
        { name: 'Pure Cotton Printed Kurtis (Set of 20)', price: '₹220/pc', tag: 'MOQ 20' },
        { name: 'Men Bio-Wash T-Shirts (Lot of 50)', price: '₹140/pc', tag: 'MOQ 50' },
        { name: 'Kids Festival Wear Assorted Bundle', price: '₹180/pc', tag: 'MOQ 30' },
      ],
      liveActivity: '🟢 5 bulk inquiries aaj aayi',
    },
  },
];

interface FeaturesProps {
  config?: {
    title?: string;
    subtitle?: string;
  };
}

export function Features({ config }: FeaturesProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [orderSent, setOrderSent] = useState(false);

  const activePurpose = PURPOSES[activeTab] || PURPOSES[0];

  const handleSimulatedClick = () => {
    setOrderSent(true);
    setTimeout(() => {
      setOrderSent(false);
    }, 3000);
  };

  return (
    <section
      id="features"
      className="py-8 sm:py-12 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border-b border-gray-200/80 dark:border-gray-800/80 relative overflow-hidden"
    >
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Tagline Essence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4 sm:mb-6"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-indigo-200 bg-indigo-50/90 dark:border-indigo-800/90 dark:bg-indigo-950/70 px-3 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2 shadow-xs">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500" />
            <span>Har Dukan Ki Shaan • Har Vyapari Ka Naam</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            {config?.title && !config.title.includes('Everything You Need') ? (
              config.title
            ) : (
              <>
                Aap Kis Fayde Ke Liye{' '}
                <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">
                  Judna Chahte Hain?
                </span>
              </>
            )}
          </h2>

          <p className="mt-2 sm:mt-2.5 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-1">
            {config?.subtitle && !config.subtitle.includes('Powerful features designed')
              ? config.subtitle
              : 'Apna vyapar chuniye aur dekhiye Bhartiyebazar ke fayde.'}
          </p>
        </motion.div>

        {/* 1. Interactive Purpose Tabs (Responsive Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 md:gap-3 mb-4 sm:mb-5">
          {PURPOSES.map((purpose, index) => {
            const isSelected = activeTab === index;
            const isLastOnTwoCols = index === 4;
            return (
              <button
                key={purpose.id}
                onClick={() => {
                  setActiveTab(index);
                  setOrderSent(false);
                }}
                className={`group relative flex flex-col items-start p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  isLastOnTwoCols ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  isSelected
                    ? 'bg-linear-to-b from-gray-900 via-indigo-950 to-gray-950 text-white border-indigo-500 shadow-md sm:shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/40 dark:from-indigo-950 dark:via-gray-900 dark:to-gray-950 dark:border-indigo-400 scale-[1.01] sm:scale-[1.02]'
                    : 'bg-white dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 border-gray-200/90 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 shadow-xs hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1 sm:mb-1.5 gap-1">
                  <span className="text-xl sm:text-2xl lg:text-3xl shrink-0">{purpose.tabEmoji}</span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {purpose.tabSubtitle}
                  </span>
                </div>
                <span className="font-black text-xs sm:text-sm tracking-tight leading-snug line-clamp-1">
                  {purpose.tabTitle}
                </span>
                <span
                  className={`text-[10px] sm:text-[11px] font-medium leading-tight mt-0.5 line-clamp-1 ${
                    isSelected ? 'text-indigo-200/90' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {purpose.shortTag}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Interactive Feature Showcase for Selected Purpose */}
        <div className="mb-4 sm:mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePurpose.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800/90 bg-white dark:bg-gray-900/95 shadow-xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden"
            >
              {/* Top Tagline Strip */}
              <div className="px-3.5 sm:px-5 py-2 bg-linear-to-r from-indigo-50 via-purple-50 to-amber-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-amber-950/30 border-b border-gray-200/80 dark:border-gray-800 flex items-center justify-between flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{activePurpose.taglineBanner}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-[10px] sm:text-[11px] font-bold shrink-0">
                  <span>{activePurpose.statBadge}</span>
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8 grid gap-5 sm:gap-6 lg:grid-cols-12 items-center">
                {/* Left Column: What you can do & Value */}
                <div className="lg:col-span-7 flex flex-col justify-between h-full">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[11px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                      <span>{activePurpose.tabEmoji}</span>
                      <span>{activePurpose.badge}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      {activePurpose.headline}
                    </h3>

                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      {activePurpose.subheadline}
                    </p>

                    {/* What You Can Do Checklist */}
                    <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-3.5 border-t border-gray-100 dark:border-gray-800/80">
                      <h4 className="text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 sm:mb-2.5 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" />
                        <span>Aapke Mukhya Fayde:</span>
                      </h4>

                      <div className="space-y-1.5 sm:space-y-2">
                        {activePurpose.whatYouCanDo.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 sm:gap-2.5 group">
                            <div className="mt-0.5 flex h-4 w-4 sm:h-4.5 sm:w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                              <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 stroke-[3]" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
                    <Link
                      href="/register/company"
                      className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.99] transition-all text-center w-full sm:w-auto"
                    >
                      <span>Abhi Dukan Jodein</span>
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>

                    <Link
                      href="/search"
                      className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold text-xs sm:text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center w-full sm:w-auto"
                    >
                      <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" />
                      <span>Live Dukanein</span>
                    </Link>

                    <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 text-center sm:text-left sm:ml-auto">
                      ✓ Free • No Card Needed
                    </span>
                  </div>
                </div>

                {/* Right Column: Live Simulated Storefront Mockup */}
                <div className="lg:col-span-5 w-full">
                  <div className="relative mx-auto max-w-sm w-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-3.5 sm:p-5 shadow-2xl shadow-indigo-500/10 dark:shadow-black/50">
                    {/* Simulated Mobile Header */}
                    <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-gray-100 dark:border-gray-800 text-xs gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white min-w-0">
                        <span className="text-base shrink-0">{activePurpose.tabEmoji}</span>
                        <span className="truncate">{activePurpose.preview.storeName}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold shrink-0">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified</span>
                      </span>
                    </div>

                    {/* Store Meta & Rating */}
                    <div className="mt-2.5 sm:mt-3">
                      <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                        <span className="truncate">{activePurpose.preview.location}</span>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex items-center text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="ml-1 text-xs font-bold text-gray-900 dark:text-white">
                            {activePurpose.preview.rating}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          ({activePurpose.preview.reviewCount})
                        </span>
                      </div>
                    </div>

                    {/* Highlight Offer Banner */}
                    <div className="mt-2.5 sm:mt-3 px-3 py-2 rounded-xl bg-linear-to-r from-amber-500/15 to-orange-500/15 border border-amber-300/60 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-[11px] font-semibold leading-tight flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="truncate">{activePurpose.preview.sampleOffer}</span>
                    </div>

                    {/* Sample Product / Service List */}
                    <div className="mt-2.5 sm:mt-3 space-y-1.5 sm:space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Live Catalog Preview:
                      </div>
                      {activePurpose.preview.sampleProducts.map((prod, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs"
                        >
                          <div className="truncate mr-2 min-w-0">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-[11px] truncate">
                              {prod.name}
                            </p>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
                              {prod.tag}
                            </span>
                          </div>
                          <span className="font-black text-xs text-gray-900 dark:text-white shrink-0">
                            {prod.price}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Interactive Action Button (Simulates WhatsApp / Call) */}
                    <div className="mt-3.5 sm:mt-4">
                      <button
                        onClick={handleSimulatedClick}
                        className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                          orderSent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 hover:scale-[1.02]'
                        }`}
                      >
                        {orderSent ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-white animate-bounce" />
                            <span>Enquiry Sent to Vyapari!</span>
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4 fill-white text-white" />
                            <span>{activePurpose.preview.actionButtonText}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Live Activity Toast */}
                    <div className="mt-2 text-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {activePurpose.preview.liveActivity}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. Tagline Footer Callout Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-3 sm:mt-5 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-linear-to-r from-gray-900 via-indigo-950 to-gray-950 text-white shadow-2xl relative overflow-hidden border border-indigo-900/60"
        >
          {/* Subtle Decorative Elements */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] sm:text-xs font-bold mb-2 border border-indigo-500/30">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Bhartiyebazar Ka Sankalp</span>
              </div>
              <h3 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
                Chhota ho ya bada kaam, <br className="hidden sm:inline" />
                Bhartiyebazar par har vyapari ka naam.
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-300 max-w-xl">
                Aaj hi judkar apni dukan aur services ko shehar ka brand banayein.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full md:w-auto">
              <Link
                href="/register/company"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-gray-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all text-center w-full sm:w-auto"
              >
                <span>Dukan Jodein (Free)</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm backdrop-blur-sm border border-white/10 transition-colors text-center w-full sm:w-auto"
              >
                <span>Dukanein Dekhein</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
