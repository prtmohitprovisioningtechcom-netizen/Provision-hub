'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, ArrowRight, Sparkles } from 'lucide-react';

interface CategoryItem {
  name: string;
  icon: string;
  href: string;
  badge?: string;
  gradient: string;
  borderGlow: string;
}

const POPULAR_CATEGORIES: CategoryItem[] = [
  {
    name: 'Medical Store',
    icon: '💊',
    href: '/search?query=Medical%20Store',
    badge: 'Emergency',
    gradient: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/30',
    borderGlow: 'hover:border-emerald-400/80 hover:shadow-emerald-500/15',
  },
  {
    name: 'Doctor',
    icon: '🩺',
    href: '/search?query=Doctor',
    badge: 'Verified',
    gradient: 'from-sky-500/10 to-blue-500/10 dark:from-sky-950/40 dark:to-blue-950/30',
    borderGlow: 'hover:border-sky-400/80 hover:shadow-sky-500/15',
  },
  {
    name: 'Hospital',
    icon: '🏥',
    href: '/search?query=Hospital',
    badge: '24x7',
    gradient: 'from-rose-500/10 to-red-500/10 dark:from-rose-950/40 dark:to-red-950/30',
    borderGlow: 'hover:border-rose-400/80 hover:shadow-rose-500/15',
  },
  {
    name: 'Lawyer',
    icon: '⚖️',
    href: '/search?query=Lawyer',
    badge: 'Expert',
    gradient: 'from-amber-500/10 to-orange-500/10 dark:from-amber-950/40 dark:to-orange-950/30',
    borderGlow: 'hover:border-amber-400/80 hover:shadow-amber-500/15',
  },
  {
    name: 'Hotel',
    icon: '🏨',
    href: '/search?query=Hotel',
    badge: 'Stay',
    gradient: 'from-indigo-500/10 to-violet-500/10 dark:from-indigo-950/40 dark:to-violet-950/30',
    borderGlow: 'hover:border-indigo-400/80 hover:shadow-indigo-500/15',
  },
  {
    name: 'Grocery',
    icon: '🛒',
    href: '/search?query=Grocery',
    badge: 'Daily Needs',
    gradient: 'from-lime-500/10 to-green-500/10 dark:from-lime-950/40 dark:to-green-950/30',
    borderGlow: 'hover:border-lime-400/80 hover:shadow-lime-500/15',
  },
  {
    name: 'Electrician',
    icon: '⚡',
    href: '/search?query=Electrician',
    badge: 'Fast Repair',
    gradient: 'from-yellow-500/10 to-amber-500/10 dark:from-yellow-950/40 dark:to-amber-950/30',
    borderGlow: 'hover:border-yellow-400/80 hover:shadow-yellow-500/15',
  },
  {
    name: 'Mobile Repair',
    icon: '📱',
    href: '/search?query=Mobile%20Repair',
    badge: 'Same Day',
    gradient: 'from-cyan-500/10 to-blue-500/10 dark:from-cyan-950/40 dark:to-blue-950/30',
    borderGlow: 'hover:border-cyan-400/80 hover:shadow-cyan-500/15',
  },
  {
    name: 'Computer Repair',
    icon: '💻',
    href: '/search?query=Computer%20Repair',
    badge: 'Hardware/Soft',
    gradient: 'from-purple-500/10 to-indigo-500/10 dark:from-purple-950/40 dark:to-indigo-950/30',
    borderGlow: 'hover:border-purple-400/80 hover:shadow-purple-500/15',
  },
  {
    name: 'Beauty Parlour',
    icon: '✂️',
    href: '/search?query=Beauty%20Parlour',
    badge: 'Salon & Spa',
    gradient: 'from-pink-500/10 to-rose-500/10 dark:from-pink-950/40 dark:to-rose-950/30',
    borderGlow: 'hover:border-pink-400/80 hover:shadow-pink-500/15',
  },
  {
    name: 'Coaching',
    icon: '📚',
    href: '/search?query=Coaching',
    badge: 'Classes',
    gradient: 'from-violet-500/10 to-purple-500/10 dark:from-violet-950/40 dark:to-purple-950/30',
    borderGlow: 'hover:border-violet-400/80 hover:shadow-violet-500/15',
  },
  {
    name: 'School',
    icon: '🏫',
    href: '/search?query=School',
    badge: 'Education',
    gradient: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-950/40 dark:to-indigo-950/30',
    borderGlow: 'hover:border-blue-400/80 hover:shadow-blue-500/15',
  },
];

export function PopularCategories() {
  return (
    <section className="relative pt-4 pb-6 sm:py-12 bg-linear-to-b from-white via-slate-50/70 to-white dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950 border-b border-gray-200/70 dark:border-gray-800/80 overflow-hidden">
      {/* Soft ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Title & All Services button */}
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div className="flex flex-col items-start gap-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/90 bg-indigo-50/80 dark:border-indigo-800/80 dark:bg-indigo-950/50 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Aapke Shehar Ke Vishwasniya Vyapari & Services</span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white"
            >
              Popular Categories
            </motion.h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xl">
              Har dukan ki shaan, har vyapari ka naam — Apni zaroorat ki verified service ya local dukan ek click me khojein.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <Menu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>All Services</span>
              <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
          </motion.div>
        </div>

        {/* Categories Grid (2 rows of 6 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5 md:gap-4.5">
          {POPULAR_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.025 }}
            >
              <Link
                href={category.href}
                className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xs shadow-xs hover:shadow-xl ${category.borderGlow} hover:-translate-y-1.5 transition-all duration-300 text-center h-full overflow-hidden`}
              >
                {/* Subtle top background gradient per category */}
                <div
                  className={`absolute inset-0 bg-linear-to-b ${category.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                {/* Micro badge */}
                {category.badge && (
                  <span className="relative mb-2 inline-block rounded-full bg-slate-100 dark:bg-gray-800/80 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                    {category.badge}
                  </span>
                )}

                {/* Icon with float & scale animation on hover */}
                <span className="relative text-3xl sm:text-4xl select-none transition-transform duration-300 group-hover:scale-120 group-hover:rotate-3 drop-shadow-xs">
                  {category.icon}
                </span>

                <span className="relative mt-2.5 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight line-clamp-1">
                  {category.name}
                </span>

                <span className="relative mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span>Explore</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
