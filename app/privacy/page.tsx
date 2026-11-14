import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { PrivacyClient } from '@/components/legal/PrivacyClient';
import { getPlatformSettings } from '@/lib/platform-settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Privacy Policy | Bhartiyebazar',
  description:
    'Official Privacy Policy for Bhartiyebazar (bhartiyebazar.com), developed & powered by Provisioning Tech. Learn how we collect, use, protect, and handle your data, merchant listings, and privacy rights.',
  alternates: {
    canonical: 'https://bhartiyebazar.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Bhartiyebazar',
    description:
      'Official Privacy Policy for Bhartiyebazar (bhartiyebazar.com), developed & powered by Provisioning Tech.',
    url: 'https://bhartiyebazar.com/privacy',
    type: 'website',
    siteName: 'Bhartiyebazar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Bhartiyebazar',
    description:
      'Official Privacy Policy for Bhartiyebazar (bhartiyebazar.com), developed & powered by Provisioning Tech.',
  },
};

export default async function PrivacyPage() {
  const settings = await getPlatformSettings();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://bhartiyebazar.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Privacy Policy',
        item: 'https://bhartiyebazar.com/privacy',
      },
    ],
  };

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy for Bhartiyebazar',
    description:
      'Privacy Policy, data handling, CCPA/GDPR compliance, cookie management, and user protection policies for Bhartiyebazar.',
    url: 'https://bhartiyebazar.com/privacy',
    publisher: {
      '@type': 'Organization',
      name: 'Bhartiyebazar',
      url: 'https://bhartiyebazar.com',
      legalName: 'Bhartiyebazar (Powered by Provisioning Tech)',
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar config={settings.themeConfig} featureToggles={settings.featureToggles} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />

      <main className="flex-1">
        <PrivacyClient />
      </main>

      <Footer config={settings} />
    </div>
  );
}

