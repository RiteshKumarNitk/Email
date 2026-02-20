
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Button from "@/components/Button";
import EditQueueModal from "@/components/EditQueueModal";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import { Trash2, Eye, Edit2, ChevronLeft, ChevronRight, Search } from "lucide-react";

/* ================= PREVIEW MODALArray ================= */
function QueuePreviewModal({ row, onClose }: { row: any; onClose: () => void }) {
    useEffect(() => {
        const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", esc);
        return () => window.removeEventListener("keydown", esc);
    }, [onClose]);

    if (!row) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Email Preview</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl border">
                        <p className="text-sm text-gray-500 mb-1">To:</p>
                        <p className="font-medium text-gray-800">{row.email}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border">
                        <p className="text-sm text-gray-500 mb-1">Subject:</p>
                        <p className="font-medium text-gray-800">{row.subject || "—"}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500 mb-2 font-medium ml-1">Message Content:</p>
                        <div
                            className="prose prose-sm max-w-none border rounded-xl p-6 bg-white shadow-inner min-h-[200px]"
                            dangerouslySetInnerHTML={{ __html: row.html || "" }}
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ================= MAIN PAGE ================= */
export default function Queue() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [editingRow, setEditingRow] = useState<any>(null);
    const [previewRow, setPreviewRow] = useState<any>(null);
    const [importMode, setImportMode] = useState("append");

    const fileRef = useRef<HTMLInputElement>(null);

    /* ================= DATA LOADING ================= */
    const load = async () => {
        setLoading(true);
        try {
            const result = await api("/queue");
            setData(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error("Load failed:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    /* ================= ACTIONS ================= */
    const deleteOne = async (id: string) => {
        if (!confirm("Delete this email?")) return;
        try {
            await api(`/queue/${id}`, { method: "DELETE" });
            load();
        } catch (err) { console.error(err); }
    };

    const deleteSelected = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const selectedIds = selectedRows.map(row => row.original._id);

        if (!selectedIds.length) return;
        if (!confirm(`Delete ${selectedIds.length} selected emails?`)) return;

        try {
            await api("/queue/delete-many", {
                method: "POST",
                body: { ids: selectedIds },
            });
            setRowSelection({});
            load();
        } catch (err) { console.error(err); }
    };

    const convertSelectedToCampaign = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const selectedIds = selectedRows.map(row => row.original._id);

        const allowedStatuses = ["DRAFT", "FAILED"];
        if (selectedRows.some(row => !allowedStatuses.includes(row.original.status?.toUpperCase() || "DRAFT"))) {
            return alert("Only DRAFT or FAILED emails allowed for conversion");
        }

        try {
            await api("/campaigns/convert-to-campaign", {
                method: "POST",
                body: { queueIds: selectedIds },
            });
            alert("Campaign created 🚀");
            setRowSelection({});
            load();
            router.push("/campaigns");
        } catch (err) { console.error(err); }
    };

    const saveEdit = async (formData: any) => {
        try {
            await api(`/queue/${editingRow._id}`, {
                method: "PATCH",
                body: formData,
            });
            setEditingRow(null);
            load();
        } catch (err) { console.error(err); }
    };

    const handleUpload = () => fileRef.current?.click();

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`/api/queue/upload?mode=${importMode}`, {
                method: "POST",
                credentials: "same-origin",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");
            load();
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        } finally {
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    /* ================= TABLE LOGIC ================= */
    const filteredData = useMemo(() => {
        if (statusFilter === "all") return data;
        return data.filter(r => r.status?.toUpperCase() === statusFilter);
    }, [data, statusFilter]);

    const columnHelper = createColumnHelper<any>();

    const columns = [
        columnHelper.display({
            id: "select",
            header: ({ table }) => (
                <div className="px-1">
                    <input
                        type="checkbox"
                        className="rounded border-gray-300 w-4 h-4"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="px-1">
                    <input
                        type="checkbox"
                        className="rounded border-gray-300 w-4 h-4"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                    />
                </div>
            ),
        }),
        columnHelper.accessor("email", {
            header: "Recipient",
            cell: info => <span className="font-medium text-gray-700">{info.getValue()}</span>,
        }),
        columnHelper.accessor("subject", {
            header: "Subject",
            cell: info => <span className="text-gray-500 truncate max-w-[200px] block">{info.getValue() || "—"}</span>,
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: info => {
                const status = (info.getValue() || "DRAFT").toUpperCase();
                const colors: Record<string, string> = {
                    SENT: "bg-green-100 text-green-700",
                    DRAFT: "bg-gray-100 text-gray-600",
                    FAILED: "bg-red-100 text-red-700",
                    CONVERTED: "bg-indigo-100 text-indigo-700",
                };
                return (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || "bg-gray-100"}`}>
                        {status}
                    </span>
                );
            },
        }),
        columnHelper.display({
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setPreviewRow(row.original)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Preview"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => setEditingRow(row.original)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Edit"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => deleteOne(row.original._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        }),
    ];

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            rowSelection,
            globalFilter,
        },
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
    });

    const selectedCount = Object.keys(rowSelection).length;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Email Queue</h1>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center bg-white border rounded-xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            placeholder="Search emails..."
                            value={globalFilter ?? ""}
                            onChange={e => setGlobalFilter(e.target.value)}
                            className="bg-transparent outline-none text-sm w-64"
                        />
                    </div>
                </div>
            </div>

            {/* STATS & FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">📦</div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Total Emails</p>
                        <p className="text-lg font-bold text-gray-800">{data.length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-600">📝</div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Pending Drafts</p>
                        <p className="text-lg font-bold text-gray-800">{data.filter(r => r.status?.toUpperCase() === "DRAFT").length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl text-green-600">✅</div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Successfully Sent</p>
                        <p className="text-lg font-bold text-gray-800">{data.filter(r => r.status?.toUpperCase() === "SENT").length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 col-span-1">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none text-sm font-medium text-gray-700 cursor-pointer"
                    >
                        <option value="all">Display: All Items</option>
                        <option value="DRAFT">Display: Drafts Only</option>
                        <option value="SENT">Display: Sent Only</option>
                        <option value="FAILED">Display: Failures Only</option>
                    </select>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border shadow-sm">
                <div className="flex items-center gap-3">
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={onFileChange}
                    />
                    <div className="flex items-center bg-gray-50 border rounded-xl px-3 py-1.5 gap-2">
                        <span className="text-xs font-bold text-gray-400 border-r pr-2 uppercase">Import</span>
                        <select
                            value={importMode}
                            onChange={(e) => setImportMode(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs font-semibold text-gray-700 cursor-pointer"
                        >
                            <option value="append">Append</option>
                            <option value="replace">Replace All</option>
                        </select>
                    </div>
                    <Button text="Upload CSV" onClick={handleUpload} />
                </div>

                <div className="flex items-center gap-2">
                    {selectedCount > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                            <span className="text-sm font-semibold text-gray-500 mr-2">{selectedCount} Selected</span>
                            <Button
                                text="Convert to Campaign"
                                onClick={convertSelectedToCampaign}
                            />
                            <button
                                onClick={deleteSelected}
                                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm rounded-xl transition"
                            >
                                Delete Selected
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-gray-500 font-medium">Loading Queue...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map(row => (
                                    <tr
                                        key={row.id}
                                        className={`hover:bg-indigo-50/30 transition-colors ${row.getIsSelected() ? 'bg-indigo-50' : ''}`}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="p-4">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-gray-500 font-medium">
                                        No emails found in your queue
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <Button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            text="Previous"
                        />
                        <Button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            text="Next"
                        />
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page <span className="font-bold">{table.getState().pagination.pageIndex + 1}</span> of{" "}
                                <span className="font-bold">{table.getPageCount()}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500 mr-2">Rows per page:</span>
                                <select
                                    value={table.getState().pagination.pageSize}
                                    onChange={e => table.setPageSize(Number(e.target.value))}
                                    className="text-xs font-bold bg-transparent border-none outline-none cursor-pointer text-gray-700"
                                >
                                    {[10, 20, 30, 40, 50, 100].map(pageSize => (
                                        <option key={pageSize} value={pageSize}>
                                            {pageSize}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px overflow-hidden border">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="relative inline-flex items-center px-2 py-2 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="relative inline-flex items-center px-2 py-2 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition border-l"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {editingRow && (
                <EditQueueModal
                    item={editingRow}
                    onClose={() => setEditingRow(null)}
                    onSave={saveEdit}
                />
            )}

            {previewRow && (
                <QueuePreviewModal
                    row={previewRow}
                    onClose={() => setPreviewRow(null)}
                />
            )}
        </div>
    );
}

