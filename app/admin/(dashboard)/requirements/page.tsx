'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/dashboard/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';

export default function RequirementsAdminPage() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  const fetchRequirements = async () => {
    try {
      const res = await axios.get('/api/admin/requirements');
      if (res.data.success) {
        setRequirements(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load requirements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await axios.put(`/api/admin/requirements/${id}`, { status });
      if (res.data.success) {
        toast.success(`Marked as ${status}`);
        fetchRequirements();
        if (selectedReq && selectedReq._id === id) {
          setSelectedReq({ ...selectedReq, status });
        }
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this requirement?')) return;
    try {
      await axios.delete(`/api/admin/requirements/${id}`);
      toast.success('Deleted successfully');
      fetchRequirements();
      setSelectedReq(null);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Requirements"
        description="View all leads and requirements submitted from the platform"
      />

      <div className="rounded-xl border bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Info</TableHead>
              <TableHead>Requirement</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : requirements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No requirements found
                </TableCell>
              </TableRow>
            ) : (
              requirements.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>
                    <div className="font-medium">{req.customerName}</div>
                    <div className="text-sm text-gray-500">{req.email}</div>
                    <div className="text-sm text-gray-500">{req.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium line-clamp-1 max-w-[200px]" title={req.title}>{req.title}</div>
                    {req.budget && <div className="text-sm text-green-600">Budget: {req.budget}</div>}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(req.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.status === 'new'
                          ? 'default'
                          : req.status === 'reviewed'
                            ? 'secondary'
                            : 'outline'
                      }
                      className={
                        req.status === 'new'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : req.status === 'reviewed'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedReq(req)}
                      >
                        <Eye className="h-4 w-4 text-indigo-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(req._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedReq} onOpenChange={() => setSelectedReq(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Requirement Details</DialogTitle>
          </DialogHeader>
          
          {selectedReq && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedReq.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedReq.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedReq.email}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg">{selectedReq.title}</h3>
                {selectedReq.budget && (
                  <p className="text-sm font-semibold text-green-600 mt-1">Budget: {selectedReq.budget}</p>
                )}
                <div className="mt-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                  {selectedReq.description}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                {selectedReq.status === 'new' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedReq._id, 'reviewed')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Mark as Reviewed
                  </Button>
                )}
                {selectedReq.status !== 'closed' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedReq._id, 'closed')}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Close Lead
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
