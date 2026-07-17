import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalyticsDocument extends Document {
  companyId: mongoose.Types.ObjectId;
  date: Date;
  visitors: number;
  pageViews: number;
  clicks: number;
  leads: number;
  topPages: Array<{ path: string; views: number }>;
  trafficSources: Array<{ source: string; count: number }>;
}

const AnalyticsSchema = new Schema<IAnalyticsDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    date: { type: Date, required: true },
    visitors: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    leads: { type: Number, default: 0 },
    topPages: [{ path: String, views: Number }],
    trafficSources: [{ source: String, count: Number }],
  },
  { timestamps: false },
);

AnalyticsSchema.index({ companyId: 1, date: -1 });

const Analytics: Model<IAnalyticsDocument> =
  mongoose.models.Analytics || mongoose.model<IAnalyticsDocument>('Analytics', AnalyticsSchema);

export default Analytics;
