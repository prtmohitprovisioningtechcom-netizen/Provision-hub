export type UserRole = 'super_admin' | 'company_admin' | 'customer';

export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type CompanyStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type BlogStatus = 'draft' | 'published';

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

export type NotificationType =
  | 'new_lead'
  | 'new_review'
  | 'new_login'
  | 'subscription_expiry'
  | 'system_update'
  | 'verification';

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  whatsapp?: string;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface Address {
  country: string;
  state: string;
  city: string;
  street?: string;
  zipCode?: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  darkMode: boolean;
}

export interface SEOSettings {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isEmailVerified: boolean;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompany {
  _id: string;
  name: string;
  slug: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  address: Address;
  logo?: string;
  banner?: string;
  favicon?: string;
  description?: string;
  website?: string;
  socialLinks: SocialLinks;
  gst?: string;
  pan?: string;
  businessHours: BusinessHours[];
  status: CompanyStatus;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  subscription: SubscriptionPlan;
  subscriptionExpiresAt?: Date;
  ownerId: string;
  theme: ThemeSettings;
  seo: SEOSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILandingPageSection {
  id: string;
  type:
    | 'hero'
    | 'rating'
    | 'about'
    | 'why-choose-us'
    | 'services'
    | 'products'
    | 'gallery'
    | 'blogs'
    | 'testimonials'
    | 'faq'
    | 'subscribe'
    | 'contact'
    | 'footer';
  title: string;
  subtitle?: string;
  content?: string;
  image?: string;
  images?: string[];
  buttonText?: string;
  buttonLink?: string;
  items?: Record<string, unknown>[];
  isVisible: boolean;
  order: number;
}

export interface IProduct {
  _id: string;
  companyId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  offerPrice?: number;
  category: string;
  images: string[];
  stock: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IService {
  _id: string;
  companyId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  gallery: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlog {
  _id: string;
  companyId: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category: string;
  featuredImage?: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export interface ILead {
  _id: string;
  companyId: string;
  customerName: string;
  email: string;
  phone: string;
  message: string;
  interestedService?: string;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview {
  _id: string;
  companyId: string;
  userId: string;
  customerName: string;
  rating: number;
  comment: string;
  images: string[];
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  _id: string;
  userId: string;
  companyId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  companyId?: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  city?: string;
  state?: string;
  country?: string;
  verified?: boolean;
  topRated?: boolean;
  newest?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
