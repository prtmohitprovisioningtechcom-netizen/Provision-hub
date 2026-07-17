'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TestimonialsConfig {
  title: string;
  items: Array<{
    name: string;
    role: string;
    content: string;
    rating: number;
    initials: string;
  }>;
}

export function Testimonials({ config }: { config?: TestimonialsConfig }) {
  const defaultTestimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart Inc.',
      content:
        'TenantHub transformed our online presence. We went from zero to a professional landing page in under an hour.',
      rating: 5,
      initials: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Founder, GreenLeaf Services',
      content:
        'The lead management system alone has increased our conversions by 40%. Highly recommended for any business.',
      rating: 5,
      initials: 'MC',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Director, Bloom Studio',
      content:
        'Beautiful templates, easy customization, and the analytics dashboard gives us insights we never had before.',
      rating: 5,
      initials: 'ER',
    },
  ];

  const title = config?.title || 'Loved by Businesses Worldwide';
  const items = config?.items && config.items.length > 0 ? config.items : defaultTestimonials;

  return (
    <section id="testimonials" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 dark:text-white">
            {title}
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {items.map((t, i) => (
            <motion.div
              key={t.name + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{t.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{t.name}</div>
                      <div className="text-sm text-gray-500">{t.role}</div>
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
