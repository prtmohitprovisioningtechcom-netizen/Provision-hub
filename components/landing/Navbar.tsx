'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Menu,
  Moon,
  Shield,
  Sun,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

interface NavbarProps {
  config?: {
    logoText?: string;
    logoImage?: string;
  };
  featureToggles?: {
    showFeatures?: boolean;
    showHowItWorks?: boolean;
    showTemplates?: boolean;
    showPricing?: boolean;
    showTestimonials?: boolean;
    showFAQ?: boolean;
  };
}

export function Navbar({ config, featureToggles }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mode, toggle } = useTheme();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const accountLink =
    user?.role === 'super_admin'
      ? '/admin'
      : user?.role === 'company_admin'
        ? '/dashboard'
        : '/search';
  const accountLabel =
    user?.role === 'super_admin'
      ? 'Admin Dashboard'
      : user?.role === 'company_admin'
        ? 'Dashboard'
        : 'Browse Companies';

  // Row 1 buttons (Platform Navigation) in the requested 2-tier pill design
  const row1Buttons = [
    { href: '/', label: 'Home', emoji: '🏠', show: true },
    { href: '#features', label: 'Features', emoji: '⚡', show: featureToggles?.showFeatures !== false },
    { href: '#how-it-works', label: 'How It Works', emoji: '⚙️', show: featureToggles?.showHowItWorks !== false },
    { href: '#templates', label: 'Themes', emoji: '🎨', show: featureToggles?.showTemplates !== false },
    { href: '#pricing', label: 'Pricing', emoji: '💳', show: featureToggles?.showPricing !== false },
    { href: '/search', label: 'Directory', emoji: '🏢', show: true },
    { href: '/search?verified=true', label: 'Verified', emoji: '✅', show: true },
  ].filter((btn) => btn.show);

  // Row 2 buttons (Platform Actions & Access)
  const row2Buttons = [
    { href: '/post-requirement', label: 'Post Requirement', emoji: '📝', variant: 'accent' as const },
    { href: '/register/company', label: 'Get Started', emoji: '✨', variant: 'primary' as const },
    {
      href: isAuthenticated ? accountLink : '/login',
      label: isAuthenticated ? accountLabel : 'Sign in',
      emoji: '🔐',
      variant: 'default' as const,
    },
    { href: '/admin/login', label: 'Admin Sign in', emoji: '🛡️', variant: 'admin' as const },
  ];

  const closeMenu = () => setIsOpen(false);

  const brandName = config?.logoText || siteConfig.name || 'Bhartiyebazar';

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-gray-200/90 bg-white/95 backdrop-blur-xl dark:border-gray-800/90 dark:bg-gray-950/95 shadow-2xs"
    >
      <div className="mx-auto flex h-16 lg:h-[106px] max-w-7xl items-center justify-between lg:justify-start gap-3 lg:gap-7 px-3.5 sm:px-6 lg:px-8 py-1.5 lg:py-2">
        {/* Left: User's Brand Logo with Name & Tagline */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group select-none min-w-0">
          {config?.logoImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.logoImage}
              alt={`${brandName} Logo`}
              className="h-8 sm:h-10 lg:h-13 w-auto max-w-28 sm:max-w-40 lg:max-w-48 object-contain rounded-xl sm:rounded-2xl shadow-2xs group-hover:scale-105 transition-transform shrink-0"
            />
          ) : (
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          )}
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-base sm:text-lg lg:text-xl font-black tracking-tight bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent leading-snug truncate">
              {brandName}
            </span>
            <span className="text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 dark:text-gray-400 tracking-tight leading-tight mt-0.5 truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
              Har dukan ki shaan, har vyapari ka naam
            </span>
          </div>
        </Link>

        {/* Right: Two Rows of Pill Buttons (No scroll, perfectly fitted) */}
        <div className="hidden lg:flex flex-col items-start justify-center gap-2">
          {/* Row 1: Core Navigation Pills */}
          <div className="flex items-center gap-1.5 xl:gap-2">
            {row1Buttons.map((btn) => (
              <Link
                key={btn.href}
                href={btn.href}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs xl:text-[13px] font-bold text-gray-800 dark:text-gray-100 shadow-2xs hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-150 active:scale-95 whitespace-nowrap shrink-0"
              >
                <span className="text-sm select-none">{btn.emoji}</span>
                <span>{btn.label}</span>
              </Link>
            ))}
          </div>

          {/* Row 2: Action Buttons & Authentication + Dark/Light Theme Button */}
          <div className="flex items-center gap-1.5 xl:gap-2">
            {row2Buttons.map((btn) => (
              <Link
                key={btn.href}
                href={btn.href}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-1.5 text-xs xl:text-[13px] font-bold transition-all duration-150 active:scale-95 shadow-2xs whitespace-nowrap shrink-0',
                  btn.variant === 'primary' &&
                    'border border-indigo-600 bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-xs shadow-indigo-500/25',
                  btn.variant === 'accent' &&
                    'border border-indigo-200/90 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 hover:border-indigo-300',
                  btn.variant === 'admin' &&
                    'border border-amber-200/90 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100/80 dark:hover:bg-amber-900/60 hover:border-amber-300',
                  btn.variant === 'default' &&
                    'border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600',
                )}
              >
                <span className="text-sm select-none">{btn.emoji}</span>
                <span>{btn.label}</span>
              </Link>
            ))}

            {/* Dark / Light Theme toggle button in Row 2 */}
            <button
              type="button"
              onClick={toggle}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-gray-900 px-3.5 py-1.5 text-xs xl:text-[13px] font-bold text-gray-800 dark:text-gray-100 shadow-2xs hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-150 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            >
              {mode === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-600" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 ml-auto lg:hidden">
          <button
            type="button"
            onClick={toggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-2xs cursor-pointer"
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {mode === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => {
              setIsOpen((open) => !open);
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-gray-200 bg-white lg:hidden dark:border-gray-800 dark:bg-gray-950 max-h-[85vh] overflow-y-auto"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 p-4">
              <span className="text-xs font-bold text-gray-500 uppercase px-3 pb-1">Navigation</span>

              {row1Buttons.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900"
                  onClick={closeMenu}
                >
                  <span className="text-base">{link.emoji}</span>
                  <span>{link.label}</span>
                </a>
              ))}

              <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
              <span className="text-xs font-bold text-gray-500 uppercase px-3">Quick Actions</span>

              {row2Buttons.map((btn) => (
                <Link
                  key={btn.href}
                  href={btn.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900"
                  onClick={closeMenu}
                >
                  <span className="text-base">{btn.emoji}</span>
                  <span>{btn.label}</span>
                </Link>
              ))}

              <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
              <button
                type="button"
                onClick={() => {
                  toggle();
                  closeMenu();
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900 w-full text-left cursor-pointer"
              >
                <span className="text-base">{mode === 'dark' ? '☀️' : '🌙'}</span>
                <span>{mode === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
