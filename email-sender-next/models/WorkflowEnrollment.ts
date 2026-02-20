
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWorkflowEnrollment extends Document {
    userId: string;
    workflowId: string;
    contactId: string;
    currentStepIndex: number;
    status: 'active' | 'completed' | 'failed' | 'cancelled';
    nextExecutionAt: Date;
    history: {
        stepId: string;
        executedAt: Date;
        status: 'success' | 'failure';
        error?: string;
    }[];
}

const WorkflowEnrollmentSchema = new Schema<IWorkflowEnrollment>(
    {
        userId: { type: String, required: true, index: true },
        workflowId: { type: String, required: true, index: true },
        contactId: { type: String, required: true },
        currentStepIndex: { type: Number, default: 0 },
        status: { type: String, enum: ['active', 'completed', 'failed', 'cancelled'], default: 'active', index: true },
        nextExecutionAt: { type: Date, required: true, index: true },
        history: [
            {
                stepId: String,
                executedAt: Date,
                status: String,
                error: String,
            },
        ],
    },
    { timestamps: true }
);

// Prevent duplicate enrollment active
WorkflowEnrollmentSchema.index({ workflowId: 1, contactId: 1, status: 1 });

const WorkflowEnrollment: Model<IWorkflowEnrollment> = mongoose.models.WorkflowEnrollment || mongoose.model<IWorkflowEnrollment>('WorkflowEnrollment', WorkflowEnrollmentSchema);
export default WorkflowEnrollment;
