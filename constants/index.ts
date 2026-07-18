import { SubscriptionPlan } from '@/types';

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'TenantHub';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin',
  CUSTOMER: 'customer',
} as const;

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlan,
  {
    name: string;
    price: number;
    features: string[];
    limits: {
      products: number;
      services: number;
      gallery: number;
      blogs: number;
      pages: number;
      leads: number;
    };
  }
> = {
  free: {
    name: 'Free',
    price: 0,
    features: ['Basic landing page', 'Up to 5 products', 'Up to 3 services', 'Basic analytics'],
    limits: { products: 5, services: 3, gallery: 10, blogs: 3, pages: 1, leads: 50 },
  },
  starter: {
    name: 'Starter',
    price: 29,
    features: ['Custom domain', 'Up to 25 products', 'Lead management', 'Email notifications'],
    limits: { products: 25, services: 10, gallery: 50, blogs: 10, pages: 5, leads: 500 },
  },
  professional: {
    name: 'Professional',
    price: 79,
    features: ['Advanced analytics', 'Blog module', 'Review system', 'Priority support'],
    limits: { products: 100, services: 50, gallery: 200, blogs: 50, pages: 20, leads: 5000 },
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    features: ['Unlimited everything', 'White label', 'API access', 'Dedicated support'],
    limits: { products: -1, services: -1, gallery: -1, blogs: -1, pages: -1, leads: -1 },
  },
};

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const DEFAULT_BUSINESS_HOURS = DAYS_OF_WEEK.map((day) => ({
  day,
  open: '09:00',
  close: '18:00',
  isClosed: day === 'Sunday',
}));

export const LANDING_SECTIONS = [
  { type: 'hero', title: 'Grow Your Business With Us', subtitle: 'Professional solutions designed around your goals.', order: 0 },
  { type: 'rating', title: 'Trusted by Our Customers', subtitle: 'Real experiences. Proven quality.', order: 1 },
  { type: 'about', title: 'About Us', subtitle: 'Get to know our company and what drives us.', order: 2 },
  {
    type: 'why-choose-us',
    title: 'Why Choose Us',
    subtitle: 'The values that make us the right partner for your business.',
    order: 3,
    items: [
      { title: 'Experienced Team', description: 'Skilled professionals focused on excellent results.' },
      { title: 'Quality First', description: 'Reliable work with attention to every detail.' },
      { title: 'Customer Support', description: 'Clear communication and support when you need it.' },
    ],
  },
  { type: 'services', title: 'Our Services', subtitle: 'Solutions tailored to your needs.', order: 4 },
  { type: 'products', title: 'Our Products', subtitle: 'Explore our latest products.', order: 5 },
  { type: 'gallery', title: 'Our Work', subtitle: 'A closer look at what we create.', order: 6 },
  {
    type: 'blogs',
    title: 'Latest Insights',
    subtitle: 'News, ideas, and useful updates from our team.',
    order: 7,
    items: [],
  },
  { type: 'testimonials', title: 'Customer Stories', subtitle: 'What our customers say about us.', order: 8 },
  { type: 'faq', title: 'Frequently Asked Questions', subtitle: 'Helpful answers to common questions.', order: 9 },
  {
    type: 'subscribe',
    title: 'Subscribe to Our Newsletter',
    subtitle: 'Get useful updates, offers, and company news delivered to your inbox.',
    order: 10,
    buttonText: 'Subscribe',
  },
  { type: 'contact', title: 'Contact Us', subtitle: 'Tell us what you need and our team will get back to you.', order: 11 },
  { type: 'footer', title: 'Footer', order: 12 },
] as const;

export const PRICING_PLANS = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
  id: key,
  ...plan,
}));

export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#templates', label: 'Templates' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
];
