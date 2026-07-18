'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const templates = [
  { name: 'Modern Business', category: 'Corporate', color: 'from-blue-500 to-cyan-500' },
  { name: 'Creative Agency', category: 'Agency', color: 'from-purple-500 to-pink-500' },
  { name: 'Restaurant', category: 'Food', color: 'from-orange-500 to-red-500' },
  { name: 'Tech Startup', category: 'Technology', color: 'from-indigo-500 to-violet-500' },
  { name: 'Healthcare', category: 'Medical', color: 'from-green-500 to-teal-500' },
  { name: 'Real Estate', category: 'Property', color: 'from-amber-500 to-orange-500' },
];

export function Templates() {
  return (
    <section id="templates" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 dark:text-white">
            Beautiful Templates
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Choose from professionally designed templates for every industry
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, i) => (
            <motion.div
              key={template.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className="overflow-hidden group cursor-pointer">
                <div className={`h-48 bg-linear-to-br ${template.color} relative`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Button
                      asChild
                      variant="secondary"
                      className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Link href="/search">View live pages</Link>
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.category}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/register/company">
            <Button variant="gradient" size="lg">
              Start Building with Templates
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
