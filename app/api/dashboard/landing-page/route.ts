import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { connectDB } from '@/lib/mongodb';
import LandingPage from '@/models/LandingPage';
import Company from '@/models/Company';
import { LANDING_SECTIONS } from '@/constants';
import { generateSlug } from '@/lib/utils';
import {
  containsDataImage,
  sanitizeLandingSections,
} from '@/lib/sanitize-landing-sections';

function normalizePages(pages: unknown) {
  if (!Array.isArray(pages)) return [];
  if (pages.length > 20) {
    throw new Error('You can create up to 20 custom pages');
  }

  const normalized = pages.map((raw, index) => {
    const page = raw as Record<string, unknown>;
    const title = String(page.title || '').trim();
    if (!title) throw new Error(`Page ${index + 1} needs a title`);
    const slugSource = String(page.slug || title).trim();
    const slug = generateSlug(slugSource);
    if (!slug) throw new Error(`Page "${title}" needs a valid URL slug`);
    return {
      id: String(page.id || `page-${Date.now()}-${index}`),
      title,
      slug,
      subtitle: String(page.subtitle || ''),
      content: String(page.content || ''),
      image: typeof page.image === 'string' ? page.image : '',
      isVisible: page.isVisible !== false,
    };
  });

  const slugs = normalized.map((page) => page.slug);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error('Each custom page needs a unique URL slug');
  }

  return normalized;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    await connectDB();
    const landingPage = await LandingPage.findOne({ companyId: auth.companyId }).lean();

    return apiSuccess(landingPage || { sections: [], pages: [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get landing page';
    return apiError(message, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['company_admin']);
    if (auth instanceof Response) return auth;
    if (!auth.companyId) return apiError('No company associated', 400);

    let body: unknown;
    try {
      body = await parseBody(request);
    } catch {
      return apiError(
        'Request is too large. Re-upload large images (use Upload, not paste), then publish again.',
        413,
      );
    }
    const { sections, pages } = body as { sections: any[]; pages?: unknown };

    if (!Array.isArray(sections)) {
      return apiError('Invalid sections data', 400);
    }
    if (sections.length > 20) {
      return apiError('A landing page can contain up to 20 sections', 400);
    }
    if (containsDataImage(sections) || containsDataImage(pages)) {
      return apiError(
        'Embedded images are not allowed. Upload each image again, then publish.',
        413,
      );
    }
    const { sections: sanitized, tooLarge } = sanitizeLandingSections(sections);
    if (tooLarge) {
      return apiError(
        'Landing page content is too large to publish. Remove some gallery/media images and try again.',
        413,
      );
    }

    let normalizedPages;
    try {
      normalizedPages = normalizePages(pages);
    } catch (error) {
      return apiError(error instanceof Error ? error.message : 'Invalid pages', 400);
    }

    const allowedTypes = new Set(LANDING_SECTIONS.map((section) => section.type));
    const sectionTypes = sanitized.map((section) => section?.type);
    if (sectionTypes.some((type) => !allowedTypes.has(type))) {
      return apiError('Landing page contains an unsupported section', 400);
    }
    if (new Set(sectionTypes).size !== sectionTypes.length) {
      return apiError('Each landing page section can only be added once', 400);
    }
    const normalizedSections = [...sanitized]
      .sort((a, b) => {
        if (a.type === 'navbar') return -1;
        if (b.type === 'navbar') return 1;
        return Number(a.order || 0) - Number(b.order || 0);
      })
      .map((section, order) => ({ ...section, order }));

    await connectDB();
    const landingPage = await LandingPage.findOneAndUpdate(
      { companyId: auth.companyId },
      {
        sections: normalizedSections,
        pages: normalizedPages,
        isPublished: true,
      },
      { new: true, upsert: true },
    ).lean();

    const company = await Company.findById(auth.companyId).select('slug').lean();
    if (company?.slug) {
      revalidatePath(`/${company.slug}`);
      revalidatePath(`/${company.slug}`, 'layout');
      revalidatePath(`/${company.slug}`, 'page');
      for (const page of normalizedPages) {
        revalidatePath(`/${company.slug}/p/${page.slug}`);
      }
    }

    // Keep dashboard Gallery model in sync with landing gallery section.
    const gallerySection = normalizedSections.find((section) => section.type === 'gallery');
    if (gallerySection) {
      const { default: Gallery } = await import('@/models/Gallery');
      const images: Array<{ url: string; caption: string }> = [];
      for (const raw of gallerySection.items || []) {
        const item = raw as { image?: string; title?: string; description?: string };
        const url = String(item.image || '').trim();
        if (!url) continue;
        images.push({
          url,
          caption: String(item.title || item.description || '').trim(),
        });
      }
      await Gallery.findOneAndUpdate(
        { companyId: auth.companyId },
        {
          images: images.map((image, order) => ({
            url: image.url,
            publicId: image.url.split('/').pop() || `gallery-${order}`,
            caption: image.caption || '',
            order,
          })),
        },
        { upsert: true, new: true },
      );
    }

    return apiSuccess(landingPage);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save landing page';
    return apiError(message, 400);
  }
}
