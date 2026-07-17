'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type PlatformBranding,
  usePlatformBranding,
} from '@/hooks/usePlatformBranding';

interface BrandLogoProps {
  branding?: PlatformBranding;
  href?: string;
  showText?: boolean;
  className?: string;
  imageClassName?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function BrandLogo({
  branding: initialBranding,
  href = '/',
  showText = true,
  className,
  imageClassName,
  iconClassName,
  textClassName,
}: BrandLogoProps) {
  const branding = usePlatformBranding(initialBranding);
  const name = branding.logoText || 'TenantHub';

  return (
    <Link href={href} className={cn('flex items-center gap-2', className)}>
      {branding.logoImage ? (
        // Admins may use a data URL or any hosted image, so keep this source unrestricted.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={branding.logoImage}
          alt={`${name} logo`}
          className={cn('h-9 w-auto max-w-32 object-contain', imageClassName)}
        />
      ) : (
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-600 to-purple-600',
            iconClassName,
          )}
        >
          <Building2 className="h-5 w-5 text-white" />
        </span>
      )}
      {showText && (
        <span
          className={cn(
            'text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent',
            textClassName,
          )}
        >
          {name}
        </span>
      )}
    </Link>
  );
}
