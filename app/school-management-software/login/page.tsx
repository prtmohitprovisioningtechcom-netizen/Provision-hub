import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { SchoolLoginClient } from '@/components/school/SchoolLoginClient';
import { getPlatformSettings } from '@/lib/platform-settings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'School Admin Login | School Management Software',
  description: 'Sign in to your school administration dashboard to manage students, fees, attendance, and marksheets.',
  alternates: {
    canonical: 'https://bhartiyebazar.com/school-management-software/login',
  },
};

export default async function SchoolLoginPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar config={settings.themeConfig} featureToggles={settings.featureToggles} />

      <main className="flex-1">
        <SchoolLoginClient />
      </main>

      <Footer config={settings} />
    </div>
  );
}

