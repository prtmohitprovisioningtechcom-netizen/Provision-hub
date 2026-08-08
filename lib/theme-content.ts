import { ILandingPageSection, IReview } from '@/types';

export type ThemeLandingPage = {
  sections?: ILandingPageSection[];
  isPublished?: boolean;
  templateId?: string | null;
  layoutId?: string | null;
} | null;

export type ThemeGallery = {
  images?: Array<{ url: string; caption?: string }>;
} | null;

/** Find a visible builder section by type. */
export function getSection(
  landingPage: ThemeLandingPage,
  type: ILandingPageSection['type'] | string,
): ILandingPageSection | null {
  const sections = landingPage?.sections || [];
  return (
    sections.find((s) => s.type === type && s.isVisible !== false) || null
  );
}

export function isSectionVisible(
  landingPage: ThemeLandingPage,
  type: ILandingPageSection['type'] | string,
): boolean {
  const section = (landingPage?.sections || []).find((s) => s.type === type);
  if (!section) return true; // missing section → show with fallbacks
  return section.isVisible !== false;
}

/** Hero / about cover image from builder fields. */
export function sectionImage(
  section: ILandingPageSection | null | undefined,
  fallback?: string,
): string {
  if (!section) return fallback || '';
  if (section.images?.length) return section.images[0] || fallback || '';
  if (section.image) return section.image;
  return fallback || '';
}

export function sectionImages(
  section: ILandingPageSection | null | undefined,
): string[] {
  if (!section) return [];
  if (section.images?.length) return section.images.filter(Boolean);
  if (section.image) return [section.image];
  return [];
}

export type GalleryItem = { url: string; caption?: string };

/** Gallery images from builder gallery section items, then DB gallery. */
export function resolveGalleryImages(
  landingPage: ThemeLandingPage,
  gallery: ThemeGallery,
): GalleryItem[] {
  const section = getSection(landingPage, 'gallery');
  if (section?.items?.length) {
    return section.items
      .map((item) => {
        const row = item as Record<string, unknown>;
        const url = String(row.image || row.url || '');
        if (!url) return null;
        return {
          url,
          caption: String(row.title || row.caption || row.description || ''),
        };
      })
      .filter(Boolean) as GalleryItem[];
  }
  return (gallery?.images || []).filter((img) => Boolean(img?.url));
}

export type TestimonialItem = {
  name: string;
  comment: string;
  rating: number;
};

/** Prefer builder testimonials items; fall back to approved reviews. */
export function resolveTestimonials(
  landingPage: ThemeLandingPage,
  reviews: IReview[] | undefined,
): TestimonialItem[] {
  const section = getSection(landingPage, 'testimonials');
  if (section?.items?.length) {
    return section.items.map((item) => {
      const row = item as Record<string, unknown>;
      return {
        name: String(row.name || row.author || row.title || 'Customer'),
        comment: String(row.comment || row.quote || row.description || row.content || row.text || ''),
        rating: Number(row.rating) || 5,
      };
    }).filter((t) => t.comment);
  }
  return (reviews || []).map((r) => ({
    name: r.customerName,
    comment: r.comment,
    rating: Number(r.rating) || 5,
  }));
}

export type FaqItem = { question: string; answer: string };

export function resolveFaq(landingPage: ThemeLandingPage): FaqItem[] {
  const section = getSection(landingPage, 'faq');
  if (!section?.items?.length) return [];
  return section.items.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      question: String(row.question || row.title || ''),
      answer: String(row.answer || row.description || row.content || ''),
    };
  }).filter((f) => f.question);
}

export type WhyItem = { title: string; description: string };

export function resolveWhyItems(landingPage: ThemeLandingPage): WhyItem[] {
  const section = getSection(landingPage, 'why-choose-us');
  if (!section?.items?.length) return [];
  return section.items.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      title: String(row.title || row.label || ''),
      description: String(row.description || row.content || ''),
    };
  }).filter((i) => i.title);
}

export function whatsappLink(phone?: string | null): string {
  const digits = (phone || '').replace(/[^0-9]/g, '');
  return digits ? `https://wa.me/${digits}` : '#contact';
}

/** Build default editable sections for a new theme selection. */
export function buildDefaultSections(
  defaults: ReadonlyArray<{
    type: string;
    title?: string;
    subtitle?: string;
    content?: string;
    buttonText?: string;
    buttonLink?: string;
    eyebrow?: string;
    note?: string;
    placeholder?: string;
    order: number;
    items?: readonly Record<string, unknown>[] | Record<string, unknown>[];
  }>,
): ILandingPageSection[] {
  return defaults.map((section, index) => ({
    id: `section-${section.type}-${index}`,
    type: section.type as ILandingPageSection['type'],
    title: section.title || '',
    subtitle: section.subtitle || '',
    content: section.content || '',
    buttonText: section.buttonText || '',
    buttonLink: section.buttonLink || '',
    eyebrow: section.eyebrow || '',
    note: section.note || '',
    placeholder: section.placeholder || '',
    order: section.order,
    isVisible: true,
    items: section.items ? section.items.map((item) => ({ ...item })) : [],
    images: [],
  }));
}
