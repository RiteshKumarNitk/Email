
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import Button from "@/components/Button";

export default function Segments() {
    const [segments, setSegments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api("/segments")
            .then(setSegments)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Smart Segments</h1>
                <Link href="/segments/create">
                    <Button text="+ New Segment" />
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading segments...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {segments.map((s) => (
                        <div key={s._id} className="bg-white p-5 rounded-xl border hover:shadow-md transition">
                            <h3 className="font-semibold text-lg text-gray-800">{s.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{s.description || "No description"}</p>

                            <div className="mt-4 flex items-center justify-between">
                                <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">
                                    {s.contactCount} Contacts
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(s.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="mt-4 pt-4 border-t flex gap-2">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    Tags: {s.criteria?.tags?.join(", ") || "None"}
                                </span>
                            </div>
                        </div>
                    ))}
                    {segments.length === 0 && (
                        <div className="col-span-full text-center py-10 bg-white rounded-xl border border-dashed text-gray-500">
                            No segments found. create one to filter your audience.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
