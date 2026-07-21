import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FloatingContactButtons } from '@/components/company/FloatingContactButtons';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { getCompanyBySlug } from '@/lib/company';
import { ICompany, ILandingCustomPage, ILandingPageSection } from '@/types';

interface PageProps {
  params: Promise<{ slug: string; pageSlug: string }>;
}

function serialize<T>(data: unknown): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, pageSlug } = await params;
  try {
    const result = await getCompanyBySlug(slug);
    const company = serialize<ICompany>(result.company);
    const pages = serialize<ILandingCustomPage[]>(
      (result.landingPage as { pages?: ILandingCustomPage[] } | null)?.pages || [],
    );
    const page = pages.find((item) => item.slug === pageSlug && item.isVisible !== false);
    if (!page) return { title: 'Page Not Found' };

    return {
      title: `${page.title} | ${company.name}`,
      description: page.subtitle || page.content?.slice(0, 160) || company.description,
      alternates: {
        canonical: `${siteConfig.url}/${slug}/p/${pageSlug}`,
      },
    };
  } catch {
    return { title: 'Page Not Found' };
  }
}

export default async function CompanyCustomPage({ params }: PageProps) {
  const { slug, pageSlug } = await params;

  try {
    const result = await getCompanyBySlug(slug);
    const company = serialize<ICompany>(result.company);
    const landingPage = result.landingPage
      ? serialize<{
          sections?: ILandingPageSection[];
          pages?: ILandingCustomPage[];
          isPublished?: boolean;
        }>(result.landingPage)
      : null;

    const page = (landingPage?.pages || []).find(
      (item) => item.slug === pageSlug && item.isVisible !== false,
    );
    if (!page || landingPage?.isPublished === false) notFound();

    const navbarSection = (landingPage?.sections || []).find(
      (section) => section.type === 'navbar',
    );
    const navbarItems = (navbarSection?.items || []) as Array<{
      label?: string;
      link?: string;
    }>;
    const primaryColor = company.theme?.primaryColor || '#0ea5e9';
    const whatsappNumber = company.socialLinks?.whatsapp || company.phone;
    const whatsappUrl = whatsappNumber
      ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`
      : null;

    return (
      <div className="min-h-screen bg-white text-gray-900">
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link href={`/${company.slug}`} className="flex min-w-0 items-center gap-3">
              {company.logo ? (
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border bg-white">
                  <Image src={company.logo} alt="" fill sizes="40px" className="object-contain p-1" />
                </span>
              ) : (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {company.name.charAt(0)}
                </span>
              )}
              <span className="truncate text-base font-bold sm:text-lg">{company.name}</span>
            </Link>
            <div className="flex items-center gap-2">
              <nav className="hidden items-center gap-1 md:flex">
                {navbarItems.slice(0, 6).map((item, index) =>
                  item.label && item.link ? (
                    <a
                      key={`${item.label}-${index}`}
                      href={item.link}
                      className="rounded-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                    >
                      {item.label}
                    </a>
                  ) : null,
                )}
              </nav>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={`/${company.slug}`}>Home</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          {page.image && (
            <div className="relative mb-10 aspect-video overflow-hidden rounded-4xl bg-gray-100">
              <Image src={page.image} alt={page.title} fill className="object-cover" priority />
            </div>
          )}
          <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
            {company.name}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
            {page.title}
          </h1>
          {page.subtitle && <p className="mt-4 text-lg text-gray-500">{page.subtitle}</p>}
          <div className="mt-10 whitespace-pre-wrap text-lg leading-relaxed text-gray-700">
            {page.content}
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button asChild className="rounded-full text-white" style={{ backgroundColor: primaryColor }}>
              <Link href={`/${company.slug}#contact`}>Contact us</Link>
            </Button>
            {company.phone && (
              <Button asChild variant="outline" className="rounded-full">
                <a href={`tel:${company.phone.replace(/\s/g, '')}`}>Call</a>
              </Button>
            )}
          </div>
        </main>

        <FloatingContactButtons
          phone={company.phone}
          email={company.email}
          whatsappUrl={whatsappUrl}
          accentColor={company.theme?.primaryColor || '#0b2a5b'}
        />
      </div>
    );
  } catch {
    notFound();
  }
}
