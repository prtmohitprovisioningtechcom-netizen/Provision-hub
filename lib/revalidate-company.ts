import 'server-only';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import Company from '@/models/Company';

export async function revalidateCompanyPage(companyId: string) {
  await connectDB();
  const company = await Company.findById(companyId).select('slug').lean();
  if (company?.slug) {
    revalidatePath(`/company/${company.slug}`);
  }
}
