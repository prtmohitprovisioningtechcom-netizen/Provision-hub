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
    config?.secondaryCtaText ||
    (secondaryLink === '#templates' ? 'Available Themes' : 'Browse Companies');
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

    const paint = (img: HTMLImageElement, idx: number) => {
      shown = idx;
      if (canvas.width === 0 || canvas.height === 0) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      if (!iw || !ih) return;

      const scale = Math.max(cw / iw, ch / ih);
      const nw = iw * scale;
      const nh = ih * scale;
      const ox = (cw - nw) * 0.5;
      const oy = (ch - nh) * 0.5;

      ctx.drawImage(img, ox, oy, nw, nh);
      if (fallbackRef.current) fallbackRef.current.style.opacity = '0';
    };

    const sync = () => {
      raf = 0;
      if (!alive || document.hidden) return;
      const stickyChild = track.firstElementChild as HTMLElement;
      const stickyHeight = stickyChild ? stickyChild.offsetHeight : 0;
      // Use stickyHeight instead of window.innerHeight to prevent mobile address bar glitches
      const navOffset = mobile ? 64 : 106;
      const dist = trackHeight - stickyHeight - navOffset; 
      const progressTop = navOffset - track.getBoundingClientRect().top;
      
      const p = reduced
        ? 0
        : dist <= 0
          ? 0
          : Math.min(1, Math.max(0, progressTop / (dist + navOffset)));
          
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

  const mobileScrollDist = Math.round((FRAME_COUNT - 1) * 2.5); // Fast & tight on mobile
  const desktopScrollDist = Math.round((FRAME_COUNT - 1) * 6); // Snappy scroll without huge empty gaps

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
        <div className="sticky top-16 lg:top-[106px] flex h-[calc(100svh-4rem)] lg:h-[calc(100svh-106px)] min-h-0 flex-col overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
        <div className="absolute top-1/4 left-1/4 hidden h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl sm:block" />
        <div className="absolute bottom-1/4 right-1/4 hidden h-72 w-72 rounded-full bg-purple-400/20 blur-3xl sm:block" />
        <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px origin-left scale-x-0 bg-indigo-500" ref={barRef} />

        <div className="relative z-10 mx-auto grid h-full min-h-0 w-full max-w-7xl grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-3 px-4 pt-2 pb-4 sm:gap-4 sm:px-6 sm:py-4 md:gap-6 lg:grid-cols-2 lg:grid-rows-1 lg:items-center lg:gap-8 lg:px-8 lg:py-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-0 flex-col justify-center lg:pr-6"
          >
            <div className="mb-2 inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs text-indigo-700 sm:mb-3 sm:px-3.5 sm:py-1.5 sm:text-xs font-semibold dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="leading-tight">Launch your business online in minutes</span>
            </div>

            <h1 className="text-2xl font-black leading-[1.12] tracking-tight sm:text-4xl md:text-4xl lg:text-5xl">
              <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                {highlightText}
              </span>
              {restText && (
                <>
                  {' '}
                  <span className="text-gray-900 dark:text-white">{restText}</span>
                </>
              )}
            </h1>

            <p className="mt-2.5 max-w-xl text-xs leading-relaxed text-gray-600 sm:mt-3 sm:text-sm md:text-base dark:text-gray-300 line-clamp-3 sm:line-clamp-none">
              {subtitleText}
            </p>

            {/* CTAs with clean Available Themes button */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5 sm:mt-5 sm:gap-3">
              <Button asChild variant="gradient" className="h-10 sm:h-11 rounded-2xl px-5 sm:px-6 font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 active:scale-95 transition-all">
                <Link href={primaryLink} className="inline-flex items-center gap-2">
                  <span>✨</span>
                  <span>{config?.primaryCtaText || 'Start Free Trial'}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-10 sm:h-11 rounded-2xl border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-gray-900/80 px-4 sm:px-5 font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-2xs active:scale-95 transition-all">
                <Link href={secondaryLink} className="inline-flex items-center gap-1.5">
                  <span>🎨</span>
                  <span>{secondaryText}</span>
                </Link>
              </Button>
            </div>

            {/* Premium trial & trust indicator */}
            <div className="mt-2.5 flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span>14-Day Free Trial • Premium Themes Included • No Card Needed</span>
            </div>

            {/* Feature Highlights with Premium / Theme indicators */}
            <div className="mt-3.5 sm:mt-5 grid max-w-lg grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: '12+ Themes', label: 'Available & Premium', emoji: '🎨' },
                { value: 'Live Preview', label: 'Instant No-Code Editor', emoji: '⚡' },
                { value: 'SEO Ready', label: 'Rank On Google Fast', emoji: '⭐' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-900/60 p-2 sm:p-2.5 backdrop-blur-xs shadow-2xs"
                >
                  <div className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <span>{stat.emoji}</span>
                    <span>{stat.value}</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-semibold leading-tight mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex min-h-0 items-center justify-center pt-1 pb-0 sm:py-2 lg:py-0 lg:pl-4">
            <div className="relative w-full overflow-hidden rounded-xl border-[3px] border-indigo-200 shadow-xl sm:rounded-2xl sm:border-[5px] max-h-[38vh] sm:max-h-[48vh] lg:max-h-none lg:aspect-[16/11] lg:h-auto dark:border-indigo-800/60">
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
