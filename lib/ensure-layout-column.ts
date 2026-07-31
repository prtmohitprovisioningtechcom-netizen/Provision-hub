import pool from '@/lib/db';

let ensurePromise: Promise<void> | null = null;

/** Idempotent: adds layoutId column on older databases. Server-only. */
export function ensureLandingPageLayoutColumn(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      try {
        await pool.execute(
          "ALTER TABLE landing_pages ADD COLUMN layoutId VARCHAR(16) NOT NULL DEFAULT '1'",
        );
      } catch (error: unknown) {
        const code =
          error && typeof error === 'object' && 'code' in error
            ? String((error as { code?: string }).code)
            : '';
        if (code !== 'ER_DUP_FIELDNAME') {
          const message = error instanceof Error ? error.message : '';
          if (!/duplicate column/i.test(message)) {
            console.warn('ensureLandingPageLayoutColumn:', message || error);
          }
        }
      }
    })();
  }
  return ensurePromise;
}
