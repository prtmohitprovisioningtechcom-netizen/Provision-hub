'use client';

import { motion } from 'framer-motion';
import { Layout, Rocket, UserPlus } from 'lucide-react';

interface HowItWorksConfig {
  title: string;
  subtitle: string;
  items: Array<{
    step: string;
    title: string;
    description: string;
  }>;
}

export function HowItWorks({ config }: { config?: HowItWorksConfig }) {
  const defaultSteps = [
    {
      step: '01',
      title: 'Register Your Company',
      description: 'Sign up with your business details, logo, and category in under 2 minutes.',
    },
    {
      step: '02',
      title: 'Customize Your Page',
      description: 'Use our website builder to edit sections, add products, services, and gallery.',
    },
    {
      step: '03',
      title: 'Go Live & Grow',
      description: 'Publish your landing page, get discovered, and start receiving leads.',
    },
  ];

  const title = config?.title || 'How It Works';
  const subtitle = config?.subtitle || 'Get your business online in three simple steps';
  const items = config?.items && config.items.length > 0 ? config.items : defaultSteps;

  const getIconForStep = (index: number) => {
    if (index === 0) return <UserPlus className="h-10 w-10 text-white" />;
    if (index === 1) return <Layout className="h-10 w-10 text-white" />;
    return <Rocket className="h-10 w-10 text-white" />;
  };

  return (
    <section id="how-it-works" className="py-24">
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

        <div className="grid gap-12 md:grid-cols-3">
          {items.map((step, i) => (
            <motion.div
              key={step.step + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              {i < items.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-indigo-500 to-purple-500" />
              )}
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                {getIconForStep(i)}
              </div>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                STEP {step.step}
              </span>
              <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-gray-600 dark:text-gray-400">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
