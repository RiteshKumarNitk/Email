
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import AIWorkflowAssistant from "@/components/AIWorkflowAssistant";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, ChevronLeft, Plus, Mail, Clock, Trash2, Settings2, Workflow as WorkflowIcon } from "lucide-react";

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
    const [steps, setSteps] = useState<Step[]>([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Load Dependencies
    useEffect(() => {
        api("/segments").then(setSegments).catch(console.error);
        api("/templates").then(setTemplates).catch(console.error);
    }, []);

    const addStep = (type: 'email' | 'wait') => {
        setSteps([...steps, {
            id: crypto.randomUUID(),
            type,
            name: type === 'email' ? 'Send Email' : 'Wait Delay',
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
        if (!name) return showToast("Enter a workflow name", "error");
        if (triggerType === 'segment_entry' && !selectedSegment) return showToast("Select a segment", "error");
        if (steps.length === 0) return showToast("Add at least one step", "error");

        setLoading(true);
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
            router.push("/workflows");
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Failed to create workflow", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
            {/* TOAST SYSTEM */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        className={`fixed bottom-10 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border ${toast.type === 'error'
                                ? "bg-red-500 text-white border-red-400"
                                : "bg-indigo-600 text-white border-indigo-400"
                            }`}
                    >
                        {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Automation Lab</h1>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Connect your marketing nodes</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 space-y-8">
                    {/* SETTINGS CARD */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings2 size={18} className="text-indigo-400" />
                            <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest">Workflow Trigger</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">Campaign Name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border-2 border-gray-50 bg-gray-50/30 px-5 py-3 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                                    placeholder="e.g. 7-Day Nurture Sequence"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">Entry Trigger</label>
                                <select
                                    value={triggerType}
                                    onChange={(e) => setTriggerType(e.target.value)}
                                    className="w-full border-2 border-gray-50 bg-gray-50/30 px-5 py-3 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-gray-700 appearance-none"
                                >
                                    <option value="segment_entry">Contact Joins Segment</option>
                                    <option value="manual">Manual Trigger Only</option>
                                </select>
                            </div>
                        </div>

                        {triggerType === 'segment_entry' && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">Source Audience</label>
                                <select
                                    value={selectedSegment}
                                    onChange={(e) => setSelectedSegment(e.target.value)}
                                    className="w-full border-2 border-gray-50 bg-gray-50/30 px-5 py-3 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-indigo-600 appearance-none"
                                >
                                    <option value="">Choose Targeted Segment</option>
                                    {segments.map((s) => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.contactCount} contacts)</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* STEPS CARD */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <WorkflowIcon size={18} className="text-indigo-400" />
                            <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest">Automation logic</h3>
                        </div>

                        <div className="space-y-6 relative">
                            {steps.map((step, index) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={step.id}
                                    className="relative pl-10 group"
                                >
                                    {/* Connection Node */}
                                    <div className="absolute left-0 top-6 w-5 h-5 rounded-full bg-white border-4 border-indigo-500 z-10 shadow-sm group-hover:scale-125 transition-transform"></div>
                                    {index < steps.length - 1 && (
                                        <div className="absolute left-[9px] top-11 w-0.5 h-[calc(100%+12px)] bg-indigo-100"></div>
                                    )}

                                    <div className="bg-gray-50/50 hover:bg-white p-6 rounded-2xl border-2 border-gray-50 hover:border-indigo-100 transition-all">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                {step.type === 'email' ? <Mail size={16} className="text-indigo-500" /> : <Clock size={16} className="text-gray-400" />}
                                                <span className="font-black text-[10px] uppercase tracking-widest text-gray-400">{step.type} node</span>
                                            </div>
                                            <button
                                                onClick={() => removeStep(index)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {step.type === 'email' && (
                                            <select
                                                value={step.payload.templateId}
                                                onChange={(e) => updateStep(index, 'templateId', e.target.value)}
                                                className="w-full border-2 border-gray-100 bg-white px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-indigo-500"
                                            >
                                                <option value="">Choose Email Template</option>
                                                {templates.map((t) => (
                                                    <option key={t._id} value={t._id}>{t.name}</option>
                                                ))}
                                            </select>
                                        )}

                                        {step.type === 'wait' && (
                                            <div className="flex gap-3 items-center">
                                                <input
                                                    type="number"
                                                    value={step.payload.duration}
                                                    onChange={(e) => updateStep(index, 'duration', parseInt(e.target.value))}
                                                    className="w-24 border-2 border-gray-100 bg-white px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-indigo-500"
                                                />
                                                <select
                                                    value={step.payload.unit}
                                                    onChange={(e) => updateStep(index, 'unit', e.target.value)}
                                                    className="flex-1 border-2 border-gray-100 bg-white px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-indigo-500"
                                                >
                                                    <option value="minutes">Minutes</option>
                                                    <option value="hours">Hours</option>
                                                    <option value="days">Days</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {steps.length === 0 && (
                                <div className="text-center py-16 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 text-gray-300">
                                    <Plus size={48} className="mx-auto mb-2 opacity-20" />
                                    <p className="font-black text-xs uppercase tracking-widest">Workspace is empty</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center gap-4 pt-8">
                            <button
                                onClick={() => addStep('email')}
                                className="px-6 py-2.5 rounded-2xl border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 text-indigo-600 font-bold text-xs uppercase tracking-widest transition flex items-center gap-2"
                            >
                                <Mail size={14} />+ Email
                            </button>
                            <button
                                onClick={() => addStep('wait')}
                                className="px-6 py-2.5 rounded-2xl border-2 border-gray-100 hover:border-gray-600 hover:bg-white text-gray-600 font-bold text-xs uppercase tracking-widest transition flex items-center gap-2"
                            >
                                <Clock size={14} />+ Delay
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            text="Discard Changes"
                            variant="secondary"
                            onClick={() => router.back()}
                        />
                        <Button
                            text={loading ? "Launching..." : "Deploy Workflow"}
                            onClick={saveWorkflow}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* AI PANEL */}
                <div className="w-full lg:w-80 space-y-6">
                    <AIWorkflowAssistant
                        onApply={(data) => {
                            setName(data.name);
                            setDescription(data.description);
                            setSteps(data.steps);
                            showToast("Automation steps architected by AI!");
                        }}
                    />

                    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Workflow Tips</h4>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                                <p className="text-[11px] text-blue-800/60 font-medium leading-relaxed">
                                    Strategic delays between emails significantly increase open rates by avoiding spam filters.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                                <p className="text-[11px] text-blue-800/60 font-medium leading-relaxed">
                                    AI-generated sequences include optimized timing based on industry benchmarks.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
