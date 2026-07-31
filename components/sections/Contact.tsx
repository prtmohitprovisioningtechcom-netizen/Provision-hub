'use client';

import { ILandingPageSection } from '@/types';
import { motion } from 'framer-motion';
import { SectionShell, SectionHead } from '@/components/company/SectionShell';
import { ContactForm } from '@/components/company/ContactForm';
import { toGoogleMapsEmbedUrl } from '@/lib/maps';
import { MapPin, Phone, Mail, Building, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactSectionProps {
  section: ILandingPageSection;
  primaryColor: string;
  companyId: string;
  companyName: string;
  addressLine?: string;
  phone?: string;
  email?: string;
}

const cardReveal: any = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const staggerGrid: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export function ContactSection({ 
  section, 
  primaryColor, 
  companyId, 
  companyName, 
  addressLine, 
  phone, 
  email 
}: ContactSectionProps) {
  const variant = section.designVariant || 'variant-1';
  const mapSrc = toGoogleMapsEmbedUrl(section.mapUrl || addressLine);
  const leftHeading = section.note?.trim() || companyName;
  const leftIntro = section.content?.trim() || '';

  // ---------------------------------------------------------------------------
  // Variant 1: Split Layout (Info + Map on Left, Form on Right)
  // ---------------------------------------------------------------------------
  if (variant === 'variant-1') {
    return (
      <SectionShell id={section.type} tone="soft" navy={primaryColor}>
        <SectionHead
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          accent="#f5b301"
        />
        <motion.div
          variants={staggerGrid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 lg:grid-cols-2 lg:gap-8"
        >
          <motion.div
            variants={cardReveal}
            className="flex flex-col rounded-2xl bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100 sm:p-8"
          >
            <h3 className="text-xl font-extrabold text-gray-950 sm:text-2xl">
              {leftHeading}
            </h3>
            {leftIntro && (
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{leftIntro}</p>
            )}

            <div className="mt-7 space-y-4">
              {addressLine && (
                <div className="flex gap-3 rounded-xl bg-[#f4f7fb] p-3.5 hover:bg-gray-50 transition-colors">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Address
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-gray-800">{addressLine}</p>
                  </div>
                </div>
              )}
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="flex gap-3 rounded-xl bg-[#f4f7fb] p-3.5 transition hover:bg-gray-100"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Phone className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Phone
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-gray-800">{phone}</p>
                  </div>
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex gap-3 rounded-xl bg-[#f4f7fb] p-3.5 transition hover:bg-gray-100"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Mail className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Email
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-gray-800">{email}</p>
                  </div>
                </a>
              )}
            </div>

            {mapSrc && (
              <div className="mt-8 flex-1 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200 min-h-[200px]">
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full object-cover grayscale transition duration-700 hover:grayscale-0"
                  title="Google Maps Location"
                />
              </div>
            )}
          </motion.div>

          <motion.div
            variants={cardReveal}
            className="rounded-2xl bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100 sm:p-8"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Send us a message</h3>
              <p className="mt-1 text-sm text-gray-500">We'll get back to you as soon as possible.</p>
            </div>
            <ContactForm companyId={companyId} primaryColor={primaryColor} />
          </motion.div>
        </motion.div>
      </SectionShell>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 2: Full Width Map Background with Floating Glass Card
  // ---------------------------------------------------------------------------
  if (variant === 'variant-2') {
    return (
      <section id={section.type} className="relative w-full overflow-hidden bg-gray-900 scroll-mt-24">
        {mapSrc ? (
          <div className="absolute inset-0 z-0">
            <iframe
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full object-cover opacity-60 grayscale"
              title="Google Maps Location"
            />
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-900 z-0" />
        )}
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <SectionHead
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
            accent="#f5b301"
            inverse
          />
          
          <div className="mt-16 mx-auto max-w-5xl rounded-[2rem] bg-white/10 p-4 sm:p-8 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
              
              <div className="lg:col-span-2 text-white space-y-8 p-4">
                <div>
                  <h3 className="text-2xl font-black mb-2">{leftHeading}</h3>
                  {leftIntro && <p className="text-gray-300 text-sm leading-relaxed">{leftIntro}</p>}
                </div>
                
                <div className="space-y-6">
                  {addressLine && (
                    <div className="flex items-start gap-4">
                      <div className="mt-1 rounded-full bg-white/20 p-2 backdrop-blur-md">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-sm text-gray-200">Visit Us</h4>
                        <p className="text-sm text-gray-300">{addressLine}</p>
                      </div>
                    </div>
                  )}
                  {phone && (
                     <div className="flex items-start gap-4">
                       <div className="mt-1 rounded-full bg-white/20 p-2 backdrop-blur-md">
                         <Phone className="h-4 w-4 text-white" />
                       </div>
                       <div>
                         <h4 className="font-semibold mb-1 text-sm text-gray-200">Call Us</h4>
                         <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-sm text-gray-300 hover:text-white transition-colors">{phone}</a>
                       </div>
                     </div>
                  )}
                  {email && (
                     <div className="flex items-start gap-4">
                       <div className="mt-1 rounded-full bg-white/20 p-2 backdrop-blur-md">
                         <Mail className="h-4 w-4 text-white" />
                       </div>
                       <div>
                         <h4 className="font-semibold mb-1 text-sm text-gray-200">Email Us</h4>
                         <a href={`mailto:${email}`} className="text-sm text-gray-300 hover:text-white transition-colors">{email}</a>
                       </div>
                     </div>
                  )}
                </div>
              </div>
              
              <div className="lg:col-span-3 rounded-3xl bg-white p-6 sm:p-10 shadow-xl">
                <ContactForm companyId={companyId} primaryColor={primaryColor} />
              </div>
              
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 3: Clean Corporate Grid with Large Icons
  // ---------------------------------------------------------------------------
  return (
    <SectionShell id={section.type} tone="white" navy={primaryColor}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {section.eyebrow && (
            <span className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}>
              {section.eyebrow}
            </span>
          )}
          <h2 className="text-3xl font-black text-gray-900 sm:text-5xl tracking-tight">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="mt-6 text-lg text-gray-600">
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {addressLine && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 ring-1 ring-gray-100"
            >
              <div className="h-16 w-16 rounded-2xl mb-6 flex items-center justify-center shadow-md text-white transition-transform hover:scale-110 hover:rotate-3" style={{ backgroundColor: primaryColor }}>
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Office Address</h3>
              <p className="text-gray-600">{addressLine}</p>
            </motion.div>
          )}

          {phone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 ring-1 ring-gray-100"
            >
              <div className="h-16 w-16 rounded-2xl mb-6 flex items-center justify-center shadow-md text-white transition-transform hover:scale-110 hover:rotate-3" style={{ backgroundColor: primaryColor }}>
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Phone Number</h3>
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-gray-600 hover:text-gray-900 transition-colors text-lg font-medium">
                {phone}
              </a>
            </motion.div>
          )}

          {email && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 ring-1 ring-gray-100"
            >
              <div className="h-16 w-16 rounded-2xl mb-6 flex items-center justify-center shadow-md text-white transition-transform hover:scale-110 hover:rotate-3" style={{ backgroundColor: primaryColor }}>
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Email Address</h3>
              <a href={`mailto:${email}`} className="text-gray-600 hover:text-gray-900 transition-colors text-lg font-medium">
                {email}
              </a>
            </motion.div>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-2xl ring-1 ring-gray-100"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Get In Touch</h3>
            <p className="text-gray-500 mt-2">Fill out the form below and our team will get back to you.</p>
          </div>
          <ContactForm companyId={companyId} primaryColor={primaryColor} />
        </motion.div>
      </div>
    </SectionShell>
  );
}
