'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FRAME_COUNT, FIRST_FRAME_SRC, frameSrc } from '@/lib/watch-frames';

const SCROLL_PX_PER_FRAME = 16;

type BitmapLike = ImageBitmap | HTMLImageElement;

class FrameCache {
  private order = new Map<number, BitmapLike>();
  private inflight = new Map<number, Promise<BitmapLike | null>>();
  private running = 0;
  private waiters: Array<() => void> = [];

  constructor(
    private max: number,
    private concurrency: number,
    private decodeW: number,
    private decodeH: number,
  ) {}

  nearest(i: number) {
    const hit = this.order.get(i);
    if (hit) return hit;
    let best: BitmapLike | null = null;
    let dist = Infinity;
    for (const [k, img] of this.order) {
      const d = Math.abs(k - i);
      if (d < dist) {
        dist = d;
        best = img;
      }
    }
    return best;
  }

  load(i: number) {
    const hit = this.order.get(i);
    if (hit) {
      this.order.delete(i);
      this.order.set(i, hit);
      return Promise.resolve(hit);
    }
    const pending = this.inflight.get(i);
    if (pending) return pending;
    const task = this.run(i);
    this.inflight.set(i, task);
    return task;
  }

  prefetch(from: number, dir: 1 | -1, step: number, count: number) {
    for (let n = 1; n <= count; n++) {
      const i = from + dir * n * step;
      if (i < 0 || i >= FRAME_COUNT) break;
      if (!this.order.has(i) && !this.inflight.has(i)) void this.load(i);
    }
  }

  destroy() {
    for (const img of this.order.values()) {
      if ('close' in img) img.close();
    }
    this.order.clear();
    this.inflight.clear();
    this.waiters = [];
  }

  private async acquire() {
    while (this.running >= this.concurrency) {
      await new Promise<void>((r) => this.waiters.push(r));
    }
    this.running++;
  }

  private release() {
    this.running--;
    this.waiters.shift()?.();
  }

  private async run(i: number) {
    await this.acquire();
    try {
      const cached = this.order.get(i);
      if (cached) return cached;
      const res = await fetch(frameSrc(i), { cache: 'force-cache' });
      if (!res.ok) return null;
      const blob = await res.blob();
      const bmp =
        typeof createImageBitmap === 'function'
          ? await createImageBitmap(blob, {
              resizeWidth: this.decodeW,
              resizeHeight: this.decodeH,
              resizeQuality: 'low',
            })
          : await blobToImage(blob);
      while (this.order.size >= this.max) {
        const oldest = this.order.keys().next().value;
        if (oldest === undefined || oldest === i) break;
        const img = this.order.get(oldest);
        this.order.delete(oldest);
        if (img && 'close' in img) img.close();
      }
      this.order.set(i, bmp);
      return bmp;
    } catch {
      return null;
    } finally {
      this.inflight.delete(i);
      this.release();
    }
  }
}


function blobToImage(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('frame decode failed'));
    };
    img.src = url;
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
    'Create beautiful, SEO-optimized landing pages for your business. Manage products, services, leads, and reviews — all from one powerful dashboard.';
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

    const mobile = window.matchMedia('(max-width: 768px)').matches;
    const saveData = Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
    );
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = saveData || mobile ? 3 : 2;
    const steps = Math.ceil(FRAME_COUNT / step);
    const prefetchCount = mobile ? 3 : 4;
    const cache = new FrameCache(
      mobile ? 10 : 14,
      mobile ? 2 : 3,
      mobile ? 640 : 960,
      mobile ? 360 : 540,
    );

    let frame = 0;
    let shown = -1;
    let requested = -1;
    let dir: 1 | -1 = 1;
    let raf = 0;
    let alive = true;
    let trackHeight = track.offsetHeight;

    const sizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'low';
      }
    };

    const paint = (img: BitmapLike, index: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const iw = img.width || 960;
      const ih = img.height || 540;
      const scale = Math.max(w / iw, h / ih);
      ctx.drawImage(img, (w - iw * scale) / 2, (h - ih * scale) / 2, iw * scale, ih * scale);
      shown = index;
      if (fallbackRef.current && fallbackRef.current.style.opacity !== '0') {
        fallbackRef.current.style.opacity = '0';
      }
    };

    const sync = () => {
      raf = 0;
      if (!alive || document.hidden) return;
      const total = trackHeight - window.innerHeight;
      const p = reduced
        ? 0
        : total <= 0
          ? 0
          : Math.min(1, Math.max(0, -track.getBoundingClientRect().top / total));
      const next = Math.min(FRAME_COUNT - 1, Math.round(p * (steps - 1)) * step);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (next === shown && next === requested) return;
      if (next !== frame) dir = next > frame ? 1 : -1;
      frame = next;
      const approx = cache.nearest(frame);
      if (approx) paint(approx, frame);
      if (requested !== frame) {
        requested = frame;
        void cache.load(frame).then((ready) => {
          if (alive && ready && frame === next) paint(ready, frame);
        });
        cache.prefetch(frame, dir, step, prefetchCount);
      }
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
    void cache.load(0).then((img) => {
      if (alive && img) paint(img, 0);
    });
    requested = 0;
    cache.prefetch(0, 1, step, prefetchCount);

    const warm = () => {
      if (alive) cache.prefetch(0, 1, step, 8);
    };
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(warm, { timeout: 900 });
    } else {
      window.setTimeout(warm, 250);
    }

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
      cache.destroy();
    };
  }, []);

  return (
    <section
      ref={trackRef}
      className="relative"
      style={{ height: `calc(100svh + ${(FRAME_COUNT - 1) * SCROLL_PX_PER_FRAME}px)` }}
    >
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] min-h-0 flex-col overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
        <div className="absolute top-1/4 left-1/4 hidden h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl sm:block" />
        <div className="absolute bottom-1/4 right-1/4 hidden h-72 w-72 rounded-full bg-purple-400/20 blur-3xl sm:block" />
        <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px origin-left scale-x-0 bg-indigo-500" ref={barRef} />

        <div className="relative z-10 mx-auto grid h-full min-h-0 w-full max-w-7xl grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-5 md:gap-6 lg:grid-cols-2 lg:grid-rows-1 lg:items-start lg:gap-8 lg:px-8 lg:py-0 lg:pt-36">
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

            <h1 className="text-[1.7rem] font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
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

            <div className="mt-4 flex w-full flex-col gap-2.5 sm:mt-6 sm:flex-row sm:items-center sm:gap-4 lg:mt-10">
              <Button asChild variant="gradient" size="lg" className="h-11 w-full gap-2 sm:h-12 sm:w-auto">
                <Link href={primaryLink}>
                  {config?.primaryCtaText || 'Start Free Trial'}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 w-full sm:h-12 sm:w-auto">
                <Link href={secondaryLink}>{secondaryText}</Link>
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

          <div className="flex min-h-0 items-stretch justify-center lg:pl-4">
            <div className="relative h-full min-h-[230px] w-full overflow-hidden rounded-xl border-2 border-indigo-300 shadow-[0_16px_40px_rgba(79,70,229,0.16)] ring-1 ring-indigo-100 sm:min-h-[290px] sm:rounded-2xl sm:border-4 sm:ring-2 md:min-h-[330px] lg:aspect-[16/11] lg:h-auto lg:min-h-0 dark:border-indigo-700 dark:ring-indigo-900">
              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full [contain:strict]"
                aria-hidden
              />
              <img
                ref={fallbackRef}
                src={FIRST_FRAME_SRC}
                alt=""
                width={1280}
                height={720}
                fetchPriority="high"
                decoding="async"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
