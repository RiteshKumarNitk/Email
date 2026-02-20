
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrackingEvent extends Document {
    campaignId: string;
    recipient: string; // The email address
    type: "open" | "click";
    url?: string; // For clicks
    ip?: string;
    userAgent?: string;
    timestamp: Date;
}

const TrackingEventSchema = new Schema<ITrackingEvent>(
    {
        campaignId: { type: String, required: true, index: true },
        recipient: { type: String, required: true, index: true },
        type: { type: String, enum: ["open", "click"], required: true },
        url: { type: String },
        ip: { type: String },
        userAgent: { type: String },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Prevent multiple counts from same IP/UserAgent for same campaign per day?
// Or just log everything for raw data. Let's log raw for now.

const TrackingEvent: Model<ITrackingEvent> = mongoose.models.TrackingEvent || mongoose.model<ITrackingEvent>('TrackingEvent', TrackingEventSchema);
export default TrackingEvent;
