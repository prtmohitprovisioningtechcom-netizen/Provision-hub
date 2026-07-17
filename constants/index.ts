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

export const BUSINESS_CATEGORIES = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Real Estate',
  'Retail',
  'Food & Beverage',
  'Manufacturing',
  'Consulting',
  'Marketing',
  'Legal',
  'Travel',
  'Fitness',
  'Beauty',
  'Automotive',
  'Other',
];

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
  { type: 'hero', title: 'Hero', order: 0 },
  { type: 'about', title: 'About Us', order: 1 },
  { type: 'services', title: 'Our Services', order: 2 },
  { type: 'products', title: 'Our Products', order: 3 },
  { type: 'gallery', title: 'Gallery', order: 4 },
  { type: 'testimonials', title: 'Testimonials', order: 5 },
  { type: 'faq', title: 'FAQ', order: 6 },
  { type: 'contact', title: 'Contact Us', order: 7 },
  { type: 'footer', title: 'Footer', order: 8 },
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
