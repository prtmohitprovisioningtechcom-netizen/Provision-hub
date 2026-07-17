'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { blogSchema, type BlogInput } from '@/lib/validators';
import { formatDate } from '@/lib/utils';
import { useCompany } from '@/hooks/useCompany';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BlogPost extends BlogInput {
  _id: string;
  createdAt: string;
}

export default function BlogsPage() {
  const { companyId } = useCompany();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: { status: 'draft' as const },
  });

  const status = watch('status');

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    const stored = localStorage.getItem(`blogs-${companyId}`);
    if (stored) setBlogs(JSON.parse(stored));
    setLoading(false);
  }, [companyId]);

  const saveBlogs = (updated: BlogPost[]) => {
    if (!companyId) return;
    setBlogs(updated);
    localStorage.setItem(`blogs-${companyId}`, JSON.stringify(updated));
  };

  const onSubmit = (data: BlogInput & { status: BlogInput['status'] }) => {
    const post: BlogPost = {
      ...data,
      _id: `blog-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    saveBlogs([post, ...blogs]);
    reset({ title: '', content: '', category: '', status: 'draft' });
    setShowForm(false);
    toast.success('Blog post created');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    saveBlogs(blogs.filter((b) => b._id !== id));
    toast.success('Blog deleted');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blogs"
        description="Create and manage blog posts"
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Blog Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" className="mt-1" {...register('title')} />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" className="mt-1" {...register('category')} />
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setValue('status', v as BlogInput['status'])}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" rows={8} className="mt-1" {...register('content')} />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Post</Button>
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
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : blogs.length ? (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{blog.title}</h3>
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        {blog.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{blog.category}</p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {blog.content}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(blog.createdAt)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(blog._id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No blog posts yet"
              description="Create your first blog post to engage your audience."
              action={
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
