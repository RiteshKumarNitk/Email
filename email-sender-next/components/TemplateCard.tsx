"use client";

import { motion } from "framer-motion";
import { Star, Send, Eye, Edit3, Copy, Trash2, LayoutTemplate } from "lucide-react";

export default function TemplateCard({ template, onFavorite, onUse, onEdit, onPreview, onClone, onDelete }: any) {
    const isVariant = template.name?.includes("(Variant)");

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between overflow-hidden h-full"
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <LayoutTemplate size={120} className="text-indigo-600" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {template.category && (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                                    {template.category}
                                </span>
                            )}
                            {isVariant && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider">
                                    Variant
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight truncate pr-2" title={template.name}>
                            {template.name}
                        </h3>
                        <div className="mt-2 text-xs text-gray-400 font-medium overflow-hidden">
                            <span className="text-gray-300 mr-1 uppercase text-[9px] font-black">Subject</span>
                            <p className="inline italic text-gray-500 truncate">{template.subject || "—"}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => onFavorite(template._id, template.isFavorite)}
                            className={`p-2 rounded-xl transition-all active:scale-90 ${template.isFavorite
                                    ? "bg-yellow-50 text-yellow-500 shadow-sm"
                                    : "bg-gray-50 text-gray-300 hover:text-yellow-500 hover:bg-yellow-50"
                                }`}
                            title="Toggle Favorite"
                        >
                            <Star size={18} fill={template.isFavorite ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative z-10 mt-6 flex flex-col gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => onUse(template)}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        <Send size={16} />
                        <span>Use This</span>
                    </button>

                    <button
                        onClick={() => onPreview(template)}
                        className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100 rounded-xl transition-all active:scale-95"
                        title="Preview"
                    >
                        <Eye size={18} />
                    </button>
                </div>

                <div className="flex justify-between gap-1 mt-1">
                    <div className="flex gap-1">
                        <button
                            onClick={() => onEdit(template)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                        >
                            <Edit3 size={14} />
                            Edit
                        </button>
                        <button
                            onClick={() => onClone(template._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-100"
                        >
                            <Copy size={14} />
                            Clone
                        </button>
                    </div>

                    <button
                        onClick={() => onDelete(template._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
