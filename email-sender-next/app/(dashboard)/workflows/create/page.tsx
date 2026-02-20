
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

interface Step {
    id: string;
    type: 'email' | 'wait' | 'condition';
    name: string;
    payload: any;
}

export default function CreateWorkflow() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [triggerType, setTriggerType] = useState("segment_entry");
    const [selectedSegment, setSelectedSegment] = useState("");
    const [segments, setSegments] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    // Steps State
    const [steps, setSteps] = useState<Step[]>([]);

    // Load Dependencies
    useEffect(() => {
        api("/segments").then(setSegments).catch(console.error);
        api("/templates").then(setTemplates).catch(console.error);
    }, []);

    const addStep = (type: 'email' | 'wait') => {
        setSteps([...steps, {
            id: crypto.randomUUID(),
            type,
            name: type === 'email' ? 'Send Email' : 'Wait',
            payload: type === 'email' ? { templateId: "" } : { duration: 1, unit: 'days' }
        }]);
    };

    const updateStep = (index: number, key: string, value: any) => {
        const newSteps = [...steps];
        newSteps[index].payload[key] = value;
        setSteps(newSteps);
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const saveWorkflow = async () => {
        try {
            await api("/workflows", {
                method: "POST",
                body: {
                    name,
                    description,
                    status: 'draft',
                    trigger: {
                        type: triggerType,
                        segmentId: selectedSegment
                    },
                    steps
                }
            });
            alert("Workflow Created!");
            router.push("/workflows");
        } catch (error) {
            console.error(error);
            alert("Failed to create workflow");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">New Workflow</h1>

            {/* SETUP */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">1. Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Workflow Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border px-4 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Welcome Series"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Trigger</label>
                        <select
                            value={triggerType}
                            onChange={(e) => setTriggerType(e.target.value)}
                            className="w-full border px-4 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="segment_entry">Contact Joins Segment</option>
                            <option value="manual">Manual Trigger Only</option>
                        </select>
                    </div>
                </div>

                {triggerType === 'segment_entry' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Segment</label>
                        <select
                            value={selectedSegment}
                            onChange={(e) => setSelectedSegment(e.target.value)}
                            className="w-full border px-4 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">-- Choose Segment --</option>
                            {segments.map((s) => (
                                <option key={s._id} value={s._id}>{s.name} ({s.contactCount} contacts)</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* FLOW BUILDER */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                <h3 className="font-semibold text-lg border-b pb-2 flex justify-between items-center">
                    2. Workflow Steps
                    <div className="text-sm font-normal text-gray-500">Add steps to your automation</div>
                </h3>

                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="relative pl-8 border-l-2 border-indigo-100 last:border-b-0">
                            <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white"></div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-gray-700 uppercase text-xs">{step.type}</span>
                                    <button onClick={() => removeStep(index)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                </div>

                                {step.type === 'email' && (
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Select Email Template</label>
                                        <select
                                            value={step.payload.templateId}
                                            onChange={(e) => updateStep(index, 'templateId', e.target.value)}
                                            className="w-full border px-3 py-2 rounded bg-white text-sm"
                                        >
                                            <option value="">-- Choose Template --</option>
                                            {templates.map((t) => (
                                                <option key={t._id} value={t._id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {step.type === 'wait' && (
                                    <div className="flex gap-2 items-center">
                                        <label className="text-sm text-gray-600">Wait for</label>
                                        <input
                                            type="number"
                                            value={step.payload.duration}
                                            onChange={(e) => updateStep(index, 'duration', parseInt(e.target.value))}
                                            className="w-20 border px-3 py-2 rounded bg-white text-sm"
                                        />
                                        <select
                                            value={step.payload.unit}
                                            onChange={(e) => updateStep(index, 'unit', e.target.value)}
                                            className="border px-3 py-2 rounded bg-white text-sm"
                                        >
                                            <option value="minutes">Minutes</option>
                                            <option value="hours">Hours</option>
                                            <option value="days">Days</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="h-4 border-l-2 border-indigo-100 ml-[-2px]"></div>
                            )}
                        </div>
                    ))}

                    {steps.length === 0 && (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                            No steps yet. Add your first action below.
                        </div>
                    )}
                </div>

                <div className="flex justify-center gap-4 pt-4">
                    <button
                        onClick={() => addStep('email')}
                        className="px-4 py-2 rounded-full border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-600 font-medium transition flex items-center gap-2"
                    >
                        + Send Email
                    </button>
                    <button
                        onClick={() => addStep('wait')}
                        className="px-4 py-2 rounded-full border-2 border-gray-100 hover:border-gray-400 hover:bg-gray-50 text-gray-600 font-medium transition flex items-center gap-2"
                    >
                        + Wait Delay
                    </button>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button
                    text="Cancel"
                    variant="secondary"
                    onClick={() => router.back()}
                />
                <Button
                    text="Save Workflow"
                    onClick={saveWorkflow}
                />
            </div>
        </div>
    );
}
