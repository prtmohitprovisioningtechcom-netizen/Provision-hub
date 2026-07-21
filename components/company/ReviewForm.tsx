'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema } from '@/lib/validators';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle2, Loader2, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const formSchema = reviewSchema.extend({
  customerName: z.string().min(2, 'Name is required'),
});

type ReviewFormInput = z.infer<typeof formSchema>;

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

interface ReviewFormProps {
  companyId: string;
  primaryColor?: string;
  onSuccess?: () => void;
  className?: string;
  compact?: boolean;
}

export function ReviewForm({
  companyId,
  primaryColor = '#0b2a5b',
  onSuccess,
  className,
  compact = false,
}: ReviewFormProps) {
  const { isAuthenticated, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId,
      rating: 5,
      comment: '',
      images: [],
      customerName: user?.name || '',
    },
  });

  const rating = watch('rating');
  const activeRating = hoverRating || rating;

  const onSubmit = async (data: ReviewFormInput) => {
    setSubmitting(true);
    try {
      const res = await axios.post('/api/reviews', {
        ...data,
        customerName: data.customerName.trim() || user?.name || 'Guest',
      });
      if (res.data.success) {
        setDone(true);
        toast.success('Thanks! Your review will appear after approval.');
        reset({
          companyId,
          rating: 5,
          comment: '',
          images: [],
          customerName: user?.name || '',
        });
        onSuccess?.();
      } else {
        toast.error(res.data.message || 'Failed to submit review');
      }
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : 'Something went wrong';
      toast.error(message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/80 px-6 py-10 text-center',
          className,
        )}
      >
        <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-500" />
        <p className="text-lg font-bold text-gray-900">Review submitted</p>
        <p className="mt-1 text-sm text-gray-600">
          It will show on the site after the company approves it.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => setDone(false)}
        >
          Write another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-5', className)}
      noValidate
    >
      <input type="hidden" {...register('companyId')} />
      <input type="hidden" {...register('rating', { valueAsNumber: true })} />

      <div>
        <Label className="text-sm font-semibold text-gray-900">Your rating</Label>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setValue('rating', star, { shouldValidate: true })}
                className="rounded-lg p-1 transition hover:scale-110"
                aria-label={`${star} star${star === 1 ? '' : 's'}`}
              >
                <Star
                  className={cn(
                    compact ? 'h-8 w-8' : 'h-9 w-9',
                    'transition',
                    activeRating >= star ? 'fill-current' : 'text-gray-200',
                  )}
                  style={activeRating >= star ? { color: primaryColor } : undefined}
                />
              </button>
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {RATING_LABELS[activeRating] || 'Tap a star'}
          </span>
        </div>
        {errors.rating && (
          <p className="mt-1 text-xs text-red-500">{errors.rating.message}</p>
        )}
      </div>

      {!isAuthenticated && (
        <div className="space-y-2">
          <Label htmlFor="review-name">Your name</Label>
          <Input
            id="review-name"
            placeholder="Full name"
            {...register('customerName')}
          />
          {errors.customerName && (
            <p className="text-xs text-red-500">{errors.customerName.message}</p>
          )}
        </div>
      )}

      {isAuthenticated && (
        <input type="hidden" {...register('customerName')} value={user?.name || ''} />
      )}

      <div className="space-y-2">
        <Label htmlFor="review-comment">Your review</Label>
        <Textarea
          id="review-comment"
          rows={compact ? 3 : 4}
          placeholder="Tell others about your experience..."
          className="resize-none"
          {...register('comment')}
        />
        {errors.comment && (
          <p className="text-xs text-red-500">{errors.comment.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="h-11 w-full rounded-full text-sm font-bold uppercase tracking-wide text-white"
        style={{ backgroundColor: primaryColor }}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit rating'
        )}
      </Button>
    </form>
  );
}
