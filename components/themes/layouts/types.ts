import {
  IBlog,
  ICompany,
  ILandingPageSection,
  IProduct,
  IReview,
  IService,
} from '@/types';
import { ThemeSkin } from '@/lib/theme-skins';

export type ThemeLayoutProps = {
  skin: ThemeSkin;
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
  } | null;
  gallery: { images?: Array<{ url: string; caption?: string }> } | null;
};
