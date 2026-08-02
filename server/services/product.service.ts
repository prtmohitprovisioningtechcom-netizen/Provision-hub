// @ts-nocheck
import crypto from 'crypto';
import pool from '@/lib/db';
import { generateSlug, getPaginationMeta, sqlLimitOffset } from '@/lib/utils';
import { ProductInput } from '@/lib/validators';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ProductService {
  static async create(companyId: string, data: ProductInput) {
    const slug = generateSlug(data.name);
    const id = crypto.randomUUID();

    await pool.execute(
      'INSERT INTO products (id, companyId, name, slug, description, price, offerPrice, category, images, stock, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, companyId, data.name, slug, data.description, data.price,
        data.offerPrice || null, data.category, JSON.stringify(data.images || []),
        data.stock || 0, data.status || 'active'
      ]
    );

    return await this.getById(id);
  }

  static async getByCompany(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [[countResult], [products]] = await Promise.all([
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM products WHERE companyId = ?', [companyId]),
      pool.execute<RowDataPacket[]>(
        `SELECT * FROM products WHERE companyId = ? ORDER BY createdAt DESC ${sqlLimitOffset(limit, skip)}`,
        [companyId],
      ),
    ]);

    return {
      products: products.map(p => ({
        ...p,
        _id: p.id,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images
      })),
      pagination: getPaginationMeta(page, limit, countResult[0].count)
    };
  }

  static async getById(id: string) {
    const [products] = await pool.execute<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
    if (products.length === 0) throw new Error('Product not found');
    const p = products[0];
    
    return {
      ...p,
      _id: p.id,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images
    };
  }

  static async update(id: string, data: Partial<ProductInput>) {
    if (Object.keys(data).length === 0) return await this.getById(id);

    const keys = Object.keys(data);
    let setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => {
      const val = data[k as keyof ProductInput];
      return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
    });

    if (data.name && !data.slug) {
      setClause += ', slug = ?';
      params.push(generateSlug(data.name));
    }

    params.push(id);

    await pool.execute(`UPDATE products SET ${setClause} WHERE id = ?`, params);
    return await this.getById(id);
  }

  static async delete(id: string) {
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    return { message: 'Product deleted' };
  }
}
