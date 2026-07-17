'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrandLogo } from '@/components/BrandLogo';
import axios from 'axios';
import toast from 'react-hot-toast';
import { z } from 'zod';

type ForgotForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    try {
      await axios.post('/api/auth', { action: 'forgot-password', ...data });
      setSent(true);
      toast.success('Reset link sent if email exists');
    } catch {
      toast.error('Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrandLogo
            className="mx-auto mb-3"
            imageClassName="h-12 max-w-40"
            iconClassName="h-12 w-12"
          />
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            {sent ? 'Check your email for reset instructions' : 'Enter your email to reset your password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} className="mt-1" />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="w-full">Back to Login</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
