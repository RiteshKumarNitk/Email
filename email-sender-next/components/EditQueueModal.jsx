import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export default function EditQueueModal({ item, onSave, onClose }) {
  const boxRef = useRef(null)

  /* 🔒 GUARD — item undefined ho to render hi mat karo */
  if (!item) return null

  const [form, setForm] = useState({
    email: "",
    subject: "",
    html: "",
    footer: "",
    status: "draft",
  })

  /* 🧠 HYDRATE FORM (SAFE) */
  useEffect(() => {
    setForm({
      email: item.email || "",
      subject: item.subject || "",
      html: item.html || item.body || item.body_html || "",
      footer: item.footer || "",
      status: item.status || "draft",
    })
  }, [item])

  /* ESC to close */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  /* Outside click close */
  const handleOutside = (e) => {
    if (boxRef.current && !boxRef.current.contains(e.target)) {
      onClose()
    }
  }

  const update = (key, value) =>
    setForm((p) => ({ ...p, [key]: value }))

  const isInvalid = !form.email.trim() || !form.subject.trim()

  const save = () => {
    if (isInvalid) return
    const payload = { ...form }
    // If status is changed to queued from something else, reset retry count
    if (payload.status === "queued" && item.status !== "queued") {
      payload.retryCount = 0
    }
    onSave(payload)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onMouseDown={handleOutside}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        ref={boxRef}
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl overflow-hidden flex flex-col"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
      >
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">
              Refine Queue Transaction
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manual correction for outgoing communications</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
        </div>

        <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          {/* Email & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Recipient Identity *</label>
              <input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="target@example.com"
                className="w-full border-2 border-gray-100 bg-gray-50/30 px-4 py-2.5 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Transaction Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="w-full border-2 border-gray-100 bg-gray-50/30 px-4 py-2.5 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-gray-700 cursor-pointer"
              >
                <option value="draft">DRAFT (Awaiting Conversion)</option>
                <option value="queued">QUEUED (Ready to Send)</option>
                <option value="failed">FAILED (Last Attempt Errored)</option>
                <option value="sent">SENT (Completed)</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Internal Subject Line *</label>
            <input
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
              placeholder="Enter subject..."
              className="w-full border-2 border-gray-100 bg-gray-50/30 px-4 py-2.5 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Payload Content (HTML)</label>
            <textarea
              rows={8}
              value={form.html}
              onChange={(e) => update("html", e.target.value)}
              className="w-full border-2 border-gray-100 bg-gray-50/30 px-4 py-3 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-mono text-sm text-gray-600 resize-none h-48"
              placeholder="<p>Hello world...</p>"
            />
          </div>

          {/* Footer */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Footer Attachment</label>
            <textarea
              rows={2}
              value={form.footer}
              onChange={(e) => update("footer", e.target.value)}
              className="w-full border-2 border-gray-100 bg-gray-50/30 px-4 py-2.5 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm text-gray-500 resize-none"
              placeholder="Unsubscribe / copyright etc"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 border-t bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-100 transition-colors"
          >
            Abort
          </button>

          <button
            onClick={save}
            disabled={isInvalid}
            className={`px-8 py-2.5 rounded-2xl text-sm font-black transition-all shadow-xl ${isInvalid
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200/50"
              }`}
          >
            Synchronize Changes
          </button>
        </div>

      </motion.div>
    </motion.div>
  )
}
