import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Plus_Jakarta_Sans, Outfit, Geist_Mono, Dancing_Script } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { siteConfig } from '@/config/site';
import { getPlatformSettings } from '@/lib/platform-settings';
import { SeoService } from '@/server/services/seo.service';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  display: 'swap',
});

const dancingScript = Dancing_Script({
  variable: '--font-cursive',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPlatformSettings();
  const globalSeo = await SeoService.getGlobalSettings();

  const name = globalSeo?.siteName || siteConfig.name || 'Bhartiyebazar';
  const title = globalSeo?.defaultTitle || `${name} | India's Leading Local Business Directory & Vyapari Platform`;
  const description = globalSeo?.defaultDescription || settings?.seoConfig?.description || siteConfig.description;
  const canonicalUrl = globalSeo?.canonicalBaseUrl || siteConfig.url || 'https://bhartiyebazar.com';
  const logoImage = settings?.themeConfig?.logoImage || globalSeo?.defaultOgImage;
  const keywords = globalSeo?.defaultKeywords
    ? String(globalSeo.defaultKeywords)
        .split(',')
        .map((k: string) => k.trim())
    : ['Bhartiyebazar', 'Indian businesses', 'local directory', 'verified suppliers', 'vyapari portal'];
  const twitterHandle = globalSeo?.twitterHandle || '@bhartiyebazar';
  const googleVerification = globalSeo?.googleSiteVerification || process.env.NEXT_PUBLIC_GSC_VERIFICATION;
  const bingVerification = globalSeo?.bingSiteVerification;

  return {
    metadataBase: new URL(canonicalUrl),
    title: {
      default: title,
      template: `%s | ${name}`,
    },
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    applicationName: name,
    creator: name,
    publisher: name,
    verification: {
      google: googleVerification || undefined,
      other: bingVerification ? { 'msvalidate.01': bingVerification } : undefined,
    },
    icons: logoImage ? { icon: logoImage, apple: logoImage } : undefined,
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: canonicalUrl,
      siteName: name,
      title,
      description,
      images: [
        {
          url: globalSeo?.defaultOgImage || logoImage || '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${name} - India's Leading Vyapari & Business Platform`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: twitterHandle,
      creator: twitterHandle,
      title,
      description,
      images: [globalSeo?.defaultOgImage || logoImage || '/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, globalSeo] = await Promise.all([
    getPlatformSettings(),
    SeoService.getGlobalSettings(),
  ]);

  const initialBranding = {
    logoText: globalSeo?.siteName || 'Bhartiyebazar',
    logoImage: settings?.themeConfig?.logoImage || '',
  };

  const gaId = globalSeo?.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_ID;

  // Global Website Schema with Sitelinks Searchbox
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: globalSeo?.siteName || 'Bhartiyebazar',
    url: globalSeo?.canonicalBaseUrl || 'https://bhartiyebazar.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${globalSeo?.canonicalBaseUrl || 'https://bhartiyebazar.com'}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = globalSeo?.organizationSchema
    ? typeof globalSeo.organizationSchema === 'string'
      ? JSON.parse(globalSeo.organizationSchema)
      : globalSeo.organizationSchema
    : {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Bhartiyebazar',
        url: 'https://bhartiyebazar.com',
        logo: 'https://bhartiyebazar.com/logo.png',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-6397650818',
          contactType: 'Customer Support',
          areaServed: 'IN',
          availableLanguage: ['en', 'hi'],
        },
      };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${plusJakartaSans.variable} ${outfit.variable} ${dancingScript.variable} ${geistMono.variable} font-sans min-h-screen antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100`}
      >
        {settings?.customHeaderCode && (
          <div dangerouslySetInnerHTML={{ __html: settings.customHeaderCode }} style={{ display: 'none' }} />
        )}
        <Providers initialBranding={initialBranding}>{children}</Providers>
      </body>
    </html>
  );
}
