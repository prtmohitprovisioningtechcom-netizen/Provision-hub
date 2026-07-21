'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema, type LeadInput } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ContactFormProps {
  companyId: string;
  services?: string[];
  className?: string;
}

/** Force readable light-theme fields on public company pages (even if OS is dark). */
const fieldClass =
  'bg-white text-gray-900 border-gray-200 placeholder:text-gray-400 caret-gray-900 dark:bg-white dark:text-gray-900 dark:border-gray-200 dark:placeholder:text-gray-400';

export function ContactForm({ companyId, services = [], className }: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { companyId },
  });

  const onSubmit = async (data: LeadInput) => {
    setSubmitting(true);
    try {
      const res = await axios.post('/api/leads', data);
      if (res.data.success) {
        toast.success('Enquiry submitted successfully!');
        reset({ companyId, customerName: '', email: '', phone: '', message: '', interestedService: '' });
      } else {
        toast.error(res.data.message || 'Failed to submit enquiry');
      }
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : 'Something went wrong';
      toast.error(message || 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onSubmit)}
      className={cn('text-gray-900', className)}
    >
      <input type="hidden" {...register('companyId')} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customerName" className="text-gray-800">
            Full Name
          </Label>
          <Input
            id="customerName"
            placeholder="John Doe"
            className={fieldClass}
            {...register('customerName')}
          />
          {errors.customerName && (
            <p className="text-xs text-red-500">{errors.customerName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-800">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            className={fieldClass}
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-800">
            Phone
          </Label>
          <Input
            id="phone"
            placeholder="+91 98765 43210"
            className={fieldClass}
            {...register('phone')}
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>
        {services.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="interestedService" className="text-gray-800">
              Interested In
            </Label>
            <select
              id="interestedService"
              className={cn(
                'flex h-10 w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                fieldClass,
              )}
              {...register('interestedService')}
            >
              <option value="">Select a service</option>
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="message" className="text-gray-800">
          Message
        </Label>
        <Textarea
          id="message"
          rows={4}
          placeholder="Tell us about your requirements..."
          className={fieldClass}
          {...register('message')}
        />
        {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Enquiry
          </>
        )}
      </Button>
    </motion.form>
  );
}
