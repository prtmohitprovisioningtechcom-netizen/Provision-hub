'use client';

import Image, { type ImageProps } from 'next/image';
import { shouldSkipImageOptimization } from '@/lib/images';

/**
 * next/image that skips optimization for Mongo-backed `/api/media` URLs
 * (optimizer often fails on dynamic binary API responses).
 */
export function SafeImage({ unoptimized, src, ...props }: ImageProps) {
  const skip =
    typeof src === 'string' ? shouldSkipImageOptimization(src) : false;

  return <Image src={src} unoptimized={unoptimized ?? skip} {...props} />;
}
