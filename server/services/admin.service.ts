// @ts-nocheck
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';

export class AdminService {
  static async getDashboardStats() {
    const [[totalUsersRes], [totalCompaniesRes], [pendingCompaniesRes], [totalLeadsRes], [totalReviewsRes]] =
      await Promise.all([
        pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM users'),
        pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM companies'),
        pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM companies WHERE status = "pending"'),
        pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM leads'),
        pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM reviews'),
      ]);

    const [recentCompanies] = await pool.execute<RowDataPacket[]>(
      'SELECT id as _id, name, slug, status, createdAt FROM companies ORDER BY createdAt DESC LIMIT 5'
    );

    const [companiesByCategory] = await pool.execute<RowDataPacket[]>(
      'SELECT category as _id, COUNT(*) as count FROM companies GROUP BY category ORDER BY count DESC LIMIT 10'
    );

    return {
      stats: {
        totalUsers: totalUsersRes[0].count,
        totalCompanies: totalCompaniesRes[0].count,
        pendingCompanies: pendingCompaniesRes[0].count,
        totalLeads: totalLeadsRes[0].count,
        totalReviews: totalReviewsRes[0].count,
      },
      recentCompanies,
      companiesByCategory,
    };
  }

  static async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [[countResult], [users]] = await Promise.all([
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM users'),
      pool.execute<RowDataPacket[]>('SELECT id as _id, name, email, phone, role, avatar, isEmailVerified, companyId, createdAt, updatedAt FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?', [limit, skip]),
    ]);

    const total = countResult[0].count;

    return { 
      users: users.map(u => ({ ...u, isEmailVerified: Boolean(u.isEmailVerified) })), 
      total, 
      page, 
      limit, 
      totalPages: Math.ceil(total / limit) 
    };
  }

  static async createSuperAdmin() {
    const [existing] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE role = "super_admin" LIMIT 1');
    if (existing.length > 0) return existing[0];

    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword('Admin@123');
    const id = crypto.randomUUID();

    await pool.execute(
      'INSERT INTO users (id, name, email, password, role, isEmailVerified) VALUES (?, ?, ?, ?, ?, ?)',
      [id, 'Super Admin', 'admin@tenanthub.com', hashedPassword, 'super_admin', true]
    );
    
    const [users] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
    return users[0];
  }
}
