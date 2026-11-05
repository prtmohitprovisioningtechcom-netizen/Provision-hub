import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';

let tablesReady = false;

async function ensureSoftwareTables() {
  if (tablesReady) return;

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS vyapari_sw_users (
      id VARCHAR(36) PRIMARY KEY,
      shopName VARCHAR(255) NOT NULL,
      ownerName VARCHAR(255) NOT NULL,
      phone VARCHAR(30) NOT NULL UNIQUE,
      gstNumber VARCHAR(64) DEFAULT '',
      address VARCHAR(500) DEFAULT '',
      passwordHash VARCHAR(255) NOT NULL,
      isPaidPro BOOLEAN DEFAULT FALSE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS vyapari_sw_bills (
      id VARCHAR(36) PRIMARY KEY,
      userId VARCHAR(36) NOT NULL,
      invoiceNo VARCHAR(64) NOT NULL,
      customerName VARCHAR(255) NOT NULL,
      customerPhone VARCHAR(50) DEFAULT '',
      isGst BOOLEAN DEFAULT FALSE,
      gstRate DECIMAL(5,2) DEFAULT 18,
      items JSON NOT NULL,
      subtotal DECIMAL(12,2) DEFAULT 0,
      discount DECIMAL(12,2) DEFAULT 0,
      gstAmount DECIMAL(12,2) DEFAULT 0,
      grandTotal DECIMAL(12,2) DEFAULT 0,
      status ENUM('paid', 'unpaid') DEFAULT 'paid',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_sw_bills_user (userId, createdAt)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS vyapari_sw_khata (
      id VARCHAR(36) PRIMARY KEY,
      userId VARCHAR(36) NOT NULL,
      customerName VARCHAR(255) NOT NULL,
      customerPhone VARCHAR(50) DEFAULT '',
      entries JSON NOT NULL,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_sw_khata_user (userId, updatedAt)
    )
  `);

  tablesReady = true;
}

function hashPass(raw: string) {
  return crypto.createHash('sha256').update(raw.trim()).digest('hex');
}

export async function GET(request: NextRequest) {
  try {
    await ensureSoftwareTables();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return apiError('userId is required', 400);

    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, shopName, ownerName, phone, gstNumber, address, isPaidPro, createdAt FROM vyapari_sw_users WHERE id = ? LIMIT 1',
      [userId],
    );
    if (!users.length) return apiError('User not found', 404);

    const [bills] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM vyapari_sw_bills WHERE userId = ? ORDER BY createdAt DESC',
      [userId],
    );

    const [khata] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM vyapari_sw_khata WHERE userId = ? ORDER BY updatedAt DESC',
      [userId],
    );

    return apiSuccess({
      user: {
        ...users[0],
        isPaidPro: Boolean(users[0].isPaidPro),
      },
      bills: bills.map((b) => ({
        ...b,
        isGst: Boolean(b.isGst),
        gstRate: Number(b.gstRate || 0),
        subtotal: Number(b.subtotal || 0),
        discount: Number(b.discount || 0),
        gstAmount: Number(b.gstAmount || 0),
        grandTotal: Number(b.grandTotal || 0),
        items: typeof b.items === 'string' ? JSON.parse(b.items) : b.items || [],
      })),
      khata: khata.map((k) => ({
        ...k,
        entries: typeof k.entries === 'string' ? JSON.parse(k.entries) : k.entries || [],
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load software data';
    return apiError(message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSoftwareTables();
    const body = (await parseBody(request)) as any;
    const action = body?.action;

    if (action === 'register') {
      const phone = String(body.phone || '').replace(/\D/g, '').slice(-10);
      const shopName = String(body.shopName || '').trim();
      const ownerName = String(body.ownerName || '').trim();
      const password = String(body.password || '').trim();

      if (!shopName || !ownerName || phone.length < 10 || !password) {
        return apiError('Please fill Shop Name, Owner Name, 10-digit Mobile & Password', 400);
      }

      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM vyapari_sw_users WHERE phone = ? LIMIT 1',
        [phone],
      );
      if (existing.length > 0) {
        return apiError('This mobile number is already registered. Please Login!', 409);
      }

      const id = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO vyapari_sw_users (id, shopName, ownerName, phone, gstNumber, address, passwordHash)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          shopName,
          ownerName,
          phone,
          String(body.gstNumber || '').trim(),
          String(body.address || '').trim(),
          hashPass(password),
        ],
      );

      return apiSuccess(
        {
          id,
          shopName,
          ownerName,
          phone,
          isPaidPro: false,
        },
        'Registered successfully',
        201,
      );
    }

    if (action === 'login') {
      const phone = String(body.phone || '').replace(/\D/g, '').slice(-10);
      const password = String(body.password || '').trim();

      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM vyapari_sw_users WHERE phone = ? LIMIT 1',
        [phone],
      );
      if (!rows.length || rows[0].passwordHash !== hashPass(password)) {
        return apiError('Invalid Mobile Number or Password', 401);
      }

      const u = rows[0];
      return apiSuccess({
        id: u.id,
        shopName: u.shopName,
        ownerName: u.ownerName,
        phone: u.phone,
        gstNumber: u.gstNumber || '',
        address: u.address || '',
        isPaidPro: Boolean(u.isPaidPro),
      });
    }

    if (action === 'create_bill') {
      const { userId } = body;
      if (!userId) return apiError('Unauthorized', 401);

      const [users] = await pool.execute<RowDataPacket[]>(
        'SELECT isPaidPro FROM vyapari_sw_users WHERE id = ? LIMIT 1',
        [userId],
      );
      if (!users.length) return apiError('User not found', 404);
      const isPaidPro = Boolean(users[0].isPaidPro);

      const [countRows] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM vyapari_sw_bills WHERE userId = ?',
        [userId],
      );
      const currentCount = Number(countRows[0]?.total || 0);

      if (!isPaidPro && currentCount >= 3) {
        return apiError('FREE_LIMIT_REACHED', 402);
      }

      const id = crypto.randomUUID();
      const invoiceNo = body.invoiceNo || `BB-${1001 + currentCount}`;
      const items = Array.isArray(body.items) ? body.items : [];
      const subtotal = Number(body.subtotal || 0);
      const discount = Number(body.discount || 0);
      const gstAmount = Number(body.gstAmount || 0);
      const grandTotal = Number(body.grandTotal || 0);

      await pool.execute(
        `INSERT INTO vyapari_sw_bills
         (id, userId, invoiceNo, customerName, customerPhone, isGst, gstRate, items, subtotal, discount, gstAmount, grandTotal, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          userId,
          invoiceNo,
          String(body.customerName || 'Customer').trim(),
          String(body.customerPhone || '').trim(),
          Boolean(body.isGst),
          Number(body.gstRate || 18),
          JSON.stringify(items),
          subtotal,
          discount,
          gstAmount,
          grandTotal,
          body.status === 'unpaid' ? 'unpaid' : 'paid',
        ],
      );

      return apiSuccess(
        {
          id,
          userId,
          invoiceNo,
          customerName: String(body.customerName || 'Customer').trim(),
          customerPhone: String(body.customerPhone || '').trim(),
          isGst: Boolean(body.isGst),
          gstRate: Number(body.gstRate || 18),
          items,
          subtotal,
          discount,
          gstAmount,
          grandTotal,
          status: body.status === 'unpaid' ? 'unpaid' : 'paid',
          createdAt: new Date().toISOString(),
        },
        'Bill saved',
        201,
      );
    }

    if (action === 'toggle_bill_status') {
      const { userId, billId, status } = body;
      await pool.execute(
        'UPDATE vyapari_sw_bills SET status = ? WHERE id = ? AND userId = ?',
        [status === 'paid' ? 'paid' : 'unpaid', billId, userId],
      );
      return apiSuccess({ billId, status });
    }

    if (action === 'save_khata_customer') {
      const { userId, customer } = body;
      if (!userId || !customer?.name) return apiError('Missing details', 400);

      const id = customer.id || crypto.randomUUID();
      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM vyapari_sw_khata WHERE id = ? AND userId = ?',
        [id, userId],
      );

      if (existing.length > 0) {
        await pool.execute(
          'UPDATE vyapari_sw_khata SET entries = ?, customerName = ?, customerPhone = ? WHERE id = ? AND userId = ?',
          [
            JSON.stringify(customer.entries || []),
            customer.name,
            customer.phone || '',
            id,
            userId,
          ],
        );
      } else {
        await pool.execute(
          'INSERT INTO vyapari_sw_khata (id, userId, customerName, customerPhone, entries) VALUES (?, ?, ?, ?, ?)',
          [
            id,
            userId,
            customer.name,
            customer.phone || '',
            JSON.stringify(customer.entries || []),
          ],
        );
      }

      return apiSuccess({ id, ...customer });
    }

    return apiError('Invalid action', 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return apiError(message, 500);
  }
}

