export interface ServiceDefinition {
  slug: string;
  key: string;
  name: string;
  nameKey: string;
  badge: string;
  badgeKey: string;
  icon: string;
  searchQuery: string;
  description: string;
  gradient: string;
  borderGlow: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  previewImg: string;
  tags: readonly string[];
  /**
   * Core service slugs this theme is built for.
   * Leave empty (`[]`) or use custom non-core slugs (e.g. `['carpentry']`, `['other']`)
   * and this theme will AUTOMATICALLY appear under the "Other" service category.
   */
  services: readonly string[];
  isPremium?: boolean;
}

export const CORE_SERVICES: readonly ServiceDefinition[] = [
  {
    slug: 'medical-store',
    key: 'medical',
    name: 'Medical Store',
    nameKey: 'cat.medicalStore',
    badge: 'Emergency',
    badgeKey: 'badge.emergency',
    icon: '💊',
    searchQuery: 'Medical Store',
    description: 'Pharmacy, chemist, ayurvedic & health product storefront themes with instant medicine inquiry and order forms.',
    gradient: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/30',
    borderGlow: 'hover:border-emerald-400/80 hover:shadow-emerald-500/15',
  },
  {
    slug: 'doctor',
    key: 'doctor',
    name: 'Doctor',
    nameKey: 'cat.doctor',
    badge: 'Verified',
    badgeKey: 'badge.verified',
    icon: '🩺',
    searchQuery: 'Doctor',
    description: 'Clean, trustworthy clinic & physician website themes with appointment booking, specialization cards & patient reviews.',
    gradient: 'from-sky-500/10 to-blue-500/10 dark:from-sky-950/40 dark:to-blue-950/30',
    borderGlow: 'hover:border-sky-400/80 hover:shadow-sky-500/15',
  },
  {
    slug: 'hospital',
    key: 'hospital',
    name: 'Hospital',
    nameKey: 'cat.hospital',
    badge: '24x7',
    badgeKey: 'badge.roundClock',
    icon: '🏥',
    searchQuery: 'Hospital',
    description: 'Multi-specialty hospital & healthcare center website themes built for fast emergency contact and department listings.',
    gradient: 'from-rose-500/10 to-red-500/10 dark:from-rose-950/40 dark:to-red-950/30',
    borderGlow: 'hover:border-rose-400/80 hover:shadow-rose-500/15',
  },
  {
    slug: 'lawyer',
    key: 'lawyer',
    name: 'Lawyer',
    nameKey: 'cat.lawyer',
    badge: 'Expert',
    badgeKey: 'badge.expert',
    icon: '⚖️',
    searchQuery: 'Lawyer',
    description: 'Authoritative law firm, advocate & legal consultancy website themes with case consultation and practice areas.',
    gradient: 'from-amber-500/10 to-orange-500/10 dark:from-amber-950/40 dark:to-orange-950/30',
    borderGlow: 'hover:border-amber-400/80 hover:shadow-amber-500/15',
  },
  {
    slug: 'hotel',
    key: 'hotel',
    name: 'Hotel',
    nameKey: 'cat.hotel',
    badge: 'Stay',
    badgeKey: 'badge.stay',
    icon: '🏨',
    searchQuery: 'Hotel',
    description: 'Warm, luxury hotel, resort, guest house & restaurant themes designed to showcase rooms, dining & direct bookings.',
    gradient: 'from-indigo-500/10 to-violet-500/10 dark:from-indigo-950/40 dark:to-violet-950/30',
    borderGlow: 'hover:border-indigo-400/80 hover:shadow-indigo-500/15',
  },
  {
    slug: 'grocery',
    key: 'grocery',
    name: 'Grocery',
    nameKey: 'cat.grocery',
    badge: 'Daily Needs',
    badgeKey: 'badge.dailyNeeds',
    icon: '🛒',
    searchQuery: 'Grocery',
    description: 'Kirana store, supermarket & organic grocery storefront themes featuring catalog showcase & WhatsApp delivery orders.',
    gradient: 'from-lime-500/10 to-green-500/10 dark:from-lime-950/40 dark:to-green-950/30',
    borderGlow: 'hover:border-lime-400/80 hover:shadow-lime-500/15',
  },
  {
    slug: 'electrician',
    key: 'electrician',
    name: 'Electrician',
    nameKey: 'cat.electrician',
    badge: 'Fast Repair',
    badgeKey: 'badge.fastRepair',
    icon: '⚡',
    searchQuery: 'Electrician',
    description: 'High-impact local electrician & home service themes highlighting emergency response, rate cards & quick call buttons.',
    gradient: 'from-yellow-500/10 to-amber-500/10 dark:from-yellow-950/40 dark:to-amber-950/30',
    borderGlow: 'hover:border-yellow-400/80 hover:shadow-yellow-500/15',
  },
  {
    slug: 'mobile-repair',
    key: 'mobileRepair',
    name: 'Mobile Repair',
    nameKey: 'cat.mobileRepair',
    badge: 'Same Day',
    badgeKey: 'badge.sameDay',
    icon: '📱',
    searchQuery: 'Mobile Repair',
    description: 'Modern smartphone repair shop & accessories themes with device service menus, warranty badges & WhatsApp booking.',
    gradient: 'from-cyan-500/10 to-blue-500/10 dark:from-cyan-950/40 dark:to-blue-950/30',
    borderGlow: 'hover:border-cyan-400/80 hover:shadow-cyan-500/15',
  },
  {
    slug: 'computer-repair',
    key: 'computerRepair',
    name: 'Computer Repair',
    nameKey: 'cat.computerRepair',
    badge: 'Hardware/Soft',
    badgeKey: 'badge.hwSw',
    icon: '💻',
    searchQuery: 'Computer Repair',
    description: 'Sleek IT support, laptop repair & AMC service themes showcasing hardware/software diagnostics & custom PC builds.',
    gradient: 'from-purple-500/10 to-indigo-500/10 dark:from-purple-950/40 dark:to-indigo-950/30',
    borderGlow: 'hover:border-purple-400/80 hover:shadow-purple-500/15',
  },
  {
    slug: 'beauty-parlour',
    key: 'beautyParlour',
    name: 'Beauty Parlour',
    nameKey: 'cat.beautyParlour',
    badge: 'Salon & Spa',
    badgeKey: 'badge.salonSpa',
    icon: '✂️',
    searchQuery: 'Beauty Parlour',
    description: 'Stylish salon, bridal studio & skincare parlour themes crafted with royal aesthetics, service menus & gallery sliders.',
    gradient: 'from-pink-500/10 to-rose-500/10 dark:from-pink-950/40 dark:to-rose-950/30',
    borderGlow: 'hover:border-pink-400/80 hover:shadow-pink-500/15',
  },
  {
    slug: 'coaching',
    key: 'coaching',
    name: 'Coaching',
    nameKey: 'cat.coaching',
    badge: 'Classes',
    badgeKey: 'badge.classes',
    icon: '📚',
    searchQuery: 'Coaching',
    description: 'Vibrant coaching institute, tuition & academy themes with course batches, student results & admission inquiry forms.',
    gradient: 'from-violet-500/10 to-purple-500/10 dark:from-violet-950/40 dark:to-purple-950/30',
    borderGlow: 'hover:border-violet-400/80 hover:shadow-violet-500/15',
  },
  {
    slug: 'school',
    key: 'school',
    name: 'School',
    nameKey: 'cat.school',
    badge: 'Education',
    badgeKey: 'badge.education',
    icon: '🏫',
    searchQuery: 'School',
    description: 'Structured school, college & educational campus themes with faculty highlights, admission notices & photo galleries.',
    gradient: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-950/40 dark:to-indigo-950/30',
    borderGlow: 'hover:border-blue-400/80 hover:shadow-blue-500/15',
  },
] as const;

export const OTHER_SERVICE: ServiceDefinition = {
  slug: 'other',
  key: 'other',
  name: 'Other',
  nameKey: 'cat.other',
  badge: 'More Categories',
  badgeKey: 'badge.other',
  icon: '✨',
  searchQuery: '',
  description:
    'Special-purpose & newly added themes (Carpenter, Gaming, Tech, Interior, Agencies & more) that are automatically grouped here whenever they belong outside the 12 core services.',
  gradient: 'from-slate-500/10 to-zinc-500/10 dark:from-slate-800/50 dark:to-zinc-900/50',
  borderGlow: 'hover:border-indigo-400/80 hover:shadow-indigo-500/15',
};

export const ALL_SERVICES: readonly ServiceDefinition[] = [...CORE_SERVICES, OTHER_SERVICE];

export const CORE_SERVICE_SLUGS: readonly string[] = CORE_SERVICES.map((s) => s.slug);

export const THEME_OPTIONS = [
  {
    id: 'default',
    name: 'Modern Business',
    description: 'Clean multi-purpose company profile — great for clinics, hospitals, lawyers, coaching & local services.',
    previewImg:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    tags: ['Professional', 'Corporate', 'Modern'],
    services: ['doctor', 'hospital', 'lawyer', 'electrician', 'coaching', 'school'],
    isPremium: false,
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    description: 'Vibrant look — bold type, soft cards & playful accents ideal for coaching institutes & schools.',
    previewImg:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    tags: ['Creative', 'Vibrant', 'Education'],
    services: ['coaching', 'school'],
    isPremium: false,
  },
  {
    id: 'warm-showcase',
    name: 'Warm Showcase',
    description: 'Inviting hospitality feel — warm tones and elegant serif headlines for hotels, restaurants & grocery stores.',
    previewImg:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    tags: ['Elegant', 'Warm', 'Hospitality'],
    services: ['hotel', 'grocery'],
    isPremium: false,
  },
  {
    id: 'bold-launch',
    name: 'Bold Launch',
    description: 'High-impact dark service layout — fast call-to-action for electricians, mobile repair & computer technicians.',
    previewImg:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    tags: ['Modern', 'Dark', 'Fast Service'],
    services: ['electrician', 'mobile-repair', 'computer-repair'],
    isPremium: false,
  },
  {
    id: 'clean-presence',
    name: 'Clean Presence',
    description: 'Airy minimal layout — calm whitespace and soft teal accents crafted for doctors, hospitals, lawyers & schools.',
    previewImg:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    tags: ['Clean', 'Minimalist', 'Trusted'],
    services: ['doctor', 'hospital', 'lawyer', 'school'],
    isPremium: false,
  },
  {
    id: 'premium-showcase',
    name: 'Premium Showcase',
    description: 'Luxury catalog style — rich wine tones and multi-product showcase for medical stores, hotels & supermarkets.',
    previewImg:
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    tags: ['Premium', 'Luxury', 'Catalog'],
    services: ['medical-store', 'hotel', 'grocery'],
    isPremium: true,
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    description: 'Editorial luxury — spacious typography for advocates, boutique hotels & luxury beauty parlours.',
    previewImg:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    tags: ['Elegant', 'Editorial', 'Luxury'],
    services: ['lawyer', 'hotel', 'beauty-parlour'],
    isPremium: false,
  },
  {
    id: 'sleek-glass',
    name: 'Sleek Glass',
    description: 'Modern tech glassmorphism UI — crisp panels ideal for computer repair, mobile repair & online coaching.',
    previewImg:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    tags: ['Modern', 'Glassmorphism', 'Tech'],
    services: ['mobile-repair', 'computer-repair', 'coaching'],
    isPremium: true,
  },
  {
    id: 'neon-dark',
    name: 'Neon Dark',
    description: 'Cyberpunk energy — glowing cyan accents on deep navy for gaming, software studios & specialty tech brands.',
    previewImg:
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80',
    tags: ['Dark', 'Neon', 'Cyberpunk'],
    services: [], // Not in core 12 services -> automatically grouped under "Other"
    isPremium: true,
  },
  {
    id: 'royal-glow',
    name: 'Royal Glow',
    description: 'Luxurious gold and purple aesthetics crafted for bridal studios, beauty parlours & premium hotels.',
    previewImg:
      'https://images.unsplash.com/photo-1542340916-3829440f3531?auto=format&fit=crop&w=800&q=80',
    tags: ['Luxury', 'Royal', 'Salon & Spa'],
    services: ['beauty-parlour', 'hotel'],
    isPremium: true,
  },
  {
    id: 'herbal-cosmetics',
    name: 'Herbal Cosmetics',
    description: 'Vibrant structured catalog perfect for medical stores, cosmetics, herbal beauty parlours & organic groceries.',
    previewImg:
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
    tags: ['Pharmacy', 'Cosmetics', 'Retail'],
    services: ['medical-store', 'beauty-parlour', 'grocery'],
    isPremium: false,
  },
  {
    id: 'carpenter-works',
    name: 'Carpenter Works',
    description: 'Earthy tones, warm typography, tailored for carpenters, furniture makers, woodwork & custom trades.',
    previewImg:
      'https://images.unsplash.com/photo-1618220179428-22790b461013?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    tags: ['Carpenter', 'Furniture', 'Woodwork'],
    services: [], // Not in core 12 services -> automatically grouped under "Other"
    isPremium: false,
  },
] as const;

export type ThemeTemplateId = (typeof THEME_OPTIONS)[number]['id'];

/**
 * Automatically determines whether a theme falls under the "Other" category.
 * Any theme that has no services mapped OR none matching the 12 core services
 * (or explicitly tagged `'other'`) automatically shows inside "Other".
 */
export function isOtherTheme(theme: { services?: readonly string[] }): boolean {
  const services = theme.services || [];
  if (services.length === 0) return true;
  if (services.includes('other')) return true;
  return !services.some((slug) => CORE_SERVICE_SLUGS.includes(slug));
}

/**
 * Returns all themes belonging to a given service slug.
 * Passing `'other'` returns every theme not assigned to any of the 12 core services.
 */
export function getThemesForService(
  serviceSlug: string,
  enabledThemeIds?: string[],
): (typeof THEME_OPTIONS)[number][] {
  const normalizedSlug = serviceSlug.toLowerCase().trim();
  const baseThemes =
    enabledThemeIds && enabledThemeIds.length > 0
      ? THEME_OPTIONS.filter((theme) => enabledThemeIds.includes(theme.id))
      : [...THEME_OPTIONS];

  if (normalizedSlug === 'all') {
    return baseThemes;
  }

  if (normalizedSlug === 'other') {
    return baseThemes.filter((theme) => isOtherTheme(theme));
  }

  return baseThemes.filter((theme) => (theme.services as readonly string[]).includes(normalizedSlug));
}

export function getServiceBySlug(slug: string): ServiceDefinition | undefined {
  const normalized = slug.toLowerCase().trim();
  return ALL_SERVICES.find((s) => s.slug === normalized);
}

export function findMatchingServiceByQuery(query: string): ServiceDefinition | undefined {
  if (!query) return undefined;
  const q = query.toLowerCase().trim();
  return ALL_SERVICES.find(
    (s) =>
      s.slug === q ||
      s.name.toLowerCase() === q ||
      s.searchQuery.toLowerCase() === q ||
      (s.slug !== 'other' && q.includes(s.name.toLowerCase())),
  );
}

export function getThemeServiceNames(theme: { services?: readonly string[] }): string[] {
  if (isOtherTheme(theme)) return [OTHER_SERVICE.name];
  return (theme.services || [])
    .map((slug) => CORE_SERVICES.find((s) => s.slug === slug)?.name)
    .filter((n): n is string => Boolean(n));
}

