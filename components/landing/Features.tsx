'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  Globe,
  MessageSquare,
  Palette,
  Search,
  Shield,
  Star,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FEATURE_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Globe,
  MessageSquare,
  Palette,
  Search,
  Shield,
  Star,
  Users,
  Zap,
};

interface FeatureConfig {
  title: string;
  subtitle: string;
  items: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

export function Features({ config }: { config?: FeatureConfig }) {
  const defaultItems = [
    {
      icon: 'Globe',
      title: 'Dynamic Website Builder',
      description: 'Create stunning landing pages with drag-and-drop sections. No coding required.',
    },
    {
      icon: 'BarChart3',
      title: 'Advanced Analytics',
      description: 'Track visitors, leads, and conversions with real-time analytics dashboards.',
    },
    {
      icon: 'Shield',
      title: 'Enterprise Security',
      description: 'JWT authentication, rate limiting, and XSS protection built-in.',
    },
    {
      icon: 'Zap',
      title: 'Lightning Fast',
      description: 'Optimized with Next.js server components, caching, and image optimization.',
    },
    {
      icon: 'Users',
      title: 'Lead Management',
      description: 'Capture, manage, and export leads with automated email notifications.',
    },
    {
      icon: 'Palette',
      title: 'Custom Themes',
      description: 'Customize colors, fonts, and branding to match your business identity.',
    },
    {
      icon: 'Search',
      title: 'Company Directory',
      description: 'Get discovered by customers searching by category, location, and ratings.',
    },
    {
      icon: 'MessageSquare',
      title: 'Review System',
      description: 'Collect and manage customer reviews with approval workflows.',
    },
  ];

  const title = config?.title || 'Everything You Need to Grow';
  const subtitle = config?.subtitle || 'Powerful features designed to help businesses create, manage, and scale their online presence.';
  const items = config?.items && config.items.length > 0 ? config.items : defaultItems;

  const renderIcon = (iconName: string) => {
    const IconComponent = FEATURE_ICONS[iconName] || Star;
    return <IconComponent className="h-6 w-6 text-white" />;
  };

  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900">
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
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((feature, i) => (
            <motion.div
              key={feature.title + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800/60">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600">
                    {renderIcon(feature.icon)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
