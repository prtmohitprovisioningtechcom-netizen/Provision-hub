'use client';

import { SafeImage as Image } from '@/components/SafeImage';
import Link from 'next/link';
import { filterNavFooterItems, isPlaceholderBrandLabel } from '@/lib/nav-links';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  BadgeCheck,
  Clock,
  MessageCircle,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContactForm } from './ContactForm';
import { ReviewForm } from './ReviewForm';
import { CompanyLanding } from './CompanyLanding';
import { SocialIcons } from './SocialIcons';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';
import {
  ICompany,
  IProduct,
  IService,
  IReview,
  IBlog,
  ILandingPageSection,
  BusinessHours,
  SocialLinks,
} from '@/types';

interface GalleryData {
  images?: Array<{ url: string; caption?: string }>;
}

interface LandingPageData {
  sections?: ILandingPageSection[];
  isPublished?: boolean;
}

interface CompanyProfileViewProps {
  company: ICompany;
  products: IProduct[];
  services: IService[];
  reviews: IReview[];
  blogs: IBlog[];
  landingPage: LandingPageData | null;
  gallery: GalleryData | null;
}

function safeCompanyLink(link: string | undefined, fallback = '/') {
  if (
    link?.startsWith('/') ||
    link?.startsWith('#') ||
    link?.startsWith('https://') ||
    link?.startsWith('tel:') ||
    link?.startsWith('mailto:')
  ) {
    return link;
  }
  return fallback;
}

const socialLabels: Record<keyof SocialLinks, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-4 w-4',
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300',
          )}
        />
      ))}
    </div>
  );
}

function BusinessHoursTable({ hours }: { hours: BusinessHours[] }) {
  if (!hours?.length) return null;
  return (
    <div className="space-y-2">
      {hours.map((h) => (
        <div key={h.day} className="flex justify-between text-sm">
          <span className="text-gray-500">{h.day}</span>
          <span className="font-medium">
            {h.isClosed ? 'Closed' : `${h.open} – ${h.close}`}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CompanyProfileView({
  company,
  products,
  services,
  reviews,
  blogs,
  landingPage,
  gallery,
}: CompanyProfileViewProps) {
  const platformBranding = usePlatformBranding();
  const platformName = platformBranding.logoText || 'TenantHub';
  const whatsappNumber = company.socialLinks?.whatsapp || company.phone;
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${company.name}, I found you on ${platformName} and would like to enquire.`)}`
    : null;

  const galleryItems =
    gallery?.images?.map((image, index) => ({
      image: image.url,
      title: image.caption || `Gallery image ${index + 1}`,
      description: image.caption || '',
    })) || [];
  const galleryImages = galleryItems.map((item) => item.image);
  const hasLanding =
    landingPage?.isPublished !== false &&
    landingPage?.sections &&
    landingPage.sections.some((s) => s.isVisible);

  const enrichedSections = hasLanding
    ? landingPage!.sections!.map((section) => {
        if (section.type !== 'gallery') return section;
        const fromSection =
          section.items && section.items.length > 0
            ? section.items
            : (section.images || []).map((image, index) => ({
                image,
                title: `Gallery ${index + 1}`,
                description: '',
              }));
        if (fromSection.length > 0) {
          return { ...section, items: fromSection };
        }
        if (galleryItems.length > 0) {
          return { ...section, items: galleryItems };
        }
        return section;
      })
    : [];
  const navbarSection = enrichedSections.find(
    (section) => section.type === 'navbar',
  );
  const navbarItems = filterNavFooterItems(
    (navbarSection?.items || []) as Array<{
      label?: string;
      link?: string;
    }>,
  );
  const rawNavbarName = navbarSection?.title?.trim() || '';
  const navbarName = isPlaceholderBrandLabel(rawNavbarName)
    ? company.name
    : rawNavbarName || company.name;
  const navbarCtaText = navbarSection?.buttonText?.trim() || '';
  const navbarCtaHref = navbarSection?.buttonLink?.trim()
    ? safeCompanyLink(navbarSection.buttonLink)
    : null;
  const showNavbarCta = Boolean(navbarCtaText && navbarCtaHref);

  if (hasLanding) {
    const addressLine = [
      company.address?.street,
      company.address?.city,
      company.address?.state,
    ]
      .filter(Boolean)
      .join(', ');
    const navy = company.theme?.primaryColor || '#0b2a5b';
    const accentColor = navy;

    return (
      <div className="min-h-screen bg-white text-gray-900">
        <div className="text-white" style={{ backgroundColor: navy }}>
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6 sm:text-sm">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {company.phone && (
                <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-white">
                  <Phone className="h-3.5 w-3.5" />
                  {company.phone}
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`} className="inline-flex items-center gap-1.5 hover:text-white">
                  <Mail className="h-3.5 w-3.5" />
                  {company.email}
                </a>
              )}
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <SocialIcons links={company.socialLinks} tone="light" iconClassName="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {navbarSection?.isVisible !== false && (
          <header className="sticky top-0 z-50 border-b border-white/40 bg-white/85 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
              <Link href={`/${company.slug}`} className="flex min-w-0 items-center gap-3">
                {company.logo ? (
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-white shadow-sm">
                    <Image src={company.logo} alt="" fill sizes="48px" className="object-contain p-1" />
                  </span>
                ) : (
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-sm"
                    style={{ backgroundColor: navy }}
                  >
                    {company.name.charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <span className="block truncate text-base font-extrabold tracking-tight text-gray-950 sm:text-lg">
                    {navbarName}
                  </span>
                  {navbarSection?.subtitle && (
                    <span className="hidden truncate text-xs text-gray-500 md:block">
                      {navbarSection.subtitle}
                    </span>
                  )}
                </div>
                {company.isVerified && (
                  <BadgeCheck className="h-5 w-5 shrink-0 text-blue-500" aria-label="Verified" />
                )}
              </Link>
              <div className="flex items-center gap-1 sm:gap-2">
                <SocialIcons
                  links={company.socialLinks}
                  className="mr-1 hidden sm:flex"
                  iconClassName="h-4 w-4"
                />
                <nav className="hidden items-center gap-0.5 lg:flex">
                  {navbarItems.slice(0, 8).map((item, index) =>
                    item.label && item.link ? (
                      <a
                        key={`${item.label}-${index}`}
                        href={safeCompanyLink(item.link)}
                        className="rounded-full px-3.5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                        style={{ ['--hover' as string]: navy }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.color = navy;
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.color = '';
                        }}
                      >
                        {item.label}
                      </a>
                    ) : null,
                  )}
                </nav>
                {showNavbarCta && navbarCtaHref && (
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full font-bold uppercase tracking-wide text-white shadow-md transition hover:-translate-y-0.5"
                    style={{ backgroundColor: accentColor }}
                  >
                    <a
                      href={navbarCtaHref}
                      target={navbarCtaHref.startsWith('https://') ? '_blank' : undefined}
                      rel={
                        navbarCtaHref.startsWith('https://')
                          ? 'noopener noreferrer'
                          : undefined
                      }
                    >
                      {navbarCtaText}
                    </a>
                  </Button>
                )}
              </div>
            </div>
            {navbarItems.length > 0 && (
              <div className="flex gap-1 overflow-x-auto border-t border-gray-50 px-4 py-2 lg:hidden">
                {navbarItems.slice(0, 8).map((item, index) =>
                  item.label && item.link ? (
                    <a
                      key={`m-${item.label}-${index}`}
                      href={safeCompanyLink(item.link)}
                      className="shrink-0 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700"
                    >
                      {item.label}
                    </a>
                  ) : null,
                )}
              </div>
            )}
          </header>
        )}
        <CompanyLanding
          sections={enrichedSections}
          companyId={company._id}
          companyName={company.name}
          products={products}
          services={services}
          blogs={blogs}
          primaryColor={navy}
          accentColor={accentColor}
          rating={company.rating}
          reviewCount={company.reviewCount}
          phone={company.phone}
          email={company.email}
          addressLine={addressLine}
          whatsappUrl={whatsappUrl}
          socialLinks={company.socialLinks}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Banner */}
      <div className="relative h-72 overflow-hidden bg-gray-900 sm:h-96 md:h-112">
        {company.banner && (
          <Image src={company.banner} alt={company.name} fill className="object-cover opacity-60" priority />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-50 via-transparent to-black/60 dark:from-gray-950" />
        <div className="absolute top-6 left-6 z-10">
          <Link href="/search" className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white bg-black/30 hover:bg-black/50 px-5 py-2.5 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10">
            ← Back to search
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative -mt-40 mb-16 flex flex-col sm:flex-row gap-8 items-start sm:items-end bg-white/80 dark:bg-gray-900/80 p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-2xl border border-white/40 dark:border-gray-700/50"
        >
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-3xl border-4 border-white/80 bg-white shadow-2xl dark:border-gray-800/80 dark:bg-gray-900 transform hover:scale-105 transition-transform duration-500">
            {company.logo ? (
              <Image src={company.logo} alt={company.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-linear-to-br from-indigo-100 to-purple-100 text-5xl font-black text-indigo-600">
                {company.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {company.name}
              </h1>
              {company.isVerified && (
                <BadgeCheck className="h-8 w-8 text-blue-500" aria-label="Verified" />
              )}
            </div>
            <p className="mt-1 text-lg font-semibold text-indigo-600 uppercase tracking-wider">{company.category}</p>
            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 font-medium">
              <span className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 px-3 py-1 rounded-full">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                {company.rating.toFixed(1)} ({company.reviewCount} reviews)
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                {company.address.city}, {company.address.state}, {company.address.country}
              </span>
            </div>
          </div>
          <div className="flex gap-3 pb-3">
            {whatsappUrl && (
              <Button asChild className="bg-[#25D366] hover:bg-[#1ebd5b] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-full px-6" size="lg">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        </motion.div>

        {hasLanding ? (
          <CompanyLanding
            sections={enrichedSections}
            companyId={company._id}
            companyName={company.name}
            products={products}
            services={services}
            blogs={blogs}
            primaryColor={company.theme?.primaryColor}
            rating={company.rating}
            reviewCount={company.reviewCount}
            phone={company.phone}
            email={company.email}
            addressLine={addressLine}
            whatsappUrl={whatsappUrl}
            socialLinks={company.socialLinks}
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-3 pb-16">
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              {company.description && (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                        {company.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.section>
              )}

              {/* Services */}
              {services.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-xl font-bold mb-4">Services</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {services.map((service, i) => (
                      <motion.div
                        key={service._id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card>
                          <CardContent className="p-5">
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                              {service.description}
                            </p>
                            <div className="mt-3 flex items-center justify-between text-sm">
                              <span className="font-bold text-indigo-600">
                                {formatCurrency(service.price)}
                              </span>
                              <span className="text-gray-400">{service.duration}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Products */}
              {products.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-xl font-bold mb-4">Products</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product, i) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="overflow-hidden">
                          <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                                No image
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium truncate">{product.name}</h3>
                            <p className="mt-2 font-bold text-indigo-600">
                              {product.offerPrice
                                ? formatCurrency(product.offerPrice)
                                : formatCurrency(product.price)}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-xl font-bold mb-4">Gallery</h2>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                    {galleryImages.map((url, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                        <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Reviews */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-xl font-bold mb-4">Reviews</h2>
                {reviews.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {reviews.map((review) => (
                      <Card key={review._id}>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{review.customerName}</p>
                            <StarRating rating={review.rating} />
                          </div>
                          <p className="mt-2 text-gray-600 dark:text-gray-400">{review.comment}</p>
                          <p className="mt-2 text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 mb-6">No reviews yet. Be the first to review!</p>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewForm companyId={company._id} />
                  </CardContent>
                </Card>
              </motion.section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {company.phone && (
                      <a href={`tel:${company.phone}`} className="flex items-center gap-2 text-sm hover:text-indigo-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {company.phone}
                      </a>
                    )}
                    {company.email && (
                      <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-sm hover:text-indigo-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {company.email}
                      </a>
                    )}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm hover:text-indigo-600"
                      >
                        <Globe className="h-4 w-4 text-gray-400" />
                        Website
                      </a>
                    )}
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <span>
                        {[company.address.street, company.address.city, company.address.state, company.address.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {company.businessHours?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Business Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BusinessHoursTable hours={company.businessHours} />
                  </CardContent>
                </Card>
              )}

              {Object.values(company.socialLinks || {}).some(Boolean) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Follow Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(company.socialLinks) as [keyof SocialLinks, string | undefined][])
                        .filter(([, url]) => url)
                        .map(([key, url]) => (
                          <a
                            key={key}
                            href={key === 'whatsapp' ? `https://wa.me/${url!.replace(/\D/g, '')}` : url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-10 min-w-10 items-center justify-center rounded-lg border px-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            aria-label={socialLabels[key]}
                            title={socialLabels[key]}
                          >
                            {key === 'whatsapp' ? (
                              <MessageCircle className="h-5 w-5 text-gray-600" />
                            ) : (
                              <Share2 className="h-5 w-5 text-gray-600" />
                            )}
                          </a>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Send Enquiry</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContactForm
                    companyId={company._id}
                    services={services.map((s) => s.name)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
