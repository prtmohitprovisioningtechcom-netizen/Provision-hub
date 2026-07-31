// @ts-nocheck
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';

export class LandingPageService {
  static async getByCompany(companyId: string) {
    const [pages] = await pool.execute<RowDataPacket[]>('SELECT * FROM landing_pages WHERE companyId = ?', [companyId]);
    if (pages.length === 0) throw new Error('Landing page not found');
    const page = pages[0];
    return {
      ...page,
      _id: page.id,
      sections: typeof page.sections === 'string' ? JSON.parse(page.sections) : (page.sections || []),
      pages: typeof page.pages === 'string' ? JSON.parse(page.pages) : (page.pages || []),
      isPublished: Boolean(page.isPublished)
    };
  }

  static async update(companyId: string, sections: Array<Record<string, unknown>>) {
    const [pages] = await pool.execute<RowDataPacket[]>('SELECT * FROM landing_pages WHERE companyId = ?', [companyId]);
    
    if (pages.length === 0) {
      const id = crypto.randomUUID();
      await pool.execute('INSERT INTO landing_pages (id, companyId, sections) VALUES (?, ?, ?)', [id, companyId, JSON.stringify(sections)]);
    } else {
      await pool.execute('UPDATE landing_pages SET sections = ? WHERE companyId = ?', [JSON.stringify(sections), companyId]);
    }
    
    return await this.getByCompany(companyId);
  }

  static async updateSection(
    companyId: string,
    sectionId: string,
    data: Record<string, unknown>,
  ) {
    const page = await this.getByCompany(companyId);

    const sectionIndex = page.sections.findIndex((s: any) => s.id === sectionId);
    if (sectionIndex === -1) throw new Error('Section not found');

    page.sections[sectionIndex] = { ...page.sections[sectionIndex], ...data };
    
    await pool.execute('UPDATE landing_pages SET sections = ? WHERE companyId = ?', [JSON.stringify(page.sections), companyId]);
    
    return page;
  }
}
