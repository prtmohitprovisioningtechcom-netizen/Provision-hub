'use client';

import { motion } from 'framer-motion';
import { Layout, Rocket, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HowItWorksConfig {
  title?: string;
  subtitle?: string;
  items?: Array<{
    step: string;
    title: string;
    description: string;
  }>;
}

export function HowItWorks({ config }: { config?: HowItWorksConfig }) {
  const defaultSteps = [
    {
      step: '01',
      title: 'Dukan Register Karein',
      description: 'Apni dukan ya company ka naam, category aur contact details dalein. Sirf 2 minute me account ready.',
      points: ['No technical skill required', 'Free 14-day full access'],
    },
    {
      step: '02',
      title: 'Theme Chunein & Details Dalein',
      description: '12+ ready-made themes me se pasandida design chunein. Apne products, services aur photos upload karein.',
      points: ['Live instant preview', 'WhatsApp click-to-chat button'],
    },
    {
      step: '03',
      title: 'Google Pe Live & Grahak Paayein',
      description: 'Aapki verified landing page live hoti hai. Local log Google search se aap tak pahuche aur orders dein.',
      points: ['Google SEO optimized', 'Shareable digital visiting card'],
    },
  ];

  const title = config?.title || 'Sirf 3 Aasan Steps Mein Dukan Online';
  const subtitle =
    config?.subtitle ||
    'Chhota vyapar ho ya bada kaam — dekhiye kaise 5 minute me aapka business ban jaata hai digital brand.';
  const items = config?.items && config.items.length > 0 ? config.items : defaultSteps;

  const getIconForStep = (index: number) => {
    if (index === 0) return <UserPlus className="h-7 w-7 text-white" />;
    if (index === 1) return <Layout className="h-7 w-7 text-white" />;
    return <Rocket className="h-7 w-7 text-white" />;
  };

  return (
    <section id="how-it-works" className="py-6 sm:py-16 bg-white dark:bg-gray-950 border-b border-gray-200/70 dark:border-gray-800/80 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-14"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 mb-3 shadow-2xs">
            <span>⚙️</span>
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl tracking-tight text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 relative">
          {items.map((step: any, i: number) => (
            <motion.div
              key={step.step + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-gray-900/50 p-6 sm:p-8 backdrop-blur-xs shadow-xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-700 shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                    {getIconForStep(i)}
                  </div>
                  <span className="text-3xl sm:text-4xl font-black text-slate-300 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {step.points && (
                <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                  {step.points.map((pt: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
