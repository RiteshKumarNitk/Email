
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import CsvUploadModal from "@/components/CsvUploadModal";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function Contacts() {
    const router = useRouter();
    const [contacts, setContacts] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [search, setSearch] = useState("");
    const [groupFilter, setGroupFilter] = useState("All");

    const [showCsv, setShowCsv] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editContact, setEditContact] = useState(null);

    /* ================= LOAD ================= */
    const load = async () => {
        try {
            const [c, g] = await Promise.all([
                api("/contacts"),
                api("/groups"),
            ]);
            setContacts(Array.isArray(c) ? c : []);
            setGroups(Array.isArray(g) ? g : []);
        } catch {
            setContacts([]);
            setGroups([]);
        }
    };

    useEffect(() => {
        load();
    }, []);

    /* ================= FILTER ================= */
    const filtered = contacts.filter((c) => {
        const matchGroup =
            groupFilter === "All" || c.groupId === groupFilter || c.groupName === groupFilter;

        const matchSearch =
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase());

        return matchSearch && matchGroup;
    });

    /* ================= BULK ================= */
    const toggleAll = (checked: boolean) => {
        setSelected(checked ? filtered.map((c) => c._id) : []);
    };

    const toggleOne = (id: string) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    /* ================= CRUD ================= */
    const deleteOne = async (id: string) => {
        if (!confirm("Delete this contact?")) return;
        try {
            await api(`/contacts/${id}`, { method: "DELETE" });
            load();
        } catch (e) { console.error(e); }
    };

    const bulkDelete = async () => {
        if (!selected.length) return;
        if (!confirm(`Delete ${selected.length} contacts?`)) return;

        try {
            await api("/contacts/delete-many", {
                method: "POST",
                body: { ids: selected }
            });
            setSelected([]);
            load();
        } catch (e) {
            console.error(e);
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
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
                    <p className="text-sm text-gray-500">Manage your audience</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCsv(true)}
                        className="px-4 py-2 rounded-lg bg-white border text-gray-700 font-medium hover:bg-gray-50 shadow-sm"
                    >
                        Import CSV
                    </button>
                    <button
                        onClick={() => router.push("/contacts/new")} // Or modal
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm"
                    >
                        Add Contact
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <p className="text-sm text-gray-500">Total Contacts</p>
                    <p className="text-3xl font-bold text-gray-800">{contacts.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <p className="text-sm text-gray-500">Groups</p>
                    <p className="text-3xl font-bold text-gray-800">{groups.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <p className="text-sm text-gray-500">Selected</p>
                    <p className="text-3xl font-bold text-indigo-600">{selected.length}</p>
                </div>
            </div>

            {/* FILTER */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm items-center">
                <input
                    className="px-4 py-2 border rounded-lg w-full md:w-72 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Search name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="px-4 py-2 border rounded-lg w-full md:w-48 outline-none"
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                >
                    <option value="All">All Groups</option>
                    {groups.map((g) => (
                        <option key={g._id} value={g._id}>{g.name}</option>
                    ))}
                </select>

                {selected.length > 0 && (
                    <div className="flex gap-2 ml-auto">
                        <select
                            className="px-4 py-2 border rounded-lg outline-none bg-indigo-50 text-indigo-700 font-bold text-sm"
                            onChange={async (e) => {
                                const groupId = e.target.value;
                                if (!groupId) return;
                                try {
                                    await api("/contacts/bulk-group", {
                                        method: "POST",
                                        body: { ids: selected, groupId }
                                    });
                                    setSelected([]);
                                    load();
                                    showToast("Contacts moved to group");
                                } catch (err: any) {
                                    showToast(err.message || "Failed to move contacts", "error");
                                }
                            }}
                        >
                            <option value="">Move to Group...</option>
                            {groups.map(g => (
                                <option key={g._id} value={g._id}>{g.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={bulkDelete}
                            className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200"
                        >
                            Delete Selected
                        </button>
                    </div>
                )}
            </div>

            {/* TABLE */}
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={selected.length === filtered.length && filtered.length > 0}
                                    onChange={(e) => toggleAll(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                ,</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Group</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {filtered.map((c) => (
                            <tr key={c._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(c._id)}
                                        onChange={() => toggleOne(c._id)}
                                        className="rounded border-gray-300"
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">{c.name || "—"}</td>
                                <td className="px-6 py-4 text-gray-600">{c.email}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gray-100 italic">
                                        {groups.find(g => g._id === c.groupId)?.name || "Unassigned"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button
                                        onClick={() => {
                                            // Edit logic
                                        }}
                                        className="text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteOne(c._id)}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    No contacts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CsvUploadModal
                open={showCsv}
                onClose={() => setShowCsv(false)}
                onImported={() => load()}
            />
        </div>
    );
}
