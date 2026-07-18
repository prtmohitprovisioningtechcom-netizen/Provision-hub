import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlatformSettingsDocument extends Document {
  heroConfig: {
    title: string;
    subtitle: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
  };
  themeConfig: {
    logoText: string;
    logoImage: string;
    primaryColor: string;
    secondaryColor: string;
  };
  featureToggles: {
    showFeatures: boolean;
    showHowItWorks: boolean;
    showTemplates: boolean;
    showPricing: boolean;
    showTestimonials: boolean;
    showFAQ: boolean;
  };
  seoConfig: {
    title: string;
    description: string;
  };
  featuresConfig: {
    title: string;
    subtitle: string;
    items: Array<{ title: string; description: string; icon: string }>;
  };
  howItWorksConfig: {
    title: string;
    subtitle: string;
    items: Array<{ step: string; title: string; description: string }>;
  };
  pricingConfig: {
    title: string;
    subtitle: string;
    items: Array<{ name: string; price: string; description: string; features: string[]; ctaText: string; popular: boolean }>;
  };
  faqConfig: {
    title: string;
    subtitle: string;
    items: Array<{ question: string; answer: string }>;
  };
  testimonialsConfig: {
    title: string;
    items: Array<{ name: string; role: string; content: string; rating: number; initials: string }>;
  };
  contactConfig: {
    email: string;
    phone: string;
    address: string;
  };
  footerConfig: {
    copyrightText: string;
    facebookLink: string;
    twitterLink: string;
    instagramLink: string;
    linkedinLink: string;
  };
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettingsDocument>(
  {
    heroConfig: {
      title: { type: String, default: 'Build Stunning Company Landing Pages' },
      subtitle: { type: String, default: 'Create, manage, and scale beautiful landing pages for your clients with our powerful multi-tenant SaaS platform.' },
      primaryCtaText: { type: String, default: 'Get Started' },
      primaryCtaLink: { type: String, default: '/register/company' },
      secondaryCtaText: { type: String, default: 'View Demo' },
      secondaryCtaLink: { type: String, default: '#templates' },
    },
    themeConfig: {
      logoText: { type: String, default: 'TenantHub' },
      logoImage: { type: String, default: '' },
      primaryColor: { type: String, default: '#4f46e5' }, // Indigo-600
      secondaryColor: { type: String, default: '#ec4899' }, // Pink-500
    },
    featureToggles: {
      showFeatures: { type: Boolean, default: true },
      showHowItWorks: { type: Boolean, default: true },
      showTemplates: { type: Boolean, default: true },
      showPricing: { type: Boolean, default: true },
      showTestimonials: { type: Boolean, default: true },
      showFAQ: { type: Boolean, default: true },
    },
    seoConfig: {
      title: { type: String, default: 'TenantHub - Multi-Tenant Platform' },
      description: { type: String, default: 'The ultimate multi-tenant platform for scaling your business.' },
    },
    featuresConfig: {
      title: { type: String, default: 'Everything you need to scale' },
      subtitle: { type: String, default: 'Comprehensive tools designed to help you manage multiple tenants and grow your SaaS business effortlessly.' },
      items: [{ title: String, description: String, icon: String }],
    },
    howItWorksConfig: {
      title: { type: String, default: 'How it works' },
      subtitle: { type: String, default: 'Get started in minutes, not days. Our streamlined process gets you up and running instantly.' },
      items: [{ step: String, title: String, description: String }],
    },
    pricingConfig: {
      title: { type: String, default: 'Simple, transparent pricing' },
      subtitle: { type: String, default: 'No hidden fees. No surprise charges. Just clear pricing that scales with your growing business.' },
      items: [{ name: String, price: String, description: String, features: [String], ctaText: String, popular: Boolean }],
    },
    faqConfig: {
      title: { type: String, default: 'Frequently asked questions' },
      subtitle: { type: String, default: 'Have a different question and can\'t find the answer you\'re looking for? Reach out to our support team.' },
      items: [{ question: String, answer: String }],
    },
    testimonialsConfig: {
      title: { type: String, default: 'Loved by Businesses Worldwide' },
      items: [{ name: String, role: String, content: String, rating: Number, initials: String }],
    },
    contactConfig: {
      email: { type: String, default: 'hello@tenanthub.com' },
      phone: { type: String, default: '+1 (555) 123-4567' },
      address: { type: String, default: '123 SaaS Street, San Francisco, CA' },
    },
    footerConfig: {
      copyrightText: { type: String, default: '© 2026 TenantHub Inc. All rights reserved.' },
      facebookLink: { type: String, default: '#' },
      twitterLink: { type: String, default: '#' },
      instagramLink: { type: String, default: '#' },
      linkedinLink: { type: String, default: '#' },
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const PlatformSettings: Model<IPlatformSettingsDocument> =
  mongoose.models.PlatformSettings || mongoose.model<IPlatformSettingsDocument>('PlatformSettings', PlatformSettingsSchema);

export default PlatformSettings;
