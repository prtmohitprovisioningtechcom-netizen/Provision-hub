import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IServiceDocument extends Document {
  companyId: mongoose.Types.ObjectId;
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

const ServiceSchema = new Schema<IServiceDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: String, required: true },
    category: { type: String, required: true },
    gallery: [String],
  },
  { timestamps: true },
);

ServiceSchema.index({ companyId: 1, slug: 1 }, { unique: true });

const Service: Model<IServiceDocument> =
  mongoose.models.Service || mongoose.model<IServiceDocument>('Service', ServiceSchema);

export default Service;
