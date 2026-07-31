import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { GalleryService } from '@/server/services/gallery.service';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const gallery = await GalleryService.getByCompany(auth.companyId);
    
    return apiSuccess(gallery || { images: [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get gallery';
    return apiError(message, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const body = await parseBody(request);
    const { images } = body as { images: any[] };

    if (!Array.isArray(images)) {
      return apiError('Invalid images data', 400);
    }

    const [existing] = await pool.execute<any[]>('SELECT id FROM galleries WHERE companyId = ?', [auth.companyId]);
    if (existing.length === 0) {
      await pool.execute('INSERT INTO galleries (id, companyId, images) VALUES (UUID(), ?, ?)', [auth.companyId, JSON.stringify(images)]);
    } else {
      await pool.execute('UPDATE galleries SET images = ? WHERE companyId = ?', [JSON.stringify(images), auth.companyId]);
    }

    const gallery = await GalleryService.getByCompany(auth.companyId);
    return apiSuccess(gallery);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save gallery';
    return apiError(message, 400);
  }
}
