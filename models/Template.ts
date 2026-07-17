import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITemplateDocument extends Document {
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  sections: Array<Record<string, unknown>>;
  category: string;
  isPremium: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplateDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    thumbnail: String,
    sections: [Schema.Types.Mixed],
    category: String,
    isPremium: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Template: Model<ITemplateDocument> =
  mongoose.models.Template || mongoose.model<ITemplateDocument>('Template', TemplateSchema);

export default Template;
