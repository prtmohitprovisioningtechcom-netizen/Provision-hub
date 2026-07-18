import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INewsletterSubscriberDocument extends Document {
  companyId: mongoose.Types.ObjectId;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriberDocument>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

NewsletterSubscriberSchema.index({ companyId: 1, email: 1 }, { unique: true });

const NewsletterSubscriber: Model<INewsletterSubscriberDocument> =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model<INewsletterSubscriberDocument>(
    'NewsletterSubscriber',
    NewsletterSubscriberSchema,
  );

export default NewsletterSubscriber;
