'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, Download, Trash2 } from 'lucide-react';
import { ILead, LeadStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const { data } = await axios.get(`/api/leads${params}`);
      if (data.success) setLeads(data.data);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateStatus = async (id: string, status: LeadStatus) => {
    try {
      const { data } = await axios.patch(`/api/leads/${id}`, { status });
      if (data.success) {
        toast.success('Status updated');
        fetchLeads();
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    try {
      const { data } = await axios.delete(`/api/leads/${id}`);
      if (data.success) {
        toast.success('Lead deleted');
        fetchLeads();
      }
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const exportCsv = () => {
    if (!leads.length) {
      toast.error('No leads to export');
      return;
    }
    const headers = ['Name', 'Email', 'Phone', 'Message', 'Status', 'Date'];
    const rows = leads.map((l) =>
      [l.customerName, l.email, l.phone, `"${l.message.replace(/"/g, '""')}"`, l.status, formatDate(l.createdAt)].join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Leads exported');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Track and manage customer enquiries"
        action={
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : leads.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500">
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Contact</th>
                    <th className="pb-3 font-medium">Message</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-4 font-medium">{lead.customerName}</td>
                      <td className="py-4">
                        <p>{lead.email}</p>
                        <p className="text-gray-500">{lead.phone}</p>
                      </td>
                      <td className="py-4 max-w-xs truncate text-gray-600 dark:text-gray-400">
                        {lead.message}
                      </td>
                      <td className="py-4 text-gray-500">{formatDate(lead.createdAt)}</td>
                      <td className="py-4">
                        <Select
                          value={lead.status}
                          onValueChange={(v) => updateStatus(lead._id, v as LeadStatus)}
                        >
                          <SelectTrigger className="w-32.5 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(lead._id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No leads found"
              description={
                statusFilter !== 'all'
                  ? 'No leads match the selected filter.'
                  : 'Share your landing page to start receiving enquiries.'
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
