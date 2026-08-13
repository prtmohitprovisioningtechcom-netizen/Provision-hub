import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCompanyBySlug } from '@/lib/company';
import { ServiceService } from '@/server/services/service.service';
import { ICompany, IService } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag, Image as ImageIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string; serviceSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, serviceSlug } = await params;
  try {
    const result = await getCompanyBySlug(slug);
    const company = result.company as ICompany;
    const service = await ServiceService.getBySlug(company._id, serviceSlug);
    if (!service) return { title: 'Service Not Found' };
    
    return {
      title: `${service.name} | ${company.name}`,
      description: service.description,
    };
  } catch {
    return { title: 'Service Not Found' };
  }
}

export default async function ServiceDetailsPage({ params }: PageProps) {
  const { slug, serviceSlug } = await params;
  
  const result = await getCompanyBySlug(slug).catch(() => null);
  if (!result || !result.company) notFound();
  
  const company = result.company as ICompany;
  const service = (await ServiceService.getBySlug(company._id, serviceSlug)) as IService;
  
  if (!service) notFound();

  const primary = company.theme?.primaryColor || '#0ea5e9';
  const mainImage = service.gallery && service.gallery.length > 0 ? service.gallery[0] : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-slate-200">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href={`/${slug}`} className="flex items-center gap-3">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-xl font-bold text-slate-900">{company.name}</span>
            )}
          </Link>
          <Link 
            href={`/${slug}/#services`} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 lg:py-20">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {mainImage ? (
            <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] relative bg-slate-100">
              <img src={mainImage} alt={service.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
               <ImageIcon className="w-12 h-12 text-slate-300" />
            </div>
          )}

          <div className="p-8 md:p-12 lg:p-16">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4 text-sm font-bold uppercase tracking-widest" style={{ color: primary }}>
                  <span>{service.category || 'Service'}</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 break-words">
                  {service.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-slate-600">
                  {service.price > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 opacity-70" />
                      <span className="text-xl font-bold text-slate-900">{formatCurrency(service.price)}</span>
                    </div>
                  )}
                  {service.duration && (
                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full text-sm font-bold">
                      <Clock className="w-4 h-4 opacity-70" />
                      {service.duration}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="shrink-0">
                <a 
                  href={`/${slug}/#contact`}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white rounded-xl transition-all hover:opacity-90 hover:scale-105 shadow-lg w-full md:w-auto"
                  style={{ backgroundColor: primary }}
                >
                  Book This Service
                </a>
              </div>
            </div>

            <hr className="border-gray-100 my-10" />

            <div className="prose prose-lg prose-slate max-w-none">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">About this service</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                {service.description}
              </p>
            </div>
            
            {service.gallery && service.gallery.length > 1 && (
              <div className="mt-16">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Service Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {service.gallery.slice(1).map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-gray-200">
                      <img src={img} alt={`${service.name} - image ${i + 2}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} {company.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
