'use client';

import Image from 'next/image';
import Link from 'next/link';
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
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';
import {
  ICompany,
  IProduct,
  IService,
  IReview,
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
  landingPage: LandingPageData | null;
  gallery: GalleryData | null;
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
  landingPage,
  gallery,
}: CompanyProfileViewProps) {
  const platformBranding = usePlatformBranding();
  const platformName = platformBranding.logoText || 'TenantHub';
  const whatsappNumber = company.socialLinks?.whatsapp || company.phone;
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${company.name}, I found you on ${platformName} and would like to enquire.`)}`
    : null;

  const galleryImages = gallery?.images?.map((img) => img.url) || [];
  const hasLanding =
    landingPage?.isPublished !== false &&
    landingPage?.sections &&
    landingPage.sections.some((s) => s.isVisible);

  const enrichedSections = hasLanding
    ? landingPage!.sections!.map((section) => {
        if (section.type === 'gallery' && !section.images?.length && galleryImages.length) {
          return { ...section, images: galleryImages };
        }
        return section;
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Banner */}
      <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-r from-indigo-900 via-purple-900 to-black overflow-hidden">
        {company.banner && (
          <Image src={company.banner} alt={company.name} fill className="object-cover opacity-80 mix-blend-overlay" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/100 dark:from-gray-950/100 to-transparent" />
        <div className="absolute top-6 left-6 z-10">
          <Link href="/search" className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-md transition-all">
            ← Back to search
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative -mt-32 mb-12 flex flex-col sm:flex-row gap-8 items-start sm:items-end bg-white/70 dark:bg-gray-900/70 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20 dark:border-gray-800/50"
        >
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-white/50 bg-white shadow-2xl dark:border-gray-800/50 dark:bg-gray-900">
            {company.logo ? (
              <Image src={company.logo} alt={company.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-indigo-100 text-3xl font-bold text-indigo-600">
                {company.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {company.name}
              </h1>
              {company.isVerified && (
                <BadgeCheck className="h-6 w-6 text-blue-500" aria-label="Verified" />
              )}
            </div>
            <p className="text-indigo-600 font-medium">{company.category}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {company.rating.toFixed(1)} ({company.reviewCount} reviews)
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {company.address.city}, {company.address.state}, {company.address.country}
              </span>
            </div>
          </div>
          <div className="flex gap-2 pb-2">
            {whatsappUrl && (
              <Button asChild variant="gradient" size="lg">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
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
            primaryColor={company.theme?.primaryColor}
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
