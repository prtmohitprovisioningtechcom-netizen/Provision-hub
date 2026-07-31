'use client';

import { CompanyProfileView } from '@/components/company/CompanyProfileView';
import { CreativeStudioTheme } from '@/components/themes/creative-studio';
import { WarmShowcaseTheme } from '@/components/themes/warm-showcase';
import { BoldLaunchTheme } from '@/components/themes/bold-launch';
import { CleanPresenceTheme } from '@/components/themes/clean-presence';
import { PremiumShowcaseTheme } from '@/components/themes/premium-showcase';
import {
  IBlog,
  ICompany,
  ILandingPageSection,
  IProduct,
  IReview,
  IService,
} from '@/types';
import { ElegantSerifTheme } from '@/components/themes/elegant-serif';
import { SleekGlassTheme } from '@/components/themes/sleek-glass';
import { NeonDarkTheme } from '@/components/themes/neon-dark';

export const THEME_OPTIONS = [
  {
    id: 'default',
    name: 'Modern Business',
    description:
      'Professional layout — Clean multi-purpose company profile with builder sections.',
    previewImg:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    tags: ['Professional', 'Corporate', 'Modern'],
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    description:
      'Creative layout — Asymmetrical, vibrant, with bold typography and colorful accents.',
    previewImg:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    tags: ['Creative', 'Vibrant', 'Agency'],
  },
  {
    id: 'warm-showcase',
    name: 'Warm Showcase',
    description:
      'Elegant layout — Warm amber tones, serif fonts, and soft shadows for an inviting feel.',
    previewImg:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    tags: ['Elegant', 'Warm', 'Inviting'],
  },
  {
    id: 'bold-launch',
    name: 'Bold Launch',
    description:
      'Modern layout — High-impact dark theme with stark borders and grid-based sections.',
    previewImg:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    tags: ['Modern', 'Dark', 'Bold'],
  },
  {
    id: 'clean-presence',
    name: 'Clean Presence',
    description:
      'Clean layout — Minimalist, airy design with lots of whitespace and subtle styling.',
    previewImg:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    tags: ['Clean', 'Minimalist', 'Airy'],
  },
  {
    id: 'premium-showcase',
    name: 'Premium Showcase',
    description:
      'Premium layout — Luxury cinematic feel with rich dark backgrounds and elegant typography.',
    previewImg:
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    tags: ['Premium', 'Luxury', 'Cinematic'],
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    description: 'High-end editorial layout with spacious typography, perfect for luxury and fashion.',
    previewImg: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    tags: ['Elegant', 'Editorial', 'Luxury'],
  },
  {
    id: 'sleek-glass',
    name: 'Sleek Glass',
    description: 'Ultra-modern glassmorphism design with soft gradients and translucent layers.',
    previewImg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    tags: ['Modern', 'Glassmorphism', 'SaaS'],
  },
  {
    id: 'neon-dark',
    name: 'Neon Dark',
    description: 'Cyberpunk inspired dark mode theme with glowing neon accents and sharp edges.',
    previewImg: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80',
    tags: ['Dark', 'Neon', 'Cyberpunk'],
  },
] as const;

export type ThemeTemplateId = (typeof THEME_OPTIONS)[number]['id'];

export interface ThemeRendererProps {
  templateId?: string | null;
  company: ICompany;
  products: IProduct[];
  services: IService[];
  reviews: IReview[];
  blogs: IBlog[];
  landingPage: {
    sections?: ILandingPageSection[];
    isPublished?: boolean;
    templateId?: string | null;
  } | null;
  gallery: { images?: Array<{ url: string; caption?: string }> } | null;
}

export function ThemeRenderer({
  templateId,
  company,
  products,
  services,
  reviews,
  blogs,
  landingPage,
  gallery,
}: ThemeRendererProps) {
  const id = templateId || landingPage?.templateId || 'default';
  const shared = {
    company,
    products,
    services,
    reviews,
    blogs,
    landingPage,
    gallery,
  };

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
    default:
      return <CompanyProfileView {...shared} />;
  }
}
