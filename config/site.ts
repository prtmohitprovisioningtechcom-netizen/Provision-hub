const deploymentUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000');

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'TenantHub',
  description:
    'Build stunning company landing pages in minutes. Multi-tenant SaaS platform for businesses to create, manage, and grow their online presence.',
  url: deploymentUrl,
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/tenanthub',
    github: 'https://github.com/tenanthub',
  },
  creator: 'TenantHub Team',
};
