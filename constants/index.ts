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
  {
    type: 'navbar',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    order: 0,
    items: [
      { label: 'Home', link: '#hero' },
      { label: 'About', link: '#about' },
      { label: 'Contact', link: '#contact' },
    ],
  },
  {
    type: 'hero',
    title: 'Welcome to Our Company',
    subtitle: 'Quality products, honest rates, and trusted service for every customer.',
    buttonText: '',
    buttonLink: '',
    order: 1,
  },
  {
    type: 'rating',
    title: 'Your Brand',
    subtitle: 'Quality products, honest rates, and trusted service.',
    note: '',
    order: 2,
    items: [
      { label: 'Google', link: '' },
      { label: 'facebook', link: '' },
    ],
  },
  {
    type: 'about',
    title: 'About Us',
    subtitle: 'Who we are and what we stand for.',
    content:
      'We deliver reliable products and services with clear communication, expert support, and a customer-first approach. Every solution is designed around your needs.',
    order: 3,
  },
  {
    type: 'why-choose-us',
    title: 'Why Choose Us',
    subtitle: 'We provide the best service for your needs.',
    order: 4,
    items: [
      { title: '24/7 Support', description: 'Round-the-clock assistance whenever you need us.' },
      { title: 'Expert Team', description: 'Skilled professionals focused on quality results.' },
      { title: 'Custom Solutions', description: 'Plans tailored to your goals and budget.' },
      { title: 'Fair Pricing', description: 'Transparent pricing with no hidden charges.' },
    ],
  },
  {
    type: 'services',
    title: 'Our Services',
    subtitle: 'Explore what we offer.',
    order: 5,
  },
  {
    type: 'products',
    title: 'Featured Products',
    subtitle: 'Our most popular products and packages.',
    order: 6,
  },
  {
    type: 'gallery',
    title: 'Our Gallery',
    subtitle: 'A look at our work and moments.',
    order: 7,
  },
  {
    type: 'blogs',
    title: 'News & Insights',
    subtitle: 'Guides, ideas, and updates from our team.',
    order: 8,
    items: [],
  },
  {
    type: 'testimonials',
    title: 'What Our Customers Say',
    subtitle: 'Hear from our happy customers.',
    order: 9,
  },
  {
    type: 'faq',
    title: 'Frequently Asked Questions',
    subtitle: 'Helpful answers to common questions.',
    order: 10,
  },
  {
    type: 'subscribe',
    title: 'Subscribe to Our Newsletter',
    subtitle: 'Get updates, offers, and news in your inbox.',
    eyebrow: 'Stay connected',
    order: 11,
    buttonText: 'Subscribe',
    placeholder: 'Your email address',
    note: 'No spam. Unsubscribe whenever you want.',
  },
  {
    type: 'contact',
    title: 'Get In Touch',
    subtitle: "We'd love to hear from you",
    order: 12,
  },
  {
    type: 'footer',
    title: "Let's work together",
    subtitle: 'Clear communication and dependable support.',
    content: '',
    order: 13,
    items: [
      { label: 'Home', link: '#hero' },
      { label: 'About', link: '#about' },
      { label: 'Services', link: '#services' },
      { label: 'Contact', link: '#contact' },
    ],
  },
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
