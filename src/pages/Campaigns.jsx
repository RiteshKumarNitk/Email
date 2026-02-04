import { useEffect, useState } from "react"
import { api } from "../api"
import CampaignRow from "../components/CampaignRow"
import ContactSelector from "../components/ContactSelector"
import TemplatePicker from "../components/TemplatePicker"
import CampaignAnalytics from "../components/CampaignAnalytics"

/* ================= PREVIEW MODAL ================= */
function CampaignPreviewModal({ campaign, onClose }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [onClose])

  if (!campaign) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white w-[700px] max-h-[80vh] overflow-y-auto rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Campaign Preview</h2>

        <div className="mb-3 text-sm text-gray-600">
          <b>Subject:</b> {campaign.subject || "—"}
        </div>

        <div
          className="prose max-w-none border rounded p-4"
          dangerouslySetInnerHTML={{
            __html: campaign.html || "",
          }}
        />

        <div className="text-right mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================= SCHEDULE MODAL ================= */
function CampaignScheduleModal({ campaign, onClose, onSave }) {
  const [time, setTime] = useState("")

  const submit = () => {
    if (!time) {
      alert("Select date & time")
      return
    }
    onSave({ time })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white w-[420px] rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Schedule Campaign</h2>

        <label className="text-sm">Send At</label>
        <input
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-6"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================= MAIN ================= */
export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [openMenu, setOpenMenu] = useState(null)

  const [showTemplates, setShowTemplates] = useState(false)
  const [previewCampaign, setPreviewCampaign] = useState(null)
  const [analyticsCampaign, setAnalyticsCampaign] = useState(null)

  const [showContacts, setShowContacts] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  const [scheduleCampaign, setScheduleCampaign] = useState(null)

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      const data = await api("/campaigns")
      setCampaigns(Array.isArray(data) ? data : [])
    } catch {
      setCampaigns([])
    }
  }

  useEffect(() => {
    load()
    const i = setInterval(load, 5000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setOpenMenu(null)
    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [])

  /* ================= ACTIONS ================= */

  const deleteCampaign = async (id) => {
    if (!confirm("Delete campaign?")) return
    await api(`/campaigns/${id}`, { method: "DELETE" })
    setOpenMenu(null)
    load()
  }

const sendCampaign = async (campaign) => {
  setOpenMenu(null)

  // ✅ IF recipients already attached → DIRECT SEND
  if (
    campaign.recipientsSnapshot ||
    campaign.totalRecipients > 0
  ) {
    await api(`/campaigns/${campaign._id}/send-now`, {
      method: "POST",
    })

    load()
    return
  }

  // ❌ ONLY manual + no recipients → open selector
  setSelectedCampaign(campaign._id)
  setShowContacts(true)
}


  // 🔥 CONTACT CONFIRM → SAVE + SEND
  const attachAndSend = async ({ contactIds, groupIds }) => {
    if (!selectedCampaign) return

    await api(`/campaigns/${selectedCampaign}/recipients/save`, {
      method: "POST",
      body: JSON.stringify({
        contactIds,
        groupIds,
        excludeContactIds: [],
      }),
    })

    await api(`/campaigns/${selectedCampaign}/send-now`, {
      method: "POST",
    })

    setShowContacts(false)
    setSelectedCampaign(null)
    load()
  }

  // 🔥 SCHEDULE
  const saveSchedule = async ({ time }) => {
  await api(`/campaigns/${scheduleCampaign._id}/reschedule`, {
    method: "POST",
    body: JSON.stringify({
      scheduledAt: new Date(time).toISOString(),
    }),
  })

  setScheduleCampaign(null)
  load()
}


  /* ================= FILTER ================= */
  const filtered = campaigns.filter((c) => {
    const matchText = c.subject?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || c.status === statusFilter
    return matchText && matchStatus
  })

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-[#f7f8fa] min-h-screen space-y-6">
      {/* HEADER */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowTemplates(true)}
          className="px-4 py-2 rounded bg-indigo-600 text-white text-sm"
        >
          + New Campaign
        </button>
      </div>

      {/* FILTER */}
      <div className="flex gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subject..."
          className="px-4 py-2 border rounded w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="sending">Sending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-y-auto max-h-[70vh]">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <CampaignRow
                key={c._id}
                campaign={c}
                isOpen={openMenu === c._id}
                onToggle={(id) =>
                  setOpenMenu(openMenu === id ? null : id)
                }
                onSend={() => sendCampaign(c)}
                onDelete={() => deleteCampaign(c._id)}
                onPreview={() => setPreviewCampaign(c)}
                onAnalytics={() => setAnalyticsCampaign(c)}
                onSchedule={
                  c.status === "draft"
                    ? () => setScheduleCampaign(c)
                    : undefined
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {scheduleCampaign && (
        <CampaignScheduleModal
          campaign={scheduleCampaign}
          onClose={() => setScheduleCampaign(null)}
          onSave={saveSchedule}
        />
      )}

      {showContacts && (
        <ContactSelector
          onSelect={attachAndSend}
          onClose={() => setShowContacts(false)}
        />
      )}

      {previewCampaign && (
        <CampaignPreviewModal
          campaign={previewCampaign}
          onClose={() => setPreviewCampaign(null)}
        />
      )}

      {analyticsCampaign && (
        <CampaignAnalytics
          campaign={analyticsCampaign}
          onClose={() => setAnalyticsCampaign(null)}
        />
      )}

      {showTemplates && (
        <TemplatePicker onClose={() => setShowTemplates(false)} />
      )}
    </div>
  )
}
