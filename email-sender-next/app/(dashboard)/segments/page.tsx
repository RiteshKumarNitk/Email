
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import Button from "@/components/Button";
import { Trash2, Users, Calendar, Tag, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Segments() {
    const [segments, setSegments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const load = async () => {
        try {
            const data = await api("/segments");
            setSegments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const deleteSegment = async (id: string) => {
        if (!confirm("Are you sure you want to delete this segment?")) return;
        try {
            await api(`/segments/${id}`, { method: "DELETE" });
            showToast("Segment deleted successfully");
            load();
        } catch (err: any) {
            showToast(err.message || "Failed to delete segment", "error");
        }
    };

    return (
        <div className="space-y-6 relative">
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

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Smart Segments</h1>
                    <p className="text-sm text-gray-500 font-medium">Group your audience based on smart criteria</p>
                </div>
                <Link href="/segments/create">
                    <Button text="+ New Segment" />
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading segments...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {segments.map((s) => (
                        <motion.div
                            layout
                            key={s._id}
                            className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 relative flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{s.name}</h3>
                                <button
                                    onClick={() => deleteSegment(s._id)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Segment"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] leading-relaxed">
                                {s.description || "No description provided for this segment."}
                            </p>

                            <div className="mt-auto pt-6 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                                        <Users size={14} />
                                        {s.contactCount} Contacts
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                        <Calendar size={12} />
                                        {new Date(s.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 border-t border-gray-50 pt-4">
                                    {s.criteria?.tags?.length > 0 ? (
                                        s.criteria.tags.map((tag: string, i: number) => (
                                            <span key={i} className="flex items-center gap-1 text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-lg font-bold border border-gray-100">
                                                <Tag size={10} />
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[10px] text-gray-400 italic">No specific tag filters</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {segments.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <Users size={48} className="mx-auto text-gray-200 mb-4" />
                            <h3 className="text-gray-800 font-bold">No segments yet</h3>
                            <p className="text-gray-500 text-sm mt-1">Create your first segment to target specific users!</p>
                            <Link href="/segments/create" className="mt-4 inline-block text-indigo-600 font-bold text-sm hover:underline">
                                Get Started &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
