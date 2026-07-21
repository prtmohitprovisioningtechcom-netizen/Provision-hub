'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowDown, 
  ArrowUp, 
  Check, 
  ChevronRight,
  ChevronLeft,
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
  MonitorPlay, 
  Monitor,
  Smartphone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import {
  IBlog,
  ILandingCustomPage,
  ILandingPageSection,
  IProduct,
  IService,
} from '@/types';
import { useCompany } from '@/hooks/useCompany';
import { CompanyLanding } from '@/components/company/CompanyLanding';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, generateSlug } from '@/lib/utils';
import { toGoogleMapsEmbedUrl } from '@/lib/maps';
import { filterNavFooterItems, isPlaceholderBrandLabel } from '@/lib/nav-links';
import { compressDataUrl, compressImageFile } from '@/lib/compress-image';
import { LANDING_SECTIONS } from '@/constants';

type BuilderItem = Record<string, unknown>;

const SECTION_HELP: Record<ILandingPageSection['type'], string> = {
  navbar: 'Customize logo, brand, nav pages/links, Call & enquire buttons.',
  hero: 'Add 3–5 cover images for an auto-sliding hero, plus headline and Book Now button.',
  rating: 'Google/Facebook trust bar with score, gold stars, brand name, and tagline — all editable.',
  about: 'Tell your story with an engaging image and company introduction.',
  'why-choose-us': 'Explain the strongest reasons customers should choose your company.',
  services: 'Shows as Popular Destinations — add services from Dashboard → Services.',
  products: 'Shows as Featured Tours — add products/packages from Dashboard → Products.',
  gallery: 'Photo gallery mosaic like a travel portfolio.',
  blogs: 'Publish professional insight and news cards.',
  testimonials: 'Add customer quotes that build trust.',
  faq: 'Answer common customer questions.',
  subscribe: 'Invite visitors to subscribe for company updates and offers.',
  contact: 'Enquiry form, contact details, and Google Map location.',
  footer: 'Close the page with your company name and copyright.',
};

const IMAGE_SECTIONS: ILandingPageSection['type'][] = ['about'];

function mergeMissingSections(
  savedSections: ILandingPageSection[],
): ILandingPageSection[] {
  const allowedTypes = new Set<string>(
    LANDING_SECTIONS.map((section) => section.type),
  );
  const seenTypes = new Set<string>();
  const ordered = [...savedSections]
    .sort((a, b) => a.order - b.order)
    .filter((section) => {
      if (!allowedTypes.has(section.type) || seenTypes.has(section.type)) return false;
      seenTypes.add(section.type);
      return true;
    })
    .map((section) => {
      if (
        section.type === 'gallery' &&
        !section.items?.length &&
        section.images?.length
      ) {
        return {
          ...section,
          items: section.images.map((image, index) => ({
            image,
            title: `Gallery image ${index + 1}`,
            description: '',
          })),
        };
      }
      return section;
    });

  LANDING_SECTIONS.forEach((defaultSection, defaultIndex) => {
    if (ordered.some((section) => section.type === defaultSection.type)) return;
    const previousTypes = LANDING_SECTIONS.slice(0, defaultIndex).map(
      (section) => section.type,
    );
    let insertAt = 0;
    for (let index = ordered.length - 1; index >= 0; index -= 1) {
      if (previousTypes.includes(ordered[index].type as never)) {
        insertAt = index + 1;
        break;
      }
    }
    ordered.splice(insertAt, 0, {
      ...defaultSection,
      id: `section-${defaultSection.type}`,
      type: defaultSection.type,
      content: '',
      isVisible: true,
      items: 'items' in defaultSection
        ? defaultSection.items.map((item) => ({ ...item }))
        : [],
      images: [],
    } as ILandingPageSection);
  });

  return ordered.map((section, order) => ({ ...section, order }));
}

/** Drop placeholder "Your Company" menu links that were mistaken for pages. */
function sanitizeNavFooterItems(
  sections: ILandingPageSection[],
  companyName?: string,
): ILandingPageSection[] {
  return sections.map((section) => {
    if (section.type !== 'navbar' && section.type !== 'footer') return section;

    const items = filterNavFooterItems(
      (section.items || []) as Array<{ label?: string; link?: string }>,
    );

    let title = section.title;
    if (
      section.type === 'navbar' &&
      (!title?.trim() || isPlaceholderBrandLabel(title)) &&
      companyName?.trim()
    ) {
      title = companyName.trim();
    }

    return { ...section, title, items };
  });
}

async function uploadImageFile(file: File, onProgress?: (progress: number) => void) {
  onProgress?.(15);
  const compressed = await compressImageFile(file);
  onProgress?.(45);
  const formData = new FormData();
  formData.append('file', compressed);
  try {
    const { data } = await api.post('/api/dashboard/upload', formData);
    onProgress?.(100);
    if (!data.success || !data.data?.url) {
      throw new Error(data.message || 'Upload failed');
    }
    return data.data.url as string;
  } catch (error: unknown) {
    const apiMessage = (error as { response?: { data?: { message?: string } } })?.response
      ?.data?.message;
    if (apiMessage) throw new Error(apiMessage);
    throw error instanceof Error ? error : new Error('Upload failed');
  }
}

async function replaceEmbeddedImages<T>(value: T): Promise<T> {
  if (typeof value === 'string') {
    if (!value.startsWith('data:image/')) return value;
    const file = await compressDataUrl(value);
    return (await uploadImageFile(file)) as T;
  }
  if (Array.isArray(value)) {
    const next = [];
    for (const item of value) next.push(await replaceEmbeddedImages(item));
    return next as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out[key] = await replaceEmbeddedImages(nested);
    }
    return out as T;
  }
  return value;
}

const SECTION_LINK_OPTIONS = [
  { label: 'Hero', link: '#hero' },
  { label: 'About', link: '#about' },
  { label: 'Why choose us', link: '#why-choose-us' },
  { label: 'Services', link: '#services' },
  { label: 'Products', link: '#products' },
  { label: 'Gallery', link: '#gallery' },
  { label: 'Blogs', link: '#blogs' },
  { label: 'Testimonials', link: '#testimonials' },
  { label: 'FAQ', link: '#faq' },
  { label: 'Subscribe', link: '#subscribe' },
  { label: 'Contact', link: '#contact' },
];

export default function WebsiteBuilder() {
  const { companyId, companySlug } = useCompany();
  const [sections, setSections] = useState<ILandingPageSection[]>([]);
  const [customPages, setCustomPages] = useState<ILandingCustomPage[]>([]);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWhatsapp, setCompanyWhatsapp] = useState('');
  const [companyRating, setCompanyRating] = useState(0);
  const [companyReviewCount, setCompanyReviewCount] = useState(0);
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    youtube: '',
    twitter: '',
    linkedin: '',
  });
  const [publishedBlogs, setPublishedBlogs] = useState<IBlog[]>([]);
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>(
    'desktop',
  );
  const [catalogProducts, setCatalogProducts] = useState<IProduct[]>([]);
  const [catalogServices, setCatalogServices] = useState<IService[]>([]);
  useEffect(() => {
    if (!companyId) {
      // Avoid synchronous setState during render
      requestAnimationFrame(() => setLoading(false));
      return;
    }

    const load = async () => {
      try {
        const [
          { data },
          { data: brandingResponse },
          { data: blogsResponse },
          { data: productsResponse },
          { data: servicesResponse },
          { data: galleryResponse },
        ] = await Promise.all([
          api.get('/api/dashboard/landing-page'),
          api.get('/api/dashboard/company-branding'),
          api.get('/api/dashboard/blogs'),
          api.get(`/api/products?companyId=${companyId}&limit=12`),
          api.get(`/api/services?companyId=${companyId}&limit=12`),
          api.get('/api/dashboard/gallery'),
        ]);

        const rawSections =
          (data.data?.sections as ILandingPageSection[] | undefined) || [];
        const brandName = brandingResponse.success
          ? String(brandingResponse.data?.name || '')
          : '';
        const loaded = sanitizeNavFooterItems(
          mergeMissingSections(rawSections),
          brandName,
        );
        const ordered = [...loaded].sort((a, b) => a.order - b.order);
        const catalogFromGallery = galleryResponse.success
          ? (galleryResponse.data?.images || []).map(
              (
                image: { url?: string; caption?: string },
                index: number,
              ) => ({
                image: image.url || '',
                title: image.caption || `Gallery image ${index + 1}`,
                description: image.caption || '',
              }),
            )
          : [];
        const sectionsWithGallery = ordered.map((section) => {
          if (section.type !== 'gallery') return section;
          if (section.items?.length) return section;
          if (catalogFromGallery.length) {
            return { ...section, items: catalogFromGallery };
          }
          return section;
        });
        setSections(sectionsWithGallery);
        setCustomPages(
          Array.isArray(data.data?.pages)
            ? (data.data.pages as ILandingCustomPage[]).filter((page) => {
                const title = page.title?.trim().toLowerCase() || '';
                const slug = page.slug?.trim().toLowerCase() || '';
                // Placeholder page created by mistake from navbar brand name
                if (title === 'your company' || slug === 'your-company') return false;
                return true;
              })
            : [],
        );
        setSelectedId(null);
        setEditingPageId(null);
        setSaved(JSON.stringify(rawSections) === JSON.stringify(sectionsWithGallery));
        if (brandingResponse.success) {
          setCompanyName(brandingResponse.data?.name || '');
          setCompanyLogo(brandingResponse.data?.logo || '');
          setCompanyPhone(brandingResponse.data?.phone || '');
          setCompanyWhatsapp(
            brandingResponse.data?.socialLinks?.whatsapp ||
              brandingResponse.data?.phone ||
              '',
          );
          setCompanyRating(Number(brandingResponse.data?.rating || 0));
          setCompanyReviewCount(Number(brandingResponse.data?.reviewCount || 0));
          setPrimaryColor(
            brandingResponse.data?.theme?.primaryColor || '#0ea5e9',
          );
          const links = brandingResponse.data?.socialLinks || {};
          setSocialLinks({
            facebook: String(links.facebook || ''),
            instagram: String(links.instagram || ''),
            youtube: String(links.youtube || ''),
            twitter: String(links.twitter || ''),
            linkedin: String(links.linkedin || ''),
          });
        }
        if (blogsResponse.success) {
          setPublishedBlogs(
            ((blogsResponse.data || []) as IBlog[]).filter(
              (blog) => blog.status === 'published',
            ),
          );
        }
        if (productsResponse.success) {
          setCatalogProducts(productsResponse.data || []);
        }
        if (servicesResponse.success) {
          setCatalogServices(servicesResponse.data || []);
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
  const previewNavbar = useMemo(
    () => sections.find((section) => section.type === 'navbar'),
    [sections],
  );
  const previewSections = useMemo(() => sections, [sections]);

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
    value: unknown,
  ) => {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;
    const items = [...(section.items || [])] as BuilderItem[];
    items[index] = { ...items[index], [key]: value };
    updateSection(sectionId, { items });
  };

  const addItem = (section: ILandingPageSection) => {
    let item: BuilderItem;
    if (section.type === 'faq') {
      item = { question: 'New question', answer: 'Add your answer here.' };
    } else if (section.type === 'testimonials') {
      item = {
        name: 'Customer name',
        role: 'Customer',
        quote: 'Share what your customer said.',
        image: '',
      };
    } else if (section.type === 'services') {
      item = { name: 'New service', description: '', price: 0, image: '' };
    } else if (section.type === 'why-choose-us') {
      item = {
        title: 'New benefit',
        description: 'Explain why this matters to your customers.',
      };
    } else if (section.type === 'blogs') {
      item = {
        title: 'New article',
        description: 'Add a short article summary.',
        image: '',
        link: '',
      };
    } else if (section.type === 'navbar' || section.type === 'footer') {
      item = { label: 'New link', link: '/' };
    } else {
      item = {
        name: 'New product',
        description: '',
        price: 0,
        offerPrice: '',
        images: [],
      };
    }
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
      if (
        ordered[index].type === 'navbar' ||
        ordered[nextIndex].type === 'navbar'
      ) {
        return current;
      }
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
    if (file.size > 12 * 1024 * 1024) {
      toast.error('Image must be smaller than 12MB');
      return null;
    }

    setUploading(uploadKey);
    setUploadProgress((prev) => ({ ...prev, [uploadKey]: 0 }));
    try {
      const url = await uploadImageFile(file, (progress) => {
        setUploadProgress((prev) => ({ ...prev, [uploadKey]: progress }));
      });
      return url;
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Image upload failed';
      toast.error(
        message.includes('too large')
          ? message
          : 'Image upload failed. Try a smaller image.',
      );
      return null;
    } finally {
      setUploading(null);
      setUploadProgress((prev) => {
        const next = { ...prev };
        delete next[uploadKey];
        return next;
      });
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

  const handleHeroImages = async (
    section: ILandingPageSection,
    files: FileList | null,
  ) => {
    if (!files?.length) return;
    const current = section.images?.length
      ? [...section.images]
      : section.image
        ? [section.image]
        : [];
    const available = Math.max(0, 5 - current.length);
    const chosen = Array.from(files).slice(0, available);
    if (!available) {
      toast.error('Hero can have up to 5 slideshow images');
      return;
    }
    if (chosen.length < files.length) {
      toast.error(`Only ${available} more image(s) can be added (max 5)`);
    }

    const uploaded: string[] = [];
    for (const [index, file] of chosen.entries()) {
      const url = await uploadImage(file, `${section.id}-hero-${index}`);
      if (url) uploaded.push(url);
    }
    if (!uploaded.length) return;
    const images = [...current, ...uploaded].slice(0, 5);
    updateSection(section.id, { images, image: images[0] || '' });
  };

  const removeHeroImage = (section: ILandingPageSection, imageIndex: number) => {
    const current = section.images?.length
      ? [...section.images]
      : section.image
        ? [section.image]
        : [];
    const images = current.filter((_, index) => index !== imageIndex);
    updateSection(section.id, { images, image: images[0] || '' });
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

  const handleBrandColorSave = async () => {
    try {
      const { data } = await api.put('/api/dashboard/company-branding', {
        primaryColor,
      });
      if (!data.success) throw new Error('Update failed');
      toast.success('Brand color updated');
    } catch {
      toast.error('Could not update brand color');
    }
  };

  const handleSocialLinksSave = async () => {
    try {
      const { data } = await api.put('/api/dashboard/company-branding', {
        socialLinks,
      });
      if (!data.success) throw new Error(data.message || 'Update failed');
      toast.success('Social links saved — icons show on live navbar');
    } catch (error: unknown) {
      const apiMessage = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(apiMessage || 'Could not save social links');
    }
  };

  const handleItemImage = async (
    section: ILandingPageSection,
    itemIndex: number,
    file?: File,
  ) => {
    if (!file) return;
    const url = await uploadImage(file, `${section.id}-item-${itemIndex}`);
    if (!url) return;
    updateItem(
      section.id,
      itemIndex,
      section.type === 'products' ? 'images' : 'image',
      section.type === 'products' ? [url] : url,
    );
  };

  const handleGalleryImages = async (
    section: ILandingPageSection,
    files: FileList | null,
  ) => {
    if (!files?.length) return;
    const available = Math.max(0, 12 - (section.items?.length || 0));
    const chosen = Array.from(files).slice(0, available);
    if (!available) {
      toast.error('A gallery can contain up to 12 images');
      return;
    }

    const uploaded: BuilderItem[] = [];
    for (const [index, file] of chosen.entries()) {
      const url = await uploadImage(file, `${section.id}-${index}`);
      if (url) {
        uploaded.push({
          image: url,
          title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
          description: '',
        });
      }
    }
    if (uploaded.length) {
      updateSection(section.id, {
        items: [...(section.items || []), ...uploaded],
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
      const migratedSections = await replaceEmbeddedImages(
        sanitizeNavFooterItems(sections, companyName),
      );
      const migratedPages = (await replaceEmbeddedImages(customPages)).filter(
        (page) => {
          const title = page.title?.trim().toLowerCase() || '';
          const slug = page.slug?.trim().toLowerCase() || '';
          return title !== 'your company' && slug !== 'your-company';
        },
      );
      const normalized = [...migratedSections]
        .sort((a, b) => a.order - b.order)
        .map((section, order) => ({ ...section, order }));

      const payloadSize = JSON.stringify({
        sections: normalized,
        pages: migratedPages,
      }).length;
      if (payloadSize > 3_200_000) {
        toast.error(
          'Page content is too large to publish. Remove some gallery images and try again.',
        );
        setSections(normalized);
        setCustomPages(migratedPages);
        return;
      }

      const { data } = await api.post('/api/dashboard/landing-page', {
        sections: normalized,
        pages: migratedPages,
      });
      if (!data.success) throw new Error(data.message || 'Publish failed');
      setSections(normalized);
      setCustomPages(migratedPages);
      setSaved(true);
      toast.success('Website published successfully');
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number; data?: { message?: string } } })
        ?.response?.status;
      const apiMessage = (error as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      if (status === 413) {
        toast.error(
          apiMessage ||
            'Content too large. Re-upload large images, then publish again.',
        );
      } else {
        toast.error(apiMessage || 'Could not publish your website');
      }
    } finally {
      setSaving(false);
    }
  };

  const addCustomPage = () => {
    const id = `page-${Date.now()}`;
    const title = `New page ${customPages.length + 1}`;
    setCustomPages((current) => [
      ...current,
      {
        id,
        title,
        slug: generateSlug(title),
        subtitle: '',
        content: '',
        image: '',
        isVisible: true,
      },
    ]);
    setEditingPageId(id);
    setSelectedId(null);
    setSaved(false);
  };

  const updateCustomPage = (id: string, update: Partial<ILandingCustomPage>) => {
    setCustomPages((current) =>
      current.map((page) => {
        if (page.id !== id) return page;
        const next = { ...page, ...update };
        if (update.title && !update.slug) {
          next.slug = generateSlug(update.title);
        }
        if (update.slug) next.slug = generateSlug(update.slug);
        return next;
      }),
    );
    setSaved(false);
  };

  const removeCustomPage = (id: string) => {
    setCustomPages((current) => current.filter((page) => page.id !== id));
    if (editingPageId === id) setEditingPageId(null);
    setSaved(false);
  };

  const addPageLinkToNav = (
    page: ILandingCustomPage,
    type: 'navbar' | 'footer' = 'navbar',
  ) => {
    const target = sections.find((section) => section.type === type);
    if (!target || !companySlug) {
      toast.error(`${type} section not found`);
      return;
    }
    const link = `/${companySlug}/p/${page.slug}`;
    const exists = (target.items || []).some(
      (item) => String((item as BuilderItem).link || '') === link,
    );
    if (exists) {
      toast.success(`This page is already in the ${type}`);
      return;
    }
    updateSection(target.id, {
      items: [
        ...(target.items || []),
        { label: page.title, link },
      ],
    });
    toast.success(`Added to ${type} — opens as /${companySlug}/p/${page.slug}`);
  };

  const setNavbarButtonToPage = (page: ILandingCustomPage) => {
    const navbar = sections.find((section) => section.type === 'navbar');
    if (!navbar || !companySlug) return;
    const link = `/${companySlug}/p/${page.slug}`;
    updateSection(navbar.id, {
      buttonLink: link,
      buttonText: navbar.buttonText?.trim() || page.title,
    });
    toast.success('Navbar button will open this page');
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
    <div className="flex h-[calc(100dvh-7.5rem)] min-h-125 flex-col gap-4 overflow-hidden">
      <div className="shrink-0 overflow-hidden rounded-2xl border border-indigo-100 bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600 p-4 text-white shadow-lg shadow-indigo-500/10 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                <Link href={`/${companySlug}`} target="_blank">
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
              <MonitorPlay className="h-4 w-4" />
              {saving ? 'Publishing...' : saved ? 'Published' : 'Publish changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
        {/* Left Side: Editor */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          {!selected && !editingPageId ? (
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b bg-gray-50 px-4 py-3 dark:bg-gray-900">
              <div className="flex items-center gap-2 font-semibold">
                <LayoutTemplate className="h-4 w-4 text-indigo-600" />
                Website sections
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Edit any section. Hide ones you don’t need — they won’t show on your live site.
              </p>
            </div>
            <CardContent className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-2">
              {[...sections]
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <div
                    key={section.id}
                    className={cn(
                      'group flex w-full items-center gap-1 rounded-xl border px-2 py-2 transition',
                      section.isVisible
                        ? 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                        : 'border-dashed border-gray-200 bg-gray-50/80 opacity-75',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(section.id);
                        setEditingPageId(null);
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left"
                    >
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                          section.isVisible
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'bg-gray-200 text-gray-400',
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium capitalize">
                          {section.type === 'navbar'
                            ? 'Navbar'
                            : section.type === 'footer'
                              ? 'Footer'
                              : section.title || section.type}
                        </span>
                        <span className="block truncate text-xs text-gray-500">
                          {section.type === 'navbar'
                            ? section.title || 'Brand name'
                            : section.type === 'footer'
                              ? 'Links & copyright'
                              : section.type}
                          {!section.isVisible ? ' · removed from site' : ''}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-40" />
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      title={
                        section.isVisible
                          ? 'Remove from website'
                          : 'Add back to website'
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        updateSection(section.id, { isVisible: !section.isVisible });
                      }}
                    >
                      {section.isVisible ? (
                        <Eye className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                ))}

              <div className="mt-4 border-t pt-3">
                <div className="mb-2 flex items-center justify-between px-2">
                  <div>
                    <p className="text-sm font-semibold">Custom pages</p>
                    <p className="text-xs text-gray-500">
                      Routes like /{companySlug || 'your-slug'}/p/about
                    </p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={addCustomPage}>
                    <Plus className="h-4 w-4" />
                    Add page
                  </Button>
                </div>
                {customPages.length === 0 && (
                  <p className="px-2 py-4 text-center text-xs text-gray-500">
                    Create pages for navbar (About, Privacy, Offers, etc.).
                  </p>
                )}
                {customPages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => {
                      setEditingPageId(page.id);
                      setSelectedId(null);
                    }}
                    className="group mb-1 flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-gray-200 hover:bg-gray-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-xs font-bold text-sky-700">
                      P
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{page.title}</span>
                      <span className="block truncate text-xs text-gray-500">
                        /{companySlug}/p/{page.slug}
                      </span>
                    </span>
                    {!page.isVisible && <EyeOff className="h-4 w-4 text-gray-400" />}
                    <ChevronRight className="h-4 w-4 opacity-40" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          ) : editingPageId ? (
            (() => {
              const page = customPages.find((item) => item.id === editingPageId);
              if (!page) return null;
              return (
                <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-sky-200 shadow-xl">
                  <div className="flex shrink-0 items-center gap-3 border-b bg-sky-50/60 px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPageId(null)}
                      className="h-8 gap-1 pl-1.5"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <span className="text-sm font-semibold text-sky-900">Edit custom page</span>
                  </div>
                  <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
                    <div className="space-y-2">
                      <Label>Page title</Label>
                      <Input
                        value={page.title}
                        onChange={(event) =>
                          updateCustomPage(page.id, { title: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL slug (route)</Label>
                      <Input
                        value={page.slug}
                        onChange={(event) =>
                          updateCustomPage(page.id, { slug: event.target.value })
                        }
                      />
                      <p className="text-xs text-gray-500">
                        Live URL: /{companySlug}/p/{page.slug || '...'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input
                        value={page.subtitle || ''}
                        onChange={(event) =>
                          updateCustomPage(page.id, { subtitle: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Page content</Label>
                      <Textarea
                        rows={8}
                        value={page.content}
                        onChange={(event) =>
                          updateCustomPage(page.id, { content: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateCustomPage(page.id, { isVisible: !page.isVisible })
                        }
                      >
                        {page.isVisible ? (
                          <>
                            <Eye className="h-4 w-4" /> Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4" /> Hidden
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addPageLinkToNav(page, 'navbar')}
                      >
                        Add to navbar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addPageLinkToNav(page, 'footer')}
                      >
                        Add to footer
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setNavbarButtonToPage(page)}
                      >
                        Set as navbar button
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCustomPage(page.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })()
          ) : selected ? (
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-indigo-200 shadow-xl dark:border-indigo-800">
            <div className="shrink-0 flex items-center gap-3 border-b bg-indigo-50/50 px-4 py-3 dark:bg-indigo-950/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedId(null)}
                className="h-8 gap-1 pl-1.5 text-gray-600 hover:bg-gray-200/50 dark:text-gray-400"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
              <span className="text-sm font-semibold capitalize text-indigo-900 dark:text-indigo-300">
                Edit {selected.type} section
              </span>
            </div>
            <div className="shrink-0 flex flex-col gap-3 border-b bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:bg-gray-900">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold capitalize">{selected.title || selected.type}</h2>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      selected.isVisible
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                    )}
                  >
                    {selected.isVisible ? 'On website' : 'Removed'}
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
                  disabled={
                    selected.type === 'navbar' ||
                    selected.order === 0 ||
                    sections.some(
                      (section) =>
                        section.type === 'navbar' &&
                        section.order === selected.order - 1,
                    )
                  }
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  title="Move down"
                  onClick={() => moveSection(selected.id, 1)}
                  disabled={
                    selected.type === 'navbar' ||
                    selected.order === sections.length - 1
                  }
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
                  {selected.isVisible ? 'Remove from site' : 'Add to site'}
                </Button>
              </div>
            </div>
            <CardContent className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain bg-white p-5 sm:p-7 dark:bg-gray-900">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="section-title">
                    {selected.type === 'navbar'
                      ? 'Brand name (logo text)'
                      : selected.type === 'footer'
                        ? 'Footer heading'
                        : selected.type === 'rating'
                          ? 'Brand name (e.g. INDIA TOURS)'
                          : 'Heading'}
                  </Label>
                  <Input
                    id="section-title"
                    value={selected.title}
                    maxLength={120}
                    onChange={(event) =>
                      updateSection(selected.id, { title: event.target.value })
                    }
                    placeholder={
                      selected.type === 'navbar'
                        ? companyName || 'Your brand name'
                        : selected.type === 'rating'
                          ? companyName || 'INDIA TOURS'
                          : 'Add a clear section heading'
                    }
                  />
                  {selected.type === 'navbar' && (
                    <p className="text-xs text-gray-500">
                      Only shows next to the logo. Ye menu page nahi hai — links neeche add karo
                      (#about ya custom page).
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="section-subtitle">
                    {selected.type === 'navbar'
                      ? 'Navbar tagline'
                      : selected.type === 'rating'
                        ? 'Tagline under brand name'
                        : 'Supporting text'}
                  </Label>
                  <Input
                    id="section-subtitle"
                    value={selected.subtitle || ''}
                    maxLength={180}
                    onChange={(event) =>
                      updateSection(selected.id, { subtitle: event.target.value })
                    }
                    placeholder={
                      selected.type === 'contact'
                        ? "We'd love to hear from you"
                        : selected.type === 'rating'
                          ? 'Explore packages, honest rates, and trusted service'
                          : 'A short line that supports the heading'
                    }
                  />
                  {selected.type === 'contact' && (
                    <p className="text-xs text-gray-500">
                      Ye line Contact Us heading ke neeche live page pe dikhegi.
                    </p>
                  )}
                </div>
                {['hero', 'about', 'subscribe', 'footer', 'contact'].includes(selected.type) && (
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="section-content">
                      {selected.type === 'contact' ? 'Extra supporting text' : 'Description'}
                    </Label>
                    <Textarea
                      id="section-content"
                      rows={selected.type === 'contact' ? 3 : 5}
                      maxLength={1000}
                      value={selected.content || ''}
                      onChange={(event) =>
                        updateSection(selected.id, { content: event.target.value })
                      }
                      placeholder={
                        selected.type === 'contact'
                          ? 'Optional longer text under the contact heading...'
                          : 'Write polished, customer-focused copy...'
                      }
                    />
                  </div>
                )}
                {['about', 'services', 'products', 'why-choose-us', 'gallery', 'contact', 'footer'].includes(
                  selected.type,
                ) && (
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Small label (optional)</Label>
                    <Input
                      value={selected.eyebrow || ''}
                      onChange={(event) =>
                        updateSection(selected.id, { eyebrow: event.target.value })
                      }
                      placeholder={
                        selected.type === 'footer' ? 'Links heading' : 'Short label above the title'
                      }
                    />
                  </div>
                )}
                {['about', 'services', 'products', 'contact', 'footer'].includes(selected.type) && (
                  <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Button text (optional)</Label>
                      <Input
                        value={selected.buttonText || ''}
                        onChange={(event) =>
                          updateSection(selected.id, { buttonText: event.target.value })
                        }
                        placeholder="Only shows if you type something"
                      />
                    </div>
                    {selected.type !== 'contact' && selected.type !== 'footer' && (
                      <div className="space-y-2">
                        <Label>Button link</Label>
                        <Input
                          value={selected.buttonLink || ''}
                          onChange={(event) =>
                            updateSection(selected.id, { buttonLink: event.target.value })
                          }
                          placeholder="#contact or /slug/p/page"
                        />
                      </div>
                    )}
                  </div>
                )}
                {selected.type === 'hero' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="hero-button-text">Button text</Label>
                      <Input
                        id="hero-button-text"
                        value={selected.buttonText || ''}
                        onChange={(event) =>
                          updateSection(selected.id, {
                            buttonText: event.target.value,
                          })
                        }
                        placeholder="Leave empty to hide the button"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-button-link">Button link</Label>
                      <Input
                        id="hero-button-link"
                        value={selected.buttonLink || ''}
                        onChange={(event) =>
                          updateSection(selected.id, {
                            buttonLink: event.target.value,
                          })
                        }
                        placeholder="#contact or /slug/p/about"
                      />
                    </div>
                    {customPages.length > 0 && (
                      <div className="flex flex-wrap gap-2 sm:col-span-2">
                        {customPages.map((page) => (
                          <Button
                            key={page.id}
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              updateSection(selected.id, {
                                buttonLink: `/${companySlug}/p/${page.slug}`,
                                buttonText: selected.buttonText?.trim() || page.title,
                              })
                            }
                          >
                            Hero button → {page.title}
                          </Button>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {selected.type === 'subscribe' && (
                  <>
                    <div className="space-y-2">
                      <Label>Small label</Label>
                      <Input
                        value={selected.eyebrow || ''}
                        onChange={(event) =>
                          updateSection(selected.id, { eyebrow: event.target.value })
                        }
                        placeholder="Stay connected"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscribe-button-text">Button text</Label>
                      <Input
                        id="subscribe-button-text"
                        value={selected.buttonText || ''}
                        maxLength={40}
                        onChange={(event) =>
                          updateSection(selected.id, {
                            buttonText: event.target.value,
                          })
                        }
                        placeholder="Subscribe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email placeholder</Label>
                      <Input
                        value={selected.placeholder || ''}
                        onChange={(event) =>
                          updateSection(selected.id, {
                            placeholder: event.target.value,
                          })
                        }
                        placeholder="Enter your email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Privacy note</Label>
                      <Input
                        value={selected.note || ''}
                        onChange={(event) =>
                          updateSection(selected.id, { note: event.target.value })
                        }
                        placeholder="No spam. Unsubscribe whenever you want."
                      />
                    </div>
                  </>
                )}
                {selected.type === 'rating' && (
                  <div className="space-y-4 sm:col-span-2">
                    <p className="text-xs text-gray-500">
                      Image-style trust row: badges + score + stars + brand name + tagline. Sab
                      fields change kar sakte ho.
                    </p>
                    <div className="space-y-2">
                      <Label>Rating score (optional)</Label>
                      <Input
                        value={selected.note || ''}
                        onChange={(event) =>
                          updateSection(selected.id, { note: event.target.value })
                        }
                        placeholder="e.g. 4.9 — leave empty to use live reviews score"
                      />
                      <p className="text-xs text-gray-500">
                        Empty = live approved reviews. Fill = fixed score like 4.9
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Extra line (optional)</Label>
                      <Textarea
                        rows={2}
                        value={selected.content || ''}
                        onChange={(event) =>
                          updateSection(selected.id, { content: event.target.value })
                        }
                        placeholder="Optional third line under the tagline"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label>Trust badges (Google, Facebook…)</Label>
                        <div className="flex flex-wrap gap-2">
                          {['Google', 'facebook'].map((label) => (
                            <Button
                              key={label}
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                const exists = (selected.items || []).some(
                                  (item) =>
                                    String((item as BuilderItem).label || '').toLowerCase() ===
                                    label.toLowerCase(),
                                );
                                if (exists) return;
                                updateSection(selected.id, {
                                  items: [...(selected.items || []), { label, link: '' }],
                                });
                              }}
                            >
                              + {label}
                            </Button>
                          ))}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateSection(selected.id, {
                                items: [
                                  ...(selected.items || []),
                                  { label: 'New badge', link: '' },
                                ],
                              })
                            }
                          >
                            + Custom
                          </Button>
                        </div>
                      </div>
                      {(selected.items || []).map((rawItem, index) => {
                        const item = rawItem as BuilderItem;
                        return (
                          <div
                            key={index}
                            className="relative grid gap-3 rounded-xl border bg-gray-50 p-4 pr-12 sm:grid-cols-2 dark:bg-gray-900"
                          >
                            <div className="space-y-1">
                              <Label>Badge name</Label>
                              <Input
                                value={String(item.label || '')}
                                onChange={(event) =>
                                  updateItem(selected.id, index, 'label', event.target.value)
                                }
                                placeholder="Google"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Link (optional)</Label>
                              <Input
                                value={String(item.link || '')}
                                onChange={(event) =>
                                  updateItem(selected.id, index, 'link', event.target.value)
                                }
                                placeholder="https://..."
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-6 text-red-500"
                              onClick={() => removeItem(selected.id, index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {selected.type === 'navbar' && (
                <div className="space-y-5 border-t pt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label>Company logo</Label>
                      <div className="flex items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border bg-gray-100 text-xl font-bold text-indigo-600 dark:bg-gray-900">
                          {companyLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={companyLogo} alt="" className="h-full w-full object-contain p-1" />
                          ) : (
                            companyName.charAt(0) || 'C'
                          )}
                        </div>
                        <Label
                          htmlFor="navbar-editor-logo"
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          {uploading === 'navbar-logo' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ImagePlus className="h-4 w-4" />
                          )}
                          {uploading === 'navbar-logo' 
                            ? (uploadProgress['navbar-logo'] ? `Uploading ${uploadProgress['navbar-logo']}%` : 'Uploading...') 
                            : companyLogo ? 'Replace logo' : 'Upload logo'}
                          <Input
                            id="navbar-editor-logo"
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="sr-only"
                            disabled={uploading !== null}
                            onChange={(event) =>
                              handleNavbarLogo(event.target.files?.[0])
                            }
                          />
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="brand-color">Brand color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="brand-color"
                          type="color"
                          value={primaryColor}
                          onChange={(event) => setPrimaryColor(event.target.value)}
                          className="h-12 w-16 cursor-pointer p-1"
                        />
                        <Input
                          value={primaryColor}
                          pattern="^#[0-9a-fA-F]{6}$"
                          maxLength={7}
                          onChange={(event) => setPrimaryColor(event.target.value)}
                        />
                        <Button type="button" variant="outline" onClick={handleBrandColorSave}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Navbar button text</Label>
                      <Input
                        value={selected.buttonText || ''}
                        onChange={(event) =>
                          updateSection(selected.id, { buttonText: event.target.value })
                        }
                        placeholder="e.g. About us"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button opens this link / page</Label>
                      <Input
                        value={selected.buttonLink || ''}
                        onChange={(event) =>
                          updateSection(selected.id, { buttonLink: event.target.value })
                        }
                        placeholder={`/${companySlug || 'your-slug'}/p/about`}
                      />
                    </div>
                  </div>
                  {customPages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">
                        Pick a custom page — it opens as a separate page (not on the landing scroll).
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {customPages.map((page) => (
                          <Button
                            key={page.id}
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setNavbarButtonToPage(page)}
                          >
                            Button → {page.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-3 border-t pt-5">
                    <div>
                      <Label>Social links</Label>
                      <p className="mt-1 text-xs text-gray-500">
                        Link paste karo — Facebook / Instagram / YouTube icons navbar pe automatic aa
                        jayenge.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(
                        [
                          ['facebook', 'Facebook URL'],
                          ['instagram', 'Instagram URL'],
                          ['youtube', 'YouTube URL'],
                          ['twitter', 'X / Twitter URL'],
                          ['linkedin', 'LinkedIn URL'],
                        ] as const
                      ).map(([key, label]) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs text-gray-500">{label}</Label>
                          <Input
                            value={socialLinks[key]}
                            onChange={(event) =>
                              setSocialLinks((current) => ({
                                ...current,
                                [key]: event.target.value,
                              }))
                            }
                            placeholder={`https://${key}.com/...`}
                          />
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" onClick={handleSocialLinksSave}>
                      Save social links
                    </Button>
                  </div>
                </div>
              )}

              {IMAGE_SECTIONS.includes(selected.type) && (
                <div className="space-y-3 border-t pt-6">
                  <div>
                    <Label>About image</Label>
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG, WebP, or GIF. Wide, high-resolution images look best.
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
                        <>
                          <Loader2 className="mb-3 h-9 w-9 animate-spin text-indigo-600" />
                          <span className="font-semibold text-indigo-600">
                            Uploading {uploadProgress[selected.id] ? `${uploadProgress[selected.id]}%` : '...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="mb-3 h-9 w-9 text-indigo-600" />
                          <span className="font-semibold">Click to upload an image</span>
                          <span className="mt-1 text-xs text-gray-500">Your image is optimized in Cloudinary</span>
                        </>
                      )}
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

              {selected.type === 'hero' && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Label>Hero slideshow images</Label>
                      <p className="mt-1 text-xs text-gray-500">
                        Upload 3–5 wide images. They auto-slide every 5 seconds on the live page.
                      </p>
                    </div>
                    <Label
                      htmlFor={`hero-slides-${selected.id}`}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      {uploading?.startsWith(selected.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                      Add images
                      <Input
                        id={`hero-slides-${selected.id}`}
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="sr-only"
                        disabled={uploading !== null}
                        onChange={(event) => {
                          handleHeroImages(selected, event.target.files);
                          event.target.value = '';
                        }}
                      />
                    </Label>
                  </div>
                  {(() => {
                    const slides = selected.images?.length
                      ? selected.images
                      : selected.image
                        ? [selected.image]
                        : [];
                    if (!slides.length) {
                      return (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
                          No hero images yet. Add at least 3 images for a smooth slideshow.
                        </div>
                      );
                    }
                    return (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {slides.map((src, imageIndex) => (
                          <div
                            key={`${src}-${imageIndex}`}
                            className="group relative aspect-video overflow-hidden rounded-xl border bg-gray-100"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="h-full w-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/55 px-2 py-1.5 text-[10px] font-semibold text-white">
                              <span>Slide {imageIndex + 1}</span>
                              <button
                                type="button"
                                className="rounded bg-red-500/90 px-1.5 py-0.5"
                                onClick={() => removeHeroImage(selected, imageIndex)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {selected.type === 'contact' && (
                <div className="space-y-4 border-t pt-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Left panel heading</Label>
                      <Input
                        value={selected.note || ''}
                        onChange={(event) =>
                          updateSection(selected.id, { note: event.target.value })
                        }
                        placeholder="Company name (default)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Form heading (right side)</Label>
                      <Input
                        value={selected.placeholder || ''}
                        onChange={(event) =>
                          updateSection(selected.id, { placeholder: event.target.value })
                        }
                        placeholder="Send Us a Message"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>WhatsApp button text</Label>
                      <Input
                        value={selected.buttonText || ''}
                        onChange={(event) =>
                          updateSection(selected.id, { buttonText: event.target.value })
                        }
                        placeholder="WhatsApp"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact-map-url">Google Map location</Label>
                    <p className="mt-1 text-xs text-gray-500">
                      Paste a Google Maps link, embed URL, or full address (e.g. Sector 9, Gurugram).
                    </p>
                  </div>
                  <Input
                    id="contact-map-url"
                    value={selected.mapUrl || ''}
                    onChange={(event) =>
                      updateSection(selected.id, { mapUrl: event.target.value })
                    }
                    placeholder="https://maps.google.com/... or Sector 9 Gurugram"
                  />
                  {selected.mapUrl && toGoogleMapsEmbedUrl(selected.mapUrl) && (
                    <div className="overflow-hidden rounded-xl border">
                      <iframe
                        title="Map preview"
                        src={toGoogleMapsEmbedUrl(selected.mapUrl)!}
                        className="h-48 w-full border-0"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              )}

              {selected.type === 'gallery' && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Label>Gallery images</Label>
                      <p className="mt-1 text-xs text-gray-500">
                        Same card layout as Services — image, title, and description on each card.
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
                  {selected.items?.length ? (
                    <div className="space-y-3">
                      {selected.items.map((rawItem, index) => {
                        const item = rawItem as BuilderItem;
                        const image = String(item.image || '');
                        return (
                          <div
                          key={`${image}-${index}`}
                          className="relative grid gap-3 rounded-xl border bg-gray-50 p-3 sm:grid-cols-[120px_1fr] dark:bg-gray-900"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image} alt="" className="aspect-square h-full w-full rounded-lg object-cover" />
                          <div className="space-y-3 pr-10">
                            <div className="space-y-1">
                              <Label>Image title</Label>
                              <Input
                                value={String(item.title || '')}
                                onChange={(event) =>
                                  updateItem(selected.id, index, 'title', event.target.value)
                                }
                                placeholder="Project or image title"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Description</Label>
                              <Textarea
                                rows={2}
                                value={String(item.description || '')}
                                onChange={(event) =>
                                  updateItem(
                                    selected.id,
                                    index,
                                    'description',
                                    event.target.value,
                                  )
                                }
                                placeholder="Explain what visitors are seeing"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8"
                            onClick={() => removeItem(selected.id, index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
                      No custom gallery images yet.
                    </div>
                  )}
                </div>
              )}

              {['services', 'products'].includes(selected.type) && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Label>
                        {selected.type === 'services' ? 'Service cards' : 'Product cards'}
                      </Label>
                      <p className="mt-1 text-xs text-gray-500">
                        Add custom cards here to showcase your {selected.type === 'services' ? 'services' : 'products'}.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => addItem(selected)}>
                      <Plus className="h-4 w-4" />
                      Add {selected.type === 'services' ? 'service' : 'product'}
                    </Button>
                  </div>

                  {(selected.items || []).map((rawItem, index) => {
                    const item = rawItem as BuilderItem;
                    const isProduct = selected.type === 'products';
                    const itemImage = isProduct
                      ? Array.isArray(item.images)
                        ? String(item.images[0] || '')
                        : ''
                      : String(item.image || '');

                    return (
                      <div
                        key={index}
                        className="relative grid gap-4 rounded-2xl border bg-gray-50 p-4 sm:grid-cols-[120px_1fr] dark:bg-gray-900"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 z-10 text-red-500"
                          onClick={() => removeItem(selected.id, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <Label
                          htmlFor={`${selected.id}-item-image-${index}`}
                          className="group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed bg-white dark:bg-gray-950"
                        >
                          {itemImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={itemImage} alt="" className="h-full w-full object-cover" />
                          ) : uploading === `${selected.id}-item-${index}` ? (
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                          ) : (
                            <span className="flex flex-col items-center gap-1 text-xs text-gray-500">
                              <ImagePlus className="h-6 w-6" />
                              Add image
                            </span>
                          )}
                          <Input
                            id={`${selected.id}-item-image-${index}`}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="sr-only"
                            disabled={uploading !== null}
                            onChange={(event) =>
                              handleItemImage(selected, index, event.target.files?.[0])
                            }
                          />
                        </Label>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Name</Label>
                            <Input
                              value={String(item.name || '')}
                              onChange={(event) =>
                                updateItem(selected.id, index, 'name', event.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Description</Label>
                            <Textarea
                              rows={3}
                              value={String(item.description || '')}
                              onChange={(event) =>
                                updateItem(
                                  selected.id,
                                  index,
                                  'description',
                                  event.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Price</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={String(item.price ?? '')}
                              onChange={(event) =>
                                updateItem(selected.id, index, 'price', event.target.value)
                              }
                            />
                          </div>
                          {isProduct && (
                            <div className="space-y-2">
                              <Label>Offer price</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={String(item.offerPrice ?? '')}
                                onChange={(event) =>
                                  updateItem(
                                    selected.id,
                                    index,
                                    'offerPrice',
                                    event.target.value,
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {!selected.items?.length && (
                    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
                      No items added yet. Click Add {selected.type === 'services' ? 'service' : 'product'} to start.
                    </div>
                  )}
                </div>
              )}

              {['why-choose-us', 'blogs'].includes(selected.type) && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Label>
                        {selected.type === 'blogs' ? 'Blog cards' : 'Reasons to choose you'}
                      </Label>
                      <p className="mt-1 text-xs text-gray-500">
                        {selected.type === 'blogs'
                          ? 'Add custom cards to feature your blog posts.'
                          : 'Highlight the benefits that make your company stand out.'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => addItem(selected)}>
                      <Plus className="h-4 w-4" />
                      Add item
                    </Button>
                  </div>
                  {(selected.items || []).map((rawItem, index) => {
                    const item = rawItem as BuilderItem;
                    const isBlog = selected.type === 'blogs';
                    return (
                      <div
                        key={index}
                        className="relative grid gap-4 rounded-2xl border bg-gray-50 p-4 sm:grid-cols-[120px_1fr] dark:bg-gray-900"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 z-10 text-red-500"
                          onClick={() => removeItem(selected.id, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {isBlog && (
                          <Label
                            htmlFor={`${selected.id}-blog-image-${index}`}
                            className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed bg-white dark:bg-gray-950"
                          >
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={String(item.image)}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : uploading === `${selected.id}-item-${index}` ? (
                              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                            ) : (
                              <span className="flex flex-col items-center gap-1 text-xs text-gray-500">
                                <ImagePlus className="h-6 w-6" />
                                Add image
                              </span>
                            )}
                            <Input
                              id={`${selected.id}-blog-image-${index}`}
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="sr-only"
                              disabled={uploading !== null}
                              onChange={(event) =>
                                handleItemImage(selected, index, event.target.files?.[0])
                              }
                            />
                          </Label>
                        )}
                        <div className={cn('space-y-3 pr-10', !isBlog && 'sm:col-span-2')}>
                          <div className="space-y-1">
                            <Label>Title</Label>
                            <Input
                              value={String(item.title || '')}
                              onChange={(event) =>
                                updateItem(selected.id, index, 'title', event.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Description</Label>
                            <Textarea
                              rows={3}
                              value={String(item.description || '')}
                              onChange={(event) =>
                                updateItem(
                                  selected.id,
                                  index,
                                  'description',
                                  event.target.value,
                                )
                              }
                            />
                          </div>
                          {isBlog && (
                            <div className="space-y-1">
                              <Label>Article link (optional)</Label>
                              <Input
                                value={String(item.link || '')}
                                onChange={(event) =>
                                  updateItem(selected.id, index, 'link', event.target.value)
                                }
                                placeholder="https://example.com/article"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                        {!isFaq && (
                          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                            <div className="space-y-2">
                              <Label>Role or company</Label>
                              <Input
                                value={String(item.role || '')}
                                onChange={(event) =>
                                  updateItem(
                                    selected.id,
                                    index,
                                    'role',
                                    event.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Photo</Label>
                              <Label
                                htmlFor={`${selected.id}-testimonial-${index}`}
                                className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 text-sm dark:bg-gray-950"
                              >
                                {uploading === `${selected.id}-item-${index}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ImagePlus className="h-4 w-4" />
                                )}
                                {item.image ? 'Replace' : 'Upload'}
                                <Input
                                  id={`${selected.id}-testimonial-${index}`}
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp"
                                  className="sr-only"
                                  disabled={uploading !== null}
                                  onChange={(event) =>
                                    handleItemImage(
                                      selected,
                                      index,
                                      event.target.files?.[0],
                                    )
                                  }
                                />
                              </Label>
                            </div>
                          </div>
                        )}
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

              {['navbar', 'footer'].includes(selected.type) && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label>{selected.type === 'navbar' ? 'Navigation links / pages' : 'Footer links'}</Label>
                      <p className="mt-1 text-xs text-gray-500">
                        Custom pages open at /{companySlug || 'slug'}/p/page-name (separate page).
                        Section anchors like #about stay on the landing page.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => addItem(selected)}>
                      <Plus className="h-4 w-4" />
                      Add link
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {selected.type === 'navbar' &&
                        SECTION_LINK_OPTIONS.map((option) => (
                          <Button
                            key={option.link}
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              updateSection(selected.id, {
                                items: [
                                  ...(selected.items || []),
                                  { label: option.label, link: option.link },
                                ],
                              })
                            }
                          >
                            + {option.label}
                          </Button>
                        ))}
                      {customPages.map((page) => (
                        <Button
                          key={page.id}
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => addPageLinkToNav(page, selected.type as 'navbar' | 'footer')}
                        >
                          + {page.title} (page)
                        </Button>
                      ))}
                    </div>
                  {(selected.items || []).map((rawItem, index) => {
                    const item = rawItem as BuilderItem;
                    return (
                      <div
                        key={index}
                        className="relative grid gap-3 rounded-xl border bg-gray-50 p-4 pr-12 sm:grid-cols-2 dark:bg-gray-900"
                      >
                        <div className="space-y-1">
                          <Label>Label</Label>
                          <Input
                            value={String(item.label || '')}
                            onChange={(event) =>
                              updateItem(selected.id, index, 'label', event.target.value)
                            }
                            placeholder="Contact"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Link / route</Label>
                          <Input
                            value={String(item.link || '')}
                            onChange={(event) =>
                              updateItem(selected.id, index, 'link', event.target.value)
                            }
                            placeholder="#contact or /slug/p/about"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-6 text-red-500"
                          onClick={() => removeItem(selected.id, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {['contact', 'footer'].includes(selected.type) && (
                <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>
                    {selected.type === 'contact' &&
                      'Enquiry form sends leads to Dashboard → Leads. Set a Google Map link below for the location.'}
                    {selected.type === 'footer' &&
                      'Your company name is used automatically in the footer.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          ) : null}
        </div>

        {/* Right Side: Live Preview */}
        <div className="hidden min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-inner lg:flex dark:border-gray-800 dark:bg-gray-950">
          <div className="flex h-12 shrink-0 items-center gap-2 border-b bg-white px-4 dark:bg-gray-900">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <div className="mx-auto flex h-7 items-center rounded-md bg-gray-100 px-3 text-xs text-gray-500 dark:bg-gray-800">
              <Globe className="mr-1.5 h-3 w-3" />
              {companySlug ? `${companySlug}.tenant.hub` : 'Live Preview'}
            </div>
            <div className="flex rounded-lg border p-0.5">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={cn(
                  'rounded-md p-1.5',
                  previewDevice === 'desktop'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-gray-400',
                )}
                aria-label="Desktop preview"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={cn(
                  'rounded-md p-1.5',
                  previewDevice === 'mobile'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-gray-400',
                )}
                aria-label="Mobile preview"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gray-100 p-2 dark:bg-gray-950">
            <div
              className={cn(
                'mx-auto min-h-full overflow-hidden bg-white shadow-sm transition-all',
                previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-none',
              )}
            >
              {previewNavbar?.isVisible !== false && (
                <div className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
                  <div className="flex h-16 items-center justify-between px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-gray-50 font-bold text-sky-600">
                        {companyLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={companyLogo} alt="" className="h-full w-full object-contain p-1" />
                        ) : (
                          companyName.charAt(0) || 'C'
                        )}
                      </div>
                      <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {previewNavbar?.title?.trim() ||
                          companyName ||
                          'Your company'}
                      </p>
                        {previewNavbar?.subtitle && (
                          <p className="truncate text-[10px] text-gray-500">
                            {previewNavbar.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(previewNavbar?.items || []).slice(0, 4).map((raw, index) => {
                        const item = raw as BuilderItem;
                        if (!item.label) return null;
                        return (
                          <span key={index} className="hidden text-xs font-medium text-gray-500 md:inline">
                            {String(item.label)}
                          </span>
                        );
                      })}
                      <button
                        type="button"
                        className="rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
                        style={{ backgroundColor: primaryColor || '#0b2a5b' }}
                      >
                        {previewNavbar?.buttonText || 'Button'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <CompanyLanding 
                sections={previewSections} 
                companyId={companyId || ''} 
                companyName={companyName} 
                products={catalogProducts}
                services={catalogServices}
                blogs={publishedBlogs}
                rating={companyRating}
                reviewCount={companyReviewCount}
                primaryColor={primaryColor || '#0b2a5b'}
                accentColor={primaryColor || '#0b2a5b'}
                phone={companyPhone}
                whatsappUrl={
                  companyWhatsapp
                    ? `https://wa.me/${companyWhatsapp.replace(/\D/g, '')}`
                    : null
                }
                showFloatingContact
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
