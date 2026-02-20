
import dbConnect from "@/lib/db";
import Workflow from "@/models/Workflow";
import WorkflowEnrollment from "@/models/WorkflowEnrollment";
import Contact from "@/models/Contact";
import { QueueService } from "@/services/queue.service";
import Template from "@/models/Template";

export class WorkflowEngine {
    static async enrollContact(userId: string, workflowId: string, contactId: string) {
        await dbConnect();

        // 1. Check if workflow is active
        const workflow = await Workflow.findById(workflowId);
        if (!workflow || workflow.status !== 'active') return;

        // 2. Check duplicate active enrollment
        const existing = await WorkflowEnrollment.findOne({
            userId,
            workflowId,
            contactId,
            status: 'active'
        });
        if (existing) return;

        // 3. Create Enrollment
        const enrollment = await WorkflowEnrollment.create({
            userId,
            workflowId,
            contactId,
            currentStepIndex: 0,
            status: 'active',
            nextExecutionAt: new Date(), // Execute immediately
        });

        // Update stats
        await Workflow.updateOne({ _id: workflowId }, { $inc: { 'stats.enrolled': 1 } });

        return enrollment;
    }

    static async processDueEnrollments(limit: number = 50) {
        await dbConnect();
        const now = new Date();

        // 1. Find Due Enrollments
        const enrollments = await WorkflowEnrollment.find({
            status: 'active',
            nextExecutionAt: { $lte: now }
        })
            .sort({ nextExecutionAt: 1 })
            .limit(limit);

        if (enrollments.length === 0) return { processed: 0 };

        let processed = 0;

        for (const enrollment of enrollments) {
            try {
                // Fetch context
                const workflow = await Workflow.findById(enrollment.workflowId);
                const contact = await Contact.findById(enrollment.contactId);

                if (!workflow || !contact) {
                    // Mark as failed/cancelled if deps missing
                    enrollment.status = 'cancelled';
                    await enrollment.save();
                    continue;
                }

                if (workflow.status !== 'active') {
                    // Skip paused workflows
                    continue;
                }

                // Execute Current Step
                const step = workflow.steps[enrollment.currentStepIndex];

                if (!step) {
                    // No more steps: Complete
                    enrollment.status = 'completed';
                    await enrollment.save();
                    await Workflow.updateOne({ _id: workflow._id }, { $inc: { 'stats.completed': 1 } });
                    continue;
                }

                let executed = false;
                let nextRun = new Date(); // Immediate by default
                let advance = true;

                if (step.type === 'email') {
                    // Resolve Template
                    let subject = step.payload.subject || "No Subject";
                    let html = "<p>No Content</p>";

                    if (step.payload.templateId) {
                        const template = await Template.findById(step.payload.templateId);
                        if (template) {
                            subject = template.subject;
                            html = template.html;
                            if (template.design && typeof template.design === 'string') {
                                // If design exists, we assume template.html is updated or we render it on fly?
                                // For now assume template.html is kept in sync by builder save.
                            }
                        }
                    }

                    // Personalize
                    const personalizedHtml = html.replace(/{{name}}/g, contact.name || "Friend");

                    // Queue Email
                    await QueueService.add(contact.userId, workflow._id.toString(), contact.email, {
                        subject,
                        html: personalizedHtml
                    });

                    executed = true;
                }
                else if (step.type === 'wait') {
                    // Wait logic handled by NEXT step scheduling
                    // But effectively 'Wait' step does nothing but delay next step.
                    // Wait Steps are usually: "Wait 2 days THEN do next".
                    // So when we hit a Wait Step, we just calculate next execution time for the NEXT step index
                    // and return without executing anything "now".
                    // But wait, if step type IS wait, then we are AT the wait step.
                    // So we successfully PROCESSED the wait instruction.
                    // We calculate delay.
                    const duration = step.payload.duration || 0;
                    const unit = step.payload.unit || 'minutes';

                    let ms = duration * 60 * 1000;
                    if (unit === 'hours') ms *= 60;
                    if (unit === 'days') ms *= 24 * 60;

                    nextRun = new Date(Date.now() + ms);
                    executed = true;
                }

                // Advance
                if (advance) {
                    enrollment.history.push({
                        stepId: step.id,
                        executedAt: new Date(),
                        status: 'success'
                    });

                    enrollment.currentStepIndex += 1;

                    // If next step exists, schedule it based on flow
                    // If previous step was WAIT, we scheduled THIS run.
                    // If CURRENT step is WAIT, we schedule NEXT run with delay.
                    // If CURRENT step is EMAIL, we schedule NEXT run immediately (unless explicit delay between steps).

                    // Logic Adjustment:
                    // If step was 'wait', we set `nextExecutionAt` = future.
                    // If step was 'email', we set `nextExecutionAt` = now (processed in next loop or immediately recursive).

                    enrollment.nextExecutionAt = nextRun;

                    // Check if done
                    if (enrollment.currentStepIndex >= workflow.steps.length) {
                        enrollment.status = 'completed';
                        await Workflow.updateOne({ _id: workflow._id }, { $inc: { 'stats.completed': 1 } });
                    }

                    await enrollment.save();
                }

                processed++;

            } catch (error: any) {
                console.error(`Workflow Error ${enrollment._id}:`, error);
                // Retry logic or mark failed
                // For now, retry in 1 hour
                enrollment.nextExecutionAt = new Date(Date.now() + 60 * 60 * 1000);
                await enrollment.save();
            }
        }

        return { processed };
    }
}
