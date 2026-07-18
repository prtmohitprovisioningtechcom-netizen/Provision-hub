'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Image, Plus, Trash2 } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';

interface GalleryImage {
  url: string;
  caption: string;
}

export default function GalleryPage() {
  const { companyId } = useCompany();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    
    axios.get('/api/dashboard/gallery')
      .then((res) => {
        if (res.data.success && res.data.data.images) {
          setImages(res.data.data.images);
        }
      })
      .catch((err) => toast.error('Failed to load gallery'))
      .finally(() => setLoading(false));
  }, [companyId]);

  const saveImages = async (updated: GalleryImage[]) => {
    if (!companyId) return;
    setImages(updated);
    try {
      await axios.post('/api/dashboard/gallery', { images: updated });
    } catch (err) {
      toast.error('Failed to save gallery changes');
    }
  };

  const addImage = () => {
    if (!newUrl.trim()) {
      toast.error('Image URL is required');
      return;
    }
    saveImages([...images, { url: newUrl.trim(), caption: newCaption.trim() }]);
    setNewUrl('');
    setNewCaption('');
    toast.success('Image added');
  };

  const removeImage = (index: number) => {
    if (!confirm('Remove this image?')) return;
    saveImages(images.filter((_, i) => i !== index));
    toast.success('Image removed');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Gallery" description="Manage your image gallery" />

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                className="mt-1"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                placeholder="Optional caption"
                className="mt-1"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
              />
            </div>
          </div>
          <Button className="mt-4" onClick={addImage}>
            <Plus className="h-4 w-4" />
            Add Image
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : images.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.caption || 'Gallery image'}
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/400x300?text=Image';
                    }}
                  />
                  {img.caption && (
                    <p className="p-2 text-sm text-gray-600 dark:text-gray-400">{img.caption}</p>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Image}
              title="No images yet"
              description="Add image URLs to build your gallery."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
