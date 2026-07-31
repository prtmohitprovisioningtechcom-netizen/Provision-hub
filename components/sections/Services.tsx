'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { ILandingPageSection, IService } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { getServiceImage } from '@/components/themes/layouts/service-image';

interface ServicesSectionProps {
  section: ILandingPageSection;
  services: IService[];
  primaryColor: string;
}

export function ServicesSection({ section, services, primaryColor }: ServicesSectionProps) {
  const variant = section.designVariant || 'variant-1';
  
  if (!services || services.length === 0) return null;

  // Variant 1: Modern Cards with Icons
  if (variant === 'variant-1') {
    return (
      <section id="services" className="py-24 px-6 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-6 text-gray-900">{section.title}</h2>
            <p className="text-xl text-gray-500">{section.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => {
              const img = getServiceImage(service);
              return (
              <motion.div 
                key={service._id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:shadow-2xl"
              >
                {img ? (
                  <img src={img} alt={service.name} className="aspect-[16/10] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[16/10] w-full items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                    <Check className="h-10 w-10" />
                  </div>
                )}
                <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{service.name}</h3>
                <p className="text-gray-600 mb-6 line-clamp-3">{service.description}</p>
                <div className="flex justify-between items-center mt-auto pt-6 border-t border-gray-100">
                  <span className="font-black text-xl text-gray-900">{formatCurrency(service.price)}</span>
                  <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{service.duration}</span>
                </div>
                </div>
              </motion.div>
            );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Variant 2: Image-based Cards
  if (variant === 'variant-2') {
    return (
      <section id="services" className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black tracking-tight mb-4 text-gray-900">{section.title}</h2>
              <p className="text-xl text-gray-500">{section.subtitle}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <motion.div 
                key={service._id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-gray-900 text-white"
              >
                {service.gallery && service.gallery[0] ? (
                  <img src={service.gallery[0]} alt={service.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gray-800"></div>
                )}
                <div className="relative p-8 h-80 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold mb-2">{service.name}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">{formatCurrency(service.price)}</span>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" style={{ color: primaryColor }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Variant 3: Minimal List Layout
  return (
    <section id="services" className="py-24 px-6 bg-white border-y border-gray-100">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest uppercase mb-4" style={{ color: primaryColor }}>{section.subtitle}</h2>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-gray-900">{section.title}</h2>
        </div>
        <div className="space-y-8">
          {services.map((service, i) => (
            <motion.div 
              key={service._id || i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between p-6 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
            >
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{service.name}</h3>
                <p className="text-gray-500 max-w-2xl">{service.description}</p>
              </div>
              <div className="flex flex-col md:items-end gap-1 min-w-[120px]">
                <span className="text-2xl font-black text-gray-900">{formatCurrency(service.price)}</span>
                <span className="text-sm text-gray-400">{service.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
