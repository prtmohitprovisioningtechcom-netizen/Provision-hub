'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FRAME_COUNT, FIRST_FRAME_SRC, frameSrc } from '@/lib/watch-frames';

const SCROLL_PX_PER_FRAME = 22;

function loadFrame(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('frame'));
    img.src = src;
  });
}

export function WatchHero({
  config,
  showTemplates = true,
}: {
  config?: {
    title?: string;
    subtitle?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
  };
  showTemplates?: boolean;
}) {
  const defaultTitle = 'Build Stunning Company Landing Pages';
  const defaultSubtitle =
    'Create beautiful, SEO-optimized landing pages for your business. Manage products, services, leads, and reviews all from one powerful dashboard.';
  const titleText = config?.title || defaultTitle;
  const subtitleText = config?.subtitle || defaultSubtitle;
  const primaryLink =
    !config?.primaryCtaLink || config.primaryCtaLink === '/register'
      ? '/register/company'
      : config.primaryCtaLink;
  const configuredSecondaryLink =
    !config?.secondaryCtaLink || config.secondaryCtaLink === '#demo'
      ? '#templates'
      : config.secondaryCtaLink;
  const secondaryLink =
    configuredSecondaryLink === '#templates' && !showTemplates
      ? '/search'
      : configuredSecondaryLink;
  const secondaryText =
    secondaryLink === '/search' && config?.secondaryCtaText === 'View Demo'
      ? 'Browse Companies'
      : config?.secondaryCtaText || 'Explore Companies';
  const titleWords = titleText.split(' ');
  const highlightText = titleWords.slice(0, 2).join(' ');
  const restText = titleWords.slice(2).join(' ');

  const trackRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLImageElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const canvas = canvasRef.current;
    if (!track || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'low';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    const frames: Array<HTMLImageElement | null> = new Array(FRAME_COUNT).fill(null);
    let shown = -1;
    let raf = 0;
    let alive = true;
    let trackHeight = track.offsetHeight;

    const sizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'low';
      }
    };

    const nearest = (i: number) => {
      if (frames[i]) return frames[i];
      for (let d = 1; d < FRAME_COUNT; d++) {
        const a = frames[i - d];
        if (a) return a;
        const b = frames[i + d];
        if (b) return b;
      }
      return null;
    };

    const paint = (img: HTMLImageElement, index: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const scale = Math.max(w / img.width, h / img.height);
      ctx.drawImage(
        img,
        (w - img.width * scale) / 2,
        (h - img.height * scale) / 2,
        img.width * scale,
        img.height * scale,
      );
      shown = index;
      if (fallbackRef.current && fallbackRef.current.style.opacity !== '0') {
        fallbackRef.current.style.opacity = '0';
      }
    };

    const sync = () => {
      raf = 0;
      if (!alive || document.hidden) return;
      const stickyChild = track.firstElementChild as HTMLElement;
      const stickyHeight = stickyChild ? stickyChild.offsetHeight : 0;
      // Use stickyHeight instead of window.innerHeight to prevent mobile address bar glitches
      const dist = trackHeight - stickyHeight - 64; 
      const progressTop = 64 - track.getBoundingClientRect().top;
      
      const p = reduced
        ? 0
        : dist <= 0
          ? 0
          : Math.min(1, Math.max(0, progressTop / (dist + 64)));
          
      const next = Math.round(p * (FRAME_COUNT - 1));
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (next === shown) return;
      const img = nearest(next);
      if (img) paint(img, next);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };

    const onResize = () => {
      trackHeight = track.offsetHeight;
      sizeCanvas();
      shown = -1;
      onScroll();
    };

    sizeCanvas();

    const boot = async () => {
      try {
        const first = await loadFrame(frameSrc(0));
        if (!alive) return;
        frames[0] = first;
        paint(first, 0);
      } catch {
        return;
      }

      let cursor = 1;
      const workers = Array.from({ length: mobile ? 3 : 5 }, async () => {
        while (alive && cursor < FRAME_COUNT) {
          const i = cursor++;
          try {
            frames[i] = await loadFrame(frameSrc(i));
          } catch {
            frames[i] = null;
          }
        }
      });
      await Promise.all(workers);
    };

    void boot();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    return () => {
      alive = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const mobileScrollDist = (FRAME_COUNT - 1) * 5; // Faster on mobile (approx 1 scroll)
  const desktopScrollDist = (FRAME_COUNT - 1) * 22; // Normal on desktop

  return (
    <>
      <style>{`
        .watch-hero-track {
          height: calc(100svh + ${mobileScrollDist}px);
        }
        @media (min-width: 768px) {
          .watch-hero-track {
            height: calc(100svh + ${desktopScrollDist}px);
          }
        }
      `}</style>
      <section
        ref={trackRef}
        className="relative watch-hero-track"
      >
        <div className="sticky top-16 flex h-[calc(100svh-4rem)] min-h-0 flex-col overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
        <div className="absolute top-1/4 left-1/4 hidden h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl sm:block" />
        <div className="absolute bottom-1/4 right-1/4 hidden h-72 w-72 rounded-full bg-purple-400/20 blur-3xl sm:block" />
        <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px origin-left scale-x-0 bg-indigo-500" ref={barRef} />

        <div className="relative z-10 mx-auto grid h-full min-h-0 w-full max-w-7xl grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-3 px-4 pt-3 pb-6 sm:gap-4 sm:px-6 sm:py-5 md:gap-6 lg:grid-cols-2 lg:grid-rows-1 lg:items-start lg:gap-8 lg:px-8 lg:py-0 lg:pt-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex min-h-0 flex-col justify-start lg:pr-8"
          >
            <div className="mb-3 inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-700 sm:mb-4 sm:px-4 sm:py-1.5 sm:text-sm dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="leading-tight">Launch your business online in minutes</span>
            </div>

            <h1 className="text-[1.45rem] font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                {highlightText}
              </span>
              {restText && (
                <>
                  <br />
                  <span className="text-gray-900 dark:text-white">{restText}</span>
                </>
              )}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:mt-4 sm:text-base md:text-lg dark:text-gray-400">
              {subtitleText}
            </p>

            <div className="mt-4 flex w-full flex-row gap-2 sm:mt-6 sm:items-center sm:gap-3 lg:mt-10">
              <Button asChild variant="gradient" className="h-10 flex-1 gap-1.5 px-2 text-[11px] sm:h-11 sm:flex-none sm:gap-2 sm:px-6 sm:text-sm">
                <Link href={primaryLink}>
                  <span>{config?.primaryCtaText || 'Start Free Trial'}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-10 flex-1 px-2 text-[11px] sm:h-11 sm:flex-none sm:px-6 sm:text-sm">
                <Link href={secondaryLink}>
                  <span>{secondaryText}</span>
                </Link>
              </Button>
            </div>

            <div className="mt-5 grid max-w-lg grid-cols-3 gap-3 sm:mt-8 sm:gap-8 lg:mt-16">
              {[
                { value: 'No-code', label: 'Easy builder' },
                { value: 'SEO-ready', label: 'Built to rank' },
                { value: 'Responsive', label: 'Every screen' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="text-base font-bold text-indigo-600 sm:text-xl lg:text-2xl dark:text-indigo-400">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-gray-500 sm:text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="flex min-h-0 items-center justify-center pt-2 pb-0 sm:py-4 lg:py-0 lg:pl-4">
            <div className="relative w-full overflow-hidden rounded-xl border-[4px] border-indigo-200 shadow-2xl sm:rounded-2xl sm:border-[6px] md:border-[8px] h-full max-h-[65vw] sm:max-h-full sm:min-h-[300px] md:min-h-[360px] lg:aspect-[16/11] lg:h-auto lg:min-h-0 dark:border-indigo-800/60">
              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full [contain:strict]"
                aria-hidden
              />
              <img
                ref={fallbackRef}
                src={FIRST_FRAME_SRC}
                alt=""
                width={800}
                height={450}
                fetchPriority="high"
                decoding="async"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
