'use client';

import { useLanguage } from '@/contexts/LanguageContext';

const TICKER_ITEMS_MAP = {
  en: [
    { text: "India's #1 Verified Merchant & Business Network", emoji: '✨', highlight: true },
    { text: 'Pride of Every Shop, Identity of Every Merchant', emoji: '🏪', highlight: false },
    { text: "From Grocery to Clinics — Everyone's Digital Store", emoji: '🛒', highlight: false },
    { text: 'Electrician, Plumber & Repair Services Online', emoji: '⚡', highlight: false },
    { text: 'Direct WhatsApp Customer Orders with Zero Commission', emoji: '💬', highlight: true },
    { text: 'Rank #1 on Google Local Search', emoji: '📍', highlight: false },
    { text: '100% Verified Indian Business Platform', emoji: '🛡️', highlight: false },
    { text: 'Launch Your Business Website in 2 Minutes', emoji: '🚀', highlight: true },
  ],
  hi: [
    { text: 'छोटा हो या बड़ा काम, भारतीयबाज़ार पर हर व्यापारी का नाम', emoji: '🇮🇳', highlight: true },
    { text: 'हर दुकान की शान, हर व्यापारी का नाम', emoji: '🏪', highlight: false },
    { text: 'किराना से लेकर क्लीनिक तक सबकी डिजिटल दुकान', emoji: '🛒', highlight: false },
    { text: 'इलेक्ट्रीशियन, प्लंबर व रिपेयरिंग सर्विसेज', emoji: '⚡', highlight: false },
    { text: 'डायरेक्ट व्हाट्सएप से ग्राहक और 0% कमीशन', emoji: '💬', highlight: true },
    { text: 'गूगल लोकल सर्च में पाएं नंबर 1 रैंकिंग', emoji: '📍', highlight: false },
    { text: '100% सत्यापित भारतीय व्यापारी नेटवर्क', emoji: '🛡️', highlight: false },
    { text: 'बिना कोडिंग 2 मिनट में वेबसाइट लाइव', emoji: '🚀', highlight: true },
  ],
  hinglish: [
    { text: 'Chhota ho ya bada kaam, Bhartiyebazar par hoga har vyapari ka naam', emoji: '🇮🇳', highlight: true },
    { text: 'Har dukan ki shaan, har vyapari ka naam', emoji: '🏪', highlight: false },
    { text: 'Kirana Se Lekar Clinic Tak Sabki Digital Dukan', emoji: '🛒', highlight: false },
    { text: 'Electrician, Plumber & Mobile Repair Services', emoji: '⚡', highlight: false },
    { text: 'Direct WhatsApp Se Grahak & Local Orders', emoji: '💬', highlight: true },
    { text: 'Google Pe Local Search Me Pehle No. Par', emoji: '📍', highlight: false },
    { text: '100% Verified Bhartiya Vyapari Network', emoji: '🛡️', highlight: false },
    { text: 'Bina Coding 2 Minute Me Landing Page Live', emoji: '🚀', highlight: true },
  ],
  mr: [
    { text: 'लहान असो वा मोठा व्यवसाय, भारतीयबाजारवर प्रत्येक व्यापाऱ्याचे नाव', emoji: '🇮🇳', highlight: true },
    { text: 'प्रत्येक दुकानाची शान, प्रत्येक व्यापाऱ्याचे नाव', emoji: '🏪', highlight: false },
    { text: 'किराणा ते क्लिनिक सर्वांचे डिजिटल दुकान', emoji: '🛒', highlight: false },
    { text: 'इलेक्ट्रिशियन, प्लंबर आणि दुरुस्ती सेवा', emoji: '⚡', highlight: false },
    { text: 'थेट व्हॉट्सअॅपवरून ग्राहक आणि ०% कमिशन', emoji: '💬', highlight: true },
    { text: 'गुगल लोकल सर्चमध्ये मिळवा #१ रँकिंग', emoji: '📍', highlight: false },
    { text: '१००% सत्यापित भारतीय व्यापारी नेटवर्क', emoji: '🛡️', highlight: false },
    { text: '२ मिनिटांत वेबसाइट सुरू करा', emoji: '🚀', highlight: true },
  ],
  gu: [
    { text: 'નાનો હોય કે મોટો વેપાર, ભારતીયબજાર પર દરેક વેપારીનું નામ', emoji: '🇮🇳', highlight: true },
    { text: 'દરેક દુકાનની શાન, દરેક વેપારીનું નામ', emoji: '🏪', highlight: false },
    { text: 'કરિયાણાથી લઈને ક્લિનિક સુધી સૌની ડિજિટલ દુકાન', emoji: '🛒', highlight: false },
    { text: 'ઇલેક્ટ્રિશિયન, પ્લમ્બર અને રિપેરિંગ સેવાઓ', emoji: '⚡', highlight: false },
    { text: 'વોટ્સએપથી સીધા ગ્રાહકો અને ૦% કમિશન', emoji: '💬', highlight: true },
    { text: 'ગૂગલ લોકલ સર્ચમાં #૧ રેન્કિંગ મેળવો', emoji: '📍', highlight: false },
    { text: '૧૦૦% વેરિફાઇડ ભારતીય વેપારી નેટવર્ક', emoji: '🛡️', highlight: false },
    { text: '૨ મિનિટમાં વેબસાઇટ લાઇવ કરો', emoji: '🚀', highlight: true },
  ],
  pa: [
    { text: 'ਛੋਟਾ ਹੋਵੇ ਜਾਂ ਵੱਡਾ ਕੰਮ, ਭਾਰਤੀਯਬਾਜ਼ਾਰ ਤੇ ਹਰ ਵਪਾਰੀ ਦਾ ਨਾਮ', emoji: '🇮🇳', highlight: true },
    { text: 'ਹਰ ਦੁਕਾਨ ਦੀ ਸ਼ਾਨ, ਹਰ ਵਪਾਰੀ ਦਾ ਨਾਮ', emoji: '🏪', highlight: false },
    { text: 'ਕਰਿਆਨੇ ਤੋਂ ਲੈ ਕੇ ਕਲੀਨਿਕ ਤੱਕ ਸਭ ਦੀ ਡਿਜੀਟਲ ਦੁਕਾਨ', emoji: '🛒', highlight: false },
    { text: 'ਇਲੈਕਟ੍ਰੀਸ਼ੀਅਨ, ਪਲੰਬਰ ਅਤੇ ਮੁਰੰਮਤ ਸੇਵਾਵਾਂ', emoji: '⚡', highlight: false },
    { text: 'ਵਟਸਐਪ ਤੋਂ ਸਿੱਧੇ ਆਰਡਰ ਅਤੇ 0% ਕਮਿਸ਼ਨ', emoji: '💬', highlight: true },
    { text: 'ਗੂਗਲ ਲੋਕਲ ਸਰਚ ਵਿੱਚ #1 ਰੈਂਕਿੰਗ ਪਾਓ', emoji: '📍', highlight: false },
    { text: '100% ਪ੍ਰਮਾਣਿਤ ਭਾਰਤੀ ਵਪਾਰੀ ਨੈੱਟਵਰਕ', emoji: '🛡️', highlight: false },
    { text: '2 ਮਿੰਟਾਂ ਵਿੱਚ ਵੈੱਬਸਾਈਟ ਲਾਈਵ', emoji: '🚀', highlight: true },
  ],
  bn: [
    { text: 'ছোট হোক বা বড় কাজ, ভারতীয়বাজারে প্রতিটি ব্যবসায়ীর নাম', emoji: '🇮🇳', highlight: true },
    { text: 'প্রতিটি দোকানের শান, প্রতিটি ব্যবসায়ীর নাম', emoji: '🏪', highlight: false },
    { text: 'মুদি দোকান থেকে ক্লিনিক সবার ডিজিটাল দোকান', emoji: '🛒', highlight: false },
    { text: 'ইলেকট্রিশিয়ান, প্লাম্বার ও মেরামত পরিষেবা', emoji: '⚡', highlight: false },
    { text: 'হোয়াটসঅ্যাপ থেকে সরাসরি ক্রেতা ও ০% কমিশন', emoji: '💬', highlight: true },
    { text: 'গুগল লোকাল সার্চে #১ র‍্যাঙ্কিং পান', emoji: '📍', highlight: false },
    { text: '১০০% যাচাইকৃত ভারতীয় ব্যবসায়ী নেটওয়ার্ক', emoji: '🛡️', highlight: false },
    { text: '২ মিনিটে ওয়েবসাইট লাইভ করুন', emoji: '🚀', highlight: true },
  ],
};

export function VyapariTicker() {
  const { language } = useLanguage();
  const activeItems = TICKER_ITEMS_MAP[language] || TICKER_ITEMS_MAP.en;
  const repeatedItems = [...activeItems, ...activeItems, ...activeItems];

  return (
    <div className="relative w-full overflow-hidden border-y border-amber-300/60 dark:border-amber-800/40 bg-linear-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-indigo-950/40 py-2 sm:py-2.5 backdrop-blur-md select-none shadow-2xs">
      {/* Side gradient fade masks for smooth infinity look */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-linear-to-r from-white dark:from-gray-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-linear-to-l from-white dark:from-gray-950 to-transparent z-10" />

      <div className="flex w-max items-center animate-[marquee_45s_linear_infinite] hover:[animation-play-state:paused]">
        {repeatedItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 px-6 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap"
          >
            <span className="text-base sm:text-lg drop-shadow-xs">{item.emoji}</span>
            <span
              className={
                item.highlight
                  ? 'bg-linear-to-r from-amber-600 via-orange-600 to-indigo-600 bg-clip-text text-transparent font-black dark:from-amber-400 dark:via-orange-400 dark:to-indigo-300'
                  : 'font-bold'
              }
            >
              {item.text}
            </span>
            <span className="ml-4 text-amber-400/80 dark:text-amber-600/80 select-none">✦</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
}
