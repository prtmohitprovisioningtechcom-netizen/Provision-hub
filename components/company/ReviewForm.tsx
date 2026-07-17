'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema } from '@/lib/validators';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const formSchema = reviewSchema.extend({
  customerName: z.string().min(2, 'Name is required').optional(),
});

type ReviewFormInput = z.infer<typeof formSchema>;

interface ReviewFormProps {
  companyId: string;
  onSuccess?: () => void;
  className?: string;
}

export function ReviewForm({ companyId, onSuccess, className }: ReviewFormProps) {
  const { isAuthenticated, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: { companyId, rating: 5, comment: '', images: [] },
  });

  const rating = watch('rating');

  const onSubmit = async (data: ReviewFormInput) => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit a review');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/api/reviews', {
        ...data,
        customerName: user?.name || data.customerName,
      });
      if (res.data.success) {
        toast.success('Review submitted! It will appear after approval.');
        reset({ companyId, rating: 5, comment: '', images: [] });
        onSuccess?.();
      } else {
        toast.error(res.data.message || 'Failed to submit review');
      }
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : 'Something went wrong';
      toast.error(message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('rounded-xl border border-dashed border-gray-200 p-6 text-center dark:border-gray-700', className)}
      >
        <Star className="mx-auto h-8 w-8 text-yellow-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">Sign in to share your experience</p>
        <Button asChild variant="outline">
          <Link href="/login">Log in to review</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={handleSubmit(onSubmit)}
      className={className}
    >
      <input type="hidden" {...register('companyId')} />
      <input type="hidden" {...register('rating', { valueAsNumber: true })} />

      <div className="space-y-4">
        <div>
          <Label>Your Rating</Label>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setValue('rating', star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'h-7 w-7',
                    (hoverRating || rating) >= star
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300',
                  )}
                />
              </button>
            ))}
          </div>
          {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">Your Review</Label>
          <Textarea
            id="comment"
            rows={4}
            placeholder="Share your experience with this company..."
            {...register('comment')}
          />
          {errors.comment && <p className="text-xs text-red-500">{errors.comment.message}</p>}
        </div>
      </div>

      <Button type="submit" className="mt-4" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </Button>
    </motion.form>
  );
}
