'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Settings } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface CompanyForm {
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  description: string;
  website: string;
  gst: string;
  pan: string;
  country: string;
  state: string;
  city: string;
  street: string;
  zipCode: string;
}

export default function SettingsPage() {
  const { companySlug } = useCompany();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{name: string, slug: string}[]>([]);

  const { register, handleSubmit, reset } = useForm<CompanyForm>();

  useEffect(() => {
    if (!companySlug) {
      setLoading(false);
      return;
    }
    axios
      .get(`/api/companies/${companySlug}`)
      .then((res) => {
        if (res.data.success) {
          const c = res.data.data.company;
          reset({
            name: c.name || '',
            ownerName: c.ownerName || '',
            email: c.email || '',
            phone: c.phone || '',
            category: c.category || '',
            description: c.description || '',
            website: c.website || '',
            gst: c.gst || '',
            pan: c.pan || '',
            country: c.address?.country || '',
            state: c.address?.state || '',
            city: c.address?.city || '',
            street: c.address?.street || '',
            zipCode: c.address?.zipCode || '',
          });
        }
      })
      .catch(() => toast.error('Failed to load company settings'))
      .finally(() => setLoading(false));

    axios.get('/api/categories').then(res => {
      if (res.data.success) {
        setCategories(res.data.data);
      }
    }).catch(console.error);
  }, [companySlug, reset]);

  const onSubmit = async (data: CompanyForm) => {
    if (!companySlug) return;
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        category: data.category,
        description: data.description,
        website: data.website,
        gst: data.gst,
        pan: data.pan,
        address: {
          country: data.country,
          state: data.state,
          city: data.city,
          street: data.street,
          zipCode: data.zipCode,
        },
      };
      const res = await axios.put(`/api/companies/${companySlug}`, payload);
      if (res.data.success) toast.success('Settings saved');
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : 'Save failed';
      toast.error(message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your company information" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" className="mt-1" {...register('name')} />
            </div>
            <div>
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input id="ownerName" className="mt-1" {...register('ownerName')} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="mt-1" {...register('email')} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" className="mt-1" {...register('phone')} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="mt-1 flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                {...register('category')}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" className="mt-1" {...register('website')} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} className="mt-1" {...register('description')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" className="mt-1" {...register('country')} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" className="mt-1" {...register('state')} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" className="mt-1" {...register('city')} />
            </div>
            <div>
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input id="zipCode" className="mt-1" {...register('zipCode')} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="street">Street</Label>
              <Input id="street" className="mt-1" {...register('street')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="gst">GST Number</Label>
              <Input id="gst" className="mt-1" {...register('gst')} />
            </div>
            <div>
              <Label htmlFor="pan">PAN Number</Label>
              <Input id="pan" className="mt-1" {...register('pan')} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </div>
  );
}
