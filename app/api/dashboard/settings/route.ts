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
    if (!auth.companyId) return apiError('Company not found', 404);

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT emailNotifications, leadNotifications, reviewNotifications, loginAlerts, subscriptionAlerts, customDomain, googleAnalyticsId FROM settings WHERE companyId = ?',
      [auth.companyId],
    );

    return apiSuccess(mapRow(rows[0]));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load settings';
    return apiError(message, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('Company not found', 404);

    const body = await parseBody(request);
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
    const message = error instanceof Error ? error.message : 'Failed to save settings';
    return apiError(message, 500);
  }
}
