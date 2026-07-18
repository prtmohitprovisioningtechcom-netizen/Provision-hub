import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/api-response';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    
    const { id } = await params;
    if (!id) return apiError('Blog ID is required', 400);

    await connectDB();
    
    const blog = await Blog.findOneAndDelete({ 
      _id: id, 
      companyId: auth.companyId 
    });

    if (!blog) {
      return apiError('Blog not found or unauthorized', 404);
    }

    return apiSuccess({ message: 'Blog deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete blog';
    return apiError(message, 400);
  }
}
