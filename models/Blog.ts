import mongoose, { Schema, Document, Model } from 'mongoose';
import { BlogStatus } from '@/types';

export interface IBlogDocument extends Document {
  companyId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category: string;
  featuredImage?: string;
  status: BlogStatus;
  author: mongoose.Types.ObjectId;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  comments: Array<{
    userId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    content: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlogDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    content: { type: String, required: true },
    excerpt: String,
    category: { type: String, required: true },
    featuredImage: String,
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: String,
        email: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

BlogSchema.index({ companyId: 1, slug: 1 }, { unique: true });

const Blog: Model<IBlogDocument> =
  mongoose.models.Blog || mongoose.model<IBlogDocument>('Blog', BlogSchema);

export default Blog;
