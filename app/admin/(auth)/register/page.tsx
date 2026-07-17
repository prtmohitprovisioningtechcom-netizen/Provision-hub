'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminRegisterSchema, AdminRegisterInput } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setUser } from '@/store/slices/authSlice';

export default function AdminRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminRegisterInput>({ resolver: zodResolver(adminRegisterSchema) });

  const onSubmit = async (data: AdminRegisterInput) => {
    setIsLoading(true);
    try {
      const { data: res } = await axios.post('/api/auth', { action: 'register-admin', ...data });
      if (res.success) {
        dispatch(setUser({ user: res.data.user, token: res.data.token }));
        toast.success('Admin account created!');
        router.push('/admin');
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Registration failed'
        : 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full sm:mx-auto sm:max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Register</CardTitle>
          <CardDescription>Create admin account to manage this website</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register('name')} className="mt-1" />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} className="mt-1" />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" {...register('phone')} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} className="mt-1" />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Admin Account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/admin/login" className="text-red-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">← Back to website</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
