import mongoose, { Schema, Document, Model } from 'mongoose';
import { ProductStatus } from '@/types';

export interface IProductDocument extends Document {
  companyId: mongoose.Types.ObjectId;
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

const ProductSchema = new Schema<IProductDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, min: 0 },
    category: { type: String, required: true },
    images: [String],
    stock: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock'],
      default: 'active',
    },
  },
  { timestamps: true },
);

ProductSchema.index({ companyId: 1, slug: 1 }, { unique: true });

const Product: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);

export default Product;
