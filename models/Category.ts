import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  type: 'business' | 'landing_section';
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: ['business', 'landing_section'], default: 'business' },
    description: String,
    icon: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Category: Model<ICategoryDocument> =
  mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema);

export default Category;
