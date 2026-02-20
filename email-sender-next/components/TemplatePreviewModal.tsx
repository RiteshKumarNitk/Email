
"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function TemplatePreviewModal({ template, onClose }: any) {
    if (!template) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white w-full max-w-4xl h-[85vh] rounded-xl flex flex-col shadow-2xl overflow-hidden"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg text-sm">📧</span>
                            {template.name}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition text-gray-500"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Email Simulation Header */}
                    <div className="bg-white border-b px-8 py-6 space-y-3">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                R
                            </div>
                            <div>
                                <h3 className="text-gray-900 font-medium">Ritesh &lt;user@example.com&gt;</h3>
                                <p className="text-gray-500 text-sm">to me</p>
                            </div>
                            <div className="ml-auto text-gray-400 text-xs">
                                Just now
                            </div>
                        </div>

                        <div className="pl-16">
                            <h1 className="text-2xl font-bold text-gray-900">{template.subject}</h1>
                        </div>
                    </div>

                    {/* Email Body */}
                    <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
                        <div className="max-w-3xl mx-auto bg-white shadow-sm min-h-[400px] rounded-lg overflow-hidden">
                            {/* Sandbox iframe would be safer for real world, but dangerouslySetInnerHTML is fine here */}
                            <div dangerouslySetInnerHTML={{ __html: template.html }} className="all-initial" />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm transition"
                        >
                            Close Preview
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
