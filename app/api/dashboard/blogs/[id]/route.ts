import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/api-response';
import { blogSchema } from '@/lib/validators';
import { BlogService } from '@/server/services/blog.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const { id } = await params;
    const data = blogSchema.parse(await request.json());
    
    const blog = await BlogService.update(id, data);
    
    return apiSuccess(blog, 'Blog updated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update blog';
    return apiError(message, 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    
    const { id } = await params;
    if (!id) return apiError('Blog ID is required', 400);

    await BlogService.delete(id);

    return apiSuccess({ message: 'Blog deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete blog';
    return apiError(message, 400);
  }
}
