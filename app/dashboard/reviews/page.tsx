'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Star, Check, X } from 'lucide-react';
import { IReview, ReviewStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { useCompany } from '@/hooks/useCompany';
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

const statusColors: Record<ReviewStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { companyId } = useCompany();
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchReviews = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ companyId });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const { data } = await axios.get(`/api/reviews?${params}`);
      if (data.success) setReviews(data.data);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [companyId, statusFilter]);

  useEffect(() => {
    requestAnimationFrame(() => fetchReviews());
  }, [fetchReviews]);

  const updateStatus = async (id: string, status: ReviewStatus) => {
    try {
      const { data } = await axios.patch(`/api/reviews/${id}`, { status });
      if (data.success) {
        toast.success(`Review ${status}`);
        fetchReviews();
      }
    } catch {
      toast.error('Failed to update review');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Moderate customer reviews"
        action={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : reviews.length ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-start sm:justify-between dark:border-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{review.customerName}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[review.status]}`}>
                        {review.status}
                      </span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                  </div>
                  {review.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateStatus(review._id, 'approved')}>
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(review._id, 'rejected')}>
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Customer reviews will appear here for moderation."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
