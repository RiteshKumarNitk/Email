
"use client";

import { motion } from "framer-motion";

export default function TemplateCard({ template, onFavorite, onUse, onEdit, onPreview, onClone }: any) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white border rounded-xl p-5 hover:shadow-lg transition space-y-4 flex flex-col justify-between group"
        >
            <div>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 mr-2">
                        <h3 className="font-semibold text-gray-800 truncate text-lg">{template.name}</h3>
                        <p className="text-sm text-gray-500 truncate font-mono bg-gray-50 p-1 rounded mt-1">
                            Subject: {template.subject}
                        </p>
                    </div>

                    <button
                        onClick={() => onFavorite(template._id, template.isFavorite)}
                        className={`text-2xl focus:outline-none transition-transform active:scale-90 ${template.isFavorite ? "text-yellow-400" : "text-gray-200 group-hover:text-gray-300 hover:!text-yellow-400"
                            }`}
                        title="Toggle Favorite"
                    >
                        ★
                    </button>
                </div>
            </div>

            <div className="flex gap-2 text-sm flex-wrap mt-auto pt-4 border-t border-gray-100">
                <button
                    onClick={() => onUse(template)}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm"
                >
                    Use
                </button>

                <button
                    onClick={() => onPreview(template)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition font-medium"
                >
                    Preview
                </button>

                <button
                    onClick={() => onEdit(template)}
                    className="px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                    title="Edit"
                >
                    ✏️
                </button>

                <button
                    onClick={() => onClone(template._id)}
                    className="px-3 py-2 rounded-lg text-purple-600 hover:bg-purple-50 transition"
                    title="Create A/B Variant"
                >
                    A/B
                </button>
            </div>
        </motion.div>
    );
}
