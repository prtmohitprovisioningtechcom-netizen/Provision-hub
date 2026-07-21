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
    title: 'Explore Unforgettable Tours',
    subtitle: 'Customize packages, honest rates, and trusted service for every trip.',
    buttonText: '',
    buttonLink: '',
    order: 1,
  },
  {
    type: 'rating',
    title: 'Your Brand',
    subtitle: 'Explore packages, honest rates, and trusted service.',
    note: '',
    order: 2,
    items: [
      { label: 'Google', link: '' },
      { label: 'facebook', link: '' },
    ],
  },
  {
    type: 'about',
    title: 'Our Story',
    subtitle: 'Locally trusted. Globally inspired.',
    content:
      'We craft authentic travel experiences with expert planning, local knowledge, and warm hospitality. From short getaways to full custom tours, every journey is designed around you.',
    order: 3,
  },
  {
    type: 'why-choose-us',
    title: 'Why Choose Us',
    subtitle: 'We provide the best service for your journey.',
    order: 4,
    items: [
      { title: '24/7 Support', description: 'Round-the-clock assistance throughout your journey.' },
      { title: 'Local Guides', description: 'Knowledgeable guides for authentic experiences.' },
      { title: 'Custom Packages', description: 'Itineraries tailored to your interests and budget.' },
      { title: 'Budget Friendly', description: 'Quality experiences with transparent pricing.' },
    ],
  },
  {
    type: 'services',
    title: 'Popular Destinations',
    subtitle: 'Explore the most fascinating places with us.',
    order: 5,
  },
  {
    type: 'products',
    title: 'Featured Tours',
    subtitle: 'Our most popular packages for every traveler.',
    order: 6,
  },
  {
    type: 'gallery',
    title: 'Our Gallery',
    subtitle: 'Moments from journeys through our travelers’ lens.',
    order: 7,
  },
  {
    type: 'blogs',
    title: 'Travel Tips & Stories',
    subtitle: 'Guides, ideas, and updates from our team.',
    order: 8,
    items: [],
  },
  {
    type: 'testimonials',
    title: 'What Our Travelers Say',
    subtitle: 'Hear from our happy customers.',
    order: 9,
  },
  {
    type: 'faq',
    title: 'Frequently Asked Questions',
    subtitle: 'Helpful answers before you book.',
    order: 10,
  },
  {
    type: 'subscribe',
    title: 'Subscribe to Our Newsletter',
    subtitle: 'Get travel updates, offers, and insider tips in your inbox.',
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
    title: 'Plan your next trip with us',
    subtitle: 'Authentic experiences, clear communication, and dependable support.',
    content: '',
    order: 13,
    items: [
      { label: 'Home', link: '#hero' },
      { label: 'About', link: '#about' },
      { label: 'Destinations', link: '#services' },
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
