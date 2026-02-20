
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Button from "@/components/Button";

export default function Settings() {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Add New
    const [form, setForm] = useState({
        host: "smtp.gmail.com",
        port: "587",
        user: "",
        pass: "",
        fromEmail: "",
    });
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

    const load = async () => {
        try {
            const data = await api("/smtp");
            setConfigs(Array.isArray(data) ? data : []);
        } catch {
            setConfigs([]);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const saveSMTP = async () => {
        setLoading(true);
        setMessage(null);

        if (!form.host || !form.port || !form.user || !form.pass) {
            setMessage({ type: "error", text: "Please fill all fields" });
            setLoading(false);
            return;
        }

        try {
            await api("/smtp", {
                method: "POST",
                body: { ...form, port: Number(form.port) },
            });

            setMessage({ type: "success", text: "✅ Server Added & Verified!" });
            setForm({ host: "smtp.gmail.com", port: "587", user: "", pass: "", fromEmail: "" });
            load();
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Failed" });
        } finally {
            setLoading(false);
        }
    };

    const removeSMTP = async (id: string) => {
        if (!confirm("Remove this SMTP server?")) return;
        try {
            await api("/smtp", {
                method: "DELETE",
                body: { id },
            });
            load();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">SMTP Rotation</h1>
                    <p className="text-gray-500 mt-1">
                        Add multiple SMTP servers. The system will rotate through them to increase delivery rates.
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {configs.map((c) => (
                    <div key={c._id} className="bg-white p-5 rounded-xl border flex flex-col justify-between shadow-sm">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-gray-800">{c.host}</h3>
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                    Verified
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{c.user}</p>
                            <p className="text-xs text-gray-400 mt-2 font-mono">Used: {c.usageCount || 0} times</p>
                        </div>
                        <button
                            onClick={() => removeSMTP(c._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium mt-4 self-end"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Add New */}
            <div className="bg-white p-8 rounded-xl border shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Add New Server</h3>

                {message && (
                    <div className={`p-4 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">SMTP Host</label>
                        <input
                            value={form.host}
                            onChange={(e) => setForm({ ...form, host: e.target.value })}
                            className="w-full border px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="smtp.example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Port</label>
                        <input
                            type="number"
                            value={form.port}
                            onChange={(e) => setForm({ ...form, port: e.target.value })}
                            className="w-full border px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="587"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Username</label>
                        <input
                            value={form.user}
                            onChange={(e) => setForm({ ...form, user: e.target.value })}
                            className="w-full border px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="user@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={form.pass}
                            onChange={(e) => setForm({ ...form, pass: e.target.value })}
                            className="w-full border px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="••••••"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">From Email (Optional)</label>
                        <input
                            value={form.fromEmail}
                            onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
                            className="w-full border px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Leave empty to use Username"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        text={loading ? "Verifying..." : "Add & Verify"}
                        onClick={saveSMTP}
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
}
