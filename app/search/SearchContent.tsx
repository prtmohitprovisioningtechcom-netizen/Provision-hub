'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { CompanyCard } from '@/components/company/CompanyCard';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface SearchCompany {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  category: string;
  address: { city: string; state: string; country: string };
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  description?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SearchContent() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [companies, setCompanies] = useState<SearchCompany[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<{name: string, slug: string}[]>([]);

  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const state = searchParams.get('state') || '';
  const country = searchParams.get('country') || '';
  const verified = searchParams.get('verified') === 'true';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  const [localQuery, setLocalQuery] = useState(query);
  const [localCity, setLocalCity] = useState(city);
  const [localState, setLocalState] = useState(state);
  const [localCountry, setLocalCountry] = useState(country);

  const updateParams = useCallback(
    (updates: Record<string, string | boolean | number>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || value === false) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams],
  );

  const fetchCompanies = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (category) params.set('category', category);
      if (city) params.set('city', city);
      if (state) params.set('state', state);
      if (country) params.set('country', country);
      if (verified) params.set('verified', 'true');
      if (sort === 'topRated') params.set('topRated', 'true');
      if (sort === 'newest') params.set('newest', 'true');
      params.set('page', String(page));
      params.set('limit', '12');

      const res = await axios.get(`/api/companies/search?${params.toString()}`, { signal });
      setCompanies(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error(err);
      setCompanies([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [query, category, city, state, country, verified, sort, page]);

  useEffect(() => {
    const controller = new AbortController();
    requestAnimationFrame(() => fetchCompanies(controller.signal));
    return () => controller.abort();
  }, [fetchCompanies]);

  useEffect(() => {
    axios.get('/api/categories').then(res => {
      if (res.data.success) {
        setCategories(res.data.data);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      setLocalQuery(query);
      setLocalCity(city);
      setLocalState(state);
      setLocalCountry(country);
    });
  }, [query, city, state, country]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ query: localQuery, city: localCity, state: localState, country: localCountry, page: 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80 sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <BrandLogo imageClassName="h-8" iconClassName="h-8 w-8" />
          <Link
            href={
              user?.role === 'super_admin'
                ? '/admin'
                : user?.role === 'company_admin'
                  ? '/dashboard'
                  : isAuthenticated
                    ? '/search'
                    : '/login'
            }
            className="text-sm font-medium text-gray-500 hover:text-indigo-600"
          >
            {user?.role === 'super_admin'
              ? 'Admin Dashboard'
              : user?.role === 'company_admin'
                ? 'Dashboard'
                : isAuthenticated
                  ? 'Browse Companies'
                  : 'Sign in'}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Companies</h1>
          <p className="mt-2 text-gray-500">Discover verified businesses across categories and locations</p>
        </motion.div>

        <form onSubmit={handleSearch} className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search companies..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <Button type="submit">Search</Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4 rounded-xl border bg-white dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category || 'all'} onValueChange={(v) => updateParams({ category: v === 'all' ? '' : v, page: 1 })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="City" value={localCity} onChange={(e) => setLocalCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input placeholder="State" value={localState} onChange={(e) => setLocalState(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input placeholder="Country" value={localCountry} onChange={(e) => setLocalCountry(e.target.value)} />
              </div>
            </motion.div>
          )}
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <p className="text-sm text-gray-500">
            {pagination ? `${pagination.total} companies found` : 'Searching...'}
          </p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => updateParams({ verified: e.target.checked, page: 1 })}
                className="rounded border-gray-300"
              />
              Verified only
            </label>
            <Select value={sort} onValueChange={(v) => updateParams({ sort: v, page: 1 })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="topRated">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : companies.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, i) => (
              <CompanyCard key={company._id} company={company} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-gray-500"
          >
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No companies found</p>
            <p className="mt-1">Try adjusting your search or filters</p>
          </motion.div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => updateParams({ page: page - 1 })}
            >
              Previous
            </Button>
            <span className="px-4 text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= pagination.totalPages}
              onClick={() => updateParams({ page: page + 1 })}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
