import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    await connectDB();
    const blogs = await Blog.find({ companyId: auth.companyId }).sort({ createdAt: -1 }).lean();
    
    return apiSuccess(blogs);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get blogs';
    return apiError(message, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const body = (await parseBody(request)) as { title?: string; content?: string; category?: string; status?: 'draft' | 'published' };
    
    if (!body.title || !body.content || !body.category) {
      return apiError('Missing required fields', 400);
    }

    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    await connectDB();
    const blog = await Blog.create({
      companyId: auth.companyId,
      author: auth.userId,
      title: body.title,
      slug,
      content: body.content,
      category: body.category,
      status: body.status || 'draft'
    });

    return apiSuccess(blog);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create blog';
    return apiError(message, 400);
  }
}
