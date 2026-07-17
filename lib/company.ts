import 'server-only';

import { cache } from 'react';
import { CompanyService } from '@/server/services/company.service';

/**
 * Shares the company query between generateMetadata and the page render.
 */
export const getCompanyBySlug = cache((slug: string) =>
  CompanyService.getBySlug(slug),
);
