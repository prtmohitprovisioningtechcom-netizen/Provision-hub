import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGalleryDocument extends Document {
  companyId: mongoose.Types.ObjectId;
  title?: string;
  images: Array<{
    url: string;
    publicId: string;
    caption?: string;
    order: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGalleryDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: String,
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        caption: String,
        order: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

const Gallery: Model<IGalleryDocument> =
  mongoose.models.Gallery || mongoose.model<IGalleryDocument>('Gallery', GallerySchema);

export default Gallery;
