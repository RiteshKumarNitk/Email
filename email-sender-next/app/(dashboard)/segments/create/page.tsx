
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import AISegmentAssistant from "@/components/AISegmentAssistant";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, ChevronLeft } from "lucide-react";

export default function CreateSegment() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const saveSegment = async () => {
        if (!name) return showToast("Please enter a segment name", "error");

        setLoading(true);
        try {
            await api("/segments", {
                method: "POST",
                body: {
                    name,
                    description,
                    criteria: {
                        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                    },
                },
            });
            router.push("/segments");
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Failed to create segment", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 relative">
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
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Create Smart Segment</h1>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Build your targeted audience</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* FORM PANEL */}
                <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                    <div className="space-y-1">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Segment Identity</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border-2 border-gray-50 bg-gray-50/30 px-5 py-3 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                            placeholder="e.g. VIP Customers 2024"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Detailed Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border-2 border-gray-50 bg-gray-50/30 px-5 py-3 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none h-32 font-medium text-gray-600 placeholder:text-gray-300"
                            placeholder="Briefly describe who this segment includes..."
                        />
                    </div>

                    <div className="pt-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-px bg-gray-100 flex-1"></div>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Audience Filter Logic</span>
                            <div className="h-px bg-gray-100 flex-1"></div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Filter Tags</label>
                            <input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full border-2 border-gray-50 bg-gray-50/30 px-5 py-3 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-mono text-sm text-indigo-600 placeholder:text-gray-300"
                                placeholder="newsletter, vip, active (comma separated)"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 gap-3">
                        <Button
                            text="Discard"
                            variant="secondary"
                            onClick={() => router.back()}
                        />
                        <Button
                            text={loading ? "Creating..." : "Launch Segment"}
                            onClick={saveSegment}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* AI ASSISTANT PANEL */}
                <div className="w-full lg:w-80">
                    <AISegmentAssistant
                        onApply={(data) => {
                            setName(data.name);
                            setDescription(data.description);
                            setTags(data.tags.join(", "));
                            showToast("Segment details applied by AI!");
                        }}
                    />

                    <div className="mt-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                        <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-3">Audience Insights</h4>
                        <p className="text-xs text-indigo-900/60 leading-relaxed font-medium">
                            Use the AI assistant to automatically generate optimized naming and tagging based on your marketing goals.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
