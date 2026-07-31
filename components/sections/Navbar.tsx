'use client';

import { useState, useEffect } from 'react';
import { ILandingPageSection, SocialLinks } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { filterNavFooterItems } from '@/lib/nav-links';
import { readField } from '@/lib/read-field';
import { Menu, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface NavbarSectionProps {
  section: ILandingPageSection;
  primaryColor: string;
  companyName: string;
  logo?: string;
  callUrl?: string | null;
}

function safeLandingLink(link: string | undefined, fallback: string) {
  if (!link) return fallback;
  if (
    link.startsWith('#') ||
    link.startsWith('/') ||
    link.startsWith('https://') ||
    link.startsWith('tel:') ||
    link.startsWith('mailto:')
  ) {
    return link;
  }
  return `/${link}`;
}

export function NavbarSection({ 
  section, 
  primaryColor, 
  companyName,
  logo,
  callUrl
}: NavbarSectionProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const variant = section.designVariant || 'variant-1';
  const rawItems = (section.items || []) as Array<Record<string, string>>;
  const items = filterNavFooterItems(rawItems);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBrand = section.title?.trim() || companyName;
  const ctaText = section.buttonText?.trim() || 'Get Started';
  const ctaLink = callUrl || section.buttonLink || '#contact';

  // ---------------------------------------------------------------------------
  // Variant 1: Floating Glass Navbar (Sticky & Centered)
  // ---------------------------------------------------------------------------
  if (variant === 'variant-1') {
    return (
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 pointer-events-none">
        <div 
          className={cn(
            "pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full px-6 py-3 transition-all duration-300",
            isScrolled 
              ? "bg-white/80 shadow-lg backdrop-blur-xl ring-1 ring-gray-900/5" 
              : "bg-white shadow-md ring-1 ring-gray-100"
          )}
        >
          <Link href="/" className="flex items-center gap-3">
            {logo && (
              <div className="relative h-8 w-8 overflow-hidden rounded-md">
                <Image src={logo} alt={navBrand} fill className="object-contain" />
              </div>
            )}
            <span className="text-xl font-black tracking-tight text-gray-900">{navBrand}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {items.map((item, i) => (
              <a
                key={i}
                href={safeLandingLink(readField(item, 'link'), '/')}
                className="text-sm font-semibold text-gray-600 transition hover:text-gray-900"
              >
                {readField(item, 'label')}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a
              href={ctaLink}
              className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-bold text-white transition hover:brightness-110 shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              {ctaText}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-900 transition hover:bg-gray-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-4 top-[calc(100%+16px)] pointer-events-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-gray-100 md:hidden"
            >
              <nav className="flex flex-col gap-4">
                {items.map((item, i) => (
                  <a
                    key={i}
                    href={safeLandingLink(readField(item, 'link'), '/')}
                    className="text-lg font-bold text-gray-900 transition active:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {readField(item, 'label')}
                  </a>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={ctaLink}
                    className="flex w-full items-center justify-center rounded-full py-3 text-sm font-bold text-white shadow-md"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {ctaText}
                  </a>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 2: Full Width Solid Banner (Classic Corporate)
  // ---------------------------------------------------------------------------
  if (variant === 'variant-2') {
    return (
      <header 
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          isScrolled ? "bg-white shadow-md" : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 z-10">
            {logo ? (
              <div className="relative h-10 w-auto min-w-[120px]">
                <Image src={logo} alt={navBrand} fill className="object-contain object-left" />
              </div>
            ) : (
              <span className={cn("text-2xl font-black tracking-tighter", isScrolled ? "text-gray-900" : "text-white drop-shadow-md")}>
                {navBrand}
              </span>
            )}
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {items.map((item, i) => (
              <a
                key={i}
                href={safeLandingLink(readField(item, 'link'), '/')}
                className={cn(
                  "text-sm font-bold uppercase tracking-wider transition-colors",
                  isScrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white drop-shadow-sm"
                )}
              >
                {readField(item, 'label')}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center">
            <a
              href={ctaLink}
              className={cn(
                "inline-flex items-center justify-center rounded-sm px-6 py-2.5 text-sm font-bold uppercase tracking-widest transition-all",
                isScrolled 
                  ? "text-white shadow-lg hover:brightness-110" 
                  : "bg-white text-gray-900 shadow-xl hover:bg-gray-50"
              )}
              style={isScrolled ? { backgroundColor: primaryColor } : undefined}
            >
              {ctaText}
            </a>
          </div>

          <button
            className={cn(
              "lg:hidden flex h-10 w-10 items-center justify-center rounded-md z-10 transition-colors",
              isScrolled ? "text-gray-900 bg-gray-100" : "text-white bg-white/20 backdrop-blur-sm"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Fullscreen Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col h-screen"
            >
              <nav className="flex flex-col gap-6 flex-1">
                {items.map((item, i) => (
                  <a
                    key={i}
                    href={safeLandingLink(readField(item, 'link'), '/')}
                    className="text-3xl font-black text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {readField(item, 'label')}
                  </a>
                ))}
              </nav>
              <div className="pb-10">
                <a
                  href={ctaLink}
                  className="flex w-full items-center justify-center rounded-lg py-4 text-sm font-bold uppercase tracking-widest text-white"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {ctaText}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 3: Split Nav (Logo center, links left/right)
  // ---------------------------------------------------------------------------
  const half = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, half);
  const rightItems = items.slice(half);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white border-b border-gray-100 transition-all duration-300">
      {/* Top thin strip */}
      <div className="h-1 w-full" style={{ backgroundColor: primaryColor }} />
      
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Mobile Menu Button (Left on Mobile) */}
        <button
          className="lg:hidden flex h-10 w-10 items-center justify-center text-gray-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Left Links */}
        <nav className="hidden lg:flex flex-1 justify-end gap-8 pr-12">
          {leftItems.map((item, i) => (
            <a
              key={i}
              href={safeLandingLink(readField(item, 'link'), '/')}
              className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
              {readField(item, 'label')}
            </a>
          ))}
        </nav>

        {/* Center Logo */}
        <Link href="/" className="flex shrink-0 items-center justify-center z-10">
          {logo ? (
            <div className="relative h-12 w-32">
              <Image src={logo} alt={navBrand} fill className="object-contain" />
            </div>
          ) : (
            <span className="text-2xl font-serif font-bold italic tracking-tight text-gray-900">
              {navBrand}
            </span>
          )}
        </Link>

        {/* Desktop Right Links */}
        <nav className="hidden lg:flex flex-1 justify-start gap-8 pl-12 items-center">
          {rightItems.map((item, i) => (
            <a
              key={i}
              href={safeLandingLink(readField(item, 'link'), '/')}
              className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
              {readField(item, 'label')}
            </a>
          ))}
          <a
            href={ctaLink}
            className="group flex items-center gap-2 text-sm font-bold transition-colors"
            style={{ color: primaryColor }}
          >
            {ctaText} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </nav>

        {/* Mobile Spacer to keep logo centered */}
        <div className="lg:hidden w-10" />

      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute inset-x-0 top-[calc(100%+1px)] bg-white border-b border-gray-100 overflow-hidden lg:hidden"
          >
            <nav className="flex flex-col px-6 py-6">
              {items.map((item, i) => (
                <a
                  key={i}
                  href={safeLandingLink(readField(item, 'link'), '/')}
                  className="py-3 text-lg font-medium text-gray-900 border-b border-gray-50 last:border-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {readField(item, 'label')}
                </a>
              ))}
              <div className="mt-6">
                <a
                  href={ctaLink}
                  className="flex w-full items-center justify-between rounded-xl p-4 text-sm font-bold text-white shadow-md"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {ctaText} <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
