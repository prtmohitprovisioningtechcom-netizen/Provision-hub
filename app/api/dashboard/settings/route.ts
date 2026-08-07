import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';

type SettingsRow = {
  emailNotifications: boolean;
  leadNotifications: boolean;
  reviewNotifications: boolean;
  loginAlerts: boolean;
  subscriptionAlerts: boolean;
  customDomain: string;
  googleAnalyticsId: string;
};

const DEFAULTS: SettingsRow = {
  emailNotifications: true,
  leadNotifications: true,
  reviewNotifications: true,
  loginAlerts: true,
  subscriptionAlerts: true,
  customDomain: '',
  googleAnalyticsId: '',
};

let ensureTablePromise: Promise<void> | null = null;

function ensureSettingsTable(): Promise<void> {
  if (!ensureTablePromise) {
    ensureTablePromise = (async () => {
      try {
        await pool.execute(`
          CREATE TABLE IF NOT EXISTS settings (
            id VARCHAR(36) PRIMARY KEY,
            companyId VARCHAR(36) NOT NULL UNIQUE,
            emailNotifications BOOLEAN DEFAULT TRUE,
            leadNotifications BOOLEAN DEFAULT TRUE,
            reviewNotifications BOOLEAN DEFAULT TRUE,
            loginAlerts BOOLEAN DEFAULT TRUE,
            subscriptionAlerts BOOLEAN DEFAULT TRUE,
            customDomain VARCHAR(255),
            googleAnalyticsId VARCHAR(255),
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
      } catch (error) {
        console.warn('ensureSettingsTable:', error);
      }
    })();
  }
  return ensureTablePromise;
}

function mapRow(row?: RowDataPacket | null): SettingsRow {
  if (!row) return { ...DEFAULTS };
  return {
    emailNotifications: Boolean(row.emailNotifications),
    leadNotifications: Boolean(row.leadNotifications),
    reviewNotifications: Boolean(row.reviewNotifications),
    loginAlerts: Boolean(row.loginAlerts),
    subscriptionAlerts: Boolean(row.subscriptionAlerts),
    customDomain: String(row.customDomain || ''),
    googleAnalyticsId: String(row.googleAnalyticsId || ''),
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    await ensureSettingsTable();

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT emailNotifications, leadNotifications, reviewNotifications, loginAlerts, subscriptionAlerts, customDomain, googleAnalyticsId FROM settings WHERE companyId = ?',
        [auth.companyId],
      );
      return apiSuccess(mapRow(rows[0]));
    } catch {
      // Table/query issues should not break Settings page
      return apiSuccess({ ...DEFAULTS });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load settings';
    return apiError(message, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    await ensureSettingsTable();

    const body = await parseBody<Partial<SettingsRow>>(request);
    const next: SettingsRow = {
      emailNotifications:
        body.emailNotifications !== undefined
          ? Boolean(body.emailNotifications)
          : DEFAULTS.emailNotifications,
      leadNotifications:
        body.leadNotifications !== undefined
          ? Boolean(body.leadNotifications)
          : DEFAULTS.leadNotifications,
      reviewNotifications:
        body.reviewNotifications !== undefined
          ? Boolean(body.reviewNotifications)
          : DEFAULTS.reviewNotifications,
      loginAlerts:
        body.loginAlerts !== undefined ? Boolean(body.loginAlerts) : DEFAULTS.loginAlerts,
      subscriptionAlerts:
        body.subscriptionAlerts !== undefined
          ? Boolean(body.subscriptionAlerts)
          : DEFAULTS.subscriptionAlerts,
      customDomain: String(body.customDomain || '').trim(),
      googleAnalyticsId: String(body.googleAnalyticsId || '').trim(),
    };

    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM settings WHERE companyId = ?',
      [auth.companyId],
    );

    if (existing.length === 0) {
      await pool.execute(
        `INSERT INTO settings (
          id, companyId, emailNotifications, leadNotifications, reviewNotifications,
          loginAlerts, subscriptionAlerts, customDomain, googleAnalyticsId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          auth.companyId,
          next.emailNotifications ? 1 : 0,
          next.leadNotifications ? 1 : 0,
          next.reviewNotifications ? 1 : 0,
          next.loginAlerts ? 1 : 0,
          next.subscriptionAlerts ? 1 : 0,
          next.customDomain || null,
          next.googleAnalyticsId || null,
        ],
      );
    } else {
      await pool.execute(
        `UPDATE settings SET
          emailNotifications = ?,
          leadNotifications = ?,
          reviewNotifications = ?,
          loginAlerts = ?,
          subscriptionAlerts = ?,
          customDomain = ?,
          googleAnalyticsId = ?
        WHERE companyId = ?`,
        [
          next.emailNotifications ? 1 : 0,
          next.leadNotifications ? 1 : 0,
          next.reviewNotifications ? 1 : 0,
          next.loginAlerts ? 1 : 0,
          next.subscriptionAlerts ? 1 : 0,
          next.customDomain || null,
          next.googleAnalyticsId || null,
          auth.companyId,
        ],
      );
    }

    return apiSuccess(next, 'Settings saved');
  } catch (error) {
    console.error('Settings save failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to save settings';
    return apiError(message, 500);
  }
}
