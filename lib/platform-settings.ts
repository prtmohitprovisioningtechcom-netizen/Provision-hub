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

const LEGACY_BRAND_REGEX =
  /Multi-Tenant(?:\s+Platform)?(?:\s+Provisioning\s+Tech)?|multitenant|multi-tenant|TenantHub|ProvisioningTechHub|Provisioning\s+Tech/gi;

function sanitizeBrandStrings<T>(val: T): T {
  if (typeof val === 'string') {
    return val.replace(LEGACY_BRAND_REGEX, 'Bhartiyebazar') as unknown as T;
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeBrandStrings) as unknown as T;
  }
  if (val && typeof val === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = sanitizeBrandStrings(v);
    }
    return out as T;
  }
  return val;
}

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
      settings.heroConfig = sanitizeBrandStrings(typeof settings.heroConfig === 'string' ? JSON.parse(settings.heroConfig) : settings.heroConfig || {});
      settings.themeConfig = sanitizeBrandStrings(typeof settings.themeConfig === 'string' ? JSON.parse(settings.themeConfig) : settings.themeConfig || {});
      if (settings.themeConfig) {
        settings.themeConfig.logoText = 'Bhartiyebazar';
      }
      settings.featureToggles = typeof settings.featureToggles === 'string' ? JSON.parse(settings.featureToggles) : settings.featureToggles || {};
      settings.seoConfig = sanitizeBrandStrings(typeof settings.seoConfig === 'string' ? JSON.parse(settings.seoConfig) : settings.seoConfig || {});
      settings.featuresConfig = sanitizeBrandStrings(typeof settings.featuresConfig === 'string' ? JSON.parse(settings.featuresConfig) : settings.featuresConfig || {});
      settings.howItWorksConfig = sanitizeBrandStrings(typeof settings.howItWorksConfig === 'string' ? JSON.parse(settings.howItWorksConfig) : settings.howItWorksConfig || {});
      settings.pricingConfig = sanitizeBrandStrings(typeof settings.pricingConfig === 'string' ? JSON.parse(settings.pricingConfig) : settings.pricingConfig || {});
      settings.faqConfig = sanitizeBrandStrings(typeof settings.faqConfig === 'string' ? JSON.parse(settings.faqConfig) : settings.faqConfig || {});
      settings.testimonialsConfig = sanitizeBrandStrings(typeof settings.testimonialsConfig === 'string' ? JSON.parse(settings.testimonialsConfig) : settings.testimonialsConfig || {});
      settings.contactConfig = sanitizeBrandStrings(typeof settings.contactConfig === 'string' ? JSON.parse(settings.contactConfig) : settings.contactConfig || {});
      settings.footerConfig = sanitizeBrandStrings(typeof settings.footerConfig === 'string' ? JSON.parse(settings.footerConfig) : settings.footerConfig || {});
      settings.templatesConfig = sanitizeBrandStrings(typeof settings.templatesConfig === 'string' ? JSON.parse(settings.templatesConfig) : settings.templatesConfig || {});
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
