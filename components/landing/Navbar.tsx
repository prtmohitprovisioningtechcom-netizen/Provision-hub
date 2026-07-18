'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/BrandLogo';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { NAV_LINKS } from '@/constants';

export function Navbar({ config }: { config?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { mode, toggle } = useTheme();
  const { isAuthenticated, user } = useAuth();

  const dashboardLink =
    user?.role === 'super_admin'
      ? '/admin'
      : user?.role === 'company_admin'
        ? '/dashboard'
        : '/search';

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl dark:bg-gray-950/80"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo branding={config} />

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors dark:text-gray-300 dark:hover:text-indigo-400"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isAuthenticated && user?.role === 'super_admin' ? (
            <Link href="/admin" className="hidden sm:block">
              <Button variant="outline" size="sm" className="gap-1.5 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          ) : (
            <Link href="/admin/login" className="hidden sm:block">
              <Button variant="outline" size="sm" className="gap-1.5 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}

          {isAuthenticated ? (
            <Link href={dashboardLink}>
              <Button variant="gradient" size="sm">
                Sign in
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register/company" className="hidden sm:block">
                <Button variant="gradient" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}

          {/* Prominent Post Requirement Button */}
          <Link href="/post-requirement" className="hidden lg:block">
            <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              Post Requirement
            </Button>
          </Link>

          {/* New Quick Links Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="gap-1.5"
            >
              Menu <ChevronDown className="h-4 w-4" />
            </Button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950 py-1 z-50"
                >
                  <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900" onClick={() => setIsDropdownOpen(false)}>Home</Link>
                  <Link href="/post-requirement" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900" onClick={() => setIsDropdownOpen(false)}>Post Your Requirements</Link>
                  <Link href="/search" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900" onClick={() => setIsDropdownOpen(false)}>Product/ Service Directory</Link>
                  <Link href="/search?verified=true" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900" onClick={() => setIsDropdownOpen(false)}>Verified Business</Link>
                  <Link href={isAuthenticated ? "/dashboard/settings" : "/login"} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900" onClick={() => setIsDropdownOpen(false)}>Settings</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
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
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
          >
            <div className="flex flex-col gap-2 p-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link
                href={user?.role === 'super_admin' ? '/admin' : '/admin/login'}
                className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
              <Link
                href="/post-requirement"
                className="px-4 py-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                onClick={() => setIsOpen(false)}
              >
                Post Requirement
              </Link>
              {isAuthenticated ? (
                <Link
                  href={dashboardLink}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  onClick={() => setIsOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
