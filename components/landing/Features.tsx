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
  Plus,
  Minus,
  ShoppingBag,
  QrCode,
  Printer,
  ExternalLink,
  X,
  RotateCcw,
} from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface PurposeItem {
  id: string;
  tabTitle: string;
  tabSubtitle: string;
  tabEmoji: string;
  badge: string;
  shortTag: string;
  headline: string;
  subheadline: string;
  taglineBanner: string;
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

const PURPOSES_MAP: Record<string, PurposeItem[]> = {
  // ================= ENGLISH =================
  en: [
    {
      id: 'retail',
      tabTitle: 'Retail & Grocery',
      tabSubtitle: 'Shop Live',
      tabEmoji: '🏬',
      badge: 'Grocery, Clothing & Retail',
      shortTag: 'Online Store',
      headline: 'Make Your Shop a Citywide Brand',
      subheadline: 'Grocery, apparel or general store — go live in 2 minutes without coding.',
      taglineBanner: 'Your shop, trusted by the entire city',
      statBadge: '⚡ 2 Min Setup',
      whatYouCanDo: [
        'List products and pricing with photos instantly',
        'Customers can check live stock & offers from phones',
        'Share WhatsApp order link and Google Map location',
        'Download printable QR Standee for checkout counter',
      ],
      preview: {
        storeName: 'Gupta Superstore',
        category: 'Grocery & Daily Essentials',
        location: 'Main Market, Sector 14, Delhi NCR',
        rating: '4.9',
        reviewCount: '194+ Customers',
        verifiedText: '100% Verified Shop',
        actionButtonText: 'Order on WhatsApp',
        sampleOffer: '🔥 ₹30 OFF on 10kg Wheat Flour',
        sampleProducts: [
          { name: 'Fortune Sunlite Refined Oil 1L', price: '₹142', tag: 'Bestseller' },
          { name: 'Aashirvaad Whole Wheat Atta 10kg', price: '₹410', tag: 'Fresh Stock' },
          { name: 'Tata Premium Tea Gold 500g', price: '₹285', tag: 'Hot Deal' },
        ],
        liveActivity: '🟢 18 customers viewed shop today',
      },
    },
    {
      id: 'whatsapp',
      tabTitle: 'WhatsApp Orders',
      tabSubtitle: '0% Cut',
      tabEmoji: '📲',
      badge: 'Sweets, Bakery & Food',
      shortTag: 'Direct UPI',
      headline: '100% Profit to You, 0% Commission',
      subheadline: 'Stop paying hefty cuts to food aggregators. Get direct WhatsApp orders and UPI payments.',
      taglineBanner: 'Direct customers, 0% commission, 100% profit',
      statBadge: '💰 0% Commission',
      whatYouCanDo: [
        'Direct WhatsApp orders and item lists straight to your chat',
        '100% instant payment direct to your UPI / QR',
        'Own your customer contacts forever',
        'Broadcast seasonal festival discounts to repeat buyers',
      ],
      preview: {
        storeName: 'Bikaner Sweets & Bakery',
        category: 'Sweets, Snacks & Food',
        location: 'Station Road, Ward No. 5',
        rating: '5.0',
        reviewCount: '480+ Orders',
        verifiedText: 'Pure Desi Ghee Verified',
        actionButtonText: 'Order on WhatsApp',
        sampleOffer: '🎉 10% OFF on Kaju Katli Gift Boxes',
        sampleProducts: [
          { name: 'Kaju Katli Special (500g)', price: '₹460', tag: 'Top Rated' },
          { name: 'Desi Ghee Motichoor Ladoo 1kg', price: '₹380', tag: 'Fresh Daily' },
          { name: 'Special Khasta Kachori (Pack of 4)', price: '₹90', tag: 'Crispy' },
        ],
        liveActivity: '🟢 Instant WhatsApp Chat Active',
      },
    },
    {
      id: 'services',
      tabTitle: 'Services & Tech',
      tabSubtitle: 'Daily Calls',
      tabEmoji: '🔧',
      badge: 'Repairs & Home Services',
      shortTag: 'Direct Client',
      headline: 'Get Direct Customer Calls Citywide',
      subheadline: 'AC repair, electrician, plumber, salon — start getting local client inquiries daily.',
      taglineBanner: 'Master skill, celebrated citywide',
      statBadge: '📞 Direct Calls',
      whatYouCanDo: [
        'Appear on top in local search results',
        'Clients can tap "Call Now" to connect in seconds',
        'Showcase portfolio photos and verified reviews',
        'Build trust with official Verified Professional badge',
      ],
      preview: {
        storeName: 'Sharma Electricals & AC',
        category: 'AC & Wiring Service Experts',
        location: 'Doorstep Service Across Entire City',
        rating: '4.9',
        reviewCount: '135+ Homes Served',
        verifiedText: 'Verified Master Electrician',
        actionButtonText: 'Call Now: +91 98XXX XXXXX',
        sampleOffer: '⚡ Split AC Jet Service @ ₹499',
        sampleProducts: [
          { name: 'Split AC Full Jet Service', price: '₹499', tag: '30-Day Guarantee' },
          { name: 'Inverter & Battery Wiring Fitting', price: '₹350', tag: 'Same Day' },
          { name: 'Emergency Fuse & Circuit Repair', price: '₹200', tag: '30 Min Arrival' },
        ],
        liveActivity: '🟢 9 direct calls received today',
      },
    },
    {
      id: 'professional',
      tabTitle: 'Clinic & Doctor',
      tabSubtitle: 'Bookings',
      tabEmoji: '🩺',
      badge: 'Doctors, CA & Lawyers',
      shortTag: 'Digital Profile',
      headline: 'Verified Profile & Direct Appointments',
      subheadline: 'Doctors, lawyers, and consultants — build trust with a verified professional profile.',
      taglineBanner: 'Trust and prestige for every patient and client',
      statBadge: '🛡️ Verified Profile',
      whatYouCanDo: [
        'Display OPD timings, consultation fees, and visiting hours',
        'Patients confirm appointments directly over WhatsApp',
        'Showcase degrees, registrations, and awards',
        'Share digital visiting cards with 1 tap',
      ],
      preview: {
        storeName: 'Dr. Verma Child Clinic',
        category: 'Pediatric Specialist (MBBS, MD)',
        location: 'Civil Lines, Near City Hospital',
        rating: '4.9',
        reviewCount: '320+ Patients',
        verifiedText: 'MCI & State Council Verified',
        actionButtonText: 'Book on WhatsApp',
        sampleOffer: '🩺 OPD: 10:00 AM - 02:00 PM | 05:00 PM - 08:30 PM',
        sampleProducts: [
          { name: 'Child Health Consultation', price: '₹400', tag: 'Regular OPD' },
          { name: 'Vaccination & Growth Tracking', price: '₹600', tag: 'Package' },
          { name: 'Emergency Pediatric Care', price: '₹500', tag: 'On-Call' },
        ],
        liveActivity: '🟢 14 slots booked today',
      },
    },
    {
      id: 'wholesale',
      tabTitle: 'Wholesale & B2B',
      tabSubtitle: 'Pan-India',
      tabEmoji: '🏭',
      badge: 'Manufacturer & Wholesale',
      shortTag: 'Bulk Orders',
      headline: 'Receive Bulk Orders Across India',
      subheadline: 'Manufacturers, millers, and distributors — connect with retailers nationwide.',
      taglineBanner: 'Bigger orders, nationwide merchant network',
      statBadge: '📦 Bulk Inquiries',
      whatYouCanDo: [
        'Share bulk catalogs and MOQ tiered pricing',
        'Receive wholesale inquiries on WhatsApp directly',
        'Build trust with GST & MSME Verified badges',
        'Expand distribution network to new cities effortlessly',
      ],
      preview: {
        storeName: 'Bharat Textile Mills',
        category: 'B2B Garments Manufacturer',
        location: 'Textile Market, Surat / Delhi',
        rating: '4.9',
        reviewCount: '520+ Shipments',
        verifiedText: 'GST & MSME Verified',
        actionButtonText: 'Get Bulk Rate Sheet',
        sampleOffer: '🚛 Pan-India Transport Delivery Available',
        sampleProducts: [
          { name: 'Pure Cotton Printed Kurtis (Set of 20)', price: '₹220/pc', tag: 'MOQ 20' },
          { name: 'Men Bio-Wash T-Shirts (Lot of 50)', price: '₹140/pc', tag: 'MOQ 50' },
          { name: 'Kids Festival Wear Assorted Bundle', price: '₹180/pc', tag: 'MOQ 30' },
        ],
        liveActivity: '🟢 5 bulk inquiries received today',
      },
    },
  ],

  // ================= HINDI =================
  hi: [
    {
      id: 'retail',
      tabTitle: 'रिटेल व किराना',
      tabSubtitle: 'दुकान लाइव',
      tabEmoji: '🏬',
      badge: 'किराना, कपड़ा व रिटेल',
      shortTag: 'ऑनलाइन स्टोर',
      headline: 'दुकान बने पूरे शहर का ब्रांड',
      subheadline: 'किराना, कपड़ा या जनरल स्टोर — बिना किसी कोडर के 2 मिनट में अपनी दुकान लाइव करें।',
      taglineBanner: 'दुकान आपकी, पहचान पूरे शहर में',
      statBadge: '⚡ 2 मिनट सेटअप',
      whatYouCanDo: [
        'प्रोडक्ट्स और रेट लिस्ट फोटो के साथ लाइव करें',
        'ग्राहक फोन से स्टॉक और ऑफर्स देख सकें',
        'व्हाट्सएप ऑर्डर लिंक और लोकेशन गूगल पर लाइव करें',
        'काउंटर के लिए क्यूआर स्टैंडी डाउनलोड करें',
      ],
      preview: {
        storeName: 'गुप्ता जी सुपरस्टोर',
        category: 'किराना व दैनिक सामान स्टोर',
        location: 'मेन मार्केट, सेक्टर 14, दिल्ली एनसीआर',
        rating: '4.9',
        reviewCount: '194+ ग्राहक',
        verifiedText: '100% सत्यापित दुकान',
        actionButtonText: 'व्हाट्सएप पर ऑर्डर करें',
        sampleOffer: '🔥 10 किलो आटा पर ₹30 की छूट',
        sampleProducts: [
          { name: 'फॉर्च्यून सनलाइट रिफाइंड ऑयल 1L', price: '₹142', tag: 'बेस्टसेलर' },
          { name: 'आशीर्वाद शुद्ध चक्की आटा 10kg', price: '₹410', tag: 'ताज़ा स्टॉक' },
          { name: 'टाटा प्रीमियम टी गोल्ड 500g', price: '₹285', tag: 'हॉट डील' },
        ],
        liveActivity: '🟢 18 ग्राहकों ने आज दुकान देखी',
      },
    },
    {
      id: 'whatsapp',
      tabTitle: 'व्हाट्सएप ऑर्डर्स',
      tabSubtitle: '0% कट',
      tabEmoji: '📲',
      badge: 'मिठाई, बेकरी व फूड',
      shortTag: 'डायरेक्ट यूपीआई',
      headline: '100% मुनाफा आपका, 0% कमीशन',
      subheadline: 'डिलीवरी ऐप्स को मोटा कमीशन मत दीजिए। डायरेक्ट ऑर्डर और भुगतान व्हाट्सएप पर पाएं।',
      taglineBanner: 'सीधे ग्राहक, 0% कमीशन, 100% मुनाफा',
      statBadge: '💰 0% कमीशन',
      whatYouCanDo: [
        'डायरेक्ट व्हाट्सएप ऑर्डर और आइटम लिस्ट आपकी चैट पर',
        '100% भुगतान सीधे आपके यूपीआई / क्यूआर पर',
        'ग्राहक का मोबाइल नंबर हमेशा आपके पास',
        'त्योहारों पर ऑफर्स ब्रॉडकास्ट करके बिक्री बढ़ाएं',
      ],
      preview: {
        storeName: 'बीकानेर स्वीट्स व बेकरी',
        category: 'मिठाई, नमकीन व फूड',
        location: 'स्टेशन रोड, वार्ड नं. 5',
        rating: '5.0',
        reviewCount: '480+ ऑर्डर्स',
        verifiedText: 'शुद्ध देसी घी सत्यापित',
        actionButtonText: 'व्हाट्सएप पर ऑर्डर करें',
        sampleOffer: '🎉 काजू कतली पर 10% की विशेष छूट',
        sampleProducts: [
          { name: 'काजू कतली स्पेशल (500g)', price: '₹460', tag: 'टॉप रेटेड' },
          { name: 'देसी घी मोतीचूर लड्डू 1kg', price: '₹380', tag: 'ताज़ा रोज़' },
          { name: 'स्पेशल खस्ता कचौरी (4 पीस)', price: '₹90', tag: 'कुरकुरी' },
        ],
        liveActivity: '🟢 तुरंत व्हाट्सएप चैट सक्रिय',
      },
    },
    {
      id: 'services',
      tabTitle: 'सर्विसेज व कारीगर',
      tabSubtitle: 'दैनिक कॉल्स',
      tabEmoji: '🔧',
      badge: 'रिपेयर व होम सर्विसेज',
      shortTag: 'डायरेक्ट ग्राहक',
      headline: 'शहर भर से पाएं सीधे ग्राहक कॉल्स',
      subheadline: 'एसी रिपेयर, इलेक्ट्रीशियन, प्लंबर या सैलून — सीधे ग्राहकों की कॉल आना शुरू।',
      taglineBanner: 'हर कारीगर का हुनर, शहर में मशहूर',
      statBadge: '📞 डायरेक्ट कॉल्स',
      whatYouCanDo: [
        'लोकल सर्च में आपका प्रोफाइल सबसे ऊपर दिखे',
        'ग्राहक सीधे "Call Now" दबाकर संपर्क करें',
        'काम की तस्वीरें और ग्राहक समीक्षाएं साझा करें',
        'वेरिफाइड कारीगर बैज से विश्वास बढ़ाएं',
      ],
      preview: {
        storeName: 'शर्माजी इलेक्ट्रिकल्स व एसी',
        category: 'एसी व वायरिंग सर्विस एक्सपर्ट',
        location: 'पूरे शहर में डोरस्टेप सेवा',
        rating: '4.9',
        reviewCount: '135+ घरों की सेवा',
        verifiedText: 'सत्यापित मास्टर कारीगर',
        actionButtonText: 'कॉल करें: 98XXX XXXXX',
        sampleOffer: '⚡ स्प्लिट एसी जेट सर्विस @ ₹499',
        sampleProducts: [
          { name: 'स्प्लिट एसी फुल जेट सर्विस', price: '₹499', tag: '30-दिन गारंटी' },
          { name: 'इनवर्टर व बैटरी वायरिंग फिटिंग', price: '₹350', tag: 'उसी दिन' },
          { name: 'इमर्जेंसी फ्यूज व ट्रिप रिपेयर', price: '₹200', tag: '30 मिनट पहुंच' },
        ],
        liveActivity: '🟢 आज 9 डायरेक्ट कॉल्स आईं',
      },
    },
    {
      id: 'professional',
      tabTitle: 'क्लीनिक व डॉक्टर',
      tabSubtitle: 'अपॉइंटमेंट्स',
      tabEmoji: '🩺',
      badge: 'डॉक्टर, सीए व वकील',
      shortTag: 'डिजिटल प्रोफाइल',
      headline: 'सत्यापित पहचान व डायरेक्ट बुकिंग',
      subheadline: 'डॉक्टर्स, सीए और प्रोफेशनल्स — अपनी प्रोफाइल बनाकर क्लाइंट्स का विश्वास जीतें।',
      taglineBanner: 'विश्वास और प्रतिष्ठा, हर मरीज तक',
      statBadge: '🛡️ सत्यापित प्रोफाइल',
      whatYouCanDo: [
        'समय, परामर्श शुल्क और ओपीडी दिन प्रदर्शित करें',
        'मरीज सीधे व्हाट्सएप पर समय सुनिश्चित करें',
        'प्रमाणपत्र और डिग्रियां प्रदर्शित करें',
        'डिजिटल विज़िटिंग कार्ड 1-क्लिक में शेयर करें',
      ],
      preview: {
        storeName: 'डॉ. वर्मा चाइल्ड क्लीनिक',
        category: 'शिशु रोग विशेषज्ञ (MBBS, MD)',
        location: 'सिविल लाइंस, सिटी हॉस्पिटल के पास',
        rating: '4.9',
        reviewCount: '320+ मरीज',
        verifiedText: 'एमसीआई व राज्य परिषद सत्यापित',
        actionButtonText: 'व्हाट्सएप पर बुक करें',
        sampleOffer: '🩺 ओपीडी: सुबह 10:00 - दोपहर 02:00 | शाम 05:00 - रात 08:30',
        sampleProducts: [
          { name: 'शिशु स्वास्थ्य परामर्श', price: '₹400', tag: 'नियमित ओपीडी' },
          { name: 'टीकाकरण व ग्रोथ ट्रैकिंग', price: '₹600', tag: 'पैकेज' },
          { name: 'आपातकालीन बाल चिकित्सा', price: '₹500', tag: 'ऑन-कॉल' },
        ],
        liveActivity: '🟢 आज 14 स्लॉट बुक हुए',
      },
    },
    {
      id: 'wholesale',
      tabTitle: 'होलसेल व मंडी',
      tabSubtitle: 'पूरे भारत में',
      tabEmoji: '🏭',
      badge: 'निर्माता व थोक व्यापारी',
      shortTag: 'थोक ऑर्डर्स',
      headline: 'देश भर से पाएं थोक ऑर्डर्स',
      subheadline: 'निर्माता या वितरक — पूरे देश के रिटेलर्स से सीधे जुड़ें।',
      taglineBanner: 'बड़े ऑर्डर्स, देश भर के व्यापारी',
      statBadge: '📦 बल्क इन्क्वायरी',
      whatYouCanDo: [
        'थोक कैटलॉग और न्यूनतम ऑर्डर दरें शेयर करें',
        'रिटेलर्स से सीधे व्हाट्सएप पर बल्क इन्क्वायरी लें',
        'जीएसटी सत्यापित व्यापारी बैज से भरोसा बनाएं',
        'नए शहरों में खरीदार और डिस्ट्रीब्यूटर जोड़ें',
      ],
      preview: {
        storeName: 'भारत टेक्सटाइल मिल्स',
        category: 'बी2बी गारमेंट्स निर्माता',
        location: 'टेक्सटाइल मार्केट, सूरत / दिल्ली',
        rating: '4.9',
        reviewCount: '520+ शिपमेंट्स',
        verifiedText: 'जीएसटी व एमएसएमई सत्यापित',
        actionButtonText: 'थोक रेट शीट पाएं',
        sampleOffer: '🚛 अखिल भारतीय ट्रांसपोर्ट डिलीवरी उपलब्ध',
        sampleProducts: [
          { name: 'कॉटन प्रिंटेड कुर्ती (20 का सेट)', price: '₹220/पीस', tag: 'MOQ 20' },
          { name: 'मेंस बायो-वॉश टी-शर्ट (50 का लॉट)', price: '₹140/पीस', tag: 'MOQ 50' },
          { name: 'किड्स फेस्टिवल वियर बंडल', price: '₹180/पीस', tag: 'MOQ 30' },
        ],
        liveActivity: '🟢 आज 5 थोक इन्क्वायरी आईं',
      },
    },
  ],

  // ================= HINGLISH =================
  hinglish: [
    {
      id: 'retail',
      tabTitle: 'Retail & Kirana',
      tabSubtitle: 'Dukan Live',
      tabEmoji: '🏬',
      badge: 'Kirana, Kapda & Retail',
      shortTag: 'Online Store',
      headline: 'Dukan Bane Poore Shehar Ka Brand',
      subheadline: 'Kirana, kapda ya general store — bina kisi coder ke 2 minute me apni dukan live karein.',
      taglineBanner: 'Dukan aapki, pehchaan poore shehar me',
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
      tabEmoji: '📲',
      badge: 'Mithai, Bakery & Food',
      shortTag: 'Direct UPI',
      headline: '100% Munafa Aapka, 0% Commission',
      subheadline: 'Delivery apps ko commission mat dijiye. Direct order aur payment WhatsApp par paayein.',
      taglineBanner: 'Direct grahak, 0% commission, 100% munafa',
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
      tabEmoji: '🔧',
      badge: 'Repairs & Home Services',
      shortTag: 'Direct Client',
      headline: 'Shehar Bhar Se Paayein Direct Calls',
      subheadline: 'AC repair, electrician, plumber ya salon — daily direct customer calls aana shuru.',
      taglineBanner: 'Har karigar ka hunar, shehar me mashhoor',
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
      tabEmoji: '🩺',
      badge: 'Doctor, CA & Lawyers',
      shortTag: 'Digital Profile',
      headline: 'Digital Pehchaan & Direct Booking',
      subheadline: 'Doctors, CA aur professionals — apni profile banakar clients ka vishwas jeetein.',
      taglineBanner: 'Vishwas aur pratishtha, har grahak tak',
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
      tabEmoji: '🏭',
      badge: 'Manufacturer & Wholesale',
      shortTag: 'Bulk Orders',
      headline: 'Desh Bhar Se Paayein Bulk Orders',
      subheadline: 'Manufacturer ya distributor — poore desh ke retailers se direct judein.',
      taglineBanner: 'Bade orders, desh bhar ke vyapari',
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
  ],

  // ================= MARATHI =================
  mr: [
    {
      id: 'retail',
      tabTitle: 'किराणा व रिटेल',
      tabSubtitle: 'दुकान सुरू',
      tabEmoji: '🏬',
      badge: 'किराणा, कापड व रिटेल',
      shortTag: 'ऑनलाइन दुकान',
      headline: 'दुकान बनेल संपूर्ण शहराचा ब्रँड',
      subheadline: 'किराणा किंवा जनरल स्टोअर — २ मिनिटांत आपली दुकान लाइव्ह करा.',
      taglineBanner: 'दुकान तुमची, ओळख संपूर्ण शहरात',
      statBadge: '⚡ २ मिनिटांत सेटअप',
      whatYouCanDo: [
        'उत्पादने आणि दर सूची फोटोसह सुरू करा',
        'ग्राहक मोबाइलवरून स्टॉक आणि ऑफर्स पाहू शकतात',
        'व्हॉट्सअॅप ऑर्डर लिंक आणि गुगल मॅप सुरू करा',
        'काउंटरसाठी क्यूआर स्टँडी डाउनलोड करा',
      ],
      preview: {
        storeName: 'गुप्ता सुपरस्टोअर',
        category: 'किराणा व दैनंदिन वस्तू',
        location: 'मेन मार्केट, पुणे / मुंबई',
        rating: '4.9',
        reviewCount: '194+ ग्राहक',
        verifiedText: '१००% सत्यापित दुकान',
        actionButtonText: 'व्हॉट्सअॅपवर ऑर्डर करा',
        sampleOffer: '🔥 १० किलो गव्हाच्या पिठावर ₹३० सूट',
        sampleProducts: [
          { name: 'फॉर्च्यून सनलाइट तेल १L', price: '₹१४२', tag: 'बेस्टसेलर' },
          { name: 'आशीर्वाद चक्की आटा १०kg', price: '₹४१०', tag: 'ताजा माल' },
          { name: 'टाटा गोल्ड चहा ५००g', price: '₹२८५', tag: 'हॉट डील' },
        ],
        liveActivity: '🟢 १८ ग्राहकांनी आज दुकान पाहिले',
      },
    },
    {
      id: 'whatsapp',
      tabTitle: 'व्हॉट्सअॅप ऑर्डर्स',
      tabSubtitle: '०% कमिशन',
      tabEmoji: '📲',
      badge: 'मिठाई, बेकरी व खाद्यपदार्थ',
      shortTag: 'थेट यूपीआय',
      headline: '१००% नफा तुमचा, ०% कमिशन',
      subheadline: 'अॅप्सना जास्त कमिशन देणे बंद करा. थेट व्हॉट्सअॅप ऑर्डर्स आणि पैसे मिळवा.',
      taglineBanner: 'थेट ग्राहक, ०% कमिशन, १००% नफा',
      statBadge: '💰 ०% कमिशन',
      whatYouCanDo: [
        'थेट व्हॉट्सअॅप ऑर्डर्स आपल्या चॅटवर',
        '१००% पेमेंट थेट आपल्या यूपीआय / क्यूआरवर',
        'ग्राहकांचा मोबाइल नंबर कायम आपल्याकडे',
        'सणासुदीला ऑफर्स पाठवून विक्री वाढवा',
      ],
      preview: {
        storeName: 'चितळे स्वीट्स व नमकीन',
        category: 'मिठाई, बेकरी व खाद्यपदार्थ',
        location: 'स्टेशन रोड, वॉर्ड क्र. ५',
        rating: '5.0',
        reviewCount: '४८०+ ऑर्डर्स',
        verifiedText: 'शुद्ध देशी तूप प्रमाणित',
        actionButtonText: 'व्हॉट्सअॅपवर ऑर्डर करा',
        sampleOffer: '🎉 काजू कतलीवर १०% विशेष सवलत',
        sampleProducts: [
          { name: 'काजू कतली स्पेशल (५००g)', price: '₹४६०', tag: 'टॉप रेटेड' },
          { name: 'मोतीचूर लाडू १kg', price: '₹३८०', tag: 'रोज ताजा' },
          { name: 'खमंग कचोरी (४ नग)', price: '₹९०', tag: 'कुरकुरीत' },
        ],
        liveActivity: '🟢 झटपट व्हॉट्सअॅप चॅट सुरू',
      },
    },
    {
      id: 'services',
      tabTitle: 'सेवा व तंत्रज्ञ',
      tabSubtitle: 'दैनिक कॉल्स',
      tabEmoji: '🔧',
      badge: 'दुरुस्ती व घरगुती सेवा',
      shortTag: 'थेट ग्राहक',
      headline: 'शहरभरातून मिळवा थेट कॉल्स',
      subheadline: 'एसी रिपेअर, इलेक्ट्रिशियन, प्लंबर किंवा सलून — दररोज थेट ग्राहक चौकशी सुरू.',
      taglineBanner: 'प्रत्येक तंत्रज्ञाचे कौशल्य शहरात प्रसिद्ध',
      statBadge: '📞 थेट कॉल्स',
      whatYouCanDo: [
        'स्थानिक शोधात तुमचे प्रोफाइल सर्वात वर दिसेल',
        'ग्राहक थेट "Call Now" दाबून संपर्क करू शकतात',
        'कामाचे फोटो आणि ग्राहकांचे रिव्ह्यू शेअर करा',
        'सत्यापित बॅजने विश्वास संपादन करा',
      ],
      preview: {
        storeName: 'शर्माजी इलेक्ट्रिकल्स व एसी',
        category: 'एसी व वायरिंग तज्ज्ञ',
        location: 'घरोघरी सेवा संपूर्ण शहरात',
        rating: '4.9',
        reviewCount: '१३५+ कुटुंबे',
        verifiedText: 'सत्यापित मास्टर तंत्रज्ञ',
        actionButtonText: 'कॉल करा: ९८XXX XXXXX',
        sampleOffer: '⚡ स्प्लिट एसी जेट सर्व्हिस @ ₹४९९',
        sampleProducts: [
          { name: 'स्प्लिट एसी जेट सर्व्हिस', price: '₹४९९', tag: '३० दिवस हमी' },
          { name: 'इन्व्हर्टर व बॅटरी वायरिंग', price: '₹३५०', tag: 'त्याच दिवशी' },
          { name: 'फ्यूज व ट्रिप दुरुस्ती', price: '₹२००', tag: '३० मिनिटांत' },
        ],
        liveActivity: '🟢 आज ९ थेट कॉल्स आल्या',
      },
    },
    {
      id: 'professional',
      tabTitle: 'क्लिनिक व डॉक्टर',
      tabSubtitle: 'अपॉइंटमेंट्स',
      tabEmoji: '🩺',
      badge: 'डॉक्टर, सीए व वकील',
      shortTag: 'डिजिटल प्रोफाइल',
      headline: 'सत्यापित ओळख व थेट बुकिंग',
      subheadline: 'डॉक्टर्स, सीए आणि व्यावसायिक — प्रोफाइल बनवून क्लायंट्सचा विश्वास संपादन करा.',
      taglineBanner: 'विश्वास आणि प्रतिष्ठा, प्रत्येक रुग्णापर्यंत',
      statBadge: '🛡️ सत्यापित प्रोफाइल',
      whatYouCanDo: [
        'वेळ, सल्लामसलत फी आणि ओपीडी दिवस दाखवा',
        'रुग्ण थेट व्हॉट्सअॅपवर वेळ निश्चित करू शकतात',
        'पदव्या आणि प्रमाणपत्रे प्रदर्शित करा',
        'डिजिटल व्हिजिटिंग कार्ड १-क्लिकमध्ये शेअर करा',
      ],
      preview: {
        storeName: 'डॉ. वर्मा बाल रुग्णालय',
        category: 'बालरोग तज्ज्ञ (MBBS, MD)',
        location: 'सिव्हिल लाइन्स, सिटी हॉस्पिटलजवळ',
        rating: '4.9',
        reviewCount: '३२०+ रुग्ण',
        verifiedText: 'एमसीआय मान्यताप्राप्त',
        actionButtonText: 'व्हॉट्सअॅपवर बुक करा',
        sampleOffer: '🩺 ओपीडी: सकाळी १० ते २ | संध्याकाळी ५ ते ८:३०',
        sampleProducts: [
          { name: 'बाल आरोग्य सल्ला', price: '₹४००', tag: 'नियमित' },
          { name: 'लसीकरण व वाढ ट्रॅकिंग', price: '₹६००', tag: 'पॅकेज' },
          { name: 'तातडीची तपासणी', price: '₹५००', tag: 'ऑन-कॉल' },
        ],
        liveActivity: '🟢 आज १४ स्लॉट्स बुक झाले',
      },
    },
    {
      id: 'wholesale',
      tabTitle: 'घाऊक व व्यापारी',
      tabSubtitle: 'अखिल भारत',
      tabEmoji: '🏭',
      badge: 'उत्पादक व घाऊक व्यापारी',
      shortTag: 'मोठे ऑर्डर्स',
      headline: 'देशभरातून मिळवा मोठे ऑर्डर्स',
      subheadline: 'उत्पादक किंवा वितरक — देशभरातील किरकोळ विक्रेत्यांशी थेट जोडा.',
      taglineBanner: 'मोठ्या ऑर्डर्स, देशभरातील व्यापारी',
      statBadge: '📦 घाऊक चौकशी',
      whatYouCanDo: [
        'घाऊक कॅटलॉग आणि किमान ऑर्डर दर शेअर करा',
        'रिटेलर्सकडून थेट व्हॉट्सअॅपवर चौकशी घ्या',
        'जीएसटी प्रमाणित व्यापारी बॅजने विश्वास निर्माण करा',
        'नवीन शहरांत वितरक नेटवर्क वाढवा',
      ],
      preview: {
        storeName: 'भारत टेक्सटाइल मिल्स',
        category: 'कापड उत्पादक व घाऊक',
        location: 'टेक्सटाइल मार्केट, सुरत / मुंबई',
        rating: '4.9',
        reviewCount: '५२०+ पार्सल्स',
        verifiedText: 'जीएसटी व एमएसएमई प्रमाणित',
        actionButtonText: 'घाऊक दर सूची मिळवा',
        sampleOffer: '🚛 संपूर्ण भारतात वाहतूक सेवा उपलब्ध',
        sampleProducts: [
          { name: 'कॉटन कुर्ती सेट (२० नग)', price: '₹२२०/नग', tag: 'MOQ 20' },
          { name: 'टी-शर्ट्स लॉट (५० नग)', price: '₹१४०/नग', tag: 'MOQ 50' },
          { name: 'मुलांचे कपडे बंडल', price: '₹१८०/नग', tag: 'MOQ 30' },
        ],
        liveActivity: '🟢 आज ५ मोठ्या ऑर्डर्स आल्या',
      },
    },
  ],

  // ================= GUJARATI =================
  gu: [
    {
      id: 'retail',
      tabTitle: 'કરિયાણું અને રિટેલ',
      tabSubtitle: 'દુકાન લાઇવ',
      tabEmoji: '🏬',
      badge: 'કરિયાણું, કાપડ અને રિટેલ',
      shortTag: 'ઓનલાઇન સ્ટોર',
      headline: 'દુકાન બનશે આખા શહેરની બ્રાન્ડ',
      subheadline: 'કરિયાણું કે જનરલ સ્ટોર — કોડિંગ વગર ૨ મિનિટમાં દુકાન લાઇવ કરો.',
      taglineBanner: 'દુકાન તમારી, ઓળખ આખા શહેરમાં',
      statBadge: '⚡ ૨ મિનિટ સેટઅપ',
      whatYouCanDo: [
        'પ્રોડક્ટ્સ અને રેટ લિસ્ટ ફોટો સાથે લાઇવ કરો',
        'ગ્રાહકો ફોનથી સ્ટોક અને ઑફર્સ જોઈ શકે',
        'વોટ્સએપ ઓર્ડર લિંક અને લોકેશન ગૂગલ પર લાઇવ કરો',
        'કાઉન્ટર માટે ક્યૂઆર સ્ટેન્ડી ડાઉનલોડ કરો',
      ],
      preview: {
        storeName: 'ગુપ્તા સુપરસ્ટોર',
        category: 'કરિયાણું અને દૈનિક ચીજો',
        location: 'મેઇન માર્કેટ, અમદાવાદ / સુરત',
        rating: '4.9',
        reviewCount: '૧૯૪+ ગ્રાહકો',
        verifiedText: '૧૦૦% વેરિફાઇડ દુકાન',
        actionButtonText: 'વોટ્સએપ પર ઓર્ડર કરો',
        sampleOffer: '🔥 ૧૦ કિલો લોટ પર ₹૩૦ છૂટ',
        sampleProducts: [
          { name: 'સનલાઇટ રિફાઇન્ડ તેલ ૧L', price: '₹૧૪૨', tag: 'બેસ્ટસેલર' },
          { name: 'શુદ્ધ ઘઉંનો લોટ ૧૦kg', price: '₹૪૧૦', tag: 'તાજો સ્ટોક' },
          { name: 'ગોલ્ડ પ્રીમિયમ ચા ૫૦૦g', price: '₹૨૮૫', tag: 'સ્પેશિયલ' },
        ],
        liveActivity: '🟢 ૧૮ ગ્રાહકોએ આજે દુકાન જોઈ',
      },
    },
    {
      id: 'whatsapp',
      tabTitle: 'વોટ્સએપ ઓર્ડર્સ',
      tabSubtitle: '૦% કમિશન',
      tabEmoji: '📲',
      badge: 'મીઠાઈ, બેકરી અને ફૂડ',
      shortTag: 'ડાયરેક્ટ યુપીઆઈ',
      headline: '૧૦૦% નફો તમારો, ૦% કમિશન',
      subheadline: 'એપ્સને મોટું કમિશન ન આપો. વોટ્સએપ પર સીધા ઓર્ડર અને પેમેન્ટ મેળવો.',
      taglineBanner: 'સીધા ગ્રાહક, ૦% કમિશન, ૧૦૦% નફો',
      statBadge: '💰 ૦% કમિશન',
      whatYouCanDo: [
        'સીધા વોટ્સએપ ઓર્ડર અને લિસ્ટ તમારા ચેટ પર',
        '૧૦૦% પેમેન્ટ સીધા તમારા યુપીઆઈ / ક્યૂઆર પર',
        'ગ્રાહકનો મોબાઇલ નંબર કાયમ તમારી પાસે',
        'તહેવારો પર ઑફર્સ મોકલીને વેચાણ વધારો',
      ],
      preview: {
        storeName: 'બીકાનેર સ્વીટ્સ અને બેકરી',
        category: 'મીઠાઈ, ફરસાણ અને ફૂડ',
        location: 'સ્ટેશન રોડ, વોર્ડ નં. ૫',
        rating: '5.0',
        reviewCount: '૪૮૦+ ઓર્ડર્સ',
        verifiedText: 'શુદ્ધ દેશી ઘી વેરિફાઇડ',
        actionButtonText: 'વોટ્સએપ પર ઓર્ડર કરો',
        sampleOffer: '🎉 કાજુકતરી પર ૧૦% વિશેષ છૂટ',
        sampleProducts: [
          { name: 'કાજુકતરી સ્પેશિયલ (૫૦૦g)', price: '₹૪૬૦', tag: 'ટોપ રેટેડ' },
          { name: 'મોતીચૂર લાડુ ૧kg', price: '₹૩૮૦', tag: 'તાજા રોજેરોજ' },
          { name: 'ખસ્તા કચોરી (૪ નંગ)', price: '₹૯૦', tag: 'ક્રિસ્પી' },
        ],
        liveActivity: '🟢 ઇન્સ્ટન્ટ વોટ્સએપ ચેટ સક્રિય',
      },
    },
    {
      id: 'services',
      tabTitle: 'સર્વિસ અને કારીગર',
      tabSubtitle: 'દૈનિક કોલ્સ',
      tabEmoji: '🔧',
      badge: 'રિપેરિંગ અને હોમ સર્વિસ',
      shortTag: 'સીધા ગ્રાહક',
      headline: 'આખા શહેરમાંથી મેળવો સીધા કોલ્સ',
      subheadline: 'એસી રિપેરિંગ, ઇલેક્ટ્રિશિયન, પ્લમ્બર — દરરોજ સીધા ગ્રાહકોની પૂછપરછ શરૂ.',
      taglineBanner: 'દરેક કારીગરની કુશળતા શહેરમાં પ્રખ્યાત',
      statBadge: '📞 ડાયરેક્ટ કોલ્સ',
      whatYouCanDo: [
        'લોકલ સર્ચમાં તમારી પ્રોફાઇલ સૌથી ઉપર દેખાશે',
        'ગ્રાહકો સીધું "Call Now" દબાવીને સંપર્ક કરે',
        'કામના ફોટા અને ગ્રાહકોના રિવ્યૂ શેર કરો',
        'વેરિફાઇડ કારીગર બેજથી વિશ્વાસ વધારો',
      ],
      preview: {
        storeName: 'શર્માજી ઇલેક્ટ્રિકલ્સ અને એસી',
        category: 'એસી અને વાયરિંગ એક્સપર્ટ',
        location: 'ઘેર બેઠા સર્વિસ આખા શહેરમાં',
        rating: '4.9',
        reviewCount: '૧૩૫+ ઘરોની સેવા',
        verifiedText: 'સત્યાપિત માસ્ટર કારીગર',
        actionButtonText: 'કૉલ કરો: ૯૮XXX XXXXX',
        sampleOffer: '⚡ સ્પ્લિટ એસી જેટ સર્વિસ @ ₹૪૯૯',
        sampleProducts: [
          { name: 'સ્પ્લિટ એસી જેટ સર્વિસ', price: '₹૪૯૯', tag: '૩૦ દિવસ ગેરેન્ટી' },
          { name: 'ઇન્વર્ટર બેટરી વાયરિંગ', price: '₹૩૫૦', tag: 'તે જ દિવસે' },
          { name: 'ઇમરજન્સી ફ્યુઝ રિપેરિંગ', price: '₹૨૦૦', tag: '૩૦ મિનિટમાં' },
        ],
        liveActivity: '🟢 આજે ૯ સીધા કોલ્સ આવ્યા',
      },
    },
    {
      id: 'professional',
      tabTitle: 'ક્લિનિક અને ડોક્ટર',
      tabSubtitle: 'એપોઇન્ટમેન્ટ્સ',
      tabEmoji: '🩺',
      badge: 'ડોક્ટર, સીએ અને વકીલ',
      shortTag: 'ડિજિટલ પ્રોફાઇલ',
      headline: 'સત્યાપિત ઓળખ અને સીધું બુકિંગ',
      subheadline: 'ડોક્ટર્સ, સીએ અને પ્રોફેશનલ્સ — પ્રોફાઇલ બનાવીને દર્દીઓનો વિશ્વાસ જીતો.',
      taglineBanner: 'વિશ્વાસ અને પ્રતિષ્ઠા, દરેક દર્દી સુધી',
      statBadge: '🛡️ વેરિફાઇડ પ્રોફાઇલ',
      whatYouCanDo: [
        'સમય, કન્સલ્ટેશન ફી અને ઓપીડી દિવસો બતાવો',
        'દર્દીઓ સીધા વોટ્સએપ પર સમય બુક કરી શકે',
        'ડિગ્રી અને પ્રમાણપત્રો દર્શાવો',
        'ડિજિટલ વિઝિટિંગ કાર્ડ ૧-ક્લિકમાં શેર કરો',
      ],
      preview: {
        storeName: 'ડો. વર્મા ચાઇલ્ડ ક્લિનિક',
        category: 'બાળરોગ નિષ્ણાત (MBBS, MD)',
        location: 'સિવિલ લાઇન્સ, સિટી હોસ્પિટલ પાસે',
        rating: '4.9',
        reviewCount: '૩૨૦+ દર્દીઓ',
        verifiedText: 'કાઉન્સિલ માન્યતા પ્રાપ્ત',
        actionButtonText: 'વોટ્સએપ પર બુક કરો',
        sampleOffer: '🩺 ઓપીડી: સવારે ૧૦ થી ૨ | સાંજે ૫ થી ૮:૩૦',
        sampleProducts: [
          { name: 'બાળ સ્વાસ્થ્ય સલાહ', price: '₹૪૦૦', tag: 'ઓપીડી' },
          { name: 'રસીકરણ અને ગ્રોથ ટ્રેકિંગ', price: '₹૬૦૦', tag: 'પેકેજ' },
          { name: 'ઇમરજન્સી ચેકઅપ', price: '₹૫૦૦', tag: 'ઓન-કૉલ' },
        ],
        liveActivity: '🟢 આજે ૧૪ સ્લોટ બુક થયા',
      },
    },
    {
      id: 'wholesale',
      tabTitle: 'જથ્થાબંધ અને મંડી',
      tabSubtitle: 'આખા ભારતમાં',
      tabEmoji: '🏭',
      badge: 'ઉત્પાદક અને હોલસેલર',
      shortTag: 'મોટા ઓર્ડર્સ',
      headline: 'દેશભરમાંથી મેળવો જથ્થાબંધ ઓર્ડર્સ',
      subheadline: 'ઉત્પાદક કે વિતરક — આખા દેશના રિટેલર્સ સાથે સીધા જોડાઓ.',
      taglineBanner: 'મોટા ઓર્ડર્સ, દેશભરના વેપારીઓ',
      statBadge: '📦 બલ્ક ઇન્ક્વાયરી',
      whatYouCanDo: [
        'જથ્થાબંધ કેટલોગ અને લઘુત્તમ દર શેર કરો',
        'રિટેલર્સ પાસેથી વોટ્સએપ પર પૂછપરછ મેળવો',
        'જીએસટી વેરિફાઇડ બેજથી વિશ્વાસ ઊભો કરો',
        'નવા શહેરોમાં ડીલર્સ નેટવર્ક બનાવો',
      ],
      preview: {
        storeName: 'ભારત ટેક્સટાઇલ મિલ્સ',
        category: 'ગાર્મેન્ટ્સ ઉત્પાદક',
        location: 'ટેક્સટાઇલ માર્કેટ, સુરત',
        rating: '4.9',
        reviewCount: '૫૨૦+ ડિલિવરી',
        verifiedText: 'જીએસટી અને એમએસએમઇ માન્ય',
        actionButtonText: 'જથ્થાબંધ રેટ લિસ્ટ મેળવો',
        sampleOffer: '🚛 સમગ્ર ભારતમાં ટ્રાન્સપોર્ટ ડિલિવરી',
        sampleProducts: [
          { name: 'કોટન પ્રિન્ટેડ કુર્તી (૨૦ નંગ)', price: '₹૨૨૦/નંગ', tag: 'MOQ 20' },
          { name: 'ટી-શર્ટ્સ લોટ (૫૦ નંગ)', price: '₹૧૪૦/નંગ', tag: 'MOQ 50' },
          { name: 'બાળકોના કપડાં બંડલ', price: '₹૧૮૦/નંગ', tag: 'MOQ 30' },
        ],
        liveActivity: '🟢 આજે ૫ મોટા ઓર્ડર્સ આવ્યા',
      },
    },
  ],
};

interface FeaturesProps {
  config?: {
    title?: string;
    subtitle?: string;
  };
}

export function Features({ config }: FeaturesProps) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [orderSent, setOrderSent] = useState(false);
  const [previewMode, setPreviewMode] = useState<'store' | 'whatsapp'>('store');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStandeeModal, setShowStandeeModal] = useState(false);
  const [merchantReplies, setMerchantReplies] = useState<
    Array<{ type: string; time: string; text: string }>
  >([]);

  const activePurposes = PURPOSES_MAP[language] || PURPOSES_MAP.hi || PURPOSES_MAP.en;
  const activePurpose = activePurposes[activeTab] || activePurposes[0];

  // Helper to parse numeric price from string like "₹142" or "₹1,200"
  const parsePrice = (priceStr: string) => {
    const cleaned = priceStr.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 100;
  };

  // Cart quantity updater
  const updateQuantity = (prodName: string, delta: number) => {
    setCart((prev) => {
      const currentQty = prev[prodName] || 0;
      const nextQty = Math.max(0, currentQty + delta);
      if (nextQty === 0) {
        const copy = { ...prev };
        delete copy[prodName];
        return copy;
      }
      return { ...prev, [prodName]: nextQty };
    });
  };

  // Calculate selected items, count, and total
  const selectedItemsList = activePurpose.preview.sampleProducts
    .filter((prod) => (cart[prod.name] || 0) > 0)
    .map((prod) => {
      const qty = cart[prod.name] || 0;
      const unit = parsePrice(prod.price);
      return {
        name: prod.name,
        qty,
        unitPrice: prod.price,
        itemTotal: qty * unit,
      };
    });

  const totalItemsCount = selectedItemsList.reduce((acc, item) => acc + item.qty, 0);
  const totalBillAmount = selectedItemsList.reduce((acc, item) => acc + item.itemTotal, 0);

  // If cart is empty, default total to first product's price for display
  const effectiveTotalBill =
    totalBillAmount > 0
      ? totalBillAmount
      : parsePrice(activePurpose.preview.sampleProducts[0]?.price || '150');

  // Generate WhatsApp order message string
  const generateWhatsAppMessage = () => {
    const itemsLines =
      selectedItemsList.length > 0
        ? selectedItemsList.map((item) => `• ${item.qty}x ${item.name} (${item.unitPrice})`).join('\n')
        : `• 1x ${activePurpose.preview.sampleProducts[0]?.name || 'Item'} (${activePurpose.preview.sampleProducts[0]?.price || '₹150'})`;

    return `नमस्ते ${activePurpose.preview.storeName}!\nमुझे आपकी दुकान (भारतीय बाज़ार) से ये सामान ऑर्डर करना है:\n\n${itemsLines}\n\n💰 कुल बिल: ₹${effectiveTotalBill}\n📍 पता: ${activePurpose.preview.location}\n\nकृपया ऑर्डर कन्फ़र्म करें!`;
  };

  const handleOpenRealWhatsApp = () => {
    const msg = generateWhatsAppMessage();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSimulateInMerchantPhone = () => {
    setShowOrderModal(false);
    setPreviewMode('whatsapp');
    setOrderSent(false);
  };

  const addMerchantReply = (type: string, text: string) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setMerchantReplies((prev) => [...prev, { type, time, text }]);
  };

  return (
    <section
      id="features"
      className="py-6 sm:py-12 bg-linear-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border-b border-gray-200/80 dark:border-gray-800/80 relative overflow-hidden"
    >
      {/* Decorative Ambient Aura Glows */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4 sm:mb-8"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-amber-300/80 bg-amber-50/90 dark:border-amber-700/60 dark:bg-amber-950/40 px-3.5 py-1 text-xs font-bold text-amber-900 dark:text-amber-300 mb-2.5 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t('features.badge')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-gray-950 dark:text-white leading-[1.2]">
            {t('features.title').includes('—') ? (
              <>
                <span className="block text-gray-950 dark:text-white">
                  {t('features.title').split('—')[0].trim()}
                </span>
                <span className="block mt-1 sm:mt-2 bg-linear-to-r from-amber-600 via-orange-600 to-indigo-600 dark:from-amber-400 dark:via-orange-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  {t('features.title').split('—')[1].trim()}
                </span>
              </>
            ) : (
              <span className="bg-linear-to-r from-amber-600 via-orange-600 to-indigo-600 dark:from-amber-400 dark:via-orange-400 dark:to-indigo-300 bg-clip-text text-transparent">
                {t('features.title')}
              </span>
            )}
          </h2>

          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-1 font-medium">
            {t('features.subtitle')}
          </p>
        </motion.div>

        {/* 1. Interactive Purpose Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {activePurposes.map((purpose, index) => {
            const isSelected = activeTab === index;
            const isLastOnTwoCols = index === 4;
            return (
              <button
                key={purpose.id}
                onClick={() => {
                  setActiveTab(index);
                  setOrderSent(false);
                  setMerchantReplies([]);
                  setCart({});
                }}
                className={`group relative flex flex-col items-start p-3 sm:p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  isLastOnTwoCols ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  isSelected
                    ? 'bg-linear-to-b from-gray-950 via-slate-900 to-indigo-950 text-white border-amber-400/80 shadow-lg shadow-indigo-500/20 ring-2 ring-amber-400/30 scale-[1.02]'
                    : 'bg-white dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 border-gray-200/90 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50/90 dark:hover:bg-gray-800/80 shadow-xs hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5 gap-1">
                  <span className="text-2xl sm:text-3xl shrink-0 drop-shadow-xs">{purpose.tabEmoji}</span>
                  <span
                    className={`text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
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
                    isSelected ? 'text-amber-200/90' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {purpose.shortTag}
                </span>
                {isSelected && (
                  <span className="absolute -bottom-px left-4 right-4 h-0.5 bg-linear-to-r from-amber-400 via-orange-400 to-indigo-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Interactive Feature Showcase */}
        <div className="mb-4 sm:mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePurpose.id + language}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-gray-200/90 dark:border-gray-800/90 bg-white dark:bg-gray-900/95 shadow-xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden"
            >
              {/* Top Tagline Strip with Live Mode Switcher */}
              <div className="px-4 sm:px-6 py-2.5 bg-linear-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 dark:from-amber-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-b border-gray-200/80 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2 text-xs font-semibold">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 min-w-0">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="truncate font-bold">{activePurpose.taglineBanner}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                  <span className="hidden sm:inline text-[11px] text-gray-500 font-medium">
                    {t('features.liveDemo')}
                  </span>
                  <div className="inline-flex rounded-xl p-0.5 bg-gray-200/80 dark:bg-gray-800 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('store')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        previewMode === 'store'
                          ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-300 shadow-xs'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                      }`}
                    >
                      {t('features.storeView')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('whatsapp')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        previewMode === 'whatsapp'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600'
                      }`}
                    >
                      {t('features.whatsappOrder')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8 grid gap-6 lg:grid-cols-12 items-center">
                {/* Left Column: What you can do, KPIs & Value */}
                <div className="lg:col-span-7 flex flex-col justify-between h-full">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-400/30 text-xs font-bold text-amber-800 dark:text-amber-300 mb-3">
                      <span>{activePurpose.tabEmoji}</span>
                      <span>{activePurpose.badge}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      {activePurpose.headline}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      {activePurpose.subheadline}
                    </p>

                    {/* 3 Live KPI Chips (Indian Merchant Growth) */}
                    <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-800">
                      <div className="text-center">
                        <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                          {t('features.kpi1Value')}
                        </div>
                        <div className="text-[9.5px] sm:text-[10.5px] text-gray-500 dark:text-gray-400 font-medium">
                          {t('features.kpi1Label')}
                        </div>
                      </div>
                      <div className="text-center border-x border-gray-200 dark:border-gray-700">
                        <div className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
                          {t('features.kpi2Value')}
                        </div>
                        <div className="text-[9.5px] sm:text-[10.5px] text-gray-500 dark:text-gray-400 font-medium">
                          {t('features.kpi2Label')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                          {t('features.kpi3Value')}
                        </div>
                        <div className="text-[9.5px] sm:text-[10.5px] text-gray-500 dark:text-gray-400 font-medium">
                          {t('features.kpi3Label')}
                        </div>
                      </div>
                    </div>

                    {/* What You Can Do Checklist */}
                    <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-gray-800/80">
                      <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2.5 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{t('features.keyBenefits')}</span>
                      </h4>

                      <div className="space-y-2">
                        {activePurpose.whatYouCanDo.map((item, idx) => {
                          const isStandeeItem =
                            item.toLowerCase().includes('standee') ||
                            item.toLowerCase().includes('qr') ||
                            item.toLowerCase().includes('प्रिंट');
                          return (
                            <div key={idx} className="flex items-start gap-2.5 group">
                              <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">
                                <span>{item}</span>
                                {isStandeeItem && (
                                  <button
                                    type="button"
                                    onClick={() => setShowStandeeModal(true)}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-400/50 text-[10.5px] font-bold cursor-pointer transition-all shadow-2xs hover:scale-105 active:scale-95"
                                  >
                                    <QrCode className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                    <span>{t('features.printStandee')}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="mt-5 pt-3.5 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <Link
                      href="/register/company"
                      className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.99] transition-all text-center w-full sm:w-auto"
                    >
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span>{t('features.addShop')}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/search"
                      className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold text-xs sm:text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center w-full sm:w-auto"
                    >
                      <Store className="h-4 w-4 text-indigo-500" />
                      <span>{t('features.liveShops')}</span>
                    </Link>

                    <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 text-center sm:text-left sm:ml-auto font-medium">
                      {t('features.freeNoCard')}
                    </span>
                  </div>
                </div>

                {/* Right Column: Simulated Storefront Mockup / WhatsApp Order Phone */}
                <div className="lg:col-span-5 w-full">
                  <div className="relative mx-auto max-w-sm w-full rounded-3xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-4 sm:p-5 shadow-2xl shadow-indigo-500/10 dark:shadow-black/50">
                    {previewMode === 'store' ? (
                      /* Mode A: Storefront View */
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 text-xs gap-2">
                          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white min-w-0">
                            <span className="text-xl shrink-0">{activePurpose.tabEmoji}</span>
                            <span className="truncate">{activePurpose.preview.storeName}</span>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold shrink-0">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Verified</span>
                          </span>
                        </div>

                        <div className="mt-3">
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

                        <div className="mt-3 px-3 py-2 rounded-xl bg-linear-to-r from-amber-500/15 to-orange-500/15 border border-amber-300/60 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-[11px] font-semibold leading-tight flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="truncate">{activePurpose.preview.sampleOffer}</span>
                        </div>

                        {/* Interactive Catalog with Quantity Controls */}
                        <div className="mt-3 space-y-1.5 sm:space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            <span>{t('features.catalogPreview')}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold normal-case">
                              (क्लिक करके कार्ट में जोड़ें)
                            </span>
                          </div>

                          {activePurpose.preview.sampleProducts.map((prod, idx) => {
                            const qty = cart[prod.name] || 0;
                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                                  qty > 0
                                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-xs'
                                    : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                                }`}
                              >
                                <div className="truncate mr-2 min-w-0">
                                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-[11px] truncate">
                                    {prod.name}
                                  </p>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
                                    {prod.tag}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-black text-xs text-gray-900 dark:text-white">
                                    {prod.price}
                                  </span>

                                  {qty === 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(prod.name, 1)}
                                      className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95"
                                    >
                                      <Plus className="h-3 w-3" />
                                      <span>{t('features.addToCart')}</span>
                                    </button>
                                  ) : (
                                    <div className="flex items-center rounded-lg bg-emerald-600 text-white text-[11px] font-bold overflow-hidden shadow-xs">
                                      <button
                                        type="button"
                                        onClick={() => updateQuantity(prod.name, -1)}
                                        className="px-2 py-1 hover:bg-emerald-700 transition-colors cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <span className="px-2">{qty}</span>
                                      <button
                                        type="button"
                                        onClick={() => updateQuantity(prod.name, 1)}
                                        className="px-2 py-1 hover:bg-emerald-700 transition-colors cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Cart Summary Strip */}
                        {totalItemsCount > 0 && (
                          <div className="mt-2.5 flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-fadeIn">
                            <span className="flex items-center gap-1.5">
                              <ShoppingBag className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              {totalItemsCount} {t('features.itemsSelected')}
                            </span>
                            <span>{t('features.totalAmount')}: ₹{effectiveTotalBill}</span>
                          </div>
                        )}

                        <div className="mt-3.5">
                          <button
                            type="button"
                            onClick={() => setShowOrderModal(true)}
                            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.99]"
                          >
                            <MessageCircle className="h-4 w-4 fill-white text-white" />
                            <span>
                              {totalItemsCount > 0
                                ? `${t('features.orderOnWhatsApp')} (₹${effectiveTotalBill})`
                                : activePurpose.preview.actionButtonText}
                            </span>
                          </button>
                        </div>

                        <div className="mt-2 text-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {activePurpose.preview.liveActivity}
                        </div>
                      </div>
                    ) : (
                      /* Mode B: Merchant WhatsApp Phone Simulation */
                      <div>
                        {/* WhatsApp Top Bar */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-gray-200 dark:border-gray-800 bg-[#075E54] text-white -m-4 sm:-m-5 mb-3 p-3 rounded-t-3xl">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/80 flex items-center justify-center text-sm font-bold shrink-0">
                              🛒
                            </div>
                            <div className="truncate">
                              <p className="font-bold text-xs truncate leading-snug">
                                {activePurpose.preview.storeName}
                              </p>
                              <p className="text-[9px] text-emerald-200 font-medium leading-none">
                                ● Online • WhatsApp Business
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-emerald-600/80 px-2 py-0.5 rounded-full font-bold">
                            0% Commission
                          </span>
                        </div>

                        {/* WhatsApp Message Bubbles */}
                        <div className="space-y-2 py-1 max-h-[290px] overflow-y-auto pr-1">
                          {/* Customer Incoming Order Bubble */}
                          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl rounded-tl-xs p-3 text-xs shadow-xs text-left">
                            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 dark:text-emerald-300 pb-1 mb-1 border-b border-emerald-200/60 dark:border-emerald-800/40">
                              <span>🔔 नया ऑर्डर (Bhartiyebazar Storefront)</span>
                              <span className="text-gray-400">12:42 PM</span>
                            </div>
                            <p className="text-[11px] text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                              नमस्ते भैया! मुझे आपकी दुकान से ये सामान चाहिए:
                            </p>
                            <div className="my-1.5 p-2 rounded-lg bg-white/80 dark:bg-gray-900/80 text-[10.5px] space-y-1 border border-emerald-100 dark:border-emerald-900">
                              {selectedItemsList.length > 0 ? (
                                selectedItemsList.map((item, i) => (
                                  <div key={i} className="flex justify-between font-semibold">
                                    <span>
                                      {item.qty}x {item.name}
                                    </span>
                                    <span className="font-bold">₹{item.itemTotal}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="flex justify-between font-semibold">
                                  <span>1x {activePurpose.preview.sampleProducts[0]?.name}</span>
                                  <span className="font-bold">
                                    {activePurpose.preview.sampleProducts[0]?.price}
                                  </span>
                                </div>
                              )}
                              <div className="pt-1 border-t border-gray-200/60 dark:border-gray-800 flex justify-between font-bold text-gray-900 dark:text-white">
                                <span>{t('features.totalAmount')}:</span>
                                <span className="text-emerald-600">₹{effectiveTotalBill}</span>
                              </div>
                              <div className="flex justify-between font-semibold text-gray-500 text-[9.5px]">
                                <span>डिलीवरी: {activePurpose.preview.location}</span>
                                <span className="text-emerald-600 font-bold">✓ Free</span>
                              </div>
                            </div>
                            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-between">
                              <span>✓ Bhartiyebazar Verified Order</span>
                              <span className="text-gray-400">12:43 PM ✓✓</span>
                            </div>
                          </div>

                          {/* Merchant Interactive Responses */}
                          {merchantReplies.map((reply, i) => (
                            <div
                              key={i}
                              className="bg-emerald-600 text-white rounded-2xl rounded-tr-xs p-2.5 text-xs shadow-xs ml-auto max-w-[90%] text-left animate-fadeIn"
                            >
                              <p className="text-[11px] leading-relaxed font-medium">{reply.text}</p>
                              <div className="text-[9px] text-emerald-200 text-right mt-1">
                                {reply.time} ✓✓
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Merchant Action Buttons */}
                        <div className="mt-3 space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                            व्यापारी तुरंत एक्शन लें:
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              addMerchantReply(
                                'accept',
                                'नमस्ते! आपका ऑर्डर स्वीकार कर लिया गया है। 20-25 मिनट में सामान आपके पते पर पहुँच जाएगा। धन्यवाद! 🚚'
                              )
                            }
                            className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-[1.01]"
                          >
                            <span>{t('features.acceptOrder')}</span>
                          </button>

                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                addMerchantReply(
                                  'upi',
                                  `कृपया कुल राशि ₹${effectiveTotalBill} का भुगतान इस UPI QR पर करें। UPI ID: guptastore@okhdfcbank 📲`
                                )
                              }
                              className="py-1.5 px-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <span>{t('features.sendUpi')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                addMerchantReply(
                                  'location',
                                  'भैया, कृपया अपनी लाइव लोकेशन व्हाट्सएप पर शेयर करें ताकि डिलीवरी बॉय सीधे आपके पास पहुंचे। 📍'
                                )
                              }
                              className="py-1.5 px-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <span>{t('features.askLocation')}</span>
                            </button>
                          </div>

                          {merchantReplies.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setMerchantReplies([])}
                              className="w-full text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-center py-1 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>नया ऑर्डर शुरू करें (Reset Chat)</span>
                            </button>
                          )}
                        </div>

                        <div className="mt-2.5 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                          ⚡ 100% पेमेंट सीधे आपके बैंक खाते व UPI में
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. Workable WhatsApp Order Modal */}
        <AnimatePresence>
          {showOrderModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <MessageCircle className="h-5 w-5 fill-white text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        {t('features.orderOnWhatsApp')}
                      </h4>
                      <p className="text-[11px] text-gray-500">{activePurpose.preview.storeName}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-3.5">
                  <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                    तैयार व्हाट्सएप संदेश (Order Message Preview):
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {generateWhatsAppMessage()}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={handleOpenRealWhatsApp}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>{t('features.openRealWhatsApp')} (Live Link)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateInMerchantPhone}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer transition-all"
                  >
                    <span>📱 {t('features.simulateMerchant')}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 4. Workable Printable Standee Modal */}
        <AnimatePresence>
          {showStandeeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border-2 border-amber-400 p-5 overflow-hidden text-center"
              >
                <button
                  type="button"
                  onClick={() => setShowStandeeModal(false)}
                  className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Standee Header */}
                <div className="pt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
                    🇮🇳 भारतीय बाज़ार अधिकृत व्यापारी
                  </div>
                  <h3 className="text-xl font-black text-gray-950 dark:text-white">
                    {activePurpose.preview.storeName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{activePurpose.preview.location}</p>
                </div>

                {/* Standee QR Code Frame */}
                <div className="my-4 mx-auto w-48 h-48 rounded-2xl bg-white p-3 border-4 border-amber-500 shadow-inner flex flex-col items-center justify-center">
                  <svg className="w-full h-full text-gray-900" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="5" y="5" width="28" height="28" rx="4" />
                    <rect x="9" y="9" width="20" height="20" fill="white" />
                    <rect x="13" y="13" width="12" height="12" />
                    <rect x="67" y="5" width="28" height="28" rx="4" />
                    <rect x="71" y="9" width="20" height="20" fill="white" />
                    <rect x="75" y="13" width="12" height="12" />
                    <rect x="5" y="67" width="28" height="28" rx="4" />
                    <rect x="9" y="71" width="20" height="20" fill="white" />
                    <rect x="13" y="75" width="12" height="12" />
                    <rect x="40" y="8" width="6" height="6" />
                    <rect x="52" y="8" width="6" height="6" />
                    <rect x="40" y="20" width="6" height="6" />
                    <rect x="52" y="20" width="6" height="6" />
                    <rect x="8" y="44" width="6" height="6" />
                    <rect x="20" y="44" width="6" height="6" />
                    <rect x="32" y="44" width="6" height="6" />
                    <rect x="44" y="44" width="12" height="12" rx="2" fill="#f59e0b" />
                    <rect x="62" y="44" width="6" height="6" />
                    <rect x="74" y="44" width="6" height="6" />
                    <rect x="86" y="44" width="6" height="6" />
                    <rect x="40" y="62" width="6" height="6" />
                    <rect x="52" y="62" width="6" height="6" />
                    <rect x="64" y="62" width="6" height="6" />
                    <rect x="76" y="62" width="6" height="6" />
                    <rect x="40" y="74" width="6" height="6" />
                    <rect x="52" y="74" width="6" height="6" />
                    <rect x="64" y="74" width="6" height="6" />
                    <rect x="76" y="74" width="6" height="6" />
                    <rect x="86" y="74" width="6" height="6" />
                    <rect x="40" y="86" width="6" height="6" />
                    <rect x="52" y="86" width="6" height="6" />
                    <rect x="64" y="86" width="6" height="6" />
                    <rect x="76" y="86" width="6" height="6" />
                    <rect x="86" y="86" width="6" height="6" />
                  </svg>
                </div>

                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  📱 स्कैन करें और सीधे WhatsApp पर ऑर्डर करें
                </div>
                <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  ✓ 0% कमीशन • 100% सीधी UPI पेमेंट
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-gray-950 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Printer className="h-4 w-4" />
                    <span>{t('features.standeePrintBtn')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStandeeModal(false)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {t('features.standeeClose')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 3. Pre-eminent Bhartiyebazar Merchant Growth Pledge Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-3 sm:mt-5 p-4 sm:p-6 md:p-8 rounded-3xl bg-linear-to-r from-gray-950 via-slate-900 to-indigo-950 text-white shadow-2xl relative overflow-hidden border border-amber-400/40"
        >
          {/* Subtle Tricolor Accent Glows */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] sm:text-xs font-bold mb-2.5 border border-amber-500/40">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>🇮🇳 {t('features.bannerBadge')}</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
                {t('features.bannerTitle')}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-300 max-w-xl">
                {t('features.bannerSubtitle')}
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full md:w-auto font-display">
              <Link
                href="/register/company"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-gray-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all text-center w-full sm:w-auto"
              >
                <span>{t('features.bannerAdd')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm backdrop-blur-sm border border-white/10 transition-colors text-center w-full sm:w-auto"
              >
                <span>{t('features.bannerExplore')}</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
