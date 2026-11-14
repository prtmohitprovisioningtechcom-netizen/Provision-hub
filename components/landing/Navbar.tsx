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
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/landing/LanguageSwitcher';
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
  const { t } = useLanguage();

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
    { href: '/', label: t('nav.home'), emoji: '🏠', show: true },
    { href: '/school-management-software', label: 'School ERP', emoji: '🎓', show: true },
    { href: '#vyapari-software', label: 'Billing & Khata', emoji: '🧾', show: true },
    { href: '#pricing', label: t('nav.pricing'), emoji: '💳', show: featureToggles?.showPricing !== false },
    { href: '#how-it-works', label: t('nav.howItWorks'), emoji: '⚙️', show: featureToggles?.showHowItWorks !== false },
    { href: '#templates', label: t('nav.themes'), emoji: '🎨', show: featureToggles?.showTemplates !== false },
    { href: '/search', label: t('nav.directory'), emoji: '🏢', show: true },
    { href: '/search?verified=true', label: t('nav.verified'), emoji: '✅', show: true },
  ].filter((btn) => btn.show);

  // Row 2 buttons (Platform Actions & Access)
  const row2Buttons = [
    { href: '/post-requirement', label: t('nav.postRequirement'), emoji: '📝', variant: 'accent' as const },
    { href: '/register/company', label: t('nav.getStarted'), emoji: '✨', variant: 'primary' as const },
    {
      href: isAuthenticated ? accountLink : '/login',
      label: isAuthenticated ? accountLabel : t('nav.signIn'),
      emoji: '🔐',
      variant: 'default' as const,
    },
    { href: '/admin/login', label: t('nav.adminSignIn'), emoji: '🛡️', variant: 'admin' as const },
  ];

  const closeMenu = () => setIsOpen(false);

  const brandName = 'Bhartiyebazar';

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 border-b border-gray-200/90 bg-white/95 backdrop-blur-xl dark:border-gray-800/90 dark:bg-gray-950/95 shadow-2xs"
    >
      <div className="mx-auto flex min-h-16 lg:min-h-[86px] max-w-7xl items-center justify-between gap-2.5 sm:gap-4 lg:gap-6 px-3 sm:px-6 lg:px-8 py-1.5 lg:py-2">
        {/* Left: User's Brand Logo with Name & Tagline */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group select-none min-w-0">
          {config?.logoImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.logoImage}
              alt={`${brandName} Logo`}
              className="h-10 sm:h-11.5 lg:h-13 w-auto max-w-28 sm:max-w-36 lg:max-w-44 object-contain group-hover:scale-105 transition-transform shrink-0 drop-shadow-xs"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/logo-icon-transparent.png"
              alt={`${brandName} Logo`}
              className="h-10 sm:h-11.5 lg:h-13 w-auto object-contain group-hover:scale-105 transition-transform shrink-0 drop-shadow-xs"
            />
          )}
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent leading-snug truncate">
              {brandName}
            </span>
            <span className="text-[9.5px] sm:text-[10.5px] lg:text-[11.5px] font-semibold text-gray-500 dark:text-gray-400 tracking-tight leading-tight mt-0.5 truncate max-w-[130px] xs:max-w-[190px] sm:max-w-none">
              {t('hero.titleLine1')} {t('hero.titleLine2')}
            </span>
          </div>
        </Link>

        {/* Right: Two Rows of Pill Buttons (No scroll, perfectly fitted) */}
        <div className="hidden lg:flex flex-col items-start justify-center gap-1.5 xl:gap-2">
          {/* Row 1: Core Navigation Pills */}
          <div className="flex items-center gap-1 xl:gap-1.5 flex-wrap">
            {row1Buttons.map((btn) => (
              <Link
                key={btn.href}
                href={btn.href}
                className="inline-flex items-center gap-1 xl:gap-1.5 rounded-xl xl:rounded-2xl border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-gray-900 px-2 xl:px-2.5 py-1 text-xs xl:text-[13px] font-bold text-gray-800 dark:text-gray-100 shadow-2xs hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-150 active:scale-95 whitespace-nowrap shrink-0"
              >
                <span className="text-xs xl:text-sm select-none">{btn.emoji}</span>
                <span>{btn.label}</span>
              </Link>
            ))}
          </div>

          {/* Row 2: Action Buttons & Authentication + Dark/Light Theme Button + Language Switcher */}
          <div className="flex items-center gap-1 xl:gap-1.5 flex-wrap">
            {row2Buttons.map((btn) => (
              <Link
                key={btn.href}
                href={btn.href}
                className={cn(
                  'inline-flex items-center gap-1 xl:gap-1.5 rounded-xl xl:rounded-2xl px-2.5 xl:px-3 py-1 text-xs xl:text-[13px] font-bold transition-all duration-150 active:scale-95 shadow-2xs whitespace-nowrap shrink-0',
                  btn.variant === 'primary' &&
                  'border border-indigo-600 bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-xs shadow-indigo-500/25 px-3.5 xl:px-4',
                  btn.variant === 'accent' &&
                  'border border-indigo-200/90 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 hover:border-indigo-300',
                  btn.variant === 'admin' &&
                  'border border-amber-200/90 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100/80 dark:hover:bg-amber-900/60 hover:border-amber-300',
                  btn.variant === 'default' &&
                  'border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600',
                )}
              >
                <span className="text-xs xl:text-sm select-none">{btn.emoji}</span>
                <span>{btn.label}</span>
              </Link>
            ))}

            {/* Sleek Theme Toggle Icon Button on Desktop */}
            <button
              type="button"
              onClick={toggle}
              className="inline-flex h-7.5 xl:h-8 w-7.5 xl:w-8 items-center justify-center rounded-xl xl:rounded-2xl border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-2xs hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-150 active:scale-95 shrink-0 cursor-pointer"
              aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            >
              {mode === 'dark' ? (
                <Sun className="h-3.5 xl:h-4 w-3.5 xl:w-4 text-amber-400" />
              ) : (
                <Moon className="h-3.5 xl:h-4 w-3.5 xl:w-4 text-indigo-600" />
              )}
            </button>

            {/* Language Switcher in Row 2 */}
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 ml-auto lg:hidden">
          <LanguageSwitcher compact />

          <button
            type="button"
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-2xs cursor-pointer"
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
            className="h-9 w-9 rounded-xl"
            onClick={() => {
              setIsOpen((open) => !open);
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
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
              <span className="text-xs font-bold text-gray-500 uppercase px-3 pb-1">{t('nav.navigation')}</span>

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
              <span className="text-xs font-bold text-gray-500 uppercase px-3">{t('nav.quickActions')}</span>

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
                <span>{mode === 'dark' ? t('nav.switchToLight') : t('nav.switchToDark')}</span>
              </button>

              <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
              <div className="px-3 py-1.5 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">{t('nav.language')}</span>
                <LanguageSwitcher />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
