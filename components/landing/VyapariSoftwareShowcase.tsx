'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Receipt,
  BookOpen,
  Sparkles,
  LogIn,
  UserPlus,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { VYAPARI_SW_TEXT } from '@/lib/vyapari-software-i18n';

export function VyapariSoftwareShowcase() {
  const { language } = useLanguage();
  const txt = VYAPARI_SW_TEXT[language] || VYAPARI_SW_TEXT.hinglish;

  const cards = [
    {
      id: 'billing',
      badge: txt.sw1Badge,
      title: txt.sw1Title,
      shortDesc: txt.sw1Short,
      image: '/billing-software-preview.jpg',
      pills: [txt.sw1Pill1, txt.sw1Pill2, txt.sw1Pill3],
      accentBorder: 'border-indigo-200/90 dark:border-indigo-900/80 hover:border-indigo-500',
      badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
      primaryBtnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
      icon: Receipt,
    },
    {
      id: 'khata',
      badge: txt.sw2Badge,
      title: txt.sw2Title,
      shortDesc: txt.sw2Short,
      image: '/khata-software-preview.jpg',
      pills: [txt.sw2Pill1, txt.sw2Pill2, txt.sw2Pill3],
      accentBorder: 'border-emerald-200/90 dark:border-emerald-900/80 hover:border-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      primaryBtnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
      icon: BookOpen,
      registerUrl: '/vyapari-software?mode=register&tool=khata',
      loginUrl: '/vyapari-software?mode=login&tool=khata',
    },
    {
      id: 'school',
      badge: '🎓 School ERP • 3 Marksheet Designs',
      title: 'School Management Software',
      shortDesc: 'Complete digital campus ERP: fees & receipts, 3-design marksheet generator with QR verification, and parent portal.',
      image: '/billing-software-preview.jpg',
      pills: ['3 Marksheet Designs', 'Fees & Receipts', 'Parent Portal'],
      accentBorder: 'border-purple-200/90 dark:border-purple-900/80 hover:border-purple-500',
      badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      primaryBtnBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20',
      icon: GraduationCap,
      registerUrl: '/school-management-software/register',
      loginUrl: '/school-management-software/login',
    },
  ];

  return (
    <section
      id="vyapari-software"
      className="py-8 sm:py-12 bg-linear-to-b from-slate-50/80 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border-b border-gray-200/80 dark:border-gray-800/80 relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/60 px-3 py-1 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 mb-2 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{txt.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              {txt.sectionTitle}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {txt.sectionSub}
            </p>
          </div>

          <Button
            asChild
            className="rounded-2xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm h-10 px-5 shadow-md shrink-0 w-fit"
          >
            <Link href="/vyapari-software?mode=login">
              <span>{txt.openSwBtn}</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* 3 Visual Software Cards with Minimal Text + Register / Login Buttons */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className={`group rounded-3xl border-2 bg-white dark:bg-gray-900 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${card.accentBorder}`}
            >
              {/* Visual Software Preview Image */}
              <div>
                <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-black uppercase shadow-sm ${card.badgeBg}`}>
                      {card.badge}
                    </span>
                  </div>
                </div>

                {/* Compact Title, 1-Line Summary & 3 Visual Feature Pills */}
                <div className="p-5 sm:p-6 pb-4">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-2">
                    {card.shortDesc}
                  </p>

                  {/* 3 Short Visual Feature Pills */}
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {card.pills.map((pill) => (
                      <span
                        key={pill}
                        className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-gray-800 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 border border-slate-200/80 dark:border-gray-700"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Register & Login (Opens Separate Dedicated Software Page) */}
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2 flex flex-wrap items-center gap-2.5">
                <Button
                  asChild
                  className={`flex-1 h-10 sm:h-11 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md ${card.primaryBtnBg}`}
                >
                  <Link href={card.registerUrl || `/vyapari-software?mode=register&tool=${card.id}`}>
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    {txt.registerBtn}
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="flex-1 h-10 sm:h-11 rounded-2xl font-extrabold text-xs sm:text-sm border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Link href={card.loginUrl || `/vyapari-software?mode=login&tool=${card.id}`}>
                    <LogIn className="h-4 w-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                    {txt.loginBtn}
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
