
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import nodemailer from "nodemailer";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const dbUser = await User.findById(user.id).select("smtpConfigs");

        // Hide password in response
        const configs = dbUser?.smtpConfigs.map((c: any) => ({
            _id: c._id,
            host: c.host,
            port: c.port,
            user: c.user,
            fromEmail: c.fromEmail,
            verified: c.verified,
            usageCount: c.usageCount
        })) || [];

        return ApiResponse.success(configs);
    } catch (err: any) {
        return ApiResponse.error("Failed to fetch SMTP configs", err);
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const { host, port, user: smtpUser, pass, fromEmail } = await req.json();

        // 1. Verify SMTP
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port == 465,
            auth: { user: smtpUser, pass },
        });

        try {
            await transporter.verify();
        } catch (smtpError: any) {
            return ApiResponse.error("SMTP Verification Failed", smtpError.message, 400);
        }

        // 2. Add to User's list
        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            {
                $push: {
                    smtpConfigs: {
                        host,
                        port,
                        user: smtpUser,
                        pass, // Encrypt in real app!
                        fromEmail: fromEmail || smtpUser,
                        secure: port == 465,
                        verified: true,
                    }
                }
            },
            { new: true }
        );

        return ApiResponse.success(updatedUser?.smtpConfigs, "SMTP Added Successfully");
    } catch (error: any) {
        return ApiResponse.error("Server error", error, 500);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const { id } = await req.json(); // Config ID to remove

        await User.findByIdAndUpdate(user.id, {
            $pull: { smtpConfigs: { _id: id } }
        });

        return ApiResponse.success(null, "SMTP Config Removed");
    } catch (error: any) {
        return ApiResponse.error("Delete failed", error);
    }
}
