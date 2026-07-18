'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  ImagePlus,
  LayoutTemplate,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { LANDING_SECTIONS } from '@/constants';
import { ILandingPageSection } from '@/types';
import { useCompany } from '@/hooks/useCompany';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type BuilderItem = Record<string, unknown>;

const SECTION_HELP: Record<ILandingPageSection['type'], string> = {
  hero: 'Create a strong first impression with a headline and cover image.',
  about: 'Tell your story with an engaging image and company introduction.',
  services: 'Automatically displays services added from your dashboard.',
  products: 'Automatically displays products added from your dashboard.',
  gallery: 'Upload multiple images to create a visual portfolio.',
  testimonials: 'Add customer quotes that build trust.',
  faq: 'Answer common customer questions.',
  contact: 'Show an enquiry form so visitors can contact you.',
  footer: 'Close the page with your company name and copyright.',
};

const IMAGE_SECTIONS: ILandingPageSection['type'][] = ['hero', 'about'];

function createDefaultSections(): ILandingPageSection[] {
  return LANDING_SECTIONS.map((section, index) => ({
    id: `section-${section.type}-${index}`,
    type: section.type,
    title: section.title,
    subtitle: '',
    content: '',
    isVisible: true,
    order: index,
    items: [],
    images: [],
  }));
}

function mergeMissingSections(
  savedSections: ILandingPageSection[],
): ILandingPageSection[] {
  const defaults = createDefaultSections();
  const savedTypes = new Set(savedSections.map((section) => section.type));
  return [
    ...savedSections,
    ...defaults.filter((section) => !savedTypes.has(section.type)),
  ]
    .sort((a, b) => a.order - b.order)
    .map((section, order) => ({ ...section, order }));
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read image'));
    reader.readAsDataURL(file);
  });
}

export default function WebsiteBuilder() {
  const { companyId, companySlug } = useCompany();
  const [sections, setSections] = useState<ILandingPageSection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saved, setSaved] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [{ data }, { data: brandingResponse }] = await Promise.all([
          api.get('/api/dashboard/landing-page'),
          api.get('/api/dashboard/company-branding'),
        ]);
        const rawSections =
          (data.data?.sections as ILandingPageSection[] | undefined) || [];
        const loaded = data.success
          ? mergeMissingSections(rawSections)
          : createDefaultSections();
        const ordered = [...loaded].sort((a, b) => a.order - b.order);
        setSections(ordered);
        setSelectedId(ordered[0]?.id ?? null);
        setSaved(rawSections.length === loaded.length);
        if (brandingResponse.success) {
          setCompanyName(brandingResponse.data?.name || '');
          setCompanyLogo(brandingResponse.data?.logo || '');
        }
      } catch {
        toast.error('Could not load your website');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [companyId]);

  const selected = useMemo(
    () => sections.find((section) => section.id === selectedId) ?? null,
    [sections, selectedId],
  );

  const updateSection = (
    id: string,
    update: Partial<ILandingPageSection>,
  ) => {
    setSections((current) =>
      current.map((section) =>
        section.id === id ? { ...section, ...update } : section,
      ),
    );
    setSaved(false);
  };

  const updateItem = (
    sectionId: string,
    index: number,
    key: string,
    value: string,
  ) => {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;
    const items = [...(section.items || [])] as BuilderItem[];
    items[index] = { ...items[index], [key]: value };
    updateSection(sectionId, { items });
  };

  const addItem = (section: ILandingPageSection) => {
    const item =
      section.type === 'faq'
        ? { question: 'New question', answer: 'Add your answer here.' }
        : { name: 'Customer name', quote: 'Share what your customer said.' };
    updateSection(section.id, { items: [...(section.items || []), item] });
  };

  const removeItem = (sectionId: string, index: number) => {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      items: (section.items || []).filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const moveSection = (id: string, direction: -1 | 1) => {
    setSections((current) => {
      const ordered = [...current].sort((a, b) => a.order - b.order);
      const index = ordered.findIndex((section) => section.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return current;
      [ordered[index], ordered[nextIndex]] = [ordered[nextIndex], ordered[index]];
      return ordered.map((section, order) => ({ ...section, order }));
    });
    setSaved(false);
  };

  const uploadImage = async (file: File, uploadKey: string) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return null;
    }

    setUploading(uploadKey);
    try {
      const image = await readFile(file);
      const { data } = await api.post('/api/dashboard/upload', { image });
      if (!data.success || !data.data?.url) throw new Error('Upload failed');
      return data.data.url as string;
    } catch {
      toast.error('Image upload failed');
      return null;
    } finally {
      setUploading(null);
    }
  };

  const handleSectionImage = async (
    section: ILandingPageSection,
    file?: File,
  ) => {
    if (!file) return;
    const url = await uploadImage(file, section.id);
    if (url) updateSection(section.id, { image: url });
  };

  const handleNavbarLogo = async (file?: File) => {
    if (!file) return;
    const url = await uploadImage(file, 'navbar-logo');
    if (!url) return;

    try {
      const { data } = await api.put('/api/dashboard/company-branding', {
        logo: url,
      });
      if (!data.success) throw new Error('Update failed');
      setCompanyLogo(data.data.logo);
      toast.success('Navbar logo updated');
    } catch {
      toast.error('Could not update navbar logo');
    }
  };

  const handleGalleryImages = async (
    section: ILandingPageSection,
    files: FileList | null,
  ) => {
    if (!files?.length) return;
    const available = Math.max(0, 12 - (section.images?.length || 0));
    const chosen = Array.from(files).slice(0, available);
    if (!available) {
      toast.error('A gallery can contain up to 12 images');
      return;
    }

    const uploaded: string[] = [];
    for (const [index, file] of chosen.entries()) {
      const url = await uploadImage(file, `${section.id}-${index}`);
      if (url) uploaded.push(url);
    }
    if (uploaded.length) {
      updateSection(section.id, {
        images: [...(section.images || []), ...uploaded],
      });
    }
  };

  const handleSave = async () => {
    if (!companyId) {
      toast.error('No company is linked to this account');
      return;
    }
    setSaving(true);
    try {
      const normalized = [...sections]
        .sort((a, b) => a.order - b.order)
        .map((section, order) => ({ ...section, order }));
      const { data } = await api.post('/api/dashboard/landing-page', {
        sections: normalized,
      });
      if (!data.success) throw new Error(data.message);
      setSections(normalized);
      setSaved(true);
      toast.success('Website published successfully');
    } catch {
      toast.error('Could not publish your website');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <Skeleton className="h-145 rounded-2xl" />
          <Skeleton className="h-145 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600 p-5 text-white shadow-lg shadow-indigo-500/10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-100">
              <Sparkles className="h-4 w-4" />
              Professional website builder
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">Design your company website</h1>
            <p className="mt-1 max-w-2xl text-sm text-indigo-100">
              Edit content, arrange sections, upload sharp images, and publish a responsive page.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {companySlug && (
              <Button asChild variant="secondary">
                <Link href={`/company/${companySlug}`} target="_blank">
                  <Globe className="h-4 w-4" />
                  Preview
                </Link>
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving || uploading !== null || saved}
              className="bg-white text-indigo-700 hover:bg-indigo-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Publishing...' : saved ? 'Published' : 'Publish changes'}
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-gray-100 text-xl font-bold text-indigo-600 dark:bg-gray-900">
              {companyLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={companyLogo} alt="" className="h-full w-full object-cover" />
              ) : (
                companyName.charAt(0) || 'C'
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold">Navbar branding</p>
              <p className="truncate text-sm text-gray-500">
                {companyName || 'Your company'} · Upload the logo shown on your public website.
              </p>
            </div>
          </div>
          <Label
            htmlFor="navbar-logo-upload"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            {uploading === 'navbar-logo' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {companyLogo ? 'Replace logo' : 'Upload logo'}
            <Input
              id="navbar-logo-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              disabled={uploading !== null}
              onChange={(event) => handleNavbarLogo(event.target.files?.[0])}
            />
          </Label>
        </CardContent>
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="overflow-hidden lg:sticky lg:top-20">
          <div className="border-b bg-gray-50 px-4 py-3 dark:bg-gray-900">
            <div className="flex items-center gap-2 font-semibold">
              <LayoutTemplate className="h-4 w-4 text-indigo-600" />
              Page sections
            </div>
            <p className="mt-1 text-xs text-gray-500">Select, reorder, or hide sections.</p>
          </div>
          <CardContent className="space-y-1 p-2">
            {[...sections]
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setSelectedId(section.id)}
                  className={cn(
                    'group flex w-full items-center gap-2 rounded-xl border px-3 py-3 text-left transition',
                    selectedId === section.id
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300'
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-800 dark:hover:bg-gray-900',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                      section.isVisible
                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-800'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800',
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{section.title}</span>
                    <span className="block text-xs capitalize text-gray-500">{section.type}</span>
                  </span>
                  {!section.isVisible && <EyeOff className="h-4 w-4 text-gray-400" />}
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </button>
              ))}
          </CardContent>
        </Card>

        {selected ? (
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:bg-gray-900">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold capitalize">{selected.type} section</h2>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      selected.isVisible
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                    )}
                  >
                    {selected.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{SECTION_HELP[selected.type]}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  title="Move up"
                  onClick={() => moveSection(selected.id, -1)}
                  disabled={selected.order === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  title="Move down"
                  onClick={() => moveSection(selected.id, 1)}
                  disabled={selected.order === sections.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant={selected.isVisible ? 'outline' : 'default'}
                  onClick={() =>
                    updateSection(selected.id, { isVisible: !selected.isVisible })
                  }
                >
                  {selected.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {selected.isVisible ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>

            <CardContent className="space-y-7 p-5 sm:p-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="section-title">Heading</Label>
                  <Input
                    id="section-title"
                    value={selected.title}
                    maxLength={120}
                    onChange={(event) =>
                      updateSection(selected.id, { title: event.target.value })
                    }
                    placeholder="Add a clear section heading"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="section-subtitle">Supporting text</Label>
                  <Input
                    id="section-subtitle"
                    value={selected.subtitle || ''}
                    maxLength={180}
                    onChange={(event) =>
                      updateSection(selected.id, { subtitle: event.target.value })
                    }
                    placeholder="A short line that supports the heading"
                  />
                </div>
                {['hero', 'about'].includes(selected.type) && (
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="section-content">Description</Label>
                    <Textarea
                      id="section-content"
                      rows={5}
                      maxLength={1000}
                      value={selected.content || ''}
                      onChange={(event) =>
                        updateSection(selected.id, { content: event.target.value })
                      }
                      placeholder="Write polished, customer-focused copy..."
                    />
                  </div>
                )}
              </div>

              {IMAGE_SECTIONS.includes(selected.type) && (
                <div className="space-y-3 border-t pt-6">
                  <div>
                    <Label>{selected.type === 'hero' ? 'Hero cover image' : 'About image'}</Label>
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG, WebP, or GIF up to 5MB. Wide, high-resolution images look best.
                    </p>
                  </div>
                  {selected.image ? (
                    <div className="group relative aspect-16/7 overflow-hidden rounded-2xl border bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selected.image} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
                        <Label
                          htmlFor={`replace-${selected.id}`}
                          className="cursor-pointer rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-900"
                        >
                          Replace
                        </Label>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateSection(selected.id, { image: '' })}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                      <Input
                        id={`replace-${selected.id}`}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="sr-only"
                        onChange={(event) =>
                          handleSectionImage(selected, event.target.files?.[0])
                        }
                      />
                    </div>
                  ) : (
                    <Label
                      htmlFor={`upload-${selected.id}`}
                      className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-700"
                    >
                      {uploading === selected.id ? (
                        <Loader2 className="mb-3 h-9 w-9 animate-spin text-indigo-600" />
                      ) : (
                        <UploadCloud className="mb-3 h-9 w-9 text-indigo-600" />
                      )}
                      <span className="font-semibold">Click to upload an image</span>
                      <span className="mt-1 text-xs text-gray-500">Your image is optimized in Cloudinary</span>
                      <Input
                        id={`upload-${selected.id}`}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="sr-only"
                        disabled={uploading !== null}
                        onChange={(event) =>
                          handleSectionImage(selected, event.target.files?.[0])
                        }
                      />
                    </Label>
                  )}
                </div>
              )}

              {selected.type === 'gallery' && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Label>Gallery images</Label>
                      <p className="mt-1 text-xs text-gray-500">
                        Upload up to 12 portfolio images. You can select multiple files.
                      </p>
                    </div>
                    <Label
                      htmlFor={`gallery-${selected.id}`}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      {uploading?.startsWith(selected.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                      Add images
                      <Input
                        id={`gallery-${selected.id}`}
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="sr-only"
                        disabled={uploading !== null}
                        onChange={(event) =>
                          handleGalleryImages(selected, event.target.files)
                        }
                      />
                    </Label>
                  </div>
                  {selected.images?.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                      {selected.images.map((image, index) => (
                        <div
                          key={`${image}-${index}`}
                          className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image} alt="" className="h-full w-full object-cover" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8 opacity-0 transition group-hover:opacity-100"
                            onClick={() =>
                              updateSection(selected.id, {
                                images: selected.images?.filter(
                                  (_, imageIndex) => imageIndex !== index,
                                ),
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
                      No custom gallery images yet.
                    </div>
                  )}
                </div>
              )}

              {['faq', 'testimonials'].includes(selected.type) && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>
                        {selected.type === 'faq' ? 'Questions and answers' : 'Customer testimonials'}
                      </Label>
                      <p className="mt-1 text-xs text-gray-500">
                        Add authentic content that helps visitors trust your business.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => addItem(selected)}>
                      <Plus className="h-4 w-4" />
                      Add item
                    </Button>
                  </div>
                  {(selected.items || []).map((rawItem, index) => {
                    const item = rawItem as BuilderItem;
                    const isFaq = selected.type === 'faq';
                    return (
                      <div key={index} className="relative space-y-3 rounded-xl border bg-gray-50 p-4 dark:bg-gray-900">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 text-red-500"
                          onClick={() => removeItem(selected.id, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="space-y-2 pr-10">
                          <Label>{isFaq ? 'Question' : 'Customer name'}</Label>
                          <Input
                            value={String(item[isFaq ? 'question' : 'name'] || '')}
                            onChange={(event) =>
                              updateItem(
                                selected.id,
                                index,
                                isFaq ? 'question' : 'name',
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{isFaq ? 'Answer' : 'Quote'}</Label>
                          <Textarea
                            rows={3}
                            value={String(item[isFaq ? 'answer' : 'quote'] || '')}
                            onChange={(event) =>
                              updateItem(
                                selected.id,
                                index,
                                isFaq ? 'answer' : 'quote',
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                  {!selected.items?.length && (
                    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
                      Add your first {selected.type === 'faq' ? 'question' : 'testimonial'}.
                    </div>
                  )}
                </div>
              )}

              {['services', 'products', 'contact', 'footer'].includes(selected.type) && (
                <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>
                    {selected.type === 'services' &&
                      'Service cards are filled automatically from Dashboard → Services.'}
                    {selected.type === 'products' &&
                      'Product cards and images are filled automatically from Dashboard → Products.'}
                    {selected.type === 'contact' &&
                      'The enquiry form automatically sends leads to Dashboard → Leads.'}
                    {selected.type === 'footer' &&
                      'Your company name is used automatically in the footer.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex min-h-80 flex-col items-center justify-center text-center">
              <LayoutTemplate className="mb-3 h-10 w-10 text-gray-400" />
              <p className="font-medium">Select a section to start designing</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
