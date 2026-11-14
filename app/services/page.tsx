import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ServicesHubClient } from '@/components/services/ServicesHubClient';
import { getPlatformSettings } from '@/lib/platform-settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'All Services & Service-Wise Website Themes | Bhartiyebazar',
  description:
    'Explore Medical Store, Doctor, Hospital, Lawyer, Hotel, Grocery, Electrician, Mobile Repair, Computer Repair, Beauty Parlour, Coaching, School, and Other specialty themes.',
  alternates: {
    canonical: 'https://bhartiyebazar.com/services',
  },
  openGraph: {
    title: 'All Services & Service-Wise Website Themes | Bhartiyebazar',
    description:
      'Pick your business service category and explore custom-built website themes ready to launch in minutes.',
    url: 'https://bhartiyebazar.com/services',
    type: 'website',
    siteName: 'Bhartiyebazar',
  },
};

export default async function AllServicesPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar config={settings.themeConfig} featureToggles={settings.featureToggles} />

      <main className="flex-1 pt-5 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ServicesHubClient />
        </div>
      </main>

      <Footer config={settings} />
    </div>
  );
}
