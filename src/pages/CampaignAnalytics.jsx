import { useEffect, useState } from "react"
import { api } from "../api"

export default function CampaignAnalytics({ campaignId, onClose }) {
  const [summary, setSummary] = useState(null)
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!campaignId) return

    const load = async () => {
      const s = await api(`/campaigns/${campaignId}/analytics/summary`)
      const r = await api(`/campaigns/${campaignId}/analytics`)
      setSummary(s)
      setRows(r)
    }

    load()
  }, [campaignId])

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[700px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          Campaign Analytics
        </h2>

        {summary && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Stat label="Sent" value={summary.sent} />
            <Stat label="Failed" value={summary.failed} />
            <Stat label="Opened" value={summary.opened} />
            <Stat label="Clicked" value={summary.clicked} />
          </div>
        )}

        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Email</th>
              <th>Status</th>
              <th>Sent At</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-2">{r.email}</td>
                <td>{r.status}</td>
                <td>
                  {r.sentAt
                    ? new Date(r.sentAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded text-center">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
