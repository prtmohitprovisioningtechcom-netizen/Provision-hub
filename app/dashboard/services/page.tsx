'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Wrench, Plus, Trash2 } from 'lucide-react';
import { serviceSchema, type ServiceInput } from '@/lib/validators';
import { IService } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCompany } from '@/hooks/useCompany';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

export default function ServicesPage() {
  const { companyId } = useCompany();
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceInput>({ resolver: zodResolver(serviceSchema) });

  const fetchServices = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/services?companyId=${companyId}`);
      if (data.success) setServices(data.data);
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    requestAnimationFrame(() => fetchServices());
  }, [fetchServices]);

  const onSubmit = async (formData: ServiceInput) => {
    setSaving(true);
    try {
      const { data } = await axios.post('/api/services', formData);
      if (data.success) {
        toast.success('Service created');
        reset();
        setShowForm(false);
        fetchServices();
      }
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : 'Create failed';
      toast.error(message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      const { data } = await axios.delete(`/api/services/${id}`);
      if (data.success) {
        toast.success('Service deleted');
        fetchServices();
      }
    } catch {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Manage the services you offer"
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Service</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" className="mt-1" {...register('name')} />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" className="mt-1" {...register('category')} />
                  {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" step="0.01" className="mt-1" {...register('price', { valueAsNumber: true })} />
                  {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>}
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input id="duration" placeholder="e.g. 1 hour" className="mt-1" {...register('duration')} />
                  {errors.duration && <p className="mt-1 text-sm text-red-500">{errors.duration.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={3} className="mt-1" {...register('description')} />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Service'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : services.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-gray-500">{service.category}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(service._id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-medium text-indigo-600">{formatCurrency(service.price)}</span>
                    <span className="text-gray-500">{service.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Wrench}
              title="No services yet"
              description="Add services to let customers know what you offer."
              action={
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4" />
                  Add Service
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
