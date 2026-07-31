import 'server-only';
import { revalidatePath } from 'next/cache';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function revalidateCompanyPage(companyId: string) {
  const [companies] = await pool.execute<RowDataPacket[]>('SELECT slug FROM companies WHERE id = ?', [companyId]);
  if (companies.length > 0 && companies[0].slug) {
    revalidatePath(`/${companies[0].slug}`);
  }
}
