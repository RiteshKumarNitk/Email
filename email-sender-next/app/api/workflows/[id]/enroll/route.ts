
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Workflow from "@/models/Workflow";
import Contact from "@/models/Contact";
import Segment from "@/models/Segment";
import { WorkflowEngine } from "@/services/workflow.service";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/api-response";

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const workflowId = params.id;
        const workflow = await Workflow.findById(workflowId);

        if (!workflow || workflow.userId !== user.id) {
            return ApiResponse.error("Workflow not found", null, 404);
        }

        // Determine targets
        let contacts: any[] = [];

        if (workflow.trigger.type === 'segment_entry' && workflow.trigger.segmentId) {
            const segment = await Segment.findById(workflow.trigger.segmentId);
            if (segment && segment.userId === user.id) {
                const query: any = { userId: user.id };
                if (segment.criteria?.tags?.length > 0) {
                    query.tags = { $in: segment.criteria.tags };
                }
                query.active = true;
                contacts = await Contact.find(query).select("_id");
            }
        }

        if (contacts.length === 0) {
            return ApiResponse.error("No contacts found in trigger segment", null, 400);
        }

        // Activate workflow if draft first so enrollments are accepted
        if (workflow.status === 'draft') {
            workflow.status = 'active';
            await workflow.save();
        }

        // Enroll
        let count = 0;
        for (const contact of contacts) {
            await WorkflowEngine.enrollContact(user.id, workflowId, contact._id);
            count++;
        }

        return ApiResponse.success({ message: `Enrolled ${count} contacts`, count });
    } catch (error: any) {
        return ApiResponse.error("Failed to enroll contacts", error);
    }
}
