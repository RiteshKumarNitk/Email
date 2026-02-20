
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISegment extends Document {
    userId: string;
    name: string;
    description?: string;
    criteria: {
        tags?: string[];
        hasOpened?: boolean;
        hasClicked?: boolean;
        lastActiveAfter?: Date;
        lastActiveBefore?: Date;
        minOpens?: number;
    };
    contactCount: number; // Updated periodically or on save
}

const SegmentSchema = new Schema<ISegment>(
    {
        userId: { type: String, required: true, index: true },
        name: { type: String, required: true },
        description: { type: String },
        criteria: {
            tags: [String],
            hasOpened: Boolean,
            hasClicked: Boolean,
            lastActiveAfter: Date,
            lastActiveBefore: Date,
            minOpens: Number,
        },
        contactCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Segment: Model<ISegment> = mongoose.models.Segment || mongoose.model<ISegment>('Segment', SegmentSchema);
export default Segment;
