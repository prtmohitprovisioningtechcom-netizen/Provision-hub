'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PricingConfig {
  title: string;
  subtitle: string;
  items: Array<{
    name: string;
    price: string;
    description: string;
    features: string[];
    ctaText: string;
    popular: boolean;
  }>;
}

export function Pricing({ config }: { config?: PricingConfig }) {
  const defaultPlans = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect for getting started',
      popular: false,
      ctaText: 'Get Started',
      features: ['Basic landing page', 'Subdomain included', '1 Product / Service', 'Community support'],
    },
    {
      name: 'Starter',
      price: '19',
      description: 'Great for small businesses',
      popular: false,
      ctaText: 'Get Started',
      features: ['Custom domain', '5 Products / Services', 'Basic analytics', 'Email support'],
    },
    {
      name: 'Professional',
      price: '49',
      description: 'For growing companies',
      popular: true,
      ctaText: 'Get Started',
      features: ['Unlimited products', 'Advanced analytics', 'Custom branding', 'Priority support', 'API access'],
    },
    {
      name: 'Enterprise',
      price: '99',
      description: 'For large scale operations',
      popular: false,
      ctaText: 'Contact Sales',
      features: ['Multiple users', 'White-labeling', 'Dedicated account manager', '24/7 phone support', 'Custom integrations'],
    },
  ];

  const title = config?.title || 'Simple, Transparent Pricing';
  const subtitle = config?.subtitle || 'Start free and scale as you grow';
  const items = config?.items && config.items.length > 0 ? config.items : defaultPlans;

  return (
    <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900">
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
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {items.map((plan, i) => (
            <motion.div
              key={plan.name + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`h-full relative ${plan.popular ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-500">/month</span>
                  </CardDescription>
                  <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register/company" className="block mt-6">
                    <Button
                      variant={plan.popular ? 'gradient' : 'outline'}
                      className="w-full"
                    >
                      {plan.ctaText || 'Get Started'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
