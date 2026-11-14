'use client';

import { CompanyProfileView } from '@/components/company/CompanyProfileView';
import { CreativeStudioTheme } from '@/components/themes/creative-studio';
import { HerbalCosmeticsTheme } from '@/components/themes/herbal-cosmetics';
import { WarmShowcaseTheme } from '@/components/themes/warm-showcase';
import { BoldLaunchTheme } from '@/components/themes/bold-launch';
import { CleanPresenceTheme } from '@/components/themes/clean-presence';
import { PremiumShowcaseTheme } from '@/components/themes/premium-showcase';
import { ElegantSerifTheme } from '@/components/themes/elegant-serif';
import { SleekGlassTheme } from '@/components/themes/sleek-glass';
import { NeonDarkTheme } from '@/components/themes/neon-dark';
import { RoyalGlowTheme } from '@/components/themes/royal-glow';
import { CarpenterWorksTheme } from '@/components/themes/carpenter-works';
import { LAYOUT_MAP } from '@/components/themes/layouts';
import { getThemeSkin } from '@/lib/theme-skins';
import { normalizeLayoutId } from '@/lib/layout-id';
import { BackToTop } from '@/components/ui/back-to-top';
import { THEME_OPTIONS, type ThemeTemplateId } from '@/config/service-themes';
import {
  IBlog,
  ICompany,
  ILandingPageSection,
  IProduct,
  IReview,
  IService,
} from '@/types';

export { THEME_OPTIONS, type ThemeTemplateId };

export interface ThemeRendererProps {
  templateId?: string | null;
  layoutId?: string | null;
  company: ICompany;
  products: IProduct[];
  services: IService[];
  reviews: IReview[];
  blogs: IBlog[];
  landingPage: {
    sections?: ILandingPageSection[];
    isPublished?: boolean;
    templateId?: string | null;
    layoutId?: string | null;
    websiteType?: 'single_page' | 'multi_page';
  } | null;
  gallery: { images?: Array<{ url: string; caption?: string }> } | null;
  activePath?: string[];
}

export function ThemeRenderer({
  templateId,
  layoutId,
  company,
  products,
  services,
  reviews,
  blogs,
  landingPage,
  gallery,
  activePath,
}: ThemeRendererProps) {
  const id = templateId || landingPage?.templateId || 'default';
  const resolvedLayout = normalizeLayoutId(layoutId || landingPage?.layoutId);

  const shared = {
    company,
    products,
    services,
    reviews,
    blogs,
    landingPage: landingPage
      ? { ...landingPage, templateId: id, layoutId: resolvedLayout }
      : { templateId: id, layoutId: resolvedLayout, sections: [] as ILandingPageSection[] },
    gallery,
    activePath,
  };

  const renderTheme = () => {
    // Layout 3 = first theme (Modern Business) full design — sliding hero, etc.
    if (resolvedLayout === '3') {
      return <CompanyProfileView {...shared} templateId="default" />;
    }

    // Layout 1 = each theme's signature design (unique look).
    if (resolvedLayout === '1') {
      switch (id) {
        case 'creative-studio':
          return <CreativeStudioTheme {...shared} />;
        case 'warm-showcase':
          return <WarmShowcaseTheme {...shared} />;
        case 'bold-launch':
          return <BoldLaunchTheme {...shared} />;
        case 'clean-presence':
          return <CleanPresenceTheme {...shared} />;
        case 'premium-showcase':
          return <PremiumShowcaseTheme {...shared} />;
        case 'elegant-serif':
          return <ElegantSerifTheme {...shared} />;
        case 'sleek-glass':
          return <SleekGlassTheme {...shared} />;
        case 'neon-dark':
          return <NeonDarkTheme {...shared} />;
        case 'royal-glow':
          return <RoyalGlowTheme {...shared} />;
        case 'herbal-cosmetics':
          return <HerbalCosmeticsTheme {...shared} />;
        case 'carpenter-works':
          return <CarpenterWorksTheme {...shared} />;
        default:
          return <CompanyProfileView {...shared} templateId={id} />;
      }
    }

    // Layout 2 = split structure with selected theme colors.
    const skin = getThemeSkin(id, company.theme?.primaryColor);
    const Layout = LAYOUT_MAP['2'];
    return <Layout skin={skin} {...shared} />;
  };

  return (
    <>
      {renderTheme()}
      <BackToTop />
    </>
  );
}
