import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { siteConfig } from '@/config/site';
import { getPlatformSettings } from '@/lib/platform-settings';
import './globals.css';

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

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPlatformSettings();
  const name = siteConfig.name;
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
        className={`${plusJakartaSans.variable} ${outfit.variable} ${geistMono.variable} font-sans min-h-screen antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100`}
      >
        {settings?.customHeaderCode && (
          <div dangerouslySetInnerHTML={{ __html: settings.customHeaderCode }} style={{ display: 'none' }} />
        )}
        <Providers initialBranding={initialBranding}>{children}</Providers>
      </body>
    </html>
  );
}
