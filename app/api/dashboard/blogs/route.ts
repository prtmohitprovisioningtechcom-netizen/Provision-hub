import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { BlogService } from '@/server/services/blog.service';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const { blogs } = await BlogService.getByCompany(auth.companyId, 1, 100);
    
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

    const blog = await BlogService.create(auth.companyId, auth.userId, body as any);

    return apiSuccess(blog);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create blog';
    return apiError(message, 400);
  }
}
