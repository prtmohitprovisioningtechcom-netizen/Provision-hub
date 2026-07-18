import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  role: z.enum(['super_admin', 'company_admin', 'customer']).default('customer'),
});

export const adminRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
});

export const companyRegisterSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  category: z.string().min(1, 'Category is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  gst: z.string().optional(),
  pan: z.string().optional(),
  socialLinks: z
    .object({
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
      youtube: z.string().optional(),
      whatsapp: z.string().optional(),
    })
    .optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const leadSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Valid phone required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  interestedService: z.string().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
});

export const reviewSchema = z.object({
  companyId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  images: z.array(z.string()).optional(),
});

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().min(0),
  offerPrice: z.number().min(0).optional(),
  category: z.string().min(1),
  images: z.array(z.string()).optional(),
  stock: z.number().min(0).default(0),
  status: z.enum(['active', 'inactive', 'out_of_stock']).default('active'),
});

export const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().min(0),
  duration: z.string().min(1),
  category: z.string().min(1),
  gallery: z.array(z.string()).optional(),
});

export const blogSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(50),
  excerpt: z.string().optional(),
  category: z.string().min(1),
  featuredImage: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
export type CompanyRegisterInput = z.infer<typeof companyRegisterSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type BlogInput = z.infer<typeof blogSchema>;
