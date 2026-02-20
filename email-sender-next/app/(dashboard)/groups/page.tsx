
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Button from "@/components/Button";
import AIGroupAssistant from "@/components/AIGroupAssistant";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Trash2, Edit3, FolderOpen, Calendar, Mail, X, Check, Search, AlertCircle, CheckCircle, Plus } from "lucide-react";

export default function Groups() {
    const [groups, setGroups] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    const [showCreateVisible, setShowCreateVisible] = useState(false);
    const [editing, setEditing] = useState<any>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedContacts, setSelectedContacts] = useState(new Set());
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const load = async () => {
        try {
            const data = await api("/groups");
            setGroups(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error(err);
            setGroups([]);
            showToast(err.message || "Failed to load groups", "error");
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        try {
            const data = await api("/contacts");
            setContacts(Array.isArray(data) ? data : []);
        } catch {
            setContacts([]);
        }
    };

    useEffect(() => {
        load();
        loadContacts();
    }, []);

    const createGroup = async () => {
        if (!name.trim()) return showToast("Group name is required", "error");

        try {
            await api("/groups", {
                method: "POST",
                body: { name, description },
            });

            setName("");
            setDescription("");
            setShowCreateVisible(false);
            showToast("Group created successfully");
            load();
        } catch (err: any) {
            showToast(err.message || "Failed to create group", "error");
        }
    };

    const startEdit = (g: any) => {
        setEditing(g);
        setName(g.name);
        setDescription(g.description || "");
        const ids = g.contacts?.map((c: any) => c._id || c) || [];
        setSelectedContacts(new Set(ids));
    };

    const toggleContact = (id: string) => {
        const s = new Set(selectedContacts);
        s.has(id) ? s.delete(id) : s.add(id);
        setSelectedContacts(s);
    };

    const saveEdit = async () => {
        if (!name.trim()) return showToast("Group name is required", "error");

        try {
            await api(`/groups/${editing._id}`, {
                method: "PATCH",
                body: { name, description },
            });

            await api(`/groups/${editing._id}/contacts`, {
                method: "PATCH",
                body: {
                    contactIds: Array.from(selectedContacts),
                },
            });

            setEditing(null);
            setName("");
            setDescription("");
            setSelectedContacts(new Set());
            showToast("Group updated successfully");
            load();
        } catch (err: any) {
            showToast(err.message || "Failed to save group", "error");
        }
    };

    const deleteGroup = async (id: string) => {
        if (!confirm("Are you sure you want to delete this group?")) return;
        try {
            await api(`/groups/${id}`, { method: "DELETE" });
            showToast("Group deleted successfully");
            load();
        } catch (err: any) {
            showToast(err.message || "Failed to delete group", "error");
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.email.toLowerCase().includes(searchText.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20 relative">
            {/* TOAST SYSTEM */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        className={`fixed bottom-10 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border ${toast.type === 'error'
                                ? "bg-red-500 text-white border-red-400"
                                : "bg-teal-600 text-white border-teal-400"
                            }`}
                    >
                        {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Contact Groups</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Manage and organize your audience</p>
                </div>
                <button
                    onClick={() => setShowCreateVisible(true)}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Group
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            ) : groups.length === 0 ? (
                <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-gray-100 text-center space-y-4">
                    <FolderOpen size={64} className="mx-auto text-gray-100" />
                    <div className="max-w-xs mx-auto">
                        <h3 className="text-gray-800 font-bold text-lg">No groups here yet</h3>
                        <p className="text-gray-400 text-sm italic">Create your first group to start organizing your contacts effectively.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((g) => (
                        <motion.div
                            layout
                            key={g._id}
                            className="group bg-white border border-gray-100 rounded-[32px] p-8 hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-100 transition-all duration-300 relative flex flex-col justify-between min-h-[220px]"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                        <Users size={24} />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(g)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                            <Edit3 size={18} />
                                        </button>
                                        <button onClick={() => deleteGroup(g._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 truncate mb-1">
                                    {g.name}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed h-10">
                                    {g.description || "No description provided for this group."}
                                </p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-black text-indigo-400 uppercase tracking-widest">
                                    <Mail size={14} />
                                    {g.contacts?.length || 0} Members
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-300">
                                    <Calendar size={12} />
                                    {new Date(g.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* CREATE MODAL */}
            <AnimatePresence>
                {showCreateVisible && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-4xl p-10 shadow-2xl flex flex-col lg:flex-row gap-10"
                        >
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">New Contact Group</h2>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Setup your organizational bucket</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Group Name</label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Q1 Marketing Leads"
                                            className="w-full border-2 border-gray-50 bg-gray-50/50 px-5 py-3 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Internal Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="What is this group for?"
                                            className="w-full border-2 border-gray-50 bg-gray-50/50 px-5 py-3 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all h-24 resize-none font-medium text-gray-600"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowCreateVisible(false)}
                                        className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createGroup}
                                        className="flex-[2] px-4 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                                    >
                                        Establish Group
                                    </button>
                                </div>
                            </div>

                            <div className="w-full lg:w-80">
                                <AIGroupAssistant
                                    onApply={(data) => {
                                        setName(data.name);
                                        setDescription(data.description);
                                        showToast("Group concept applied by AI!");
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* EDIT MODAL / DRAWER */}
            <AnimatePresence>
                {editing && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[40px] w-full max-w-4xl p-10 shadow-2xl flex flex-col h-[85vh] overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Edit "{editing.name}"</h2>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Update group details and membership</p>
                                </div>
                                <button onClick={() => setEditing(null)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 overflow-hidden">
                                <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Group Name</label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full border-2 border-gray-50 bg-gray-50/50 px-5 py-3 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Internal Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full border-2 border-gray-50 bg-gray-50/50 px-5 py-3 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all h-24 resize-none font-medium text-gray-600"
                                        />
                                    </div>

                                    <div className="p-6 bg-indigo-50 rounded-[32px] border border-indigo-100/50">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Membership Insight</h4>
                                        <p className="text-[11px] text-indigo-900/60 font-medium leading-relaxed italic">
                                            Currently, this group contains {selectedContacts.size} unique members. You can search and toggle members on the right.
                                        </p>
                                    </div>
                                </div>

                                <div className="lg:col-span-7 flex flex-col overflow-hidden">
                                    <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 mb-4">
                                        <Search size={18} className="text-gray-400" />
                                        <input
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            placeholder="Find contact by email or name..."
                                            className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 flex-1 h-8"
                                        />
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {filteredContacts.length === 0 ? (
                                            <div className="py-20 text-center text-gray-300">
                                                <Users size={32} className="mx-auto mb-2 opacity-20" />
                                                <p className="text-xs font-black uppercase tracking-widest">No matching contacts</p>
                                            </div>
                                        ) : (
                                            filteredContacts.map((c) => (
                                                <label
                                                    key={c._id}
                                                    className={`flex items-center justify-between px-5 py-3 rounded-2xl border-2 transition-all cursor-pointer ${selectedContacts.has(c._id)
                                                            ? "bg-indigo-50 border-indigo-100 ring-2 ring-indigo-50"
                                                            : "bg-white border-transparent hover:border-gray-100"
                                                        }`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-700">{c.email}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{c.name || 'Anonymous User'}</span>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedContacts.has(c._id)}
                                                        onChange={() => toggleContact(c._id)}
                                                        className="hidden"
                                                    />
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedContacts.has(c._id)
                                                            ? "bg-indigo-600 border-indigo-600 text-white"
                                                            : "bg-white border-gray-200"
                                                        }`}>
                                                        {selectedContacts.has(c._id) && <Check size={14} strokeWidth={4} />}
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex justify-end gap-3 pt-6 border-t border-gray-50">
                                <button
                                    onClick={() => setEditing(null)}
                                    className="px-8 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200"
                                >
                                    Cancel Changes
                                </button>
                                <button
                                    onClick={saveEdit}
                                    className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                                >
                                    Save Group Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
