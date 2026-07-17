import mongoose, { Schema, Document, Model } from 'mongoose';
import { NotificationType } from '@/types';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    type: {
      type: String,
      enum: ['new_lead', 'new_review', 'new_login', 'subscription_expiry', 'system_update', 'verification'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>('Notification', NotificationSchema);

export default Notification;
