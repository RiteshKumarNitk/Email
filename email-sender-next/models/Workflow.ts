
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWorkflowStep {
    id: string;
    type: 'email' | 'wait' | 'condition';
    name: string;
    payload: {
        templateId?: string; // For email
        subject?: string;
        duration?: number; // Minutes to wait
        unit?: 'minutes' | 'hours' | 'days';
    };
}

export interface IWorkflow extends Document {
    userId: string;
    name: string;
    description?: string;
    status: 'active' | 'draft' | 'paused';
    trigger: {
        type: 'segment_entry' | 'tag_added' | 'manual';
        segmentId?: string;
        tag?: string;
    };
    steps: IWorkflowStep[];
    stats: {
        enrolled: number;
        completed: number;
    };
}

const WorkflowSchema = new Schema<IWorkflow>(
    {
        userId: { type: String, required: true, index: true },
        name: { type: String, required: true },
        description: { type: String },
        status: { type: String, enum: ['active', 'draft', 'paused'], default: 'draft' },
        trigger: {
            type: { type: String, enum: ['segment_entry', 'tag_added', 'manual'], required: true },
            segmentId: { type: String },
            tag: { type: String },
        },
        steps: [
            {
                id: { type: String, required: true },
                type: { type: String, enum: ['email', 'wait', 'condition'], required: true },
                name: { type: String },
                payload: {
                    templateId: String,
                    subject: String,
                    duration: Number,
                    unit: String,
                },
            },
        ],
        stats: {
            enrolled: { type: Number, default: 0 },
            completed: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

const Workflow: Model<IWorkflow> = mongoose.models.Workflow || mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
export default Workflow;
