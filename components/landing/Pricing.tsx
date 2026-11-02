'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  MapPin,
  MessageCircle,
  Star,
  ShieldCheck,
  ExternalLink,
  Store,
  ArrowRight,
  Search,
  Edit3,
  X,
  Check,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage, Language } from '@/contexts/LanguageContext';

export interface RealShopCard {
  id: string;
  name: string;
  slug: string;
  category: string;
  phone: string;
  city: string;
  fullAddress: string;
  rating: number;
  reviewsCount: number;
  openHours: string;
  workHighlight: string;
  bannerImage: string;
}

const LOCALIZED_SHOP_DATA: Record<
  string,
  Record<Language, { category: string; city: string; workHighlight: string; openHours: string }>
> = {
  'ganpati-electricians': {
    en: {
      category: 'Electrical & Wiring Service',
      city: 'Ghaziabad, UP',
      workHighlight: 'House wiring, inverter fitting & short circuit repair',
      openHours: 'Open Now • 24x7 Emergency',
    },
    hi: {
      category: 'इलेक्ट्रिकल व वायरिंग सर्विस',
      city: 'गाज़ियाबाद (Ghaziabad), UP',
      workHighlight: 'हाउस वायरिंग, इन्वर्टर फिटिंग व शॉर्ट सर्किट रिपेयर',
      openHours: 'खुला है • 24x7 इमरजेंसी',
    },
    hinglish: {
      category: 'Electrical & Wiring Service',
      city: 'Ghaziabad, UP',
      workHighlight: 'House wiring, inverter fitting aur short circuit repair',
      openHours: 'Open Hai • 24x7 Emergency',
    },
    mr: {
      category: 'इलेक्ट्रिकल व वायरिंग सेवा',
      city: 'गाझियाबाद (Ghaziabad), UP',
      workHighlight: 'हाउस वायरिंग, इन्व्हर्टर फिटिंग आणि शॉर्ट सर्किट दुरुस्ती',
      openHours: 'सुरू आहे • २४x७ आणीबाणी',
    },
    gu: {
      category: 'ઇલેક્ટ્રિકલ અને વાયરિંગ સેવા',
      city: 'ગાઝિયાબાદ (Ghaziabad), UP',
      workHighlight: 'હાઉસ વાયરિંગ, ઇન્વર્ટર ફિટિંગ અને શોર્ટ સર્કિટ રિપેર',
      openHours: 'ખુલ્લું છે • ૨૪x૭ ઇમરજન્સી',
    },
    pa: {
      category: 'ਇਲੈਕਟ੍ਰੀਕਲ ਅਤੇ ਵਾਇਰਿੰਗ ਸੇਵਾ',
      city: 'ਗਾਜ਼ੀਆਬਾਦ (Ghaziabad), UP',
      workHighlight: 'ਹਾਊਸ ਵਾਇਰਿੰਗ, ਇਨਵਰਟਰ ਫਿਟਿੰਗ ਅਤੇ ਸ਼ਾਰਟ ਸਰਕਟ ਰਿਪੇਅਰ',
      openHours: 'ਖੁੱਲ੍ਹਾ ਹੈ • 24x7 ਐਮਰਜੈਂਸੀ',
    },
    bn: {
      category: 'বৈদ্যুতিক ও ওয়্যারিং পরিষেবা',
      city: 'গাজিয়াবাদ (Ghaziabad), UP',
      workHighlight: 'হাউস ওয়্যারিং, ইনভার্টার ফিটিং ও শর্ট সার্কিট মেরামত',
      openHours: 'খোলা আছে • ২৪x৭ জরুরি পরিষেবা',
    },
  },
  'greater-noida-ro-service-solutions': {
    en: {
      category: 'RO Water & Appliances',
      city: 'Greater Noida, UP',
      workHighlight: 'RO installation, filter replacement & maintenance',
      openHours: 'Open Now • 8:00 AM - 9:00 PM',
    },
    hi: {
      category: 'आरओ वाटर व अप्लायंसेज',
      city: 'ग्रेटर नोएडा (Greater Noida), UP',
      workHighlight: 'RO इंस्टॉलेशन, फिल्टर रिप्लेसमेंट व मेंटेनेंस',
      openHours: 'खुला है • सुबह 8:00 - रात 9:00',
    },
    hinglish: {
      category: 'RO Water & Appliances',
      city: 'Greater Noida, UP',
      workHighlight: 'RO installation, filter replacement aur maintenance',
      openHours: 'Open Hai • 8:00 AM - 9:00 PM',
    },
    mr: {
      category: 'आरओ वॉटर आणि उपकरणे',
      city: 'ग्रेटर नोएडा (Greater Noida), UP',
      workHighlight: 'आरओ इन्स्टॉलेशन, फिल्टर रिप्लेसमेंट आणि मेंटेनन्स',
      openHours: 'सुरू आहे • सकाळी ८:०० - रात्री ९:००',
    },
    gu: {
      category: 'આરઓ વોટર અને એપ્લાયન્સીસ',
      city: 'ગ્રેટર નોઇડા (Greater Noida), UP',
      workHighlight: 'આરઓ ઇન્સ્ટોલેશન, ફિલ્ટર બદલવું અને મેન્ટેનન્સ',
      openHours: 'ખુલ્લું છે • સવારે ૮:૦૦ - રાત્રે ૯:૦૦',
    },
    pa: {
      category: 'ਆਰਓ ਵਾਟਰ ਅਤੇ ਉਪਕਰਣ',
      city: 'ਗ੍ਰੇਟਰ ਨੋਇਡਾ (Greater Noida), UP',
      workHighlight: 'ਆਰਓ ਇੰਸਟਾਲੇਸ਼ਨ, ਫਿਲਟਰ ਬਦਲਣਾ ਅਤੇ ਮੇਨਟੇਨੈਂਸ',
      openHours: 'ਖੁੱਲ੍ਹਾ ਹੈ • ਸਵੇਰੇ 8:00 - ਰਾਤ 9:00',
    },
    bn: {
      category: 'আরও ওয়াটার ও হোম অ্যাপ্লায়েন্সেস',
      city: 'গ্রেটার নয়ডা (Greater Noida), UP',
      workHighlight: 'আরও ইনস্টলেশন, ফিল্টার প্রতিস্থাপন ও রক্ষণাবেক্ষণ',
      openHours: 'খোলা আছে • সকাল ৮:০০ - রাত ৯:০০',
    },
  },
  'noida-carpenter-and-furniture': {
    en: {
      category: 'Carpenter & Modular Works',
      city: 'Noida, UP',
      workHighlight: 'Modular kitchen, customized wardrobe & wooden repair',
      openHours: 'Open Now • 9:00 AM - 8:30 PM',
    },
    hi: {
      category: 'कारपेंटर व मॉड्यूलर वर्क्स',
      city: 'नोएडा (Noida), UP',
      workHighlight: 'मॉड्यूलर किचन, कस्टमाइज़्ड वार्डरोब व वुडन रिपेयर',
      openHours: 'खुला है • सुबह 9:00 - रात 8:30',
    },
    hinglish: {
      category: 'Carpenter & Modular Works',
      city: 'Noida, UP',
      workHighlight: 'Modular kitchen, customized wardrobe aur wooden repair',
      openHours: 'Open Hai • 9:00 AM - 8:30 PM',
    },
    mr: {
      category: 'सुतारकाम आणि मॉड्युलर फर्निचर',
      city: 'नोएडा (Noida), UP',
      workHighlight: 'मॉड्युलर किचन, वॉर्डरोब आणि लाकडी दुरुस्ती',
      openHours: 'सुरू आहे • सकाळी ९:०० - रात्री ८:३०',
    },
    gu: {
      category: 'સુથાર અને મોડ્યુલર વર્ક્સ',
      city: 'નોઇડા (Noida), UP',
      workHighlight: 'મોડ્યુલર કિચન, વોર્ડરોબ અને લાકડાનું રિપેરિંગ',
      openHours: 'ખુલ્લું છે • સવારે ૯:૦૦ - રાત્રે ૮:૩૦',
    },
    pa: {
      category: 'ਤਰਖਾਣ ਅਤੇ ਮਾਡਯੂਲਰ ਵਰਕਸ',
      city: 'ਨੋਇਡਾ (Noida), UP',
      workHighlight: 'ਮਾਡਯੂਲਰ ਰਸੋਈ, ਕਸਟਮ ਅਲਮਾਰੀ ਅਤੇ ਲੱਕੜ ਦੀ ਮੁਰੰਮਤ',
      openHours: 'ਖੁੱਲ੍ਹਾ ਹੈ • ਸਵੇਰੇ 9:00 - ਰਾਤ 8:30',
    },
    bn: {
      category: 'ছুতোর ও মডুলার কাঠের কাজ',
      city: 'নয়ডা (Noida), UP',
      workHighlight: 'মডুলার কিচেন, কাস্টমাইজড ওয়ার্ডরোব ও কাঠের মেরামত',
      openHours: 'খোলা আছে • সকাল ৯:০০ - রাত ৮:৩০',
    },
  },
  'royal-palace-hotel': {
    en: {
      category: 'Hotel, Restaurant & Banquet',
      city: 'Etawah, UP',
      workHighlight: 'Deluxe family rooms, pure veg restaurant & party hall',
      openHours: 'Open Now • 24 Hours Dining & Stay',
    },
    hi: {
      category: 'होटल, रेस्टोरेंट व बैंक्वेट',
      city: 'इटावा (Etawah), UP',
      workHighlight: 'डीलक्स फैमिली रूम्स, प्योर वेज रेस्टोरेंट व पार्टी हॉल',
      openHours: 'खुला है • 24 घंटे डाइनिंग व स्टे',
    },
    hinglish: {
      category: 'Hotel, Restaurant & Banquet',
      city: 'Etawah, UP',
      workHighlight: 'Deluxe family rooms, pure veg restaurant aur party hall',
      openHours: 'Open Hai • 24 Hours Dining & Stay',
    },
    mr: {
      category: 'हॉटेल, रेस्टॉरंट आणि बँक्वेट',
      city: 'इटावा (Etawah), UP',
      workHighlight: 'डिलक्स फॅमिली रूम्स, शुद्ध शाकाहारी रेस्टॉरंट आणि पार्टी हॉल',
      openHours: 'सुरू आहे • २४ तास जेवण आणि मुक्काम',
    },
    gu: {
      category: 'હોટેલ, રેસ્ટોરન્ટ અને બેન્ક્વેટ',
      city: 'ઇટાવા (Etawah), UP',
      workHighlight: 'ડિલક્સ ફેમિલી રૂમ, શુદ્ધ શાકાહારી રેસ્ટોરન્ટ અને પાર્ટી હોલ',
      openHours: 'ખુલ્લું છે • ૨૪ કલાક ભોજન અને રોકાણ',
    },
    pa: {
      category: 'ਹੋਟਲ, ਰੈਸਟੋਰੈਂਟ ਅਤੇ ਬੈਂਕੁਇਟ',
      city: 'ਇਟਾਵਾ (Etawah), UP',
      workHighlight: 'ਡੀਲਕਸ ਫੈਮਿਲੀ ਰੂਮ, ਸ਼ੁੱਧ ਸ਼ਾਕਾਹਾਰੀ ਰੈਸਟੋਰੈਂਟ ਅਤੇ ਪਾਰਟੀ ਹਾਲ',
      openHours: 'ਖੁੱਲ੍ਹਾ ਹੈ • 24 ਘੰਟੇ ਭੋਜਨ ਅਤੇ ਰਹਿਣਾ',
    },
    bn: {
      category: 'হোটেল, রেস্তোরাঁ ও ব্যাঙ্কোয়েট',
      city: 'ইটাওয়া (Etawah), UP',
      workHighlight: 'ডিলাক্স ফ্যামিলি রুম, বিশুদ্ধ নিরামিষ রেস্তোরাঁ ও পার্টি হল',
      openHours: 'খোলা আছে • ২৪ ঘন্টা খাবার ও থাকার সুবিধা',
    },
  },
};

const INITIAL_REAL_SHOPS: RealShopCard[] = [
  {
    id: 'ganpati-electricians',
    name: 'Ganpati Electricians',
    slug: 'ganpati-electricians',
    category: 'Electrical & Wiring Service',
    phone: '8802738322',
    city: 'गाज़ियाबाद (Ghaziabad), UP',
    fullAddress: 'दुकान 4, नियर मेन मार्केट, गाज़ियाबाद',
    rating: 4.9,
    reviewsCount: 128,
    openHours: 'खुला है • 24x7 इमरजेंसी',
    workHighlight: 'हाउस वायरिंग, इन्वर्टर फिटिंग व शॉर्ट सर्किट रिपेयर',
    bannerImage:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'greater-noida-ro-service-solutions',
    name: 'Greater Noida RO Service',
    slug: 'greater-noida-ro-service-solutions',
    category: 'RO Water & Appliances',
    phone: '9105069116',
    city: 'ग्रेटर नोएडा (Greater Noida), UP',
    fullAddress: 'शॉप 12, परी चौक रोड, ग्रेटर नोएडा',
    rating: 4.8,
    reviewsCount: 194,
    openHours: 'खुला है • सुबह 8:00 - रात 9:00',
    workHighlight: 'RO इंस्टॉलेशन, फिल्टर रिप्लेसमेंट व मेंटेनेंस',
    bannerImage:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'noida-carpenter-and-furniture',
    name: 'Noida Carpenter & Furniture',
    slug: 'noida-carpenter-and-furniture',
    category: 'Carpenter & Modular Works',
    phone: '8171534277',
    city: 'नोएडा (Noida), UP',
    fullAddress: 'सेक्टर 18, अट्टा मार्केट, नोएडा',
    rating: 5.0,
    reviewsCount: 162,
    openHours: 'खुला है • सुबह 9:00 - रात 8:30',
    workHighlight: 'मॉड्यूलर किचन, कस्टमाइज़्ड वार्डरोब व वुडन रिपेयर',
    bannerImage:
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'royal-palace-hotel',
    name: 'Royal Palace Hotel',
    slug: 'royal-palace-hotel',
    category: 'Hotel, Restaurant & Banquet',
    phone: '9876543210',
    city: 'इटावा (Etawah), UP',
    fullAddress: 'स्टेशन रोड, सिविल लाइन्स, इटावा',
    rating: 4.9,
    reviewsCount: 310,
    openHours: 'खुला है • 24 घंटे डाइनिंग व स्टे',
    workHighlight: 'डीलक्स फैमिली रूम्स, प्योर वेज रेस्टोरेंट व पार्टी हॉल',
    bannerImage:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
  },
];

interface PricingProps {
  config?: {
    title?: string;
    subtitle?: string;
  };
}

export function Pricing({ config }: PricingProps) {
  const { t, language } = useLanguage();
  const [shops, setShops] = useState<RealShopCard[]>(INITIAL_REAL_SHOPS);
  const [userEdits, setUserEdits] = useState<Record<string, Partial<RealShopCard>>>({});
  const [editingShop, setEditingShop] = useState<RealShopCard | null>(null);
  const [editForm, setEditForm] = useState<Partial<RealShopCard>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Helper to get active localized or user-edited values
  const getShopView = (shop: RealShopCard) => {
    const localized = LOCALIZED_SHOP_DATA[shop.id]?.[language] || LOCALIZED_SHOP_DATA[shop.id]?.hi;
    const edits = userEdits[shop.id] || {};

    return {
      ...shop,
      name: edits.name || shop.name,
      phone: edits.phone || shop.phone,
      category: edits.category || localized?.category || shop.category,
      city: edits.city || localized?.city || shop.city,
      workHighlight: edits.workHighlight || localized?.workHighlight || shop.workHighlight,
      openHours: edits.openHours || localized?.openHours || shop.openHours,
    };
  };

  const openEditModal = (shop: RealShopCard) => {
    const view = getShopView(shop);
    setEditingShop(shop);
    setEditForm({
      name: view.name,
      phone: view.phone,
      city: view.city,
      workHighlight: view.workHighlight,
      openHours: view.openHours,
    });
    setSavedSuccess(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop) return;

    setUserEdits((prev) => ({
      ...prev,
      [editingShop.id]: {
        ...prev[editingShop.id],
        name: editForm.name,
        phone: editForm.phone,
        city: editForm.city,
        workHighlight: editForm.workHighlight,
        openHours: editForm.openHours,
      },
    }));

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setEditingShop(null);
    }, 1200);
  };

  return (
    <section
      id="pricing"
      className="py-6 sm:py-12 bg-linear-to-b from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border-b border-gray-200/80 dark:border-gray-800/80 relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50/90 dark:border-emerald-700/60 dark:bg-emerald-950/40 px-3.5 py-1 text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-2 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('gmb.badge')}</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-gray-950 dark:text-white leading-tight">
            {t('gmb.titlePart1')}{' '}
            <span className="bg-linear-to-r from-amber-600 via-orange-600 to-indigo-600 dark:from-amber-400 dark:via-orange-400 dark:to-indigo-300 bg-clip-text text-transparent">
              {t('gmb.titlePart2')}
            </span>
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
            {t('gmb.subtitle')}
          </p>
        </div>

        {/* 4 Compact Real GMB Cards in One Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6 sm:mb-8">
          {shops.map((rawShop) => {
            const shop = getShopView(rawShop);
            return (
              <motion.div
                key={shop.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md hover:border-amber-400 transition-all overflow-hidden"
              >
                <div>
                  {/* Compact Cover Banner with Live Link */}
                  <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shop.bannerImage}
                      alt={shop.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-gray-950/85 via-gray-950/30 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600/90 text-white font-bold">
                        ● {shop.openHours.split('•')[0].trim() || t('gmb.open')}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditModal(rawShop)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 hover:bg-black/90 text-amber-300 font-bold backdrop-blur-xs border border-white/20 transition-transform active:scale-95 cursor-pointer"
                        title={t('gmb.edit')}
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>{t('gmb.edit')}</span>
                      </button>
                    </div>

                    {/* Store Name on Banner */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 font-semibold backdrop-blur-xs">
                        {shop.category}
                      </span>
                      <h3 className="text-xs sm:text-sm font-black truncate leading-snug drop-shadow-xs">
                        {shop.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3">
                    {/* Rating & City */}
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center text-amber-500 font-black text-xs">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="ml-1 text-gray-900 dark:text-white">{shop.rating}</span>
                        <span className="text-[10px] text-gray-400 font-normal ml-1">
                          ({shop.reviewsCount})
                        </span>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <ShieldCheck className="h-3 w-3" />
                        {t('gmb.verified')}
                      </span>
                    </div>

                    {/* Address */}
                    <div className="mt-2 flex items-start gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                      <MapPin className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1 leading-tight">{shop.city}</span>
                    </div>

                    {/* Work Highlight */}
                    <div className="mt-2 p-2 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <p className="text-[10.5px] font-medium text-gray-700 dark:text-gray-300 line-clamp-2 leading-snug">
                        ⚡ {shop.workHighlight}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="p-2.5 bg-gray-50/90 dark:bg-gray-950/70 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 text-xs font-bold">
                  {/* Call Now */}
                  <a
                    href={`tel:${shop.phone}`}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 text-center cursor-pointer transition-colors"
                  >
                    <Phone className="h-3 w-3 fill-white text-white" />
                    <span className="text-[10.5px]">{t('gmb.call')}</span>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?phone=91${shop.phone}&text=${encodeURIComponent(
                      `Hello ${shop.name}! I found your GMB Card on Bhartiyebazar.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center cursor-pointer"
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-3.5 w-3.5 fill-white text-white" />
                  </a>

                  {/* Real Landing Page Link */}
                  <Link
                    href={`/${shop.slug}`}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1 text-center transition-colors"
                  >
                    <span className="text-[10.5px]">{t('gmb.viewPage')}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Bar: Explore All Profiles & Add Shop */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-linear-to-r from-gray-950 via-slate-900 to-indigo-950 text-white shadow-md border border-amber-400/40">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-black">{t('gmb.bannerTitle')}</h4>
            <p className="text-[11px] text-gray-300 mt-0.5">{t('gmb.bannerSubtitle')}</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/search"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-gray-950 font-black text-xs transition-transform active:scale-95 text-center"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{t('gmb.viewAllShops')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/register/company"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-sm border border-white/20 text-center"
            >
              <Store className="h-3.5 w-3.5 text-amber-300" />
              <span>{t('gmb.createFreeCard')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Edit Details Modal */}
      <AnimatePresence>
        {editingShop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-gray-900 p-5 shadow-2xl border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center">
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                      {t('gmb.editTitle')}
                    </h4>
                    <p className="text-[10px] text-gray-500">{editingShop.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingShop(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {savedSuccess ? (
                <div className="py-6 text-center text-emerald-600 font-bold text-xs flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-bounce" />
                  <span>{t('gmb.updatedMsg')}</span>
                </div>
              ) : (
                <form onSubmit={handleSaveEdit} className="mt-3.5 space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[10.5px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      {t('gmb.shopName')}
                    </label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-xs focus:outline-hidden focus:border-amber-500 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      {t('gmb.phoneNumber')}
                    </label>
                    <input
                      type="text"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-xs focus:outline-hidden focus:border-amber-500 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      {t('gmb.cityLocation')}
                    </label>
                    <input
                      type="text"
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-xs focus:outline-hidden focus:border-amber-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      {t('gmb.workService')}
                    </label>
                    <textarea
                      rows={2}
                      value={editForm.workHighlight || ''}
                      onChange={(e) => setEditForm({ ...editForm, workHighlight: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-xs focus:outline-hidden focus:border-amber-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{t('gmb.save')}</span>
                    </button>

                    <Link
                      href={`/${editingShop.slug}`}
                      className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs text-center flex items-center gap-1"
                      onClick={() => setEditingShop(null)}
                    >
                      <span>{t('gmb.viewPage')}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
