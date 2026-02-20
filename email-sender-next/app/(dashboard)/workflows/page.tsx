"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Play, RotateCw } from "lucide-react";
import Link from "next/link";
import Button from "@/components/Button";

export default function Workflows() {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const load = () => {
        setLoading(true);
        api("/workflows")
            .then(setWorkflows)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const forceProcess = async () => {
        if (!confirm("Force process due workflow steps? (Simulates Cron Job)")) return;
        setProcessing(true);
        try {
            await api("/cron/workflows");
            alert("Processor ran successfully.");
            load();
        } catch (error) {
            console.error(error);
            alert("Processor failed");
        } finally {
            setProcessing(false);
        }
    };

    const triggerEnrollment = async (id: string, name: string) => {
        if (!confirm(`Enroll contacts from the configured segment for "${name}"? This will activate the workflow if it's draft.`)) return;

        try {
            const res = await api(`/workflows/${id}/enroll`, { method: "POST" });
            alert(res.message);
            load();
        } catch (error) {
            console.error(error);
            alert("Failed to trigger enrollment");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Automated Workflows</h1>
                <div className="flex gap-2">
                    <button
                        onClick={forceProcess}
                        disabled={processing}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 text-sm font-medium transition"
                        title="Manually run the background processor (Simulate Cron)"
                    >
                        <RotateCw size={16} className={processing ? "animate-spin" : ""} />
                        {processing ? "Processing..." : "Run Processor"}
                    </button>
                    <Link href="/workflows/create">
                        <Button text="+ New Workflow" />
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading workflows...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workflows.map((w) => (
                        <div key={w._id} className="bg-white p-5 rounded-xl border hover:shadow-md transition relative group">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-lg text-gray-800">{w.name}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize
                                    ${w.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {w.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{w.description || "No description"}</p>

                            <div className="mt-4 flex gap-4 text-xs text-gray-600">
                                <div className="flex flex-col">
                                    <span className="font-bold">{w.stats?.enrolled || 0}</span>
                                    <span>Enrolled</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold">{w.stats?.completed || 0}</span>
                                    <span>Completed</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-500">Steps: {w.steps?.length || 0}</span>
                                {w.trigger.type === 'segment_entry' && (
                                    <button
                                        onClick={() => triggerEnrollment(w._id, w.name)}
                                        className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-2 py-1 rounded"
                                        title="Manually enroll current contacts from segment"
                                    >
                                        <Play size={12} /> Run Now
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {workflows.length === 0 && (
                        <div className="col-span-full text-center py-10 bg-white rounded-xl border border-dashed text-gray-500">
                            No workflows found. Create your first automation!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
