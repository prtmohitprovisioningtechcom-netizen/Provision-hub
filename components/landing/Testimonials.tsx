'use client';

import { motion } from 'framer-motion';
import { Star, ShieldCheck, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';

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

export function Testimonials({ config }: { config?: TestimonialsConfig }) {
  const branding = usePlatformBranding();
  const brandName = branding.logoText || 'Bhartiyebazar';

  const defaultTestimonials = [
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
  ];

  const title = config?.title || 'Bhartiya Vyapariyon Ka Bharosa';
  const items = config?.items && config.items.length > 0 ? config.items : defaultTestimonials;

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
              <span>Real Merchant Stories</span>
            </div>
            <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl tracking-tight text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Dekhiye kaise Bharat ke local vyapari Bhartiyebazar se apna vyapar badha rahe hain.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 rounded-2xl border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-bold shadow-2xs">
            <Link href="#contact">Vyapari Feedback</Link>
          </Button>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((t: any, i: number) => (
            <motion.div
              key={t.name + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-gray-900/80 backdrop-blur-xs shadow-xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-1 transition-all duration-300 rounded-3xl">
                <CardContent className="p-6 sm:p-7 flex flex-col justify-between h-full">
                  <div>
                    {/* Stars + Verified badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-1">
                        {Array.from({ length: t.rating || 5 }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified Vyapari</span>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-6 italic">
                      &ldquo;{t.content.replaceAll('TenantHub', brandName)}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <Avatar className="h-10 w-10 border border-indigo-200 dark:border-indigo-800">
                      <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white font-black text-xs">
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                        {t.name}
                      </div>
                      <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 truncate">
                        {t.role}
                      </div>
                      {t.city && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          <span>{t.city}</span>
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
