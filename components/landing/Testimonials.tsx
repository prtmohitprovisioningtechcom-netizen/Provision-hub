'use client';

import { motion } from 'framer-motion';
import { Star, ShieldCheck, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';
import { useLanguage } from '@/contexts/LanguageContext';

interface TestimonialsConfig {
  title?: string;
  items?: Array<{
    name: string;
    role: string;
    content: string;
    rating: number;
    initials: string;
    city?: string;
  }>;
}

const TESTIMONIALS_MAP = {
  en: [
    {
      name: 'Rajesh Sharma',
      role: 'Owner, Sharma Electronics & Mobile Repair',
      city: 'Delhi NCR',
      content:
        'Our shop page went live in 10 minutes on Bhartiyebazar. When nearby people search on Google, our WhatsApp link shows directly. We get 40+ new customers every month!',
      rating: 5,
      initials: 'RS',
    },
    {
      name: 'Dr. Priya Verma',
      role: 'Founder, Verma Health Clinic & Diagnostics',
      city: 'Lucknow',
      content:
        'Earlier only local neighborhood patients came. With Bhartiyebazar verified badge and landing page, our reputation spread citywide. Patients book appointments directly.',
      rating: 5,
      initials: 'PV',
    },
    {
      name: 'Amitabh Gupta',
      role: 'Gupta Kirana & Daily Needs Superstore',
      city: 'Jaipur',
      content:
        'Without any developer or coding, we listed our grocery store items and deals online. Today, every shop deserves online presence, and this platform is the best for merchants.',
      rating: 5,
      initials: 'AG',
    },
  ],
  hi: [
    {
      name: 'राजेश शर्मा',
      role: 'मालिक, शर्मा इलेक्ट्रॉनिक्स व मोबाइल रिपेयर',
      city: 'दिल्ली एनसीआर',
      content:
        'भारतीयबाज़ार पर हमारी दुकान का पेज 10 मिनट में लाइव हो गया। गूगल पर आस-पास के लोग सर्च करते हैं तो सीधा हमारा व्हाट्सएप लिंक आता है। हर महीने 40+ नए ग्राहक जुड़ रहे हैं!',
      rating: 5,
      initials: 'राश',
    },
    {
      name: 'डॉ. प्रिया वर्मा',
      role: 'संस्थापक, वर्मा हेल्थ क्लीनिक व डायग्नोस्टिक्स',
      city: 'लखनऊ',
      content:
        'पहले सिर्फ स्थानीय मोहल्ले के मरीज आते थे। भारतीयबाज़ार के सत्यापित बैज और लैंडिंग पेज से पूरे शहर में हमारा नाम फैल गया। मरीज सीधे अपॉइंटमेंट बुक कर लेते हैं।',
      rating: 5,
      initials: 'प्रिव',
    },
    {
      name: 'अमिताभ गुप्ता',
      role: 'गुप्ता किराना व डेली नीड्स सुपरस्टोर',
      city: 'जयपुर',
      content:
        'बिना किसी डेवलपर या कोडिंग के हमने अपनी किराना दुकान का सामान और ऑफर्स ऑनलाइन डाल दिए। आज के दौर में हर दुकान की शान ऑनलाइन होना ज़रूरी है, और यह प्लेटफॉर्म सबसे उत्तम है।',
      rating: 5,
      initials: 'अगु',
    },
  ],
  hinglish: [
    {
      name: 'Rajesh Sharma',
      role: 'Owner, Sharma Electronics & Mobile Repair',
      city: 'Delhi NCR',
      content:
        'Bhartiyebazar par humari shop ka page 10 minute me live ho gaya. Google pe aas-paas ke log search karte hain toh seedha humara WhatsApp link aata hai. Har mahine 40+ naye grahak jud rahe hain!',
      rating: 5,
      initials: 'RS',
    },
    {
      name: 'Dr. Priya Verma',
      role: 'Founder, Verma Health Clinic & Diagnostics',
      city: 'Lucknow',
      content:
        'Pehle sirf local mohalle ke patient aate the. Bhartiyebazar ke verified badge aur landing page se poore shehar me humara naam fail gaya. Patient seedha appointment book kar lete hain.',
      rating: 5,
      initials: 'PV',
    },
    {
      name: 'Amitabh Gupta',
      role: 'Gupta Kirana & Daily Needs Superstore',
      city: 'Jaipur',
      content:
        'Bina kisi developer ya coding ke humne apne kirana store ki list aur deals online daal di. Aaj kal har dukan ki shaan online hona zaroori hai, aur yeh platform har vyapari ke liye best hai.',
      rating: 5,
      initials: 'AG',
    },
  ],
  mr: [
    {
      name: 'राजेश शर्मा',
      role: 'मालक, शर्मा इलेक्ट्रॉनिक्स व मोबाइल दुरुस्ती',
      city: 'दिल्ली एनसीआर',
      content:
        'भारतीयबाजारवर आमचे दुकान अवघ्या १० मिनिटांत लाइव्ह झाले. गुगलवर जवळचे लोक शोधतात तेव्हा थेट आमची व्हॉट्सअॅप लिंक दिसते. दरमहा ४०+ नवीन ग्राहक जोडले जात आहेत!',
      rating: 5,
      initials: 'राश',
    },
    {
      name: 'डॉ. प्रिया वर्मा',
      role: 'संस्थापक, वर्मा क्लिनिक व डायग्नोस्टिक्स',
      city: 'लखनऊ',
      content:
        'आधी फक्त स्थानिक वस्तीतील रुग्ण यायचे. भारतीयबाजारच्या सत्यापित बॅजमुळे संपूर्ण शहरात आमची ओळख निर्माण झाली. रुग्ण थेट वेळ आरक्षित करतात.',
      rating: 5,
      initials: 'प्रिव',
    },
    {
      name: 'अमिताभ गुप्ता',
      role: 'गुप्ता किराणा व सुपरस्टोअर',
      city: 'जयपूर',
      content:
        'कोणत्याही डेव्हलपरशिवाय आम्ही किराणा मालाची यादी ऑनलाइन टाकली. आज प्रत्येक दुकानाची शान ऑनलाइन असणे आवश्यक आहे, आणि हे व्यासपीठ सर्वोत्कृष्ट आहे.',
      rating: 5,
      initials: 'अगु',
    },
  ],
  gu: [
    {
      name: 'રાજેશ શર્મા',
      role: 'માલિક, શર્મા ઇલેક્ટ્રોનિક્સ',
      city: 'દિલ્હી એનસીઆર',
      content:
        'ભારતીયબજાર પર અમારી દુકાન ૧૦ મિનિટમાં લાઇવ થઈ ગઈ. ગૂગલ પર નજીકના લોકો સર્ચ કરે ત્યારે સીધી અમારી વોટ્સએપ લિંક આવે છે. દર મહિને ૪૦+ નવા ગ્રાહકો જોડાય છે!',
      rating: 5,
      initials: 'રાશ',
    },
    {
      name: 'ડૉ. પ્રિયા વર્મા',
      role: 'સ્થાપક, વર્મા હેલ્થ ક્લિનિક',
      city: 'લખનૌ',
      content:
        'પહેલાં માત્ર લોકલ સોસાયટીના દર્દીઓ આવતા. ભારતીયબજારના વેરિફાઇડ બેજથી આખા શહેરમાં અમારું નામ થયું. દર્દીઓ સીધી એપોઇન્ટમેન્ટ બુક કરે છે.',
      rating: 5,
      initials: 'પ્રિવ',
    },
    {
      name: 'અમિતાભ ગુપ્તા',
      role: 'ગુપ્તા કરિયાણા સ્ટોર',
      city: 'જયપુર',
      content:
        'કોઈ પણ કોડિંગ વગર અમે અમારી દુકાન ઓનલાઇન મૂકી દીધી. આજે દરેક દુકાનની શાન ઓનલાઇન હોવું જરૂરી છે, અને આ પ્લેટફોર્મ દરેક વેપારી માટે શ્રેષ્ઠ છે.',
      rating: 5,
      initials: 'અગુ',
    },
  ],
};

export function Testimonials({ config }: { config?: TestimonialsConfig }) {
  const branding = usePlatformBranding();
  const brandName = branding.logoText || 'Bhartiyebazar';
  const { language, t } = useLanguage();

  const activeTestimonials = (TESTIMONIALS_MAP as any)[language] || TESTIMONIALS_MAP.en;
  const items = activeTestimonials;
  const title = t('testimonials.title');

  return (
    <section id="testimonials" className="py-6 sm:py-16 bg-linear-to-b from-slate-50/60 to-white dark:from-gray-950 dark:to-gray-900 border-b border-gray-200/70 dark:border-gray-800/80 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-5 sm:mb-14 gap-3 sm:gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50/90 px-3.5 py-1 text-xs font-bold text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300 mb-3 shadow-2xs">
              <span>⭐</span>
              <span>{t('testimonials.badge')}</span>
            </div>
            <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl tracking-tight text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('testimonials.subtitle')}
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 rounded-2xl border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-bold shadow-2xs">
            <Link href="#contact">{t('testimonials.feedbackBtn')}</Link>
          </Button>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((tItem: any, i: number) => (
            <motion.div
              key={tItem.name + i + language}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-gray-900/80 backdrop-blur-xs shadow-xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-1 transition-all duration-300 rounded-3xl">
                <CardContent className="p-6 sm:p-7 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-1">
                        {Array.from({ length: tItem.rating || 5 }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        <ShieldCheck className="h-3 w-3" />
                        <span>{t('testimonials.verifiedMerchant')}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-6 italic">
                      &ldquo;{tItem.content.replaceAll('TenantHub', brandName)}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <Avatar className="h-10 w-10 border border-indigo-200 dark:border-indigo-800">
                      <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white font-black text-xs">
                        {tItem.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                        {tItem.name}
                      </div>
                      <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 truncate">
                        {tItem.role}
                      </div>
                      {tItem.city && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          <span>{tItem.city}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
