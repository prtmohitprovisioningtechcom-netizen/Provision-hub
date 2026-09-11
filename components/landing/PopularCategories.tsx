'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, ArrowRight } from 'lucide-react';

interface CategoryItem {
  name: string;
  icon: string;
  href: string;
  count?: string;
}

const POPULAR_CATEGORIES: CategoryItem[] = [
  {
    name: 'Medical Store',
    icon: '💊',
    href: '/search?query=Medical%20Store',
  },
  {
    name: 'Doctor',
    icon: '🩺',
    href: '/search?query=Doctor',
  },
  {
    name: 'Hospital',
    icon: '🏥',
    href: '/search?query=Hospital',
  },
  {
    name: 'Lawyer',
    icon: '⚖️',
    href: '/search?query=Lawyer',
  },
  {
    name: 'Hotel',
    icon: '🏨',
    href: '/search?query=Hotel',
  },
  {
    name: 'Grocery',
    icon: '🛒',
    href: '/search?query=Grocery',
  },
  {
    name: 'Electrician',
    icon: '⚡',
    href: '/search?query=Electrician',
  },
  {
    name: 'Mobile Repair',
    icon: '📱',
    href: '/search?query=Mobile%20Repair',
  },
  {
    name: 'Computer Repair',
    icon: '💻',
    href: '/search?query=Computer%20Repair',
  },
  {
    name: 'Beauty Parlour',
    icon: '✂️',
    href: '/search?query=Beauty%20Parlour',
  },
  {
    name: 'Coaching',
    icon: '📚',
    href: '/search?query=Coaching',
  },
  {
    name: 'School',
    icon: '🏫',
    href: '/search?query=School',
  },
];

export function PopularCategories() {
  return (
    <section className="relative py-12 sm:py-16 bg-gray-50/50 dark:bg-gray-950/50 border-b border-gray-100 dark:border-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Title & All Services button */}
        <div className="mb-6 sm:mb-8 flex flex-col items-start gap-3">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
          >
            Popular Categories
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 shadow-2xs hover:bg-gray-50 dark:hover:bg-gray-850 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 active:scale-95"
            >
              <Menu className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span>All Services</span>
            </Link>
          </motion.div>
        </div>

        {/* Categories Grid (2 rows of 6 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4.5">
          {POPULAR_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.03 }}
            >
              <Link
                href={category.href}
                className="group flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800/80 hover:-translate-y-1.5 transition-all duration-300 text-center h-full"
              >
                <span className="text-3xl sm:text-4xl select-none transition-transform duration-300 group-hover:scale-115">
                  {category.icon}
                </span>
                <span className="mt-3 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight line-clamp-1">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
