// @ts-nocheck
import pool from '@/lib/db';
import { getPaginationMeta, sqlLimitOffset } from '@/lib/utils';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';

export class ReviewService {
  static async create(data: {
    companyId: string;
    userId?: string;
    customerName: string;
    rating: number;
    comment: string;
    images?: string[];
  }) {
    const [companies] = await pool.execute<RowDataPacket[]>('SELECT * FROM companies WHERE id = ?', [data.companyId]);
    if (companies.length === 0) throw new Error('Company not found');
    const company = companies[0];

    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO reviews (id, companyId, userId, customerName, rating, comment, images, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, data.companyId, data.userId || null, data.customerName, data.rating, 
        data.comment, JSON.stringify(data.images || []), 'pending'
      ]
    );

    await pool.execute(
      'INSERT INTO notifications (id, userId, companyId, type, title, message, link) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), company.ownerId, company.id, 'new_review', 'New Review', `${data.customerName} left a ${data.rating}-star review`, '/dashboard/reviews']
    );

    const [reviews] = await pool.execute<RowDataPacket[]>('SELECT * FROM reviews WHERE id = ?', [id]);
    return { ...reviews[0], _id: reviews[0].id };
  }

  static async getByCompany(companyId: string, page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;

    let queryStr = 'SELECT * FROM reviews WHERE companyId = ?';
    let countQueryStr = 'SELECT COUNT(*) as count FROM reviews WHERE companyId = ?';
    const params: unknown[] = [companyId];

    if (status) {
      queryStr += ' AND status = ?';
      countQueryStr += ' AND status = ?';
      params.push(status);
    }

    queryStr += ` ORDER BY createdAt DESC ${sqlLimitOffset(limit, skip)}`;

    const [[countResult], [reviews]] = await Promise.all([
      pool.execute<RowDataPacket[]>(countQueryStr, params),
      pool.execute<RowDataPacket[]>(queryStr, params),
    ]);

    return { 
      reviews: reviews.map(r => ({ ...r, _id: r.id, images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images })), 
      pagination: getPaginationMeta(page, limit, countResult[0].count) 
    };
  }

  static async updateStatus(id: string, status: string) {
    await pool.execute('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
    
    const [reviews] = await pool.execute<RowDataPacket[]>('SELECT * FROM reviews WHERE id = ?', [id]);
    if (reviews.length === 0) throw new Error('Review not found');
    const review = reviews[0];

    if (status === 'approved') {
      const [approvedReviews] = await pool.execute<RowDataPacket[]>('SELECT rating FROM reviews WHERE companyId = ? AND status = "approved"', [review.companyId]);
      if (approvedReviews.length > 0) {
        const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
        await pool.execute('UPDATE companies SET rating = ?, reviewCount = ? WHERE id = ?', [Math.round(avgRating * 10) / 10, approvedReviews.length, review.companyId]);
      }
    }

    return { ...review, _id: review.id };
  }

  static async delete(id: string) {
    await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);
    return { message: 'Review deleted' };
  }
}
