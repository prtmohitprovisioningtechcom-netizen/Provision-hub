import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { SchoolLandingClient } from '@/components/school/SchoolLandingClient';
import { getPlatformSettings } from '@/lib/platform-settings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'School Management Software (School ERP SaaS) | Bhartiyebazar',
  description:
    'Complete Cloud School Management Software & ERP SaaS in India. Automated Fees & Billing, 3-Design Marksheet Generator, Class Attendance, Student Profiles, Teacher Payroll, and Parent Portal.',
  alternates: {
    canonical: 'https://bhartiyebazar.com/school-management-software',
  },
  openGraph: {
    title: 'School Management Software (School ERP SaaS) | Bhartiyebazar',
    description:
      'Complete Cloud School ERP platform for Indian schools. Automated Fees, 3 Marksheet Designs with QR Verification, Student Management, and Parent Portal.',
    url: 'https://bhartiyebazar.com/school-management-software',
    type: 'website',
    siteName: 'Bhartiyebazar',
  },
};

export default async function SchoolLandingPage() {
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
        name: 'School Management Software',
        item: 'https://bhartiyebazar.com/school-management-software',
      },
    ],
  };

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Bhartiyebazar School ERP Software',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    description:
      'Complete School Management Software for Indian schools with Fees, Attendance, Automatic Marksheets, and Parent Portal.',
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar config={settings.themeConfig} featureToggles={settings.featureToggles} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />

      <main className="flex-1">
        <SchoolLandingClient />
      </main>

      <Footer config={settings} />
    </div>
  );
}

