'use client';

import Link from 'next/link';
import { SafeImage as Image } from '@/components/SafeImage';
import { motion } from 'framer-motion';
import { MapPin, Star, BadgeCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, truncate } from '@/lib/utils';

interface CompanyCardData {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  category: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  description?: string;
}

interface CompanyCardProps {
  company: CompanyCardData;
  index?: number;
}

export function CompanyCard({ company, index = 0 }: CompanyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/${company.slug}`}>
        <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
          <div className="relative h-36 bg-linear-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 overflow-hidden">
            <Image
              src={company.banner || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
              alt={company.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
            <div className="absolute -bottom-6 left-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl border-2 border-white bg-white shadow-md dark:border-gray-800 dark:bg-gray-900">
                {company.logo ? (
                  <Image
                    src={company.logo}
                    alt={company.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-lg">
                    {company.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <CardContent className="pt-10 pb-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-lg truncate group-hover:text-indigo-600 transition-colors">
                  {company.name}
                </h3>
                <p className="text-sm text-indigo-600">{company.category}</p>
              </div>
              {company.isVerified && (
                <BadgeCheck className="h-5 w-5 text-blue-500 shrink-0" aria-label="Verified" />
              )}
            </div>

            {company.description && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {truncate(company.description, 100)}
              </p>
            )}

            <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Star className={cn('h-4 w-4', Number(company.rating) > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')} />
                {Number(company.rating || 0).toFixed(1)} ({company.reviewCount ?? 0})
              </span>
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-4 w-4 shrink-0" />
                {company.address.city}, {company.address.state}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
