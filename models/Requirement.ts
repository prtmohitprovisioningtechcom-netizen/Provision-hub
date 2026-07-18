import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRequirementDocument extends Document {
  customerName: string;
  email: string;
  phone: string;
  title: string;
  description: string;
  budget?: string;
  status: 'new' | 'reviewed' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const RequirementSchema = new Schema<IRequirementDocument>(
  {
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: String,
    status: {
      type: String,
      enum: ['new', 'reviewed', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true }
);

const Requirement: Model<IRequirementDocument> =
  mongoose.models.Requirement || mongoose.model<IRequirementDocument>('Requirement', RequirementSchema);

export default Requirement;
