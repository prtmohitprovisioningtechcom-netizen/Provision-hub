'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/services/api';
import {
  CheckCircle,
  XCircle,
  PauseCircle,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { CompanyStatus } from '@/types';

interface AdminCompany {
  _id: string;
  name: string;
  slug: string;
  email: string;
  category: string;
  status: CompanyStatus;
  isVerified: boolean;
  address?: { city?: string; state?: string; country?: string };
  createdAt: string;
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

const isUnauthorized = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 401;

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await api.get(`/api/admin?${params.toString()}`);
      setCompanies(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      if (isUnauthorized(err)) return;
      console.error(err);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const updateStatus = async (id: string, status: CompanyStatus) => {
    setActionLoading(id);
    try {
      const res = await api.patch(`/api/admin/companies/${id}`, { status });
      if (res.data.success) {
        toast.success(`Company ${status}`);
        fetchCompanies();
      }
    } catch (err) {
      if (isUnauthorized(err)) return;
      const message = axios.isAxiosError(err) ? err.response?.data?.message : 'Action failed';
      toast.error(message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteCompany = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all associated data? This cannot be undone.`)) return;

    setActionLoading(id);
    try {
      const res = await api.delete(`/api/admin/companies/${id}`);
      if (res.data.success) {
        toast.success('Company deleted');
        fetchCompanies();
      }
    } catch (err) {
      if (isUnauthorized(err)) return;
      const message = axios.isAxiosError(err) ? err.response?.data?.message : 'Delete failed';
      toast.error(message || 'Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: CompanyStatus) => {
    const styles: Record<CompanyStatus, string> = {
      approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      suspended: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Companies</h1>
        <p className="text-gray-500">Manage company registrations and approvals</p>
      </motion.div>

      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        {pagination && (
          <p className="text-sm text-gray-500">{pagination.total} companies</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : companies.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-800 text-left text-gray-500">
                    <th className="p-4 font-medium">Company</th>
                    <th className="p-4 font-medium hidden md:table-cell">Category</th>
                    <th className="p-4 font-medium hidden lg:table-cell">Location</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium hidden sm:table-cell">Registered</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company, i) => (
                    <motion.tr
                      key={company._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-xs text-gray-400">{company.email}</p>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">{company.category}</td>
                      <td className="p-4 hidden lg:table-cell text-gray-500">
                        {[company.address?.city, company.address?.country]
                          .filter(Boolean)
                          .join(', ') || 'Not provided'}
                      </td>
                      <td className="p-4">{statusBadge(company.status)}</td>
                      <td className="p-4 hidden sm:table-cell text-gray-500">
                        {formatDate(company.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          {company.status === 'approved' && (
                            <Button variant="ghost" size="icon" asChild title="View profile">
                              <Link href={`/company/${company.slug}`} target="_blank">
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {company.status !== 'approved' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Approve"
                              disabled={actionLoading === company._id}
                              onClick={() => updateStatus(company._id, 'approved')}
                            >
                              {actionLoading === company._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                          )}
                          {company.status !== 'rejected' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Reject"
                              disabled={actionLoading === company._id}
                              onClick={() => updateStatus(company._id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                          {company.status === 'approved' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Suspend"
                              disabled={actionLoading === company._id}
                              onClick={() => updateStatus(company._id, 'suspended')}
                            >
                              <PauseCircle className="h-4 w-4 text-orange-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            disabled={actionLoading === company._id}
                            onClick={() => deleteCompany(company._id, company.name)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">No companies found</p>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
