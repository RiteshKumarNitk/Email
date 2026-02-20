
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const { mode, subject, html, prompt } = await req.json();

        let responseData: any = {};

        if (mode === "generate-group") {
            const p = prompt?.toLowerCase() || "";
            if (p.includes("team") || p.includes("internal")) {
                responseData = {
                    name: "Internal Strategic Team",
                    description: "High-level internal stakeholders and strategic advisors."
                };
            } else if (p.includes("lead") || p.includes("potential")) {
                responseData = {
                    name: "Prospective Enterprise Leads",
                    description: "High-potential leads identified through recent outbound campaigns."
                };
            } else {
                responseData = {
                    name: "Smart Contact Group",
                    description: "AI-identified group based on your specific organizational rules."
                };
            }
        } else if (mode === "generate-workflow") {
            const p = prompt?.toLowerCase() || "";
            if (p.includes("welcome") || p.includes("new")) {
                responseData = {
                    name: "User Welcome Series",
                    description: "Automatically welcome new subscribers and introduce them to your product.",
                    steps: [
                        { type: 'email', name: 'Welcome Email', payload: { templateId: "" } },
                        { type: 'wait', name: 'Wait', payload: { duration: 1, unit: 'days' } },
                        { type: 'email', name: 'Tutorial Link', payload: { templateId: "" } }
                    ]
                };
            } else if (p.includes("abandoned") || p.includes("cart")) {
                responseData = {
                    name: "Cart Recovery Sequence",
                    description: "Win back customers who left items in their cart without checking out.",
                    steps: [
                        { type: 'wait', name: 'Wait', payload: { duration: 2, unit: 'hours' } },
                        { type: 'email', name: 'Reminder: Empty Cart', payload: { templateId: "" } },
                        { type: 'wait', name: 'Wait', payload: { duration: 1, unit: 'days' } },
                        { type: 'email', name: 'Discount Offer', payload: { templateId: "" } }
                    ]
                };
            } else {
                responseData = {
                    name: "AI Generated Automation",
                    description: "Custom workflow sequence optimized for your specific campaign requirements.",
                    steps: [
                        { type: 'email', name: 'Intro Email', payload: { templateId: "" } },
                        { type: 'wait', name: 'Wait', payload: { duration: 3, unit: 'days' } },
                        { type: 'email', name: 'Follow-up', payload: { templateId: "" } }
                    ]
                };
            }
        } else if (mode === "generate-segment") {
            // Mock segment generation logic
            const p = prompt?.toLowerCase() || "";
            if (p.includes("vip") || p.includes("rich")) {
                responseData = {
                    name: "High Value VIPs",
                    description: "Customers flagged as VIP with high lifetime value.",
                    tags: ["vip", "premium", "loyal"]
                };
            } else if (p.includes("new") || p.includes("recently")) {
                responseData = {
                    name: "Newly Joined Users",
                    description: "Users who joined the platform within the last 30 days.",
                    tags: ["newcomer", "onboarding"]
                };
            } else {
                responseData = {
                    name: "Smart Audience Segment",
                    description: "AI-generated segment based on your specific targeting rules.",
                    tags: ["active", "general"]
                };
            }
        } else if (mode === "generate") {
            responseData = {
                subject: prompt ? `Generated: ${prompt}` : "Generated Campaign",
                html: `<h1>AI Generated Content</h1><p>Here is a template based on: ${prompt || 'No prompt provided'}</p>`,
                category: "promo"
            };
        } else if (mode === "improve-subject") {
            responseData = { subject: `✨ [Optimized] ${subject || "New Campaign"}` };
        } else if (mode === "subject-variants") {
            responseData = {
                variants: [
                    `🔥 Hot Pick: ${subject || "Our New Collection"}`,
                    `Don't Miss Out: ${subject || "Check this out"}`,
                    `Exclusive: ${subject || "Special offer inside"}`
                ]
            };
        } else if (mode === "rewrite-body") {
            responseData = { html: `<div style="font-family: sans-serif;">${html || ""}<hr><p><i>(AI Rewritten for professional tone)</i></p></div>` };
        } else if (mode === "spam-check") {
            responseData = { score: 0.15, status: "safe", warnings: [] };
        } else if (mode === "emoji-optimize") {
            responseData = { subject: `🚀 ${subject || "Check this out"} 💎` };
        }

        // Simulate delay
        await new Promise(r => setTimeout(r, 800));

        return ApiResponse.success(responseData);

    } catch (error: any) {
        return ApiResponse.error("AI Request failed", error);
    }
}
