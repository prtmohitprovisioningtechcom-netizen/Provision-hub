import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettingsDocument extends Document {
  companyId: mongoose.Types.ObjectId;
  emailNotifications: boolean;
  leadNotifications: boolean;
  reviewNotifications: boolean;
  loginAlerts: boolean;
  subscriptionAlerts: boolean;
  customDomain?: string;
  googleAnalyticsId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettingsDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
    emailNotifications: { type: Boolean, default: true },
    leadNotifications: { type: Boolean, default: true },
    reviewNotifications: { type: Boolean, default: true },
    loginAlerts: { type: Boolean, default: true },
    subscriptionAlerts: { type: Boolean, default: true },
    customDomain: String,
    googleAnalyticsId: String,
  },
  { timestamps: true },
);

const Settings: Model<ISettingsDocument> =
  mongoose.models.Settings || mongoose.model<ISettingsDocument>('Settings', SettingsSchema);

export default Settings;
