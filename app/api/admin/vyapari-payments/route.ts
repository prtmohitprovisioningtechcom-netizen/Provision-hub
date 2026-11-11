import { NextRequest } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { ensureSoftwareTables } from '@/app/api/vyapari-software/route';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;

    await ensureSoftwareTables();

    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get('status') || 'all'; // 'all' | 'paid' | 'pending' | 'unpaid'
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    // 1. Fetch all merchants with bill count & khata customer count
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        u.id,
        u.shopName,
        u.ownerName,
        u.phone,
        u.gstNumber,
        u.address,
        u.isPaidPro,
        COALESCE(u.planType, 'free') as planType,
        COALESCE(u.paymentStatus, 'unpaid') as paymentStatus,
        COALESCE(u.paymentAmount, 0) as paymentAmount,
        COALESCE(u.paymentReference, '') as paymentReference,
        u.paidAt,
        u.expiresAt,
        COALESCE(u.adminNotes, '') as adminNotes,
        u.createdAt,
        COALESCE(b.billsCount, 0) as totalBills,
        COALESCE(k.khataCount, 0) as totalKhataCustomers
      FROM vyapari_sw_users u
      LEFT JOIN (
        SELECT userId, COUNT(*) as billsCount FROM vyapari_sw_bills GROUP BY userId
      ) b ON b.userId = u.id
      LEFT JOIN (
        SELECT userId, COUNT(*) as khataCount FROM vyapari_sw_khata GROUP BY userId
      ) k ON k.userId = u.id
      ORDER BY u.createdAt DESC
    `);

    const allMerchants = rows.map((r) => {
      const isPaid = Boolean(r.isPaidPro) || r.paymentStatus === 'paid';
      const status = isPaid ? 'paid' : r.paymentStatus === 'pending' ? 'pending' : 'unpaid';
      return {
        id: r.id,
        shopName: r.shopName || '',
        ownerName: r.ownerName || '',
        phone: r.phone || '',
        gstNumber: r.gstNumber || '',
        address: r.address || '',
        isPaidPro: isPaid,
        planType: r.planType || 'free',
        paymentStatus: status,
        paymentAmount: Number(r.paymentAmount || 0),
        paymentReference: r.paymentReference || '',
        paidAt: r.paidAt ? new Date(r.paidAt).toISOString() : null,
        expiresAt: r.expiresAt ? new Date(r.expiresAt).toISOString() : null,
        adminNotes: r.adminNotes || '',
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
        totalBills: Number(r.totalBills || 0),
        totalKhataCustomers: Number(r.totalKhataCustomers || 0),
      };
    });

    // 2. Compute KPI Metrics
    const totalCount = allMerchants.length;
    const paidCount = allMerchants.filter((m) => m.paymentStatus === 'paid').length;
    const pendingCount = allMerchants.filter((m) => m.paymentStatus === 'pending').length;
    const unpaidCount = allMerchants.filter((m) => m.paymentStatus === 'unpaid').length;
    const totalRevenue = allMerchants
      .filter((m) => m.paymentStatus === 'paid')
      .reduce((sum, m) => sum + Number(m.paymentAmount || 0), 0);

    // 3. Apply Filters
    let filtered = allMerchants;
    if (filterStatus === 'paid') {
      filtered = filtered.filter((m) => m.paymentStatus === 'paid');
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter((m) => m.paymentStatus === 'pending');
    } else if (filterStatus === 'unpaid') {
      filtered = filtered.filter((m) => m.paymentStatus === 'unpaid');
    }

    if (search) {
      filtered = filtered.filter(
        (m) =>
          m.shopName.toLowerCase().includes(search) ||
          m.ownerName.toLowerCase().includes(search) ||
          m.phone.includes(search) ||
          m.paymentReference.toLowerCase().includes(search),
      );
    }

    return apiSuccess({
      stats: {
        total: totalCount,
        paid: paidCount,
        pending: pendingCount,
        unpaid: unpaidCount,
        totalRevenue,
      },
      merchants: filtered,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vyapari payments';
    return apiError(message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;

    await ensureSoftwareTables();

    const body = (await parseBody(request)) as any;
    const action = body?.action;
    const userId = body?.userId;

    if (!userId) return apiError('userId is required', 400);

    if (action === 'mark_paid') {
      const planType = body.planType === 'yearly' ? 'yearly' : 'monthly';
      const defaultAmt = planType === 'yearly' ? 999 : 199;
      const paymentAmount = Number(body.paymentAmount) > 0 ? Number(body.paymentAmount) : defaultAmt;
      const paymentReference = String(body.paymentReference || '').trim();
      const adminNotes = String(body.adminNotes || '').trim();

      const daysToAdd = planType === 'yearly' ? 365 : 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + daysToAdd);

      await pool.execute(
        `UPDATE vyapari_sw_users 
         SET isPaidPro = 1,
             paymentStatus = 'paid',
             planType = ?,
             paymentAmount = ?,
             paymentReference = ?,
             paidAt = NOW(),
             expiresAt = ?,
             adminNotes = ?
         WHERE id = ?`,
        [planType, paymentAmount, paymentReference, expiresAt, adminNotes, userId],
      );

      return apiSuccess({
        userId,
        isPaidPro: true,
        paymentStatus: 'paid',
        planType,
        paymentAmount,
        expiresAt: expiresAt.toISOString(),
      }, 'Merchant marked as PAID! Pro Unlimited Activated.');
    }

    if (action === 'mark_unpaid') {
      await pool.execute(
        `UPDATE vyapari_sw_users 
         SET isPaidPro = 0,
             paymentStatus = 'unpaid',
             expiresAt = NULL
         WHERE id = ?`,
        [userId],
      );

      return apiSuccess({
        userId,
        isPaidPro: false,
        paymentStatus: 'unpaid',
      }, 'Merchant marked as UNPAID. Pro Revoked.');
    }

    if (action === 'update_notes') {
      const adminNotes = String(body.adminNotes || '').trim();
      await pool.execute(
        `UPDATE vyapari_sw_users SET adminNotes = ? WHERE id = ?`,
        [adminNotes, userId],
      );
      return apiSuccess({ userId, adminNotes }, 'Admin notes updated.');
    }

    return apiError('Invalid action', 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    return apiError(message, 500);
  }
}

