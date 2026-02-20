
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import AITemplateGenerator from "@/components/AITemplateGenerator";
import { motion, AnimatePresence } from "framer-motion";
import AIPanel from "@/components/AIPanel";
import TemplateCard from "@/components/TemplateCard";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";

export default function Templates() {
    const router = useRouter();
    const [templates, setTemplates] = useState<any[]>([]);
    const [category, setCategory] = useState("all");
    const [showFav, setShowFav] = useState(false);

    const [editing, setEditing] = useState<any>(null);
    const [preview, setPreview] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    /* ================= LOAD ================= */
    const load = async () => {
        try {
            const data = await api("/templates");
            setTemplates(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    /* ================= FILTERS ================= */
    const filtered = templates.filter((t) => {
        const matchCategory =
            category === "all" || t.category === category;
        const matchFav = !showFav || t.isFavorite;
        return matchCategory && matchFav;
    });

    /* ================= FAVORITE ================= */
    const toggleFav = async (id: string, current: boolean) => {
        // Optimistic update
        setTemplates(prev => prev.map(t => t._id === id ? { ...t, isFavorite: !current } : t));

        try {
            await api(`/templates/${id}/favorite`, { method: "PATCH" });
        } catch (err) {
            console.error(err);
            load(); // Revert on error
        }
    };

    /* ================= SAVE EDIT ================= */
    const saveEdit = async () => {
        try {
            await api(`/templates/${editing._id}`, {
                method: "PATCH",
                body: {
                    subject: editing.subject,
                    html: editing.html,
                },
            });

            setEditing(null);
            load();
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= A/B CLONE ================= */
    const cloneAB = async (id: string) => {
        try {
            await api(`/templates/${id}/clone`, { method: "POST" });
            load();
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= AI IMPROVE SUBJECT ================= */
    const improveSubject = async () => {
        try {
            const res = await api("/ai", {
                method: "POST",
                body: {
                    mode: "improve-subject",
                    subject: editing.subject,
                },
            });

            setEditing({
                ...editing,
                subject: res.subject,
            });
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= USE TEMPLATE ================= */
    const useTemplate = (t: any) => {
        router.push(`/compose?templateId=${t._id}`);
    };

    return (
        <div className="space-y-6">
            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Templates</h1>

                <button
                    onClick={() => {
                        // Redirect to Builder
                        router.push("/templates/builder");
                    }}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
                >
                    + New Template
                </button>
            </div>

            {/* ================= FILTER BAR ================= */}
            <div className="flex gap-4">
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm"
                >
                    <option value="all">All Categories</option>
                    <option value="promo">Promo</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="transactional">Transactional</option>
                </select>

                <button
                    onClick={() => setShowFav(!showFav)}
                    className={`px-4 py-2 rounded-lg border font-medium transition shadow-sm ${showFav ? "bg-yellow-100 border-yellow-300 text-yellow-800" : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    {showFav ? "★ Favorites" : "☆ Favorites"}
                </button>
            </div>

            {/* ================= AI TEMPLATE GENERATOR ================= */}
            <AITemplateGenerator />

            {/* ================= TEMPLATE GRID ================= */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading templates...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filtered.map((t) => (
                            <TemplateCard
                                key={t._id}
                                template={t}
                                onFavorite={toggleFav}
                                onUse={useTemplate}
                                onEdit={(t: any) => {
                                    if (t.design) {
                                        router.push(`/templates/builder?id=${t._id}`);
                                    } else {
                                        setEditing(t);
                                    }
                                }}
                                onPreview={setPreview}
                                onClone={cloneAB}
                            />
                        ))}
                    </AnimatePresence>

                    {!loading && filtered.length === 0 && (
                        <div className="col-span-full text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                            No templates found matching your filters.
                        </div>
                    )}
                </div>
            )}

            {/* ================= PREVIEW MODAL ================= */}
            <TemplatePreviewModal
                template={preview}
                onClose={() => setPreview(null)}
            />

            {/* ================= EDIT MODAL (KEEP INLINE FOR NOW OR EXTRACT IF TOO BIG) ================= */}
            <AnimatePresence>
                {editing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                        onClick={() => setEditing(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl flex flex-col shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Edit Template
                                </h2>
                                <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-black">✕</button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-6 bg-white">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 block mb-2">Subject Line</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={editing.subject}
                                            onChange={(e) =>
                                                setEditing({
                                                    ...editing,
                                                    subject: e.target.value,
                                                })
                                            }
                                            className="flex-1 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        />
                                        <button
                                            onClick={improveSubject}
                                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium hover:opacity-90 transition shadow-sm"
                                        >
                                            ✨ AI Improve
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 block mb-2">Email Body (HTML)</label>
                                    <div className="relative">
                                        <textarea
                                            value={editing.html}
                                            onChange={(e) =>
                                                setEditing({
                                                    ...editing,
                                                    html: e.target.value,
                                                })
                                            }
                                            className="w-full border border-gray-300 p-4 h-80 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        />
                                    </div>
                                </div>

                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                    <AIPanel
                                        subject={editing.subject}
                                        html={editing.html}
                                        onApply={(res: any) => {
                                            if (res.mode === "improve-subject") {
                                                setEditing({
                                                    ...editing,
                                                    subject: res.data.subject,
                                                });
                                            }

                                            if (res.mode === "subject-variants") {
                                                setEditing({
                                                    ...editing,
                                                    subject: res.data.variants[0],
                                                });
                                            }

                                            if (res.mode === "rewrite-body") {
                                                setEditing({
                                                    ...editing,
                                                    html: res.data.html,
                                                });
                                            }
                                        }}
                                    />
                                </div>

                            </div>

                            <div className="p-6 border-t flex justify-end gap-3 bg-gray-50">
                                <button
                                    onClick={() => setEditing(null)}
                                    className="px-5 py-2.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={saveEdit}
                                    className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md transform active:scale-95 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
