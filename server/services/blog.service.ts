import Blog from '@/models/Blog';
import { connectDB } from '@/lib/mongodb';
import { generateSlug, getPaginationMeta } from '@/lib/utils';
import { BlogInput } from '@/lib/validators';

export class BlogService {
  static async create(companyId: string, authorId: string, data: BlogInput) {
    await connectDB();
    const slug = generateSlug(data.title);
    const blog = await Blog.create({ ...data, companyId, author: authorId, slug });
    return blog;
  }

  static async getByCompany(companyId: string, page = 1, limit = 20, status?: string) {
    await connectDB();
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { companyId };
    if (status) query.status = status;

    const [blogs, total] = await Promise.all([
      Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Blog.countDocuments(query),
    ]);
    return { blogs, pagination: getPaginationMeta(page, limit, total) };
  }

  static async getBySlug(companyId: string, slug: string) {
    await connectDB();
    const blog = await Blog.findOne({ companyId, slug, status: 'published' }).lean();
    if (!blog) throw new Error('Blog not found');
    return blog;
  }

  static async update(id: string, data: Partial<BlogInput>) {
    await connectDB();
    if (data.title) {
      (data as Record<string, unknown>).slug = generateSlug(data.title);
    }
    const blog = await Blog.findByIdAndUpdate(id, data, { new: true });
    if (!blog) throw new Error('Blog not found');
    return blog;
  }

  static async delete(id: string) {
    await connectDB();
    await Blog.findByIdAndDelete(id);
    return { message: 'Blog deleted' };
  }
}
