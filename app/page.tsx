// @ts-nocheck
import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { WatchHero } from '@/components/watch/WatchHero';
import { VyapariTicker } from '@/components/landing/VyapariTicker';
import { PopularCategories } from '@/components/landing/PopularCategories';
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
  const brandName = settings?.themeConfig?.logoText || siteConfig.name;
  const configuredTitle =
    settings?.seoConfig?.title || `${brandName} — Har Dukan Ki Shaan, Har Vyapari Ka Naam`;
  const title = configuredTitle.replaceAll('TenantHub', brandName);
  const description = settings?.seoConfig?.description || siteConfig.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName: brandName,
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
      <Navbar config={config.themeConfig} featureToggles={config.featureToggles} />
      <WatchHero
        config={config.heroConfig}
        showTemplates={config.featureToggles?.showTemplates !== false}
      />
      <VyapariTicker />
      <PopularCategories />
      {config.featureToggles?.showPricing !== false && <Pricing config={config.pricingConfig} />}
      {config.featureToggles?.showHowItWorks !== false && <HowItWorks config={config.howItWorksConfig} />}
      {config.featureToggles?.showTemplates !== false && <Templates config={config.templatesConfig} />}
      {config.featureToggles?.showTestimonials !== false && <Testimonials config={config.testimonialsConfig} />}
      {config.featureToggles?.showFAQ !== false && <FAQ config={config.faqConfig} />}
      <Contact config={config.contactConfig} />
      <Footer config={config} />
    </main>
  );
}
