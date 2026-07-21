import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILandingPageDocument extends Document {
  companyId: mongoose.Types.ObjectId;
  sections: Array<{
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    content?: string;
    image?: string;
    images?: string[];
    mapUrl?: string;
    buttonText?: string;
    buttonLink?: string;
    eyebrow?: string;
    note?: string;
    placeholder?: string;
    items?: Record<string, unknown>[];
    isVisible: boolean;
    order: number;
  }>;
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    subtitle?: string;
    content: string;
    image?: string;
    isVisible: boolean;
  }>;
  templateId?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LandingPageSchema = new Schema<ILandingPageDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
    sections: [
      {
        id: String,
        type: { type: String },
        title: String,
        subtitle: String,
        content: String,
        image: String,
        images: [String],
        mapUrl: String,
        buttonText: String,
        buttonLink: String,
        eyebrow: String,
        note: String,
        placeholder: String,
        items: [Schema.Types.Mixed],
        isVisible: { type: Boolean, default: true },
        order: Number,
      },
    ],
    templateId: String,
    pages: [
      {
        id: String,
        title: String,
        slug: String,
        subtitle: String,
        content: String,
        image: String,
        isVisible: { type: Boolean, default: true },
      },
    ],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

delete mongoose.models.LandingPage;

const LandingPage: Model<ILandingPageDocument> =
  mongoose.model<ILandingPageDocument>('LandingPage', LandingPageSchema);

export default LandingPage;
