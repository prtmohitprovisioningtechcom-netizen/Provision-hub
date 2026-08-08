import {
  IBlog,
  ICompany,
  ILandingPageSection,
  IProduct,
  IReview,
  IService,
} from '@/types';
import {
  getSection,
  isSectionVisible,
  resolveFaq,
  resolveGalleryImages,
  resolveTestimonials,
  resolveWhyItems,
  sectionImage,
  sectionImages,
  ThemeGallery,
  ThemeLandingPage,
  whatsappLink,
} from '@/lib/theme-content';

export type NavLink = { label: string; link: string };

export type ThemePageModel = {
  brandName: string;
  logo?: string;
  slug: string;
  phone: string;
  email: string;
  addressLine: string;
  description: string;
  whatsapp: string;
  primaryColor?: string;
  nav: NavLink[];
  navCta: { label: string; link: string } | null;
  hero: {
    show: boolean;
    eyebrow: string;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    image: string;
    images: string[];
  };
  about: {
    show: boolean;
    eyebrow: string;
    title: string;
    subtitle: string;
    content: string;
    image: string;
  };
  why: {
    show: boolean;
    title: string;
    subtitle: string;
    items: Array<{ title: string; description: string }>;
  };
  services: {
    show: boolean;
    title: string;
    subtitle: string;
    items: IService[];
  };
  products: {
    show: boolean;
    title: string;
    subtitle: string;
    items: IProduct[];
  };
  gallery: {
    show: boolean;
    title: string;
    subtitle: string;
    images: Array<{ url: string; caption?: string }>;
  };
  testimonials: {
    show: boolean;
    title: string;
    subtitle: string;
    items: Array<{ name: string; comment: string; rating: number }>;
  };
  faq: {
    show: boolean;
    title: string;
    subtitle: string;
    items: Array<{ question: string; answer: string }>;
  };
  subscribe: {
    show: boolean;
    title: string;
    subtitle: string;
    buttonText: string;
    placeholder: string;
    note: string;
  };
  blogs: {
    show: boolean;
    title: string;
    subtitle: string;
    items: IBlog[];
  };
  contact: {
    show: boolean;
    title: string;
    subtitle: string;
    content: string;
  };
  footer: {
    title: string;
    subtitle: string;
    content: string;
    items: NavLink[];
  };
  orderedSectionTypes: string[];
};

function clean(value?: string | null): string {
  return (value || '').trim();
}

function addressLine(company: ICompany): string {
  const a = company.address;
  if (!a) return '';
  return [a.street, a.city, a.state, a.country].filter(Boolean).join(', ');
}

function navFromSection(section: ILandingPageSection | null): NavLink[] {
  if (!section?.items?.length) return [];
  return section.items
    .map((item) => {
      const row = item as Record<string, unknown>;
      const label = clean(String(row.label || row.title || ''));
      const link = clean(String(row.link || row.href || row.url || ''));
      if (!label) return null;
      return { label, link: link || '#' };
    })
    .filter(Boolean) as NavLink[];
}

/**
 * Single source of truth for themed pages:
 * every visitor-facing string comes from company profile or Website Builder sections.
 * Themes must not invent marketing copy — only layout/styling.
 */
export function resolveThemePage(input: {
  company: ICompany;
  products?: IProduct[];
  services?: IService[];
  reviews?: IReview[];
  blogs?: IBlog[];
  landingPage: ThemeLandingPage;
  gallery: ThemeGallery;
}): ThemePageModel {
  const { company, landingPage, gallery } = input;
  const products = input.products || [];
  const services = input.services || [];
  const blogs = input.blogs || [];

  const navbar = getSection(landingPage, 'navbar');
  const hero = getSection(landingPage, 'hero');
  const about = getSection(landingPage, 'about');
  const why = getSection(landingPage, 'why-choose-us');
  const servicesSec = getSection(landingPage, 'services');
  const productsSec = getSection(landingPage, 'products');
  const gallerySec = getSection(landingPage, 'gallery');
  const testimonialsSec = getSection(landingPage, 'testimonials');
  const faqSec = getSection(landingPage, 'faq');
  const subscribeSec = getSection(landingPage, 'subscribe');
  const blogsSec = getSection(landingPage, 'blogs');
  const contact = getSection(landingPage, 'contact');
  const footer = getSection(landingPage, 'footer');

  const resolvedServices = services.length > 0 ? services : ((servicesSec?.items as any) || []);
  const resolvedProducts = products.length > 0 ? products : ((productsSec?.items as any) || []);
  const resolvedBlogs = blogs.length > 0 ? blogs : ((blogsSec?.items as any) || []);

  const whyItems = resolveWhyItems(landingPage);
  const galleryImages = resolveGalleryImages(landingPage, gallery);
  const testimonials = resolveTestimonials(landingPage, input.reviews);
  const faqItems = resolveFaq(landingPage);

  const nav = navFromSection(navbar);
  const footerLinks = navFromSection(footer);
  const defaultNav: NavLink[] = [
    isSectionVisible(landingPage, 'about') ? { label: clean(about?.title) || 'About', link: '#about' } : null,
    isSectionVisible(landingPage, 'services') && services.length
      ? { label: clean(servicesSec?.title) || 'Services', link: '#services' }
      : null,
    isSectionVisible(landingPage, 'gallery') && galleryImages.length
      ? { label: clean(gallerySec?.title) || 'Gallery', link: '#gallery' }
      : null,
    isSectionVisible(landingPage, 'contact')
      ? { label: clean(contact?.title) || 'Contact', link: '#contact' }
      : null,
  ].filter(Boolean) as NavLink[];

  const navCtaLabel = clean(navbar?.buttonText) || clean(hero?.buttonText);
  const navCtaLink = clean(navbar?.buttonLink) || clean(hero?.buttonLink) || '#contact';

  const orderedSectionTypes = landingPage.sections
    ?.filter(s => s.isVisible !== false && s.type !== 'navbar' && s.type !== 'footer')
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(s => s.type) || [];

  if (orderedSectionTypes.length === 0) {
    orderedSectionTypes.push('hero', 'about', 'why-choose-us', 'services', 'products', 'gallery', 'testimonials', 'faq', 'subscribe', 'blogs', 'contact');
  }

  return {
    brandName: clean(navbar?.title) || company.name,
    logo: company.logo,
    slug: company.slug,
    phone: company.phone || '',
    email: company.email || '',
    addressLine: addressLine(company),
    description: clean(company.description),
    whatsapp: whatsappLink(company.phone || company.socialLinks?.whatsapp),
    primaryColor: company.theme?.primaryColor,
    nav: nav.length ? nav : defaultNav,
    navCta: navCtaLabel ? { label: navCtaLabel, link: navCtaLink } : null,
    hero: {
      show: isSectionVisible(landingPage, 'hero'),
      eyebrow: clean(hero?.eyebrow),
      title: clean(hero?.title) || company.name,
      subtitle: clean(hero?.subtitle) || clean(company.description),
      buttonText: clean(hero?.buttonText),
      buttonLink: clean(hero?.buttonLink) || '#contact',
      image: sectionImage(hero, company.banner || ''),
      images: sectionImages(hero),
    },
    about: {
      show: isSectionVisible(landingPage, 'about'),
      eyebrow: clean(about?.eyebrow),
      title: clean(about?.title),
      subtitle: clean(about?.subtitle),
      content: clean(about?.content) || clean(company.description),
      image: sectionImage(about, company.banner || ''),
    },
    why: {
      show: isSectionVisible(landingPage, 'why-choose-us') && whyItems.length > 0,
      title: clean(why?.title) || 'Why Choose Us',
      subtitle: clean(why?.subtitle),
      items: whyItems,
    },
    services: {
      show: isSectionVisible(landingPage, 'services') && resolvedServices.length > 0,
      title: clean(servicesSec?.title) || 'Our Services',
      subtitle: clean(servicesSec?.subtitle),
      items: resolvedServices,
    },
    products: {
      show: isSectionVisible(landingPage, 'products') && resolvedProducts.length > 0,
      title: clean(productsSec?.title) || 'Our Products',
      subtitle: clean(productsSec?.subtitle),
      items: resolvedProducts,
    },
    gallery: {
      show: isSectionVisible(landingPage, 'gallery') && galleryImages.length > 0,
      title: clean(gallerySec?.title) || 'Gallery',
      subtitle: clean(gallerySec?.subtitle),
      images: galleryImages,
    },
    testimonials: {
      show: isSectionVisible(landingPage, 'testimonials') && testimonials.length > 0,
      title: clean(testimonialsSec?.title) || 'Testimonials',
      subtitle: clean(testimonialsSec?.subtitle),
      items: testimonials,
    },
    faq: {
      show: isSectionVisible(landingPage, 'faq') && faqItems.length > 0,
      title: clean(faqSec?.title) || 'FAQ',
      subtitle: clean(faqSec?.subtitle),
      items: faqItems,
    },
    subscribe: {
      show: isSectionVisible(landingPage, 'subscribe'),
      title: clean(subscribeSec?.title) || 'Subscribe',
      subtitle: clean(subscribeSec?.subtitle),
      buttonText: clean(subscribeSec?.buttonText) || 'Subscribe',
      placeholder: clean(subscribeSec?.placeholder) || 'Enter your email',
      note: clean(subscribeSec?.note),
    },
    blogs: {
      show: isSectionVisible(landingPage, 'blogs') && resolvedBlogs.length > 0,
      title: clean(blogsSec?.title) || 'Latest Blogs',
      subtitle: clean(blogsSec?.subtitle),
      items: resolvedBlogs,
    },
    contact: {
      show: isSectionVisible(landingPage, 'contact'),
      title: clean(contact?.title),
      subtitle: clean(contact?.subtitle),
      content: clean(contact?.content),
    },
    footer: {
      title: clean(footer?.title) || company.name,
      subtitle: clean(footer?.subtitle),
      content: clean(footer?.content) || clean(company.description),
      items: footerLinks.length ? footerLinks : defaultNav,
    },
    orderedSectionTypes,
  };
}
