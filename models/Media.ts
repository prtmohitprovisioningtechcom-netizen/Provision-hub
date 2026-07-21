import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMediaDocument extends Document {
  companyId: mongoose.Types.ObjectId;
  mimeType: string;
  filename?: string;
  size: number;
  data: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMediaDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    mimeType: { type: String, required: true },
    filename: String,
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true },
);

delete mongoose.models.Media;

const Media: Model<IMediaDocument> = mongoose.model<IMediaDocument>('Media', MediaSchema);

export default Media;
