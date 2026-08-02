// @ts-nocheck
import crypto from 'crypto';
import pool from '@/lib/db';
import { generateSlug, getPaginationMeta, sqlLimitOffset } from '@/lib/utils';
import { ServiceInput } from '@/lib/validators';
import { RowDataPacket } from 'mysql2';

export class ServiceService {
  static async create(companyId: string, data: ServiceInput) {
    const slug = generateSlug(data.name);
    const id = crypto.randomUUID();

    await pool.execute(
      'INSERT INTO services (id, companyId, name, slug, description, price, duration, category, gallery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, companyId, data.name, slug, data.description, data.price, data.duration, data.category, JSON.stringify(data.gallery || [])]
    );

    return await this.getById(id);
  }

  static async getByCompany(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [[countResult], [services]] = await Promise.all([
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM services WHERE companyId = ?', [companyId]),
      pool.execute<RowDataPacket[]>(
        `SELECT * FROM services WHERE companyId = ? ORDER BY createdAt DESC ${sqlLimitOffset(limit, skip)}`,
        [companyId],
      ),
    ]);

    return {
      services: services.map(s => ({
        ...s,
        _id: s.id,
        gallery: typeof s.gallery === 'string' ? JSON.parse(s.gallery) : s.gallery
      })),
      pagination: getPaginationMeta(page, limit, countResult[0].count)
    };
  }

  static async getById(id: string) {
    const [services] = await pool.execute<RowDataPacket[]>('SELECT * FROM services WHERE id = ?', [id]);
    if (services.length === 0) throw new Error('Service not found');
    const s = services[0];
    
    return {
      ...s,
      _id: s.id,
      gallery: typeof s.gallery === 'string' ? JSON.parse(s.gallery) : s.gallery
    };
  }

  static async update(id: string, data: Partial<ServiceInput>) {
    if (Object.keys(data).length === 0) return await this.getById(id);

    const keys = Object.keys(data);
    let setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => {
      const val = data[k as keyof ServiceInput];
      return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
    });

    if (data.name && !data.slug) {
      setClause += ', slug = ?';
      params.push(generateSlug(data.name));
    }

    params.push(id);

    await pool.execute(`UPDATE services SET ${setClause} WHERE id = ?`, params);
    return await this.getById(id);
  }

  static async delete(id: string) {
    await pool.execute('DELETE FROM services WHERE id = ?', [id]);
    return { message: 'Service deleted' };
  }
}
