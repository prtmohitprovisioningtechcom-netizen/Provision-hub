import { NextRequest } from 'next/server';
import { CompanyService } from '@/server/services/company.service';
import { apiSuccess, apiError, apiPaginated } from '@/server/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      query: searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      country: searchParams.get('country') || undefined,
      verified: searchParams.get('verified') === 'true',
      topRated: searchParams.get('topRated') === 'true',
      newest: searchParams.get('newest') === 'true',
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 12,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const result = await CompanyService.search(filters);
    return apiPaginated(result.companies, result.pagination);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    return apiError(message, 400);
  }
}
