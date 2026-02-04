import { useEffect, useState, useRef } from "react"
import { api } from "../api"
import Button from "../components/Button"
import EditQueueModal from "../components/EditQueueModal"
import QueueRow from "../components/QueueRow"
import { useNavigate } from "react-router-dom"

/* ================= PREVIEW MODAL ================= */
function QueuePreviewModal({ row, onClose }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [onClose])

  if (!row) return null

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-[700px] max-h-[80vh] overflow-y-auto rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-2">Email Preview</h2>

        <div className="text-sm text-gray-600 mb-4">
          <b>To:</b> {row.email}
        </div>

        <div className="border rounded p-3 mb-4">
          <b>Subject:</b> {row.subject || "—"}
        </div>

        <div
          className="prose max-w-none border rounded p-4"
          dangerouslySetInnerHTML={{
            __html: row.html || "",
          }}
        />

        {row.footer && (
          <div
            className="prose max-w-none border-t mt-4 pt-4 text-sm text-gray-500"
            dangerouslySetInnerHTML={{ __html: row.footer }}
          />
        )}

        <div className="text-right mt-6">
          <Button text="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  )
}

/* ================= MAIN PAGE ================= */
export default function Queue() {
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState("all")
  const [editingRow, setEditingRow] = useState(null)
  const [previewRow, setPreviewRow] = useState(null)
  const [selected, setSelected] = useState([])
  const [importMode, setImportMode] = useState("append")

  const fileRef = useRef(null)
  const navigate = useNavigate()

  const normalizeStatus = (s) => s?.toUpperCase()

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      const data = await api("/email-queue")
      setRows(Array.isArray(data) ? data : [])
    } catch {
      setRows([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  /* ================= FILTER ================= */
  const filtered =
    filter === "all"
      ? rows
      : rows.filter((r) => normalizeStatus(r.status) === filter)

  /* ================= SELECTION ================= */
  const toggleRow = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selected.length === filtered.length) {
      setSelected([])
    } else {
      setSelected(filtered.map((r) => r._id))
    }
  }

  const selectedRows = rows.filter((r) => selected.includes(r._id))
  const hasInvalidSelection = selectedRows.some(
    (r) =>
      normalizeStatus(r.status) === "SENT" ||
      normalizeStatus(r.status) === "FAILED"
  )

  /* ================= SUMMARY ================= */
  const total = rows.length
  const drafts = rows.filter(
    (r) => normalizeStatus(r.status) === "DRAFT"
  ).length

  /* ================= ACTIONS ================= */
  const convertToCampaign = async () => {
    if (!selected.length) return alert("Select rows first")
    if (hasInvalidSelection)
      return alert("Only Draft emails allowed")

    await api("/email-queue/convert-to-campaign", {
      method: "POST",
      body: JSON.stringify({ queueIds: selected }),
    })

    alert("Campaign created 🚀")
    setSelected([])
    load()
    navigate("/campaigns")
  }

  const uploadCSV = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const form = new FormData()
    form.append("file", file)
    form.append("mode", importMode)

    await api("/email-queue/upload", {
      method: "POST",
      body: form,
    })

    e.target.value = ""
    load()
  }

  const deleteOne = async (id) => {
    if (!confirm("Delete email?")) return
    await api(`/email-queue/${id}`, { method: "DELETE" })
    load()
  }

  const deleteMany = async () => {
    if (!selected.length) return
    if (!confirm("Delete selected emails?")) return

    await api("/email-queue/delete-many", {
      method: "POST",
      body: JSON.stringify({ ids: selected }),
    })

    setSelected([])
    load()
  }

  const saveEdit = async (data) => {
    await api(`/email-queue/${editingRow._id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
    setEditingRow(null)
    load()
  }

  /* ================= UI ================= */
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Email Queue</h1>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className="flex gap-6 text-sm">
        <div>📦 Total: <b>{total}</b></div>
        <div>📝 Draft: <b>{drafts}</b></div>
        <div>✅ Selected: <b>{selected.length}</b></div>
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={uploadCSV}
          className="hidden"
        />

        <select
          value={importMode}
          onChange={(e) => setImportMode(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="append">Append</option>
          <option value="replace">Replace All</option>
        </select>

        <Button text="Upload CSV" onClick={() => fileRef.current.click()} />

        {selected.length > 0 && (
          <>
            <Button
              text="Convert to Campaign"
              disabled={hasInvalidSelection}
              onClick={convertToCampaign}
            />
            <Button
              variant="secondary"
              text="Delete Selected"
              onClick={deleteMany}
            />
          </>
        )}
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">
                <input
                  type="checkbox"
                  checked={
                    filtered.length > 0 &&
                    selected.length === filtered.length
                  }
                  onChange={toggleAll}
                />
              </th>
              <th>Email</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Source</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => (
              <QueueRow
                key={r._id}
                row={r}
                isSelected={selected.includes(r._id)}
                isActive={
                  previewRow?._id === r._id ||
                  editingRow?._id === r._id
                }
                onSelect={toggleRow}
                onPreview={() => setPreviewRow(r)}
                onEdit={() => setEditingRow(r)}
                onDelete={() => deleteOne(r._id)}
              />
            ))}
          </tbody>
        </table>
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
  )
}
