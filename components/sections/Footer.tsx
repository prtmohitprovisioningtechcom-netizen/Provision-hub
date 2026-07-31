'use client';

import { ILandingPageSection, SocialLinks } from '@/types';
import { cn } from '@/lib/utils';
import { WaveDivider } from '@/components/company/WaveDivider';
import { SocialIcons, hasSocialLinks } from '@/components/company/SocialIcons';
import { readField } from '@/lib/read-field';
import { ArrowUpRight } from 'lucide-react';
import { filterNavFooterItems } from '@/lib/nav-links';

interface FooterSectionProps {
  section: ILandingPageSection;
  primaryColor: string;
  companyName: string;
  phone?: string;
  email?: string;
  addressLine?: string;
  socialLinks?: SocialLinks | null;
  callUrl?: string | null;
}

function safeLandingLink(link: string | undefined, fallback: string) {
  if (!link) return fallback;
  if (
    link.startsWith('#') ||
    link.startsWith('/') ||
    link.startsWith('https://') ||
    link.startsWith('tel:') ||
    link.startsWith('mailto:')
  ) {
    return link;
  }
  return `/${link}`;
}

export function FooterSection({ 
  section, 
  primaryColor, 
  companyName,
  phone,
  email,
  addressLine,
  socialLinks,
  callUrl
}: FooterSectionProps) {
  const variant = section.designVariant || 'variant-1';
  const rawItems = (section.items || []) as Array<Record<string, string>>;
  const items = filterNavFooterItems(rawItems);

  // ---------------------------------------------------------------------------
  // Variant 1: Standard 4-Column Corporate Footer
  // ---------------------------------------------------------------------------
  if (variant === 'variant-1') {
    return (
      <footer id={section.type} className="relative text-white">
        <WaveDivider fill={primaryColor} />
        <div className="px-4 py-16 sm:px-6" style={{ backgroundColor: primaryColor }}>
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <p className="text-2xl font-black mb-4">{companyName}</p>
              {section.subtitle?.trim() && (
                <p className="text-sm leading-relaxed text-white/70 max-w-md">
                  {section.subtitle}
                </p>
              )}
              {hasSocialLinks(socialLinks) && (
                <div className="mt-8">
                  <SocialIcons links={socialLinks} tone="light" />
                </div>
              )}
            </div>
            
            {items.length > 0 && (
              <div>
                <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">
                  {section.eyebrow?.trim() || 'Quick Links'}
                </h4>
                <nav className="flex flex-col gap-3">
                  {items.map((item, itemIndex) => (
                    <a
                      key={itemIndex}
                      href={safeLandingLink(readField(item, 'link'), '/')}
                      className="text-sm text-white/70 transition hover:text-white hover:translate-x-1 flex items-center group w-fit"
                    >
                      {readField(item, 'label')}
                    </a>
                  ))}
                </nav>
              </div>
            )}
            
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">
                {section.title?.trim() || 'Contact Us'}
              </h4>
              <div className="space-y-4 text-sm text-white/75">
                {addressLine && <p className="leading-relaxed">{addressLine}</p>}
                {phone && <p>{phone}</p>}
                {email && <p>{email}</p>}
              </div>
              {section.buttonText?.trim() && callUrl && (
                <a
                  href={callUrl}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ color: primaryColor }}
                >
                  {section.buttonText}
                </a>
              )}
            </div>
          </div>
          <div className="mx-auto mt-16 max-w-7xl border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>
              {section.content?.trim() || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 2: Minimalist Centered Footer
  // ---------------------------------------------------------------------------
  if (variant === 'variant-2') {
    return (
      <footer id={section.type} className="bg-gray-50 border-t border-gray-200 py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-6">{companyName}</h2>
          {section.subtitle?.trim() && (
            <p className="text-gray-500 mb-10 max-w-2xl mx-auto text-lg">
              {section.subtitle}
            </p>
          )}
          
          {items.length > 0 && (
            <nav className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12">
              {items.map((item, itemIndex) => (
                <a
                  key={itemIndex}
                  href={safeLandingLink(readField(item, 'link'), '/')}
                  className="text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {readField(item, 'label')}
                </a>
              ))}
            </nav>
          )}

          {hasSocialLinks(socialLinks) && (
            <div className="flex justify-center mb-12">
              <SocialIcons links={socialLinks} tone="dark" />
            </div>
          )}

          <div className="border-t border-gray-200 pt-8 text-sm text-gray-400 font-medium flex flex-col md:flex-row justify-center items-center gap-2">
            {section.content?.trim() || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
          </div>
        </div>
      </footer>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 3: Modern Curved-Top Footer with Bold CTA
  // ---------------------------------------------------------------------------
  return (
    <footer id={section.type} className="relative pt-32 overflow-hidden bg-gray-900">
      <div 
        className="absolute top-0 left-0 right-0 h-48 w-[120%] -translate-x-[10%] -translate-y-1/2 rounded-[100%] bg-white"
      />
      
      <div className="relative z-10 px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          
          <div className="mb-20 flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 max-w-3xl leading-tight">
              {section.subtitle || "Ready to get started with us today?"}
            </h2>
            {section.buttonText?.trim() && callUrl && (
              <a
                href={callUrl}
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition hover:scale-105 shadow-2xl"
                style={{ backgroundColor: primaryColor }}
              >
                {section.buttonText} <ArrowUpRight className="h-5 w-5" />
              </a>
            )}
          </div>
          
          <div className="border-t border-white/10 pt-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <span className="text-2xl font-black text-white">{companyName}</span>
              <p className="mt-2 text-sm text-gray-500">
                {section.content?.trim() || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
              </p>
            </div>
            
            {items.length > 0 && (
              <nav className="flex flex-wrap justify-center lg:justify-end gap-x-8 gap-y-4">
                {items.map((item, itemIndex) => (
                  <a
                    key={itemIndex}
                    href={safeLandingLink(readField(item, 'link'), '/')}
                    className="text-sm font-medium text-gray-400 transition hover:text-white"
                  >
                    {readField(item, 'label')}
                  </a>
                ))}
              </nav>
            )}
          </div>
          
        </div>
      </div>
    </footer>
  );
}
