
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function CreateSegment() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [previewCount, setPreviewCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const checkCount = async () => {
        // Mock count for now as backend logic needs more work for preview
        // Ideally: POST /api/segments/preview with criteria
        // Here we just save and redirect
        setPreviewCount(100); // Mock
    };

    const saveSegment = async () => {
        setLoading(true);
        try {
            await api("/segments", {
                method: "POST",
                body: {
                    name,
                    description,
                    criteria: {
                        tags: tags.split(",").map((t) => t.trim()),
                    },
                },
            });
            router.push("/segments");
        } catch (error) {
            console.error(error);
            alert("Failed to create segment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Create New Segment</h1>

            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Segment Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border px-4 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. VIP Customers"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border px-4 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Describe who this segment targets..."
                    />
                </div>

                <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Filters</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                            <input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full border px-4 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="newsletter, vip, active"
                            />
                        </div>
                        {/* More filters can be added here */}
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-3">
                    <Button
                        text="Cancel"
                        variant="secondary"
                        onClick={() => router.back()}
                    />
                    <Button
                        text={loading ? "Saving..." : "Save Segment"}
                        onClick={saveSegment}
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
}
