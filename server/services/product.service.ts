import Product from '@/models/Product';
import { connectDB } from '@/lib/mongodb';
import { generateSlug, getPaginationMeta } from '@/lib/utils';
import { ProductInput } from '@/lib/validators';

export class ProductService {
  static async create(companyId: string, data: ProductInput) {
    await connectDB();
    const slug = generateSlug(data.name);
    const product = await Product.create({ ...data, companyId, slug });
    return product;
  }

  static async getByCompany(companyId: string, page = 1, limit = 20) {
    await connectDB();
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find({ companyId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments({ companyId }),
    ]);
    return { products, pagination: getPaginationMeta(page, limit, total) };
  }

  static async getById(id: string) {
    await connectDB();
    const product = await Product.findById(id).lean();
    if (!product) throw new Error('Product not found');
    return product;
  }

  static async update(id: string, data: Partial<ProductInput>) {
    await connectDB();
    if (data.name) {
      (data as Record<string, unknown>).slug = generateSlug(data.name);
    }
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!product) throw new Error('Product not found');
    return product;
  }

  static async delete(id: string) {
    await connectDB();
    await Product.findByIdAndDelete(id);
    return { message: 'Product deleted' };
  }
}
