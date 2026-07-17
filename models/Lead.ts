import mongoose, { Schema, Document, Model } from 'mongoose';
import { LeadStatus } from '@/types';

export interface ILeadDocument extends Document {
  companyId: mongoose.Types.ObjectId;
  customerName: string;
  email: string;
  phone: string;
  message: string;
  interestedService?: string;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILeadDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    interestedService: String,
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true },
);

const Lead: Model<ILeadDocument> =
  mongoose.models.Lead || mongoose.model<ILeadDocument>('Lead', LeadSchema);

export default Lead;
