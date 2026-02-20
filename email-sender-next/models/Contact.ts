
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContact extends Document {
    email: string;
    name: string;
    userId: string;
    tags: string[];
    metadata: Record<string, any>;
    lastActive?: Date;
}

const ContactSchema = new Schema<IContact>(
    {
        email: { type: String, required: true },
        name: { type: String, required: true },
        userId: { type: String, required: true, index: true },
        groupId: { type: String, default: null },
        active: { type: Boolean, default: true },
        tags: { type: [String], default: [] },
        metadata: { type: Map, of: String, default: {} },
        lastActive: { type: Date },
    },
    { timestamps: true }
);

// Compound unique index: email + userId
ContactSchema.index({ email: 1, userId: 1 }, { unique: true });

const Contact: Model<IContact> = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
export default Contact;
