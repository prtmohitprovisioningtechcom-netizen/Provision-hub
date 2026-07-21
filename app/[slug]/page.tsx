import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CompanyProfileView } from '@/components/company/CompanyProfileView';
import { siteConfig } from '@/config/site';
import { getCompanyBySlug } from '@/lib/company';
import {
  IBlog,
  ICompany,
  IProduct,
  IService,
  IReview,
  ILandingPageSection,
} from '@/types';

/** Always serve fresh landing content after Website Builder publish. */
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function serialize<T>(data: unknown): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const result = await getCompanyBySlug(slug);
    const company = serialize<ICompany>(result.company);
    const seo = company.seo;

    const title = seo?.title || company.name;
    const description =
      seo?.description || company.description || `${company.name} - ${company.category} in ${company.address.city}`;
    const ogImage = seo?.ogImage || company.banner || company.logo || siteConfig.ogImage;

    return {
      title,
      description,
      keywords: seo?.keywords,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${siteConfig.url}/${slug}`,
        images: ogImage ? [{ url: ogImage, alt: company.name }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : [],
      },
      alternates: {
        canonical: seo?.canonicalUrl || `${siteConfig.url}/${slug}`,
      },
    };
  } catch {
    return { title: 'Company Not Found' };
  }
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const result = await getCompanyBySlug(slug);

    const company = serialize<ICompany>(result.company);
    const products = serialize<IProduct[]>(result.products);
    const services = serialize<IService[]>(result.services);
    const reviews = serialize<IReview[]>(result.reviews);
    const blogs = serialize<IBlog[]>(result.blogs || []);
    const landingPage = result.landingPage
      ? serialize<{ sections?: ILandingPageSection[]; isPublished?: boolean }>({
          sections: (result.landingPage as { sections?: ILandingPageSection[] }).sections,
          isPublished: (result.landingPage as { isPublished?: boolean }).isPublished,
        })
      : null;
    const gallery = result.gallery
      ? serialize<{ images?: Array<{ url: string; caption?: string }> }>(result.gallery)
      : null;

    return (
      <CompanyProfileView
        company={company}
        products={products}
        services={services}
        reviews={reviews}
        blogs={blogs}
        landingPage={landingPage}
        gallery={gallery}
      />
    );
  } catch {
    notFound();
  }
}
