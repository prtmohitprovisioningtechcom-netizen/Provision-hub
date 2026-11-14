'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  ExternalLink,
  ShieldCheck,
  FileCode,
  Layers,
  Sparkles,
  MapPin,
  Building2,
  Lock,
  FileText,
  ShoppingBag,
  Store,
  ChevronRight,
  Code,
  CheckCircle2,
} from 'lucide-react';
import { CORE_SERVICES } from '@/config/service-themes';
import { PLATFORM_THEMES, TOP_INDIAN_LOCATIONS } from '@/config/seo-constants';

interface CategoryItem {
  name: string;
  slug: string;
}

interface CompanyItem {
  name: string;
  slug: string;
  category?: string;
}

interface SitemapClientProps {
  categories: CategoryItem[];
  companies: CompanyItem[];
}

export function SitemapClient({ categories, companies }: SitemapClientProps) {
  const [search, setSearch] = useState('');

  // 1. Core Platform Pages
  const corePages = [
    { name: 'Home Page', href: '/', desc: 'Official landing page & local vyapari discovery platform', icon: '🏠' },
    { name: 'All Services Hub', href: '/services', desc: '13 core service categories with custom website themes', icon: '🩺' },
    { name: 'Search Business Directory', href: '/search', desc: 'Find local stores, suppliers & verified professionals', icon: '🔍' },
    { name: 'Verified Directory', href: '/search?verified=true', desc: 'Browse 100% phone & credential verified merchants', icon: '✅' },
    { name: 'Post Requirement', href: '/post-requirement', desc: 'Post buying/service requests and get direct seller bids', icon: '📝' },
    { name: 'Vyapari Billing & Khata', href: '/#vyapari-software', desc: 'Free POS billing, invoice generator & digital udhar khata', icon: '🧾' },
    { name: 'Free Business Registration', href: '/register/company', desc: 'Launch your free company storefront in 2 minutes', icon: '✨' },
    { name: 'Merchant Login', href: '/login', desc: 'Merchant portal for catalog, orders & analytics', icon: '🔐' },
    { name: 'Admin Portal Login', href: '/admin/login', desc: 'Super admin master control sign in', icon: '🛡️' },
    { name: 'Terms & Conditions', href: '/terms', desc: 'Official user terms, merchant rules & platform policy', icon: '📜' },
    { name: 'Privacy Policy', href: '/privacy', desc: 'Data protection, security standards & privacy rights', icon: '🔒' },
    { name: 'Dynamic XML Sitemap', href: '/sitemap.xml', desc: 'Official real-time XML feed for Google & search crawlers', icon: '🤖' },
  ];

  // 2. 13 Business Services
  const servicePages = [
    { name: 'All Services Hub', href: '/services', desc: 'Complete directory of all business themes', icon: '🌟' },
    ...CORE_SERVICES.map((s) => ({
      name: `${s.name} Website Themes`,
      href: `/services/${s.slug}`,
      desc: s.description,
      icon: s.icon,
    })),
    {
      name: 'Specialty & Other Services',
      href: '/services/other',
      desc: 'Customized web solutions for all other local niche businesses',
      icon: '✨',
    },
  ];

  // 3. Platform Themes
  const themePages = PLATFORM_THEMES.map((t) => ({
    name: t.name,
    href: `/themes/${t.slug}`,
    desc: t.desc,
    category: t.category,
  }));

  // 4. Merchant Management Tools
  const merchantTools = [
    { name: 'Merchant Dashboard', href: '/dashboard', desc: 'Control center for products, orders & customer chats', icon: '📊' },
    { name: 'Billing Software & POS', href: '/dashboard/billing', desc: 'Fast GST/Non-GST billing with thermal printer support', icon: '🧾' },
    { name: 'Digital Khata Book', href: '/dashboard/khata', desc: 'Track customer udhar, balance & automatic WhatsApp reminders', icon: '📖' },
    { name: 'Theme Selector & Switcher', href: '/dashboard/select-theme', desc: 'Pick and change your storefront website theme in 1 click', icon: '🎨' },
  ];

  // Filter based on search query
  const query = search.trim().toLowerCase();

  const filteredCore = useMemo(
    () => corePages.filter((p) => p.name.toLowerCase().includes(query) || p.href.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query)),
    [query],
  );

  const filteredServices = useMemo(
    () => servicePages.filter((p) => p.name.toLowerCase().includes(query) || p.href.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query)),
    [query],
  );

  const filteredThemes = useMemo(
    () => themePages.filter((p) => p.name.toLowerCase().includes(query) || p.href.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)),
    [query],
  );

  const filteredTools = useMemo(
    () => merchantTools.filter((p) => p.name.toLowerCase().includes(query) || p.href.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query)),
    [query],
  );

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query)),
    [categories, query],
  );

  const filteredCities = useMemo(
    () => TOP_INDIAN_LOCATIONS.filter((l) => l.city.toLowerCase().includes(query) || l.state.toLowerCase().includes(query)),
    [query],
  );

  const filteredCompanies = useMemo(
    () => companies.filter((c) => c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query)),
    [companies, query],
  );

  const totalPagesCount =
    corePages.length + servicePages.length + themePages.length + merchantTools.length + categories.length + TOP_INDIAN_LOCATIONS.length + companies.length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Breadcrumb & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-900 dark:text-white">Platform Sitemap</span>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
          >
            <FileCode className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>XML Feed</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>

          <div className="inline-flex items-center gap-1 rounded-full border border-indigo-200/80 bg-indigo-50/80 dark:border-indigo-900/60 dark:bg-indigo-950/40 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Globe className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{totalPagesCount}+ Indexed Pages</span>
          </div>
        </div>
      </div>

      {/* Hero Header & Instant Search */}
      <div className="text-left space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          Platform Sitemap &amp;{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
            Page Directory
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
          Comprehensive direct navigation index for <strong>Bhartiyebazar</strong>. Browse all core pages, 13 business service themes, 18 website templates, merchant tools, verified categories, and city hubs.
        </p>

        {/* Real-time Search Filter Bar */}
        <div className="relative max-w-xl pt-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages by name, service, theme, city or URL..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: Core Platform Pages */}
      {/* ============================================================== */}
      {filteredCore.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
            <span className="text-base sm:text-lg">🏛️</span>
            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              Core Platform Pages ({filteredCore.length})
            </h2>
          </div>

          <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCore.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group flex items-start gap-3 rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xs transition-all"
              >
                <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">{p.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                    <span className="truncate">{p.name}</span>
                    <ChevronRight className="h-3 w-3 text-gray-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="font-mono text-[10.5px] text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                    {p.href}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-tight">
                    {p.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: 13 Core Business Services & Themed Hubs */}
      {/* ============================================================== */}
      {filteredServices.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
            <span className="text-base sm:text-lg">🩺</span>
            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              Business Services &amp; Themes Hub ({filteredServices.length})
            </h2>
          </div>

          <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-start gap-2.5 rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-xs transition-all"
              >
                <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">{s.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex items-center justify-between">
                    <span className="truncate">{s.name}</span>
                    <ChevronRight className="h-3 w-3 text-gray-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="font-mono text-[10.5px] text-teal-600 dark:text-teal-400 truncate mt-0.5">
                    {s.href}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-tight">
                    {s.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: Official Website Themes */}
      {/* ============================================================== */}
      {filteredThemes.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
            <span className="text-base sm:text-lg">🎨</span>
            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              Official Website Themes ({filteredThemes.length})
            </h2>
          </div>

          <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredThemes.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="group flex flex-col justify-between rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-xs text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                      {t.name}
                    </span>
                    <span className="rounded-md bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 dark:text-purple-300 shrink-0">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-tight">
                    {t.desc}
                  </p>
                </div>
                <div className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 mt-2 truncate flex items-center gap-1">
                  <span>{t.href}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION 4: Vyapari Merchant Tools */}
      {/* ============================================================== */}
      {filteredTools.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
            <span className="text-base sm:text-lg">🛠️</span>
            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              Vyapari Merchant Tools ({filteredTools.length})
            </h2>
          </div>

          <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex items-start gap-2.5 rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 hover:border-indigo-400 hover:shadow-xs transition-all"
              >
                <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">{tool.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                    {tool.name}
                  </div>
                  <div className="font-mono text-[10.5px] text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                    {tool.href}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-tight">
                    {tool.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION 5: Business Categories & Top Cities (Grid Split) */}
      {/* ============================================================== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Categories */}
        {filteredCategories.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
              <span className="text-base sm:text-lg">🏷️</span>
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                Verified Categories ({filteredCategories.length})
              </h2>
            </div>

            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4 max-h-72 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {filteredCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors truncate"
                  >
                    <span className="text-indigo-500 font-bold shrink-0">&bull;</span>
                    <span className="truncate font-medium">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Top Cities */}
        {filteredCities.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
              <span className="text-base sm:text-lg">📍</span>
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                Top Indian Cities ({filteredCities.length})
              </h2>
            </div>

            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
              <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto">
                {filteredCities.map((loc) => (
                  <Link
                    key={loc.slug}
                    href={`/explore/${loc.slug}/construction`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors"
                  >
                    <span>{loc.city}</span>
                    <span className="text-[9px] text-gray-400">({loc.state})</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ============================================================== */}
      {/* SECTION 6: Verified Merchant Storefronts */}
      {/* ============================================================== */}
      {filteredCompanies.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
            <span className="text-base sm:text-lg">🏪</span>
            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              Featured Storefronts ({filteredCompanies.length})
            </h2>
          </div>

          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {filteredCompanies.map((comp) => (
              <Link
                key={comp.slug}
                href={`/${comp.slug}`}
                className="group flex items-center justify-between rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-2.5 text-xs hover:border-indigo-400 hover:text-indigo-600 transition-colors truncate"
              >
                <div className="truncate flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                    {comp.name}
                  </span>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400 shrink-0 ml-1 group-hover:text-indigo-500" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bottom XML Sitemap Callout */}
      <div className="rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Search Engine Auto-Crawl Feed Enabled</span>
          </div>
          <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
            Our dynamic XML sitemap is continuously refreshed as merchants, services, themes, and pages are updated.
          </p>
        </div>

        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 shrink-0 shadow-xs transition-colors"
        >
          <span>Open XML Sitemap</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

