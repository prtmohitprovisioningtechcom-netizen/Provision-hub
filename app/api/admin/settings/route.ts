import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { authenticateRequest } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/api-response';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const [settingsList] = await pool.execute<RowDataPacket[]>('SELECT * FROM platform_settings LIMIT 1');
    let settings = settingsList[0];

    if (!settings) {
      const id = crypto.randomUUID();
      await pool.execute('INSERT INTO platform_settings (id) VALUES (?)', [id]);
      const [newSettings] = await pool.execute<RowDataPacket[]>('SELECT * FROM platform_settings WHERE id = ?', [id]);
      settings = newSettings[0];
    }

    return apiSuccess({
      ...settings,
      heroConfig: typeof settings.heroConfig === 'string' ? JSON.parse(settings.heroConfig) : settings.heroConfig,
      themeConfig: typeof settings.themeConfig === 'string' ? JSON.parse(settings.themeConfig) : settings.themeConfig,
      featureToggles: typeof settings.featureToggles === 'string' ? JSON.parse(settings.featureToggles) : settings.featureToggles,
      seoConfig: typeof settings.seoConfig === 'string' ? JSON.parse(settings.seoConfig) : settings.seoConfig,
      featuresConfig: typeof settings.featuresConfig === 'string' ? JSON.parse(settings.featuresConfig) : settings.featuresConfig,
      howItWorksConfig: typeof settings.howItWorksConfig === 'string' ? JSON.parse(settings.howItWorksConfig) : settings.howItWorksConfig,
      pricingConfig: typeof settings.pricingConfig === 'string' ? JSON.parse(settings.pricingConfig) : settings.pricingConfig,
      faqConfig: typeof settings.faqConfig === 'string' ? JSON.parse(settings.faqConfig) : settings.faqConfig,
      testimonialsConfig: typeof settings.testimonialsConfig === 'string' ? JSON.parse(settings.testimonialsConfig) : settings.testimonialsConfig,
      contactConfig: typeof settings.contactConfig === 'string' ? JSON.parse(settings.contactConfig) : settings.contactConfig,
      footerConfig: typeof settings.footerConfig === 'string' ? JSON.parse(settings.footerConfig) : settings.footerConfig,
      templatesConfig: typeof settings.templatesConfig === 'string' ? JSON.parse(settings.templatesConfig) : settings.templatesConfig,
      customHeaderCode: settings.customHeaderCode || '',
    });
  } catch (error) {
    console.error('Failed to fetch platform settings:', error);
    return apiError('Failed to fetch settings', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user || user.role !== 'super_admin') {
      return apiError('Unauthorized', 403);
    }

    const data = await request.json();
    
    const [settingsList] = await pool.execute<RowDataPacket[]>('SELECT id FROM platform_settings LIMIT 1');
    
    let id;
    if (settingsList.length === 0) {
      id = crypto.randomUUID();
      await pool.execute('INSERT INTO platform_settings (id, updatedBy) VALUES (?, ?)', [id, user.userId]);
    } else {
      id = settingsList[0].id;
    }

    const updateFields = [
      'heroConfig', 'themeConfig', 'featureToggles', 'seoConfig', 'featuresConfig',
      'howItWorksConfig', 'pricingConfig', 'faqConfig', 'testimonialsConfig',
      'contactConfig', 'footerConfig', 'templatesConfig', 'customHeaderCode'
    ];

    const updates: Record<string, string> = {};
    for (const field of updateFields) {
      if (data[field] !== undefined) {
        updates[field] = field === 'customHeaderCode' ? data[field] : JSON.stringify(data[field]);
      }
    }

    if (Object.keys(updates).length > 0) {
      const keys = Object.keys(updates);
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const params = keys.map(k => updates[k]);
      params.push(user.userId, id);
      await pool.execute(`UPDATE platform_settings SET ${setClause}, updatedBy = ? WHERE id = ?`, params);
    }

    const [updatedList] = await pool.execute<RowDataPacket[]>('SELECT * FROM platform_settings WHERE id = ?', [id]);
    const settings = updatedList[0];

    revalidatePath('/', 'layout');
    revalidatePath('/search');
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/admin', 'layout');

    return apiSuccess({
      ...settings,
      heroConfig: typeof settings.heroConfig === 'string' ? JSON.parse(settings.heroConfig) : settings.heroConfig,
      themeConfig: typeof settings.themeConfig === 'string' ? JSON.parse(settings.themeConfig) : settings.themeConfig,
      featureToggles: typeof settings.featureToggles === 'string' ? JSON.parse(settings.featureToggles) : settings.featureToggles,
      seoConfig: typeof settings.seoConfig === 'string' ? JSON.parse(settings.seoConfig) : settings.seoConfig,
      featuresConfig: typeof settings.featuresConfig === 'string' ? JSON.parse(settings.featuresConfig) : settings.featuresConfig,
      howItWorksConfig: typeof settings.howItWorksConfig === 'string' ? JSON.parse(settings.howItWorksConfig) : settings.howItWorksConfig,
      pricingConfig: typeof settings.pricingConfig === 'string' ? JSON.parse(settings.pricingConfig) : settings.pricingConfig,
      faqConfig: typeof settings.faqConfig === 'string' ? JSON.parse(settings.faqConfig) : settings.faqConfig,
      testimonialsConfig: typeof settings.testimonialsConfig === 'string' ? JSON.parse(settings.testimonialsConfig) : settings.testimonialsConfig,
      contactConfig: typeof settings.contactConfig === 'string' ? JSON.parse(settings.contactConfig) : settings.contactConfig,
      footerConfig: typeof settings.footerConfig === 'string' ? JSON.parse(settings.footerConfig) : settings.footerConfig,
      templatesConfig: typeof settings.templatesConfig === 'string' ? JSON.parse(settings.templatesConfig) : settings.templatesConfig,
      customHeaderCode: settings.customHeaderCode || '',
    });
  } catch (error) {
    console.error('Failed to update platform settings:', error);
    return apiError('Failed to update settings', 500);
  }
}
