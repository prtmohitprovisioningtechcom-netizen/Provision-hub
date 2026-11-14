import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { SchoolService } from '@/server/services/school.service';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await SchoolService.ensureTables();

  const authUser = await requireAuth(request, ['super_admin']);
  if (authUser instanceof Response) return authUser;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const plan = searchParams.get('plan');
  const search = searchParams.get('search');

  try {
    let query = `
      SELECT s.*,
             COUNT(DISTINCT std.id) as totalStudents,
             COUNT(DISTINCT tch.id) as totalTeachers,
             COALESCE(SUM(pay.amount), 0) as totalFeesCollected
      FROM schools s
      LEFT JOIN school_students std ON std.schoolId = s.id AND std.status = 'active'
      LEFT JOIN school_teachers tch ON tch.schoolId = s.id AND tch.status = 'active'
      LEFT JOIN school_fee_payments pay ON pay.schoolId = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND s.status = ?';
      params.push(status);
    }
    if (plan && plan !== 'all') {
      query += ' AND s.plan = ?';
      params.push(plan);
    }
    if (search) {
      query += ' AND (s.name LIKE ? OR s.schoolCode LIKE ? OR s.city LIKE ? OR s.phone LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' GROUP BY s.id ORDER BY s.createdAt DESC';

    const [schools] = await pool.execute<RowDataPacket[]>(query, params);

    // Summary statistics
    const [summaryRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
         COUNT(*) as totalSchools,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeSchools,
         SUM(CASE WHEN plan = 'free_trial' THEN 1 ELSE 0 END) as trialSchools,
         SUM(CASE WHEN plan != 'free_trial' THEN 1 ELSE 0 END) as paidSchools
       FROM schools`
    );

    // Available plans
    const [plans] = await pool.execute<RowDataPacket[]>('SELECT * FROM school_plans ORDER BY priceMonthly ASC');

    return apiSuccess({
      schools,
      summary: summaryRows[0] || {},
      plans,
    });
  } catch (error: any) {
    console.error('Super Admin Schools GET error:', error);
    return apiError(error.message || 'Failed to fetch schools', 500);
  }
}

export async function POST(request: NextRequest) {
  await SchoolService.ensureTables();

  const authUser = await requireAuth(request, ['super_admin']);
  if (authUser instanceof Response) return authUser;

  const body = await parseBody<Record<string, any>>(request);
  if (!body) return apiError('Invalid request payload', 400);

  const { schoolId, action } = body;
  if (!schoolId) return apiError('School ID is required', 400);

  try {
    if (action === 'toggle_status') {
      const { status } = body;
      await pool.execute('UPDATE schools SET status = ? WHERE id = ?', [status, schoolId]);
      return apiSuccess({ message: `School status updated to ${status}` });
    }

    if (action === 'update_plan') {
      const { plan, durationMonths = 12 } = body;
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + Number(durationMonths));

      await pool.execute(
        'UPDATE schools SET plan = ?, planExpiresAt = ?, status = "active" WHERE id = ?',
        [plan, expiry, schoolId]
      );
      return apiSuccess({ message: `School upgraded to ${plan} plan until ${expiry.toLocaleDateString()}` });
    }

    return apiError('Unknown action', 400);
  } catch (error: any) {
    console.error('Super Admin Schools POST error:', error);
    return apiError(error.message || 'Operation failed', 500);
  }
}

