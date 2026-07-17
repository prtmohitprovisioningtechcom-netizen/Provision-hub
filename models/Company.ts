import mongoose, { Schema, Document, Model } from 'mongoose';
import { CompanyStatus, SubscriptionPlan } from '@/types';

export interface ICompanyDocument extends Document {
  name: string;
  slug: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  address: {
    country: string;
    state: string;
    city: string;
    street?: string;
    zipCode?: string;
  };
  logo?: string;
  banner?: string;
  favicon?: string;
  description?: string;
  website?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    whatsapp?: string;
  };
  gst?: string;
  pan?: string;
  businessHours: Array<{
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }>;
  status: CompanyStatus;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  subscription: SubscriptionPlan;
  subscriptionExpiresAt?: Date;
  ownerId: mongoose.Types.ObjectId;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    darkMode: boolean;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompanyDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    category: { type: String, required: true, index: true },
    address: {
      country: { type: String, required: true, index: true },
      state: { type: String, required: true, index: true },
      city: { type: String, required: true, index: true },
      street: String,
      zipCode: String,
    },
    logo: String,
    banner: String,
    favicon: String,
    description: String,
    website: String,
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      youtube: String,
      whatsapp: String,
    },
    gst: String,
    pan: String,
    businessHours: [
      {
        day: String,
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    subscription: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free',
    },
    subscriptionExpiresAt: Date,
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    theme: {
      primaryColor: { type: String, default: '#6366f1' },
      secondaryColor: { type: String, default: '#8b5cf6' },
      accentColor: { type: String, default: '#06b6d4' },
      fontFamily: { type: String, default: 'Inter' },
      darkMode: { type: Boolean, default: false },
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
      canonicalUrl: String,
    },
  },
  { timestamps: true },
);

CompanySchema.index({ category: 1, 'address.city': 1 });
CompanySchema.index({ rating: -1 });
CompanySchema.index({ createdAt: -1 });

const Company: Model<ICompanyDocument> =
  mongoose.models.Company || mongoose.model<ICompanyDocument>('Company', CompanySchema);

export default Company;
