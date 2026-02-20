"use client";

import { useState } from "react";
import { Sparkles, Wand2, Zap, X, Check, Mail, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AIWorkflowAssistant({ onApply }) {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const generate = async () => {
        if (!prompt) return;
        setLoading(true);
        try {
            const res = await api("/ai", {
                method: "POST",
                body: { mode: "generate-workflow", prompt }
            });
            setResult(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-1 shadow-xl">
            <div className="bg-white rounded-[14px] p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 leading-tight">Automation Architect</h3>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">AI Workflow Generator</p>
                    </div>
                </div>

                {!result ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe your automation goal (e.g., 'A 3-day welcome sequence for new users')"
                                className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm focus:border-blue-500 outline-none transition-all resize-none h-24"
                            />
                            <div className="absolute bottom-3 right-3">
                                <Zap size={14} className="text-yellow-400 animate-pulse" />
                            </div>
                        </div>

                        <button
                            onClick={generate}
                            disabled={loading || !prompt}
                            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${loading
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98]"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Architecting...
                                </>
                            ) : (
                                <>
                                    <Wand2 size={16} />
                                    Generate Sequence
                                </>
                            )}
                        </button>

                        <div className="flex flex-wrap gap-2">
                            {["Welcome series", "Abandoned cart", "Post-purchase"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setPrompt(s)}
                                    className="px-3 py-1 bg-gray-50 hover:bg-blue-50 text-[10px] font-bold text-gray-500 hover:text-blue-600 rounded-full border border-gray-100 transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h4 className="font-black text-[10px] text-blue-400 uppercase tracking-widest mb-1">Recommended Plan</h4>
                                <p className="font-bold text-gray-800 text-sm leading-tight">{result.name}</p>
                            </div>
                            <button onClick={() => setResult(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-black text-[10px] text-blue-400 uppercase tracking-widest">Planned Steps</h4>
                            <div className="space-y-1.5">
                                {result.steps.map((step, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-blue-50">
                                        {step.type === 'email' ? <Mail size={12} className="text-blue-500" /> : <Clock size={12} className="text-gray-400" />}
                                        <span className="text-[11px] font-semibold text-gray-700">{step.name}</span>
                                        {step.type === 'wait' && (
                                            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded ml-auto">
                                                {step.payload.duration} {step.payload.unit}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                // Add unique IDs to steps before applying
                                const stepsWithIds = result.steps.map(s => ({
                                    ...s,
                                    id: crypto.randomUUID()
                                }));
                                onApply({ ...result, steps: stepsWithIds });
                                setResult(null);
                                setPrompt("");
                            }}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                        >
                            <Check size={14} />
                            Deploy Automation Steps
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
