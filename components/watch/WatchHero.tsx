'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FRAME_COUNT, FIRST_FRAME_SRC, frameSrc } from '@/lib/watch-frames';

const CACHE_SIZE = 28;
const PREFETCH = 12;
const SCROLL_PX_PER_FRAME = 14;

type BitmapLike = ImageBitmap | HTMLImageElement;

class FrameCache {
  private order = new Map<number, BitmapLike>();
  private inflight = new Map<number, Promise<BitmapLike | null>>();

  getCached(i: number) {
    const hit = this.order.get(i);
    if (!hit) return null;
    this.order.delete(i);
    this.order.set(i, hit);
    return hit;
  }

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
    const cached = this.getCached(i);
    if (cached) return Promise.resolve(cached);
    const pending = this.inflight.get(i);
    if (pending) return pending;

    const task = (async () => {
      try {
        const res = await fetch(frameSrc(i), { cache: 'force-cache' });
        if (!res.ok) return null;
        const blob = await res.blob();
        const bmp =
          typeof createImageBitmap === 'function'
            ? await createImageBitmap(blob)
            : await blobToImage(blob);
        this.evict(i);
        this.order.set(i, bmp);
        return bmp;
      } catch {
        return null;
      } finally {
        this.inflight.delete(i);
      }
    })();

    this.inflight.set(i, task);
    return task;
  }

  prefetch(from: number, dir: 1 | -1, step = 1) {
    for (let n = 1; n <= PREFETCH; n++) {
      const i = from + dir * n * step;
      if (i < 0 || i >= FRAME_COUNT) break;
      if (!this.order.has(i) && !this.inflight.has(i)) void this.load(i);
    }
  }

  private evict(keep: number) {
    while (this.order.size >= CACHE_SIZE) {
      const oldest = this.order.keys().next().value;
      if (oldest === undefined || oldest === keep) break;
      const img = this.order.get(oldest);
      this.order.delete(oldest);
      if (img && 'close' in img) img.close();
    }
  }

  destroy() {
    for (const img of this.order.values()) {
      if ('close' in img) img.close();
    }
    this.order.clear();
    this.inflight.clear();
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

    const cache = new FrameCache();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = window.matchMedia('(max-width: 768px)').matches ? 2 : 1;
    const steps = Math.ceil(FRAME_COUNT / step);
    let frame = 0;
    let prevFrame = -1;
    let dir: 1 | -1 = 1;
    let raf = 0;
    let alive = true;

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(width * dpr));
      const h = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const paint = (img: BitmapLike) => {
      sizeCanvas();
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);
      const iw = 'width' in img ? img.width : 1280;
      const ih = 'height' in img ? img.height : 720;
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      if (fallbackRef.current && fallbackRef.current.style.opacity !== '0') {
        fallbackRef.current.style.opacity = '0';
      }
    };

    const progress = () => {
      const total = track.offsetHeight - window.innerHeight;
      const top = -track.getBoundingClientRect().top;
      if (total <= 0) return 0;
      return Math.min(1, Math.max(0, top / total));
    };

    const sync = () => {
      raf = 0;
      if (!alive) return;
      const p = reduced ? 0 : progress();
      const next = Math.min(FRAME_COUNT - 1, Math.round(p * (steps - 1)) * step);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (next !== frame) dir = next > frame ? 1 : -1;
      frame = next;
      const img = cache.nearest(frame);
      if (img) paint(img);
      if (frame !== prevFrame) {
        prevFrame = frame;
        void cache.load(frame).then((ready) => {
          if (alive && ready && frame === next) paint(ready);
        });
        cache.prefetch(frame, dir, step);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };

    void cache.load(0).then((img) => {
      if (alive && img) paint(img);
    });
    cache.prefetch(0, 1, step);

    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      alive = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
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
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />
        <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px origin-left scale-x-0 bg-indigo-500" ref={barRef} />

        <div className="relative z-10 mx-auto grid h-full w-full max-w-7xl grid-cols-1 grid-rows-[auto_minmax(0,1fr)] px-4 sm:px-6 lg:grid-cols-2 lg:grid-rows-1 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center py-6 lg:py-0 lg:pr-10"
          >
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              <Sparkles className="h-4 w-4" />
              Launch your business online in minutes
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
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

            <p className="mt-6 max-w-xl text-lg text-gray-600 dark:text-gray-400">
              {subtitleText}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild variant="gradient" size="lg" className="gap-2">
                <Link href={primaryLink}>
                  {config?.primaryCtaText || 'Start Free Trial'}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={secondaryLink}>{secondaryText}</Link>
              </Button>
            </div>

            <div className="mt-16 grid max-w-lg grid-cols-3 gap-8">
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
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="flex items-center py-6 lg:py-10 lg:pl-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-4 border-indigo-300 shadow-[0_24px_60px_rgba(79,70,229,0.18)] ring-2 ring-indigo-100 dark:border-indigo-700 dark:ring-indigo-900">
              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
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
