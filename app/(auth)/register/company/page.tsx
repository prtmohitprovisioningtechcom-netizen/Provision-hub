'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companyRegisterSchema, CompanyRegisterInput } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BrandLogo } from '@/components/BrandLogo';
import { BUSINESS_CATEGORIES } from '@/constants';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setUser } from '@/store/slices/authSlice';

export default function CompanyRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompanyRegisterInput>({ resolver: zodResolver(companyRegisterSchema) });

  const onSubmit = async (data: CompanyRegisterInput) => {
    setIsLoading(true);
    try {
      const { data: res } = await axios.post('/api/auth', { action: 'register-company', ...data });
      if (res.success) {
        dispatch(setUser({ user: res.data.user, token: res.data.token }));
        toast.success('Company registered successfully!');
        router.push('/dashboard');
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
    <div className="min-h-screen py-12 bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      <div className="mx-auto max-w-2xl px-4">
        <Card>
          <CardHeader className="text-center">
            <BrandLogo
              className="mx-auto mb-4"
              imageClassName="h-12 max-w-40"
              iconClassName="h-12 w-12"
            />
            <CardTitle className="text-2xl">Register Your Company</CardTitle>
            <CardDescription>Create your business landing page in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Company Name *</Label>
                  <Input {...register('name')} className="mt-1" />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <Label>Owner Name *</Label>
                  <Input {...register('ownerName')} className="mt-1" />
                  {errors.ownerName && <p className="text-sm text-red-500">{errors.ownerName.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Email *</Label>
                  <Input type="email" {...register('email')} className="mt-1" />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input {...register('phone')} className="mt-1" />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>
              </div>

              <div>
                <Label>Password *</Label>
                <Input type="password" {...register('password')} className="mt-1" />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <div>
                <Label>Business Category *</Label>
                <Select onValueChange={(v) => setValue('category', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Country *</Label>
                  <Input {...register('country')} className="mt-1" />
                  {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
                </div>
                <div>
                  <Label>State *</Label>
                  <Input {...register('state')} className="mt-1" />
                  {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                </div>
                <div>
                  <Label>City *</Label>
                  <Input {...register('city')} className="mt-1" />
                  {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea {...register('description')} className="mt-1" rows={3} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Website</Label>
                  <Input {...register('website')} className="mt-1" placeholder="https://" />
                </div>
                <div>
                  <Label>GST Number</Label>
                  <Input {...register('gst')} className="mt-1" />
                </div>
              </div>

              <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Company Account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:underline font-medium">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
