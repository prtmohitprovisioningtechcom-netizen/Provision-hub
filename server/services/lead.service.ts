import Lead from '@/models/Lead';
import Notification from '@/models/Notification';
import Company from '@/models/Company';
import { connectDB } from '@/lib/mongodb';
import { getPaginationMeta } from '@/lib/utils';
import { sendEmail, leadNotificationEmailHtml } from '@/lib/email';
import { LeadInput } from '@/lib/validators';

export class LeadService {
  static async create(data: LeadInput) {
    await connectDB();

    const company = await Company.findById(data.companyId);
    if (!company) throw new Error('Company not found');

    const lead = await Lead.create(data);

    await Notification.create({
      userId: company.ownerId,
      companyId: company._id,
      type: 'new_lead',
      title: 'New Lead',
      message: `New enquiry from ${data.customerName}`,
      link: '/dashboard/leads',
    });

    await sendEmail({
      to: company.email,
      subject: `New Lead: ${data.customerName}`,
      html: leadNotificationEmailHtml(data),
    });

    return lead;
  }

  static async getByCompany(companyId: string, page = 1, limit = 20, status?: string) {
    await connectDB();
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { companyId };
    if (status) query.status = status;

    const [leads, total] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Lead.countDocuments(query),
    ]);

    return { leads, pagination: getPaginationMeta(page, limit, total) };
  }

  static async updateStatus(id: string, companyId: string, status: string) {
    await connectDB();
    const lead = await Lead.findOneAndUpdate(
      { _id: id, companyId },
      { status },
      { new: true },
    );
    if (!lead) throw new Error('Lead not found');
    return lead;
  }

  static async delete(id: string, companyId: string) {
    await connectDB();
    const lead = await Lead.findOneAndDelete({ _id: id, companyId });
    if (!lead) throw new Error('Lead not found');
    return { message: 'Lead deleted' };
  }

  static async exportLeads(companyId: string) {
    await connectDB();
    const leads = await Lead.find({ companyId }).sort({ createdAt: -1 }).lean();
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
