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
  const defaultTitle = 'Har Dukan Ki Shaan, Har Vyapari Ka Naam';
  const defaultSubtitle =
    'Chhota vyapar ho ya bada karobaar — Bhartiyebazar par banayein apni verified digital pehchan. Google par rank karein, WhatsApp se seedhe grahak paayein, aur apne business ko banayein local brand.';
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
  
  let highlightText = '';
  let restText = '';
  if (titleText.includes(',')) {
    const parts = titleText.split(',');
    highlightText = parts[0].trim() + ',';
    restText = parts.slice(1).join(',').trim();
  } else {
    const titleWords = titleText.split(' ');
    const half = Math.ceil(titleWords.length / 2);
    highlightText = titleWords.slice(0, half).join(' ');
    restText = titleWords.slice(half).join(' ');
  }

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
            <div className="mb-2 inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-amber-300/80 bg-linear-to-r from-amber-50 to-orange-50 px-3.5 py-1.5 text-xs text-amber-900 sm:mb-3 font-semibold dark:border-amber-700/60 dark:bg-linear-to-r dark:from-amber-950/40 dark:to-orange-950/30 dark:text-amber-300 shadow-2xs font-display">
              <span className="text-sm select-none">🇮🇳</span>
              <span className="leading-tight tracking-wide font-medium">Chhota ho ya bada kaam, Bhartiyebazar par har vyapari ka naam</span>
            </div>

            <h1 className="font-display text-3xl font-black leading-[1.08] tracking-[-0.03em] sm:text-4xl md:text-5xl lg:text-[3.5rem]">
              <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-amber-600 dark:from-indigo-400 dark:via-purple-300 dark:to-amber-300 bg-clip-text text-transparent">
                {highlightText}
              </span>
              {restText && (
                <>
                  <br className="hidden sm:inline" />
                  <span className="text-gray-900 dark:text-white drop-shadow-xs"> {restText}</span>
                </>
              )}
            </h1>

            <p className="mt-3.5 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-300 font-normal tracking-[-0.01em]">
              {subtitleText}
            </p>

            {/* CTAs with clean Available Themes button */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-6 sm:gap-3.5 font-display">
              <Button asChild variant="gradient" className="h-11 sm:h-12 rounded-2xl px-6 sm:px-7 font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 active:scale-95 transition-all tracking-wide">
                <Link href={primaryLink} className="inline-flex items-center gap-2">
                  <span>✨</span>
                  <span>{config?.primaryCtaText || 'Start Free Trial'}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 sm:h-12 rounded-2xl border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-gray-900/90 px-5 sm:px-6 font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-xs active:scale-95 transition-all tracking-wide">
                <Link href={secondaryLink} className="inline-flex items-center gap-2">
                  <span>🎨</span>
                  <span>{secondaryText}</span>
                </Link>
              </Button>
            </div>

            {/* Premium trial & trust indicator */}
            <div className="mt-3 flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-tight">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <span>14-Day Free Trial • Premium Themes Included • 🇮🇳 Bharat Ke Har Vyapari Ke Liye</span>
            </div>

            {/* Feature Highlights with Premium / Theme indicators */}
            <div className="mt-4 sm:mt-6 grid max-w-lg grid-cols-3 gap-2.5 sm:gap-3.5">
              {[
                { value: '12+ Themes', label: 'Har Business Ke Liye', emoji: '🎨' },
                { value: 'Live Preview', label: 'Instant No-Code Setup', emoji: '⚡' },
                { value: 'SEO Ready', label: 'Google Pe Local Ranking', emoji: '⭐' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/80 dark:bg-gray-900/80 p-2.5 sm:p-3 backdrop-blur-md shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  <div className="font-display text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 tracking-tight">
                    <span className="text-sm select-none">{stat.emoji}</span>
                    <span>{stat.value}</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-semibold leading-tight mt-0.5 tracking-normal">
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
