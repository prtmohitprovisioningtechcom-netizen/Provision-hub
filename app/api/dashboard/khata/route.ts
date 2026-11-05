import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';

let khataTablesInitialized = false;

async function ensureKhataTables() {
  if (khataTablesInitialized) return;
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS merchant_khata_customers (
      id VARCHAR(36) PRIMARY KEY,
      companyId VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      address VARCHAR(500) DEFAULT '',
      partyType ENUM('customer', 'supplier') DEFAULT 'customer',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_khata_company (companyId, createdAt)
    )
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS merchant_khata_entries (
      id VARCHAR(36) PRIMARY KEY,
      companyId VARCHAR(36) NOT NULL,
      customerId VARCHAR(36) NOT NULL,
      entryType ENUM('gave', 'got') NOT NULL,
      amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      note VARCHAR(500) DEFAULT '',
      entryDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_khata_entries_customer (companyId, customerId, entryDate)
    )
  `);
  khataTablesInitialized = true;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;
    const companyId = auth.companyId || auth.userId;

    await ensureKhataTables();

    const [customers] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM merchant_khata_customers WHERE companyId = ? ORDER BY updatedAt DESC',
      [companyId],
    );

    const [entries] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM merchant_khata_entries WHERE companyId = ? ORDER BY entryDate DESC, createdAt DESC',
      [companyId],
    );

    const formattedEntries = entries.map((e) => ({
      ...e,
      amount: Number(e.amount || 0),
    }));

    return apiSuccess({
      customers,
      entries: formattedEntries,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load Khata data';
    return apiError(message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;
    const companyId = auth.companyId || auth.userId;

    await ensureKhataTables();

    const body = (await parseBody(request)) as any;
    const action = body?.action || 'add_customer';

    if (action === 'add_customer') {
      if (!body?.name) {
        return apiError('Customer name is required', 400);
      }
      const customerId = crypto.randomUUID();
      const partyType = body.partyType === 'supplier' ? 'supplier' : 'customer';

      await pool.execute(
        `INSERT INTO merchant_khata_customers (id, companyId, name, phone, address, partyType)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          companyId,
          String(body.name).trim(),
          String(body.phone || '').trim(),
          String(body.address || '').trim(),
          partyType,
        ],
      );

      // Optional opening balance entry
      const openingAmount = Number(body.openingAmount || 0);
      if (openingAmount > 0) {
        const entryId = crypto.randomUUID();
        const entryType = body.openingType === 'got' ? 'got' : 'gave';
        await pool.execute(
          `INSERT INTO merchant_khata_entries (id, companyId, customerId, entryType, amount, note)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            entryId,
            companyId,
            customerId,
            entryType,
            openingAmount,
            String(body.openingNote || 'Opening Balance'),
          ],
        );
      }

      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM merchant_khata_customers WHERE id = ?',
        [customerId],
      );

      return apiSuccess(rows[0], 'Customer added to Bahi-Khata', 201);
    }

    if (action === 'add_entry') {
      if (!body?.customerId || !body?.amount || Number(body.amount) <= 0) {
        return apiError('Customer and valid amount are required', 400);
      }
      const entryId = crypto.randomUUID();
      const entryType = body.entryType === 'got' ? 'got' : 'gave';
      const amount = Number(body.amount);
      const note = String(body.note || '').trim();

      await pool.execute(
        `INSERT INTO merchant_khata_entries (id, companyId, customerId, entryType, amount, note)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [entryId, companyId, body.customerId, entryType, amount, note],
      );

      await pool.execute(
        'UPDATE merchant_khata_customers SET updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND companyId = ?',
        [body.customerId, companyId],
      );

      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM merchant_khata_entries WHERE id = ?',
        [entryId],
      );

      return apiSuccess(
        { ...rows[0], amount: Number(rows[0].amount || 0) },
        'Entry saved in Bahi-Khata',
        201,
      );
    }

    return apiError('Invalid action', 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save Khata record';
    return apiError(message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;
    const companyId = auth.companyId || auth.userId;

    await ensureKhataTables();
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const entryId = searchParams.get('entryId');

    if (entryId) {
      await pool.execute('DELETE FROM merchant_khata_entries WHERE id = ? AND companyId = ?', [
        entryId,
        companyId,
      ]);
      return apiSuccess({ entryId }, 'Entry deleted');
    }

    if (customerId) {
      await pool.execute(
        'DELETE FROM merchant_khata_entries WHERE customerId = ? AND companyId = ?',
        [customerId, companyId],
      );
      await pool.execute('DELETE FROM merchant_khata_customers WHERE id = ? AND companyId = ?', [
        customerId,
        companyId,
      ]);
      return apiSuccess({ customerId }, 'Customer deleted');
    }

    return apiError('Provide customerId or entryId', 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete Khata item';
    return apiError(message, 500);
  }
}

