import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCompanyBySlug } from '@/lib/company';
import { ICompany, IProduct, IService, IBlog, ILandingPageSection } from '@/types';
import { siteConfig } from '@/config/site';

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
    return {
      title: `Sitemap | ${company.name}`,
      description: `Sitemap and page directory for ${company.name}.`,
    };
  } catch {
    return { title: 'Sitemap Not Found' };
  }
}

export default async function CompanySitemapPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const result = await getCompanyBySlug(slug);

    const company = serialize<ICompany>(result.company);
    const products = serialize<IProduct[]>(result.products);
    const services = serialize<IService[]>(result.services);
    const blogs = serialize<IBlog[]>(result.blogs || []);
    
    // Attempt to extract sections from landing page
    let activeSections: string[] = ['hero', 'about', 'services', 'products', 'gallery', 'contact'];
    if (result.landingPage) {
      const lp = result.landingPage as { sections?: ILandingPageSection[] };
      if (lp.sections) {
        activeSections = lp.sections
          .filter(s => s.isVisible !== false && s.type !== 'navbar' && s.type !== 'footer')
          .map(s => s.type);
      }
    }

    const primaryColor = company.theme?.primaryColor || '#4f46e5';

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
        <header className="bg-white border-b py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href={`/${slug}`} className="flex items-center gap-3">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="h-10 w-auto object-contain" />
              ) : (
                <span className="text-2xl font-bold" style={{ color: primaryColor }}>{company.name}</span>
              )}
            </Link>
            <Link 
              href={`/${slug}`} 
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              &larr; Back to Website
            </Link>
          </div>
        </header>

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-8" style={{ color: primaryColor }}>
            Site Map
          </h1>
          
          <div className="grid gap-12 md:grid-cols-2">
            
            {/* Main Pages */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 border-b pb-4">Main Sections</h2>
              <ul className="space-y-3">
                <li>
                  <Link href={`/${slug}`} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                    <span style={{ color: primaryColor }}>•</span> Home
                  </Link>
                </li>
                {activeSections.map(sec => {
                  if (sec === 'hero' || sec === 'navbar' || sec === 'footer') return null;
                  const label = sec.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  return (
                    <li key={sec}>
                      <Link href={`/${slug}#${sec}`} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                        <span style={{ color: primaryColor }}>•</span> {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Products */}
            {products.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-6 border-b pb-4">Products</h2>
                <ul className="space-y-3">
                  {products.map(p => (
                    <li key={p._id}>
                      <Link href={`/${slug}#products`} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                        <span style={{ color: primaryColor }}>•</span> {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-6 border-b pb-4">Services</h2>
                <ul className="space-y-3">
                  {services.map(s => (
                    <li key={s._id}>
                      <Link href={`/${slug}#services`} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                        <span style={{ color: primaryColor }}>•</span> {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Blogs */}
            {blogs.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-6 border-b pb-4">Blog Posts</h2>
                <ul className="space-y-3">
                  {blogs.map(b => (
                    <li key={b._id}>
                      <Link href={`/${slug}/blog/${b.slug}`} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                        <span style={{ color: primaryColor }}>•</span> {b.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </main>
        
        <footer className="bg-white border-t py-8 mt-12 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </footer>
      </div>
    );
  } catch {
    notFound();
  }
}
