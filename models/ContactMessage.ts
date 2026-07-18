import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IContactMessageDocument extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read';
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessageDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ['new', 'read'], default: 'new' },
  },
  { timestamps: true },
);

const ContactMessage: Model<IContactMessageDocument> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessageDocument>('ContactMessage', ContactMessageSchema);

export default ContactMessage;
