'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  ChevronDown,
  ClipboardPlus,
  Home,
  Menu,
  Moon,
  Search,
  Settings,
  Shield,
  Sun,
  X,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { mode, toggle } = useTheme();
  const { isAuthenticated, user } = useAuth();

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
    { href: '/', label: 'Home', icon: Home },
    { href: '/post-requirement', label: 'Post Requirement', icon: ClipboardPlus },
    { href: '/search', label: 'Company Directory', icon: Search },
    { href: '/search?verified=true', label: 'Verified Businesses', icon: BadgeCheck },
    { href: accountLink, label: accountLabel, icon: Settings },
    { href: '/login', label: 'Sign in', icon: Shield },
    { href: '/register/company', label: 'Get Started', icon: ClipboardPlus },
    { href: '/admin/login', label: 'Admin Sign in', icon: Shield }
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-gray-200/70 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo branding={config} className="min-w-0 shrink" />

        <div className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {visibleLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/search"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
          >
            Directory
          </Link>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {mode === 'dark' ? <Sun /> : <Moon />}
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setIsDropdownOpen((open) => !open);
                setIsOpen(false);
              }}
              aria-label="Open quick links"
              aria-expanded={isDropdownOpen}
              aria-controls="navbar-quick-links"
            >
              <span className="hidden xl:inline">Quick links</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </Button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  id="navbar-quick-links"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-950"
                >
                  {quickLinks.map((link) => (
                    <Link
                      key={`${link.href}-${link.label}`}
                      href={link.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-200 dark:hover:bg-gray-900 dark:hover:text-indigo-400"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400"
              >
                <Link href="/admin/login">
                  <Shield />
                  Admin
                </Link>
              </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => {
              setIsOpen((open) => !open);
              setIsDropdownOpen(false);
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X /> : <Menu />}
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
