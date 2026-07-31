import 'server-only';
import { cache } from 'react';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

/**
 * Deduplicates settings reads during a server render.
 */
export const getPlatformSettings = cache(async () => {
  try {
    const [settingsList] = await pool.execute<RowDataPacket[]>('SELECT * FROM platform_settings LIMIT 1');
    
    let settings = settingsList[0];
    
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
    }
    
    return settings || {};
  } catch (error) {
    // Keep public pages deployable when build-time database access is unavailable.
    console.warn(
      'Using default platform settings because DB is unavailable:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return {};
  }
});
