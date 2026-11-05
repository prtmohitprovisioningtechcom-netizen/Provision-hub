import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';

let tableInitialized = false;

async function ensureInvoicesTable() {
  if (tableInitialized) return;
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS merchant_invoices (
      id VARCHAR(36) PRIMARY KEY,
      companyId VARCHAR(36) NOT NULL,
      invoiceNumber VARCHAR(64) NOT NULL,
      customerName VARCHAR(255) NOT NULL,
      customerPhone VARCHAR(50) NOT NULL,
      customerAddress VARCHAR(500) DEFAULT '',
      customerGst VARCHAR(64) DEFAULT '',
      isGstBill BOOLEAN DEFAULT FALSE,
      gstRate DECIMAL(5,2) DEFAULT 0,
      items JSON NOT NULL,
      subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
      discount DECIMAL(12,2) NOT NULL DEFAULT 0,
      gstAmount DECIMAL(12,2) NOT NULL DEFAULT 0,
      grandTotal DECIMAL(12,2) NOT NULL DEFAULT 0,
      status ENUM('paid', 'unpaid', 'partial') DEFAULT 'paid',
      paymentMode VARCHAR(50) DEFAULT 'UPI',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_company_created (companyId, createdAt)
    )
  `);
  tableInitialized = true;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;
    const companyId = auth.companyId || auth.userId;

    await ensureInvoicesTable();

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM merchant_invoices WHERE companyId = ? ORDER BY createdAt DESC LIMIT 200',
      [companyId],
    );

    const invoices = rows.map((row) => ({
      ...row,
      isGstBill: Boolean(row.isGstBill),
      gstRate: Number(row.gstRate || 0),
      subtotal: Number(row.subtotal || 0),
      discount: Number(row.discount || 0),
      gstAmount: Number(row.gstAmount || 0),
      grandTotal: Number(row.grandTotal || 0),
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
    }));

    return apiSuccess(invoices);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load invoices';
    return apiError(message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;
    const companyId = auth.companyId || auth.userId;

    await ensureInvoicesTable();

    const body = (await parseBody(request)) as any;
    if (!body?.customerName || !Array.isArray(body?.items) || body.items.length === 0) {
      return apiError('Customer name and at least 1 item are required', 400);
    }

    const id = crypto.randomUUID();
    const invoiceNumber =
      body.invoiceNumber ||
      `BB-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const isGstBill = Boolean(body.isGstBill);
    const gstRate = isGstBill ? Number(body.gstRate || 18) : 0;
    const items = body.items.map((item: any) => ({
      name: String(item.name || 'Item'),
      qty: Math.max(1, Number(item.qty || 1)),
      price: Math.max(0, Number(item.price || 0)),
    }));

    const subtotal = items.reduce((sum: number, it: any) => sum + it.qty * it.price, 0);
    const discount = Math.max(0, Number(body.discount || 0));
    const taxable = Math.max(0, subtotal - discount);
    const gstAmount = isGstBill ? Number(((taxable * gstRate) / 100).toFixed(2)) : 0;
    const grandTotal = Number((taxable + gstAmount).toFixed(2));
    const status = ['paid', 'unpaid', 'partial'].includes(body.status) ? body.status : 'paid';
    const paymentMode = String(body.paymentMode || 'UPI');

    await pool.execute(
      `INSERT INTO merchant_invoices (
        id, companyId, invoiceNumber, customerName, customerPhone, customerAddress, customerGst,
        isGstBill, gstRate, items, subtotal, discount, gstAmount, grandTotal, status, paymentMode, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        companyId,
        invoiceNumber,
        String(body.customerName).trim(),
        String(body.customerPhone || '').trim(),
        String(body.customerAddress || '').trim(),
        String(body.customerGst || '').trim(),
        isGstBill,
        gstRate,
        JSON.stringify(items),
        subtotal,
        discount,
        gstAmount,
        grandTotal,
        status,
        paymentMode,
        String(body.notes || '').trim(),
      ],
    );

    const [created] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM merchant_invoices WHERE id = ?',
      [id],
    );
    const row = created[0];

    return apiSuccess(
      {
        ...row,
        isGstBill: Boolean(row.isGstBill),
        gstRate: Number(row.gstRate || 0),
        subtotal: Number(row.subtotal || 0),
        discount: Number(row.discount || 0),
        gstAmount: Number(row.gstAmount || 0),
        grandTotal: Number(row.grandTotal || 0),
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
      },
      'Invoice saved successfully',
      201,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create invoice';
    return apiError(message, 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;
    const companyId = auth.companyId || auth.userId;

    await ensureInvoicesTable();
    const body = (await parseBody(request)) as { id?: string; status?: string };
    if (!body?.id || !body?.status) {
      return apiError('Invoice ID and status are required', 400);
    }

    await pool.execute(
      'UPDATE merchant_invoices SET status = ? WHERE id = ? AND companyId = ?',
      [body.status, body.id, companyId],
    );

    return apiSuccess({ id: body.id, status: body.status }, 'Invoice status updated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update invoice';
    return apiError(message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin', 'super_admin']);
    if (auth instanceof Response) return auth;
    const companyId = auth.companyId || auth.userId;

    await ensureInvoicesTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return apiError('Invoice ID required', 400);

    await pool.execute('DELETE FROM merchant_invoices WHERE id = ? AND companyId = ?', [
      id,
      companyId,
    ]);

    return apiSuccess({ id }, 'Invoice deleted');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete invoice';
    return apiError(message, 500);
  }
}

