'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  BadgeCheck,
  Building2,
  Camera,
  Loader2,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
} from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import { compressImageFile } from '@/lib/compress-image';
import { formatDate, getInitials } from '@/lib/utils';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { companySlug } = useCompany();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { register, handleSubmit, reset } = useForm<ProfileForm>();
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
  } = useForm<PasswordForm>();

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setLoading(false);
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      const { data: res } = await api.put('/api/dashboard/profile', {
        name: data.name,
        phone: data.phone,
      });
      if (!res.success) throw new Error(res.message || 'Failed');
      await refreshUser();
      toast.success('Profile updated');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      const { data: res } = await api.put('/api/dashboard/profile', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (!res.success) throw new Error(res.message || 'Failed');
      resetPassword();
      toast.success('Password changed');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to change password';
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatar = async (file?: File) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const compressed = await compressImageFile(file);
      const formData = new FormData();
      formData.append('file', compressed);
      const { data: upload } = await api.post('/api/dashboard/upload', formData);
      if (!upload.success || !upload.data?.url) {
        throw new Error(upload.message || 'Upload failed');
      }
      const { data: res } = await api.put('/api/dashboard/profile', {
        avatar: upload.data.url,
      });
      if (!res.success) throw new Error(res.message || 'Failed');
      await refreshUser();
      toast.success('Photo updated');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not update photo';
      toast.error(message);
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const roleLabel = user?.role?.replace(/_/g, ' ') || 'user';

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Profile"
        description="Apna account, photo aur password yahan manage karein"
      />

      <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600 p-5 text-white shadow-lg shadow-indigo-500/10 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-white/40">
                {user?.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                <AvatarFallback className="bg-white/20 text-xl text-white">
                  {getInitials(user?.name || 'U')}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white text-indigo-700 shadow"
                title="Change photo"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleAvatar(e.target.files?.[0])}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="mt-1 text-sm text-indigo-100 capitalize">{roleLabel}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
                  {user?.isEmailVerified ? (
                    <>
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Email verified
                    </>
                  ) : (
                    <>
                      <Mail className="h-3.5 w-3.5" />
                      Email not verified
                    </>
                  )}
                </span>
                {companySlug ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
                    <Building2 className="h-3.5 w-3.5" />
                    /{companySlug}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-indigo-600" />
              Personal information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    className="mt-1"
                    placeholder="Your full name"
                    {...register('name', { required: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9"
                      disabled
                      {...register('email')}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Email change nahi ho sakta</p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative mt-1">
                    <Phone className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="phone"
                      className="pl-9"
                      placeholder="+91 XXXXX XXXXX"
                      {...register('phone')}
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-indigo-600" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
              <p className="text-xs uppercase tracking-wide text-gray-400">Role</p>
              <p className="mt-1 font-medium capitalize text-gray-900 dark:text-white">
                {roleLabel}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
              <p className="text-xs uppercase tracking-wide text-gray-400">Member since</p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {user?.createdAt ? formatDate(user.createdAt) : '—'}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
              <p className="text-xs uppercase tracking-wide text-gray-400">Login email</p>
              <p className="mt-1 break-all font-medium text-gray-900 dark:text-white">
                {user?.email || '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-indigo-600" />
            Change password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            className="grid max-w-2xl gap-4 sm:grid-cols-3"
          >
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                className="mt-1"
                autoComplete="current-password"
                {...registerPassword('currentPassword', { required: true })}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                className="mt-1"
                autoComplete="new-password"
                {...registerPassword('newPassword', { required: true, minLength: 6 })}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                className="mt-1"
                autoComplete="new-password"
                {...registerPassword('confirmPassword', {
                  required: true,
                  validate: (value) => value === newPassword || 'Passwords must match',
                })}
              />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" variant="outline" disabled={savingPassword}>
                {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {savingPassword ? 'Updating...' : 'Update password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
