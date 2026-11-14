import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { SchoolRegisterClient } from '@/components/school/SchoolRegisterClient';
import { getPlatformSettings } from '@/lib/platform-settings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Register Your School | School Management Software SaaS',
  description:
    'Free 14-day trial school registration. Setup automated fees collection, 3-design marksheet generator, student directory, and online admissions for your school in 2 minutes.',
  alternates: {
    canonical: 'https://bhartiyebazar.com/school-management-software/register',
  },
};

export default async function SchoolRegisterPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar config={settings.themeConfig} featureToggles={settings.featureToggles} />

      <main className="flex-1">
        <SchoolRegisterClient />
      </main>

      <Footer config={settings} />
    </div>
  );
}

