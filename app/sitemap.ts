import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${siteConfig.url}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteConfig.url}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteConfig.url}/register/company`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];
}
