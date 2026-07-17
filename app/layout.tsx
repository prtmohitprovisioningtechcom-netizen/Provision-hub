import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { siteConfig } from '@/config/site';
import { getPlatformSettings } from '@/lib/platform-settings';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPlatformSettings();
  const name = settings?.themeConfig?.logoText || siteConfig.name;
  const description = settings?.seoConfig?.description || siteConfig.description;
  const logoImage = settings?.themeConfig?.logoImage;

  return {
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description,
    metadataBase: new URL(siteConfig.url),
    applicationName: name,
    creator: name,
    icons: logoImage ? { icon: logoImage, apple: logoImage } : undefined,
    openGraph: {
      siteName: name,
      description,
      type: 'website',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPlatformSettings();
  const initialBranding = {
    logoText: settings?.themeConfig?.logoText || siteConfig.name,
    logoImage: settings?.themeConfig?.logoImage || '',
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100`}
      >
        <Providers initialBranding={initialBranding}>{children}</Providers>
      </body>
    </html>
  );
}
