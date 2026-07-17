import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Templates } from '@/components/landing/Templates';
import { Pricing } from '@/components/landing/Pricing';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { Contact } from '@/components/landing/Contact';
import { Footer } from '@/components/landing/Footer';
import { siteConfig } from '@/config/site';
import { getPlatformSettings } from '@/lib/platform-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPlatformSettings();
  const title = settings?.seoConfig?.title || `${siteConfig.name} - Build Stunning Company Landing Pages`;
  const description = settings?.seoConfig?.description || siteConfig.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function HomePage() {
  const config = await getPlatformSettings();

  return (
    <main className="marketing-page">
      <Navbar config={config.themeConfig} />
      <Hero config={config.heroConfig} />
      {config.featureToggles?.showFeatures && <Features config={config.featuresConfig} />}
      {config.featureToggles?.showHowItWorks && <HowItWorks config={config.howItWorksConfig} />}
      {config.featureToggles?.showTemplates && <Templates />}
      {config.featureToggles?.showPricing && <Pricing config={config.pricingConfig} />}
      {config.featureToggles?.showTestimonials && <Testimonials config={config.testimonialsConfig} />}
      {config.featureToggles?.showFAQ && <FAQ config={config.faqConfig} />}
      <Contact config={config.contactConfig} />
      <Footer config={config} />
    </main>
  );
}
