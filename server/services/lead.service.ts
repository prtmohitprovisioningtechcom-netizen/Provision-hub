// @ts-nocheck
import crypto from 'crypto';
import pool from '@/lib/db';
import { getPaginationMeta } from '@/lib/utils';
import { sendEmail, leadNotificationEmailHtml } from '@/lib/email';
import { LeadInput } from '@/lib/validators';
import { RowDataPacket } from 'mysql2';

export class LeadService {
  static async create(data: LeadInput) {
    const [companies] = await pool.execute<RowDataPacket[]>('SELECT * FROM companies WHERE id = ?', [data.companyId]);
    if (companies.length === 0) throw new Error('Company not found');
    const company = companies[0];

    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO leads (id, companyId, customerName, email, phone, message, interestedService, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.companyId, data.customerName, data.email, data.phone, data.message, data.interestedService || null, data.status || 'new']
    );

    await pool.execute(
      'INSERT INTO notifications (id, userId, companyId, type, title, message, link) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), company.ownerId, company.id, 'new_lead', 'New Lead', `New enquiry from ${data.customerName}`, '/dashboard/leads']
    );

    await sendEmail({
      to: company.email,
      subject: `New Lead: ${data.customerName}`,
      html: leadNotificationEmailHtml(data),
    });

    const [leads] = await pool.execute<RowDataPacket[]>('SELECT * FROM leads WHERE id = ?', [id]);
    return { ...leads[0], _id: leads[0].id };
  }

  static async getByCompany(companyId: string, page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    
    let queryStr = 'SELECT * FROM leads WHERE companyId = ?';
    let countQueryStr = 'SELECT COUNT(*) as count FROM leads WHERE companyId = ?';
    const params: unknown[] = [companyId];

    if (status) {
      queryStr += ' AND status = ?';
      countQueryStr += ' AND status = ?';
      params.push(status);
    }

    queryStr += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';

    const [[countResult], [leads]] = await Promise.all([
      pool.execute<RowDataPacket[]>(countQueryStr, params),
      pool.execute<RowDataPacket[]>(queryStr, [...params, limit, skip])
    ]);

    return { 
      leads: leads.map(l => ({ ...l, _id: l.id })), 
      pagination: getPaginationMeta(page, limit, countResult[0].count) 
    };
  }

  static async updateStatus(id: string, companyId: string, status: string) {
    await pool.execute('UPDATE leads SET status = ? WHERE id = ? AND companyId = ?', [status, id, companyId]);
    const [leads] = await pool.execute<RowDataPacket[]>('SELECT * FROM leads WHERE id = ?', [id]);
    if (leads.length === 0) throw new Error('Lead not found');
    return { ...leads[0], _id: leads[0].id };
  }

  static async delete(id: string, companyId: string) {
    const [result] = await pool.execute<any>('DELETE FROM leads WHERE id = ? AND companyId = ?', [id, companyId]);
    if (result.affectedRows === 0) throw new Error('Lead not found');
    return { message: 'Lead deleted' };
  }

  static async exportLeads(companyId: string) {
    const [leads] = await pool.execute<RowDataPacket[]>('SELECT * FROM leads WHERE companyId = ? ORDER BY createdAt DESC', [companyId]);
    const headers = ['Name', 'Email', 'Phone', 'Message', 'Service', 'Status', 'Date'];
    const rows = leads.map((l) => [
      l.customerName,
      l.email,
      l.phone,
      l.message,
      l.interestedService || '',
      l.status,
      new Date(l.createdAt).toISOString(),
    ]);
    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  }
}
