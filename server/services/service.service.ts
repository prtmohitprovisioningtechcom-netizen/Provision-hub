import Service from '@/models/Service';
import { connectDB } from '@/lib/mongodb';
import { generateSlug, getPaginationMeta } from '@/lib/utils';
import { ServiceInput } from '@/lib/validators';

export class ServiceService {
  static async create(companyId: string, data: ServiceInput) {
    await connectDB();
    const slug = generateSlug(data.name);
    const service = await Service.create({ ...data, companyId, slug });
    return service;
  }

  static async getByCompany(companyId: string, page = 1, limit = 20) {
    await connectDB();
    const skip = (page - 1) * limit;
    const [services, total] = await Promise.all([
      Service.find({ companyId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Service.countDocuments({ companyId }),
    ]);
    return { services, pagination: getPaginationMeta(page, limit, total) };
  }

  static async getById(id: string) {
    await connectDB();
    const service = await Service.findById(id).lean();
    if (!service) throw new Error('Service not found');
    return service;
  }

  static async update(id: string, data: Partial<ServiceInput>) {
    await connectDB();
    if (data.name) {
      (data as Record<string, unknown>).slug = generateSlug(data.name);
    }
    const service = await Service.findByIdAndUpdate(id, data, { new: true });
    if (!service) throw new Error('Service not found');
    return service;
  }

  static async delete(id: string) {
    await connectDB();
    await Service.findByIdAndDelete(id);
    return { message: 'Service deleted' };
  }
}
