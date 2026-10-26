import 'server-only';
import { cache } from 'react';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export interface PlatformSettings {
  id?: string;
  heroConfig?: any;
  themeConfig?: {
    logoText?: string;
    logoImage?: string;
    primaryColor?: string;
    secondaryColor?: string;
    [key: string]: any;
  };
  featureToggles?: {
    showFeatures?: boolean;
    showHowItWorks?: boolean;
    showTemplates?: boolean;
    showPricing?: boolean;
    showTestimonials?: boolean;
    showFAQ?: boolean;
    showContact?: boolean;
    [key: string]: any;
  };
  seoConfig?: {
    title?: string;
    description?: string;
    keywords?: string;
    [key: string]: any;
  };
  featuresConfig?: any;
  howItWorksConfig?: any;
  pricingConfig?: any;
  faqConfig?: any;
  testimonialsConfig?: any;
  contactConfig?: any;
  footerConfig?: any;
  templatesConfig?: any;
  customHeaderCode?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

let cachedSettings: PlatformSettings | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60000; // 60 seconds memory cache

/**
 * Deduplicates settings reads during a server render and caches across requests.
 */
export const getPlatformSettings = cache(async (): Promise<PlatformSettings> => {
  const now = Date.now();
  if (cachedSettings && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedSettings;
  }

  try {
    const [settingsList] = await pool.execute<RowDataPacket[]>('SELECT * FROM platform_settings LIMIT 1');
    
    let settings = settingsList[0] as unknown as PlatformSettings | undefined;
    
    if (settings) {
      settings.heroConfig = typeof settings.heroConfig === 'string' ? JSON.parse(settings.heroConfig) : settings.heroConfig || {};
      settings.themeConfig = typeof settings.themeConfig === 'string' ? JSON.parse(settings.themeConfig) : settings.themeConfig || {};
      settings.featureToggles = typeof settings.featureToggles === 'string' ? JSON.parse(settings.featureToggles) : settings.featureToggles || {};
      settings.seoConfig = typeof settings.seoConfig === 'string' ? JSON.parse(settings.seoConfig) : settings.seoConfig || {};
      settings.featuresConfig = typeof settings.featuresConfig === 'string' ? JSON.parse(settings.featuresConfig) : settings.featuresConfig || {};
      settings.howItWorksConfig = typeof settings.howItWorksConfig === 'string' ? JSON.parse(settings.howItWorksConfig) : settings.howItWorksConfig || {};
      settings.pricingConfig = typeof settings.pricingConfig === 'string' ? JSON.parse(settings.pricingConfig) : settings.pricingConfig || {};
      settings.faqConfig = typeof settings.faqConfig === 'string' ? JSON.parse(settings.faqConfig) : settings.faqConfig || {};
      settings.testimonialsConfig = typeof settings.testimonialsConfig === 'string' ? JSON.parse(settings.testimonialsConfig) : settings.testimonialsConfig || {};
      settings.contactConfig = typeof settings.contactConfig === 'string' ? JSON.parse(settings.contactConfig) : settings.contactConfig || {};
      settings.footerConfig = typeof settings.footerConfig === 'string' ? JSON.parse(settings.footerConfig) : settings.footerConfig || {};
      settings.templatesConfig = typeof settings.templatesConfig === 'string' ? JSON.parse(settings.templatesConfig) : settings.templatesConfig || {};
    }
    
    cachedSettings = settings || {};
    lastCacheTime = now;
    return cachedSettings;
  } catch (error) {
    // If cached version exists, return it even if expired during DB blip
    if (cachedSettings) return cachedSettings;

    // Keep public pages deployable when build-time database access is unavailable.
    console.warn(
      'Using default platform settings because DB is unavailable:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return {};
  }
});
