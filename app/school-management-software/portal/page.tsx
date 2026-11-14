import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { SchoolPortalClient } from '@/components/school/SchoolPortalClient';
import { getPlatformSettings } from '@/lib/platform-settings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Parent & Student Portal | Bhartiyebazar School Cloud',
  description:
    'Dedicated portal for parents and students to track attendance, fee balances, fee receipts, homework, and download term marksheets.',
  alternates: {
    canonical: 'https://bhartiyebazar.com/school-management-software/portal',
  },
};

export default async function SchoolPortalPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar config={settings.themeConfig} featureToggles={settings.featureToggles} />

      <main className="flex-1">
        <SchoolPortalClient />
      </main>

      <Footer config={settings} />
    </div>
  );
}

