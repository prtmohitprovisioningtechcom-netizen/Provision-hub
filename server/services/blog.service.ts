// @ts-nocheck
import crypto from 'crypto';
import pool from '@/lib/db';
import { generateSlug, getPaginationMeta } from '@/lib/utils';
import { BlogInput } from '@/lib/validators';
import { RowDataPacket } from 'mysql2';

export class BlogService {
  static async create(companyId: string, authorId: string, data: BlogInput) {
    const slug = generateSlug(data.title);
    const id = crypto.randomUUID();

    await pool.execute(
      'INSERT INTO blogs (id, companyId, authorId, title, slug, content, excerpt, category, featuredImage, status, seo, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, companyId, authorId, data.title, slug, data.content,
        data.excerpt || null, data.category, data.featuredImage || null,
        data.status || 'draft', JSON.stringify({}), JSON.stringify([])
      ]
    );

    const [blogs] = await pool.execute<RowDataPacket[]>('SELECT * FROM blogs WHERE id = ?', [id]);
    return { ...blogs[0], _id: blogs[0].id };
  }

  static async getByCompany(companyId: string, page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;

    let queryStr = 'SELECT * FROM blogs WHERE companyId = ?';
    let countQueryStr = 'SELECT COUNT(*) as count FROM blogs WHERE companyId = ?';
    const params: unknown[] = [companyId];

    if (status) {
      queryStr += ' AND status = ?';
      countQueryStr += ' AND status = ?';
      params.push(status);
    }

    queryStr += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';

    const [[countResult], [blogs]] = await Promise.all([
      pool.execute<RowDataPacket[]>(countQueryStr, params),
      pool.execute<RowDataPacket[]>(queryStr, [...params, limit, skip])
    ]);

    return { 
      blogs: blogs.map(b => ({ ...b, _id: b.id, seo: typeof b.seo === 'string' ? JSON.parse(b.seo) : b.seo, comments: typeof b.comments === 'string' ? JSON.parse(b.comments) : b.comments })), 
      pagination: getPaginationMeta(page, limit, countResult[0].count) 
    };
  }

  static async getBySlug(companyId: string, slug: string) {
    const [blogs] = await pool.execute<RowDataPacket[]>('SELECT * FROM blogs WHERE companyId = ? AND slug = ? AND status = "published"', [companyId, slug]);
    if (blogs.length === 0) throw new Error('Blog not found');
    const b = blogs[0];
    return {
      ...b,
      _id: b.id,
      seo: typeof b.seo === 'string' ? JSON.parse(b.seo) : b.seo,
      comments: typeof b.comments === 'string' ? JSON.parse(b.comments) : b.comments
    };
  }

  static async update(id: string, data: Partial<BlogInput>) {
    if (Object.keys(data).length === 0) {
      const [blogs] = await pool.execute<RowDataPacket[]>('SELECT * FROM blogs WHERE id = ?', [id]);
      return { ...blogs[0], _id: blogs[0].id };
    }

    const keys = Object.keys(data);
    let setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => {
      const val = data[k as keyof BlogInput];
      return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
    });

    if (data.title && !data.slug) {
      setClause += ', slug = ?';
      params.push(generateSlug(data.title));
    }

    params.push(id);

    await pool.execute(`UPDATE blogs SET ${setClause} WHERE id = ?`, params);
    
    const [blogs] = await pool.execute<RowDataPacket[]>('SELECT * FROM blogs WHERE id = ?', [id]);
    if (blogs.length === 0) throw new Error('Blog not found');
    return { ...blogs[0], _id: blogs[0].id };
  }

  static async delete(id: string) {
    await pool.execute('DELETE FROM blogs WHERE id = ?', [id]);
    return { message: 'Blog deleted' };
  }
}
