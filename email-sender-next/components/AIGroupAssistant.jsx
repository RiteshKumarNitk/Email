"use client";

import { useState } from "react";
import { Sparkles, Wand2, Zap, X, Check, Users } from "lucide-react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AIGroupAssistant({ onApply }) {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const generate = async () => {
        if (!prompt) return;
        setLoading(true);
        try {
            const res = await api("/ai", {
                method: "POST",
                body: { mode: "generate-group", prompt }
            });
            setResult(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-1 shadow-xl">
            <div className="bg-white rounded-[14px] p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-teal-100 text-teal-600 rounded-xl">
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 leading-tight">Group Assistant</h3>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">AI Organizational Tool</p>
                    </div>
                </div>

                {!result ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g. 'A group for our high-potential leads'"
                                className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm focus:border-teal-500 outline-none transition-all resize-none h-24"
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
                                    : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200 active:scale-[0.98]"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Designing...
                                </>
                            ) : (
                                <>
                                    <Wand2 size={16} />
                                    Identify Group
                                </>
                            )}
                        </button>

                        <div className="flex flex-wrap gap-2">
                            {["Team members", "VIP leads", "Event attendees"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setPrompt(s)}
                                    className="px-3 py-1 bg-gray-50 hover:bg-teal-50 text-[10px] font-bold text-gray-500 hover:text-teal-600 rounded-full border border-gray-100 transition-colors"
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
                        className="space-y-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h4 className="font-black text-[10px] text-teal-400 uppercase tracking-widest mb-1">Suggested Name</h4>
                                <p className="font-bold text-gray-800 text-sm">{result.name}</p>
                            </div>
                            <button onClick={() => setResult(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div>
                            <h4 className="font-black text-[10px] text-teal-400 uppercase tracking-widest mb-1">Description</h4>
                            <p className="text-xs text-gray-600 leading-relaxed italic">{result.description}</p>
                        </div>

                        <button
                            onClick={() => {
                                onApply(result);
                                setResult(null);
                                setPrompt("");
                            }}
                            className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-teal-700 transition-all shadow-md shadow-teal-100"
                        >
                            <Check size={14} />
                            Apply AI Details
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
