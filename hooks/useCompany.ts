'use client';

import { useAuth } from '@/contexts/AuthContext';

type CompanyRef = {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  status?: string;
};

export function useCompany() {
  const { user, isLoading } = useAuth();
  const company = user?.companyId as string | CompanyRef | undefined;

  const companyId =
    typeof company === 'string' ? company : company && '_id' in company ? company._id : undefined;

  const companySlug =
    typeof company === 'object' && company && 'slug' in company ? company.slug : undefined;

  return { user, companyId, companySlug, isLoading };
}
