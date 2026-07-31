'use client';

import { cn } from '@/lib/utils';

export function WaveDivider({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <div className={cn('pointer-events-none leading-none', flip && 'rotate-180')} aria-hidden>
      <svg viewBox="0 0 1440 64" className="block h-10 w-full md:h-14" preserveAspectRatio="none">
        <path
          fill={fill}
          d="M0,32 C240,64 480,0 720,24 C960,48 1200,64 1440,24 L1440,64 L0,64 Z"
        />
      </svg>
    </div>
  );
}
