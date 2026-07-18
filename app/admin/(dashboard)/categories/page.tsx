'use client';

import { useState, useEffect } from 'react';
import axios from '@/services/api';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    isActive: true
  });

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/api/admin/categories');
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', icon: '', isActive: true });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (category: any) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      isActive: category.isActive
    });
    setCurrentId(category._id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const { data } = await axios.delete(`/api/admin/categories/${id}`);
      if (data.success) {
        toast.success('Category deleted');
        fetchCategories();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedName = formData.name.trim().toLowerCase();
    const normalizedSlug = (formData.slug || formData.name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!normalizedName) {
      toast.error('Name is required');
      return;
    }

    if (!isEditing) {
      const duplicate = categories.find(
        (category) =>
          category.name.trim().toLowerCase() === normalizedName ||
          category.slug === normalizedSlug,
      );
      if (duplicate) {
        toast.error(`"${duplicate.name}" already exists. Use Edit to update it.`);
        return;
      }
    }
    
    setSaving(true);
    try {
      if (isEditing && currentId) {
        const { data } = await axios.put(`/api/admin/categories/${currentId}`, formData);
        if (data.success) {
          toast.success('Category updated');
          resetForm();
          fetchCategories();
        }
      } else {
        const { data } = await axios.post('/api/admin/categories', formData);
        if (data.success) {
          toast.success(data.alreadyExists ? 'Category already exists' : 'Category created');
          resetForm();
          fetchCategories();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Categories</h1>
        <p className="mt-2 text-gray-500">Manage business categories used across the platform.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Category' : 'New Category'}</CardTitle>
            <CardDescription>
              {isEditing ? 'Update the details below.' : 'Add a new category for businesses.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Real Estate"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (Optional)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. real-estate"
                />
                <p className="text-xs text-gray-500">Leave blank to auto-generate from name.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <div className="pt-4 flex gap-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Update' : 'Create'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>All Categories ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 dark:border-gray-800">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Slug</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {category.name}
                        {category.description && (
                          <p className="text-xs text-gray-500 font-normal">{category.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{category.slug}</td>
                      <td className="px-4 py-3">
                        {category.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full dark:bg-green-900/20 dark:text-green-400">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full dark:bg-red-900/20 dark:text-red-400">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                            <Edit2 className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(category._id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No categories found. Create one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
