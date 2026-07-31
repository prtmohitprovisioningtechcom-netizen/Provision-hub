'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { ILandingPageSection } from '@/types';
import { SectionShell, cardReveal } from '@/components/company/SectionShell';
import { cn } from '@/lib/utils';

interface RatingSectionProps {
  section: ILandingPageSection;
  primaryColor: string;
  companyName?: string;
  rating?: number;
}

function readField(item: Record<string, unknown>, key: string): string {
  const value = item[key];
  return value != null ? String(value).trim() : '';
}

function safeLink(link: string | undefined, fallback: string) {
  if (!link) return fallback;
  if (
    link.startsWith('#') ||
    link.startsWith('/') ||
    link.startsWith('https://') ||
    link.startsWith('http://') ||
    link.startsWith('tel:') ||
    link.startsWith('mailto:')
  ) {
    return link;
  }
  return fallback;
}

export function RatingSection({
  section,
  primaryColor,
  companyName = '',
  rating = 0,
}: RatingSectionProps) {
  const navy = primaryColor || '#0b2a5b';
  const manualScore = Number.parseFloat(String(section.note || '').trim());
  const displayRating =
    Number.isFinite(manualScore) && manualScore > 0
      ? Math.min(5, manualScore)
      : rating > 0
        ? Number(rating)
        : 0;

  const badges = (section.items || [])
    .map((item) => ({
      label: readField(item as Record<string, unknown>, 'label'),
      link: readField(item as Record<string, unknown>, 'link'),
    }))
    .filter((item) => item.label);

  const brandName = section.title?.trim() || companyName;
  const fullStars = Math.floor(displayRating);
  const partial = Math.max(0, Math.min(1, displayRating - fullStars));

  if (!brandName && displayRating <= 0 && badges.length === 0 && !section.subtitle?.trim()) {
    return null;
  }

  return (
    <SectionShell id={section.type} tone="white" navy={navy} compact>
      <motion.div
        variants={cardReveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
          {badges.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-x-1.5">
              {badges.map((badge, index) => (
                <span key={`${badge.label}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <span className="text-sm text-gray-300" aria-hidden>
                      |
                    </span>
                  )}
                  {badge.link ? (
                    <a
                      href={safeLink(badge.link, '#')}
                      target={badge.link.startsWith('http') ? '_blank' : undefined}
                      rel={badge.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className={cn(
                        'text-xl font-bold tracking-tight sm:text-2xl',
                        /google/i.test(badge.label)
                          ? 'bg-linear-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent'
                          : /facebook/i.test(badge.label)
                            ? 'text-[#1877F2]'
                            : 'text-gray-800',
                      )}
                      style={
                        !/google|facebook/i.test(badge.label) ? { color: navy } : undefined
                      }
                    >
                      {badge.label}
                    </a>
                  ) : (
                    <span
                      className={cn(
                        'text-xl font-bold tracking-tight sm:text-2xl',
                        /google/i.test(badge.label)
                          ? 'bg-linear-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent'
                          : /facebook/i.test(badge.label)
                            ? 'text-[#1877F2]'
                            : 'text-gray-800',
                      )}
                      style={
                        !/google|facebook/i.test(badge.label) ? { color: navy } : undefined
                      }
                    >
                      {badge.label}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}

          {displayRating > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
                {displayRating.toFixed(1)}
                <span className="text-lg font-bold text-gray-500 sm:text-xl">/5</span>
              </span>
              <div className="flex items-center gap-0.5" aria-label={`${displayRating} out of 5`}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const fill =
                    star <= fullStars ? 1 : star === fullStars + 1 ? partial : 0;
                  return (
                    <span key={star} className="relative inline-block h-5 w-5 sm:h-6 sm:w-6">
                      <Star className="absolute inset-0 h-full w-full text-gray-200" />
                      <span
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${fill * 100}%` }}
                      >
                        <Star className="h-full w-full fill-[#f5b301] text-[#f5b301]" />
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {brandName && (
          <h2
            className="mt-3 text-3xl font-black uppercase tracking-wide sm:mt-4 sm:text-4xl md:text-5xl"
            style={{ color: navy }}
          >
            {brandName}
          </h2>
        )}
        {section.subtitle?.trim() && (
          <p className="mx-auto mt-1.5 max-w-2xl font-serif text-base text-gray-800 sm:mt-2 sm:text-lg">
            {section.subtitle}
          </p>
        )}
        {section.content?.trim() && (
          <p className="mx-auto mt-1 max-w-xl text-sm text-gray-500">{section.content}</p>
        )}
      </motion.div>
    </SectionShell>
  );
}
