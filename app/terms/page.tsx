import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { TermsClient } from '@/components/legal/TermsClient';
import { getPlatformSettings } from '@/lib/platform-settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Terms & Conditions | Bhartiyebazar',
  description:
    'Official Terms and Conditions for Bhartiyebazar (bhartiyebazar.com), developed & powered by Provisioning Tech. Read our rules, user conduct, intellectual property, and platform policies.',
  alternates: {
    canonical: 'https://bhartiyebazar.com/terms',
  },
  openGraph: {
    title: 'Terms & Conditions | Bhartiyebazar',
    description:
      'Official Terms and Conditions for Bhartiyebazar (bhartiyebazar.com), developed & powered by Provisioning Tech.',
    url: 'https://bhartiyebazar.com/terms',
    type: 'website',
    siteName: 'Bhartiyebazar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions | Bhartiyebazar',
    description:
      'Official Terms and Conditions for Bhartiyebazar (bhartiyebazar.com), developed & powered by Provisioning Tech.',
  },
};

export default async function TermsPage() {
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
        name: 'Terms & Conditions',
        item: 'https://bhartiyebazar.com/terms',
      },
    ],
  };

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms & Conditions for Bhartiyebazar',
    description:
      'Terms and conditions, rules, regulations, and legal policies for accessing and using Bhartiyebazar and related merchant services.',
    url: 'https://bhartiyebazar.com/terms',
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
        <TermsClient />
      </main>

      <Footer config={settings} />
    </div>
  );
}
