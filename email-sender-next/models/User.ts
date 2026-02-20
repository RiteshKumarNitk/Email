
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    smtpVerified: boolean;
    smtpConfigs: {
        _id: string; // Mongoose subdoc ID
        host: string;
        port: number;
        user: string;
        pass: string;
        fromEmail: string;
        secure: boolean;
        verified: boolean;
        addedAt: Date;
        usageCount: number;
    }[];
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        smtpHost: { type: String },
        smtpPort: { type: Number },
        smtpUser: { type: String },
        smtpPass: { type: String },
        smtpVerified: { type: Boolean, default: false },
        smtpConfigs: [
            {
                host: String,
                port: Number,
                user: String,
                pass: String,
                fromEmail: String, // Store the sender email or name
                secure: Boolean,
                verified: { type: Boolean, default: false },
                addedAt: { type: Date, default: Date.now },
                usageCount: { type: Number, default: 0 }, // For rotation
            }
        ],
    },
    { timestamps: true }
);

// Prevent overwriting the model if it already exists (Next.js hot reload issue fix)
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
