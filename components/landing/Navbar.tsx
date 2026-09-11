'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  ClipboardPlus,
  Home,
  Menu,
  Moon,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
  Zap,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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

const links = [
  { href: '#features', label: 'Features', toggle: 'showFeatures' },
  { href: '#how-it-works', label: 'How It Works', toggle: 'showHowItWorks' },
  { href: '#templates', label: 'Templates', toggle: 'showTemplates' },
  { href: '#pricing', label: 'Pricing', toggle: 'showPricing' },
] as const;

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

  const visibleLinks = links.filter(
    (link) => featureToggles?.[link.toggle] !== false,
  );
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
  const settingsLink =
    user?.role === 'super_admin'
      ? '/admin/customize'
      : user?.role === 'company_admin'
        ? '/dashboard/settings'
        : isAuthenticated
          ? '/search'
          : '/login';
  const quickLinks = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      variant: 'default' as const,
    },
    {
      href: '/post-requirement',
      label: 'Post Requirement',
      icon: ClipboardPlus,
      variant: 'accent-indigo' as const,
    },
    {
      href: '/search',
      label: 'Company Directory',
      icon: Search,
      variant: 'default' as const,
    },
    {
      href: '/search?verified=true',
      label: 'Verified Businesses',
      icon: BadgeCheck,
      variant: 'accent-emerald' as const,
    },
    {
      href: isAuthenticated ? accountLink : '/login',
      label: isAuthenticated ? accountLabel : 'Sign in',
      icon: Shield,
      variant: 'default' as const,
    },
    {
      href: '/register/company',
      label: 'Get Started',
      icon: Sparkles,
      variant: 'primary' as const,
    },
    {
      href: '/admin/login',
      label: 'Admin Sign in',
      icon: ShieldCheck,
      variant: 'accent-amber' as const,
    },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-950/95 shadow-xs"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Bigger Brand Logo */}
        <BrandLogo
          branding={config}
          className="min-w-0 shrink-0 gap-3"
          imageClassName="h-11 sm:h-13 w-auto max-w-44 sm:max-w-52 object-contain rounded-md"
          textClassName="text-xl sm:text-2xl font-black tracking-tight"
        />

        {/* Right: All Buttons Ek Side, Badi Badi Halki Se, Achi Se */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 overflow-x-auto no-scrollbar py-1">
          {quickLinks.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={cn(
                'group inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs xl:text-sm font-semibold transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 hover:-translate-y-0.5',
                link.variant === 'primary' &&
                  'bg-linear-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:from-indigo-500 hover:to-purple-500',
                link.variant === 'accent-indigo' &&
                  'border border-indigo-200/80 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100/80 hover:border-indigo-300 dark:border-indigo-800/70 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60',
                link.variant === 'accent-emerald' &&
                  'border border-emerald-200/80 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100/80 hover:border-emerald-300 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60',
                link.variant === 'accent-amber' &&
                  'border border-amber-200/80 bg-amber-50/70 text-amber-700 hover:bg-amber-100/80 hover:border-amber-300 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60',
                link.variant === 'default' &&
                  'border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-850 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-900 dark:hover:text-white',
              )}
            >
              <link.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>{link.label}</span>
            </Link>
          ))}

          {/* Theme Toggle Button right with the buttons */}
          <button
            type="button"
            onClick={toggle}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-200 shadow-2xs hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {mode === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={toggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-2xs cursor-pointer"
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-gray-200 bg-white lg:hidden dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 p-4">
              {visibleLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900"
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/search"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900"
                onClick={closeMenu}
              >
                Company Directory
              </Link>
              <Link
                href="/search?verified=true"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900"
                onClick={closeMenu}
              >
                Verified Businesses
              </Link>

              <Link
                href="/post-requirement"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                onClick={closeMenu}
              >
                Post Requirement
              </Link>
              <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
              <Link
                href={accountLink}
                className="rounded-lg bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                onClick={closeMenu}
              >
                {accountLabel}
              </Link>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900"
                onClick={closeMenu}
              >
                Sign in
              </Link>
              <Link
                href="/register/company"
                className="rounded-lg bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                onClick={closeMenu}
              >
                Register Company
              </Link>
              <Link
                href="/admin/login"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950"
                onClick={closeMenu}
              >
                <Shield className="h-4 w-4" />
                Admin Sign in
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
