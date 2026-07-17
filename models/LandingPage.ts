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
    items?: Record<string, unknown>[];
    isVisible: boolean;
    order: number;
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
        type: String,
        title: String,
        subtitle: String,
        content: String,
        image: String,
        images: [String],
        items: [Schema.Types.Mixed],
        isVisible: { type: Boolean, default: true },
        order: Number,
      },
    ],
    templateId: String,
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const LandingPage: Model<ILandingPageDocument> =
  mongoose.models.LandingPage ||
  mongoose.model<ILandingPageDocument>('LandingPage', LandingPageSchema);

export default LandingPage;
