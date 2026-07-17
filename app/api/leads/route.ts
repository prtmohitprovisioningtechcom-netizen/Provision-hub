import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { LeadService } from '@/server/services/lead.service';
import { leadSchema } from '@/lib/validators';
import { apiSuccess, apiError, apiPaginated, parseBody } from '@/server/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const status = searchParams.get('status') || undefined;

    const result = await LeadService.getByCompany(auth.companyId, page, limit, status);
    return apiPaginated(result.leads, result.pagination);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get leads';
    return apiError(message, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    const data = leadSchema.parse(body);
    const lead = await LeadService.create(data);
    return apiSuccess(lead, 'Enquiry submitted successfully', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create lead';
    return apiError(message, 400);
  }
}
