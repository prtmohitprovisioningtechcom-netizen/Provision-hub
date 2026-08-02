'use client';

import { CompanyProfileView } from '@/components/company/CompanyProfileView';
import { CreativeStudioTheme } from '@/components/themes/creative-studio';
import { HerbalCosmeticsTheme } from '@/components/themes/herbal-cosmetics';
import { WarmShowcaseTheme } from '@/components/themes/warm-showcase';
import { BoldLaunchTheme } from '@/components/themes/bold-launch';
import { CleanPresenceTheme } from '@/components/themes/clean-presence';
import { PremiumShowcaseTheme } from '@/components/themes/premium-showcase';
import { ElegantSerifTheme } from '@/components/themes/elegant-serif';
import { SleekGlassTheme } from '@/components/themes/sleek-glass';
import { NeonDarkTheme } from '@/components/themes/neon-dark';
import { RoyalGlowTheme } from '@/components/themes/royal-glow';
import { LAYOUT_MAP } from '@/components/themes/layouts';
import { getThemeSkin } from '@/lib/theme-skins';
import { normalizeLayoutId } from '@/lib/layout-id';
import {
  IBlog,
  ICompany,
  ILandingPageSection,
  IProduct,
  IReview,
  IService,
} from '@/types';

export const THEME_OPTIONS = [
  {
    id: 'default',
    name: 'Modern Business',
    description: 'Clean multi-purpose company profile — great for agencies and local businesses.',
    previewImg:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    tags: ['Professional', 'Corporate', 'Modern'],
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    description: 'Vibrant agency look — bold type, soft cards, playful pink accents.',
    previewImg:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    tags: ['Creative', 'Vibrant', 'Agency'],
  },
  {
    id: 'warm-showcase',
    name: 'Warm Showcase',
    description: 'Inviting hospitality feel — warm tones and elegant serif headlines.',
    previewImg:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    tags: ['Elegant', 'Warm', 'Inviting'],
  },
  {
    id: 'bold-launch',
    name: 'Bold Launch',
    description: 'High-impact dark launch page — stark contrast and energetic type.',
    previewImg:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    tags: ['Modern', 'Dark', 'Bold'],
  },
  {
    id: 'clean-presence',
    name: 'Clean Presence',
    description: 'Airy minimal layout — calm whitespace and soft teal accents.',
    previewImg:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    tags: ['Clean', 'Minimalist', 'Airy'],
  },
  {
    id: 'premium-showcase',
    name: 'Premium Showcase',
    description: 'Luxury cinematic style — wine tones and elegant serif display.',
    previewImg:
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    tags: ['Premium', 'Luxury', 'Cinematic'],
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    description: 'Editorial luxury — spacious typography for fashion and consulting.',
    previewImg:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    tags: ['Elegant', 'Editorial', 'Luxury'],
  },
  {
    id: 'sleek-glass',
    name: 'Sleek Glass',
    description: 'Modern SaaS dark UI — teal accents and crisp panels.',
    previewImg:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    tags: ['Modern', 'Glassmorphism', 'SaaS'],
  },
  {
    id: 'neon-dark',
    name: 'Neon Dark',
    description: 'Cyberpunk energy — glowing cyan accents on deep navy.',
    previewImg:
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80',
    tags: ['Dark', 'Neon', 'Cyberpunk'],
  },
  {
    id: 'royal-glow',
    name: 'Royal Glow',
    description: 'Luxurious gold and purple aesthetics for high-end brands.',
    previewImg:
      'https://images.unsplash.com/photo-1542340916-3829440f3531?auto=format&fit=crop&w=800&q=80',
    tags: ['Luxury', 'Royal', 'Elegant'],
  },
  {
    id: 'herbal-cosmetics',
    name: 'Herbal Cosmetics',
    description: 'Vibrant, structured layout perfect for physical products, cosmetics, and health brands with built-in order forms.',
    previewImg:
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
    tags: ['Cosmetics', 'Products', 'Retail', 'Vibrant'],
  },
] as const;

export type ThemeTemplateId = (typeof THEME_OPTIONS)[number]['id'];

export interface ThemeRendererProps {
  templateId?: string | null;
  layoutId?: string | null;
  company: ICompany;
  products: IProduct[];
  services: IService[];
  reviews: IReview[];
  blogs: IBlog[];
  landingPage: {
    sections?: ILandingPageSection[];
    isPublished?: boolean;
    templateId?: string | null;
    layoutId?: string | null;
  } | null;
  gallery: { images?: Array<{ url: string; caption?: string }> } | null;
}

export function ThemeRenderer({
  templateId,
  layoutId,
  company,
  products,
  services,
  reviews,
  blogs,
  landingPage,
  gallery,
}: ThemeRendererProps) {
  const id = templateId || landingPage?.templateId || 'default';
  const resolvedLayout = normalizeLayoutId(layoutId || landingPage?.layoutId);

  const shared = {
    company,
    products,
    services,
    reviews,
    blogs,
    landingPage: landingPage
      ? { ...landingPage, templateId: id, layoutId: resolvedLayout }
      : { templateId: id, layoutId: resolvedLayout, sections: [] as ILandingPageSection[] },
    gallery,
  };

  // Layout 3 = first theme (Modern Business) full design — sliding hero, etc.
  if (resolvedLayout === '3') {
    return <CompanyProfileView {...shared} templateId="default" />;
  }

  // Layout 1 = each theme's signature design (unique look).
  if (resolvedLayout === '1') {
    switch (id) {
      case 'creative-studio':
        return <CreativeStudioTheme {...shared} />;
      case 'warm-showcase':
        return <WarmShowcaseTheme {...shared} />;
      case 'bold-launch':
        return <BoldLaunchTheme {...shared} />;
      case 'clean-presence':
        return <CleanPresenceTheme {...shared} />;
      case 'premium-showcase':
        return <PremiumShowcaseTheme {...shared} />;
      case 'elegant-serif':
        return <ElegantSerifTheme {...shared} />;
      case 'sleek-glass':
        return <SleekGlassTheme {...shared} />;
      case 'neon-dark':
        return <NeonDarkTheme {...shared} />;
      case 'royal-glow':
        return <RoyalGlowTheme {...shared} />;
      case 'herbal-cosmetics':
        return <HerbalCosmeticsTheme {...shared} />;
      default:
        return <CompanyProfileView {...shared} templateId={id} />;
    }
  }

  // Layout 2 = split structure with selected theme colors.
  const skin = getThemeSkin(id, company.theme?.primaryColor);
  const Layout = LAYOUT_MAP['2'];
  return <Layout skin={skin} {...shared} />;
}
