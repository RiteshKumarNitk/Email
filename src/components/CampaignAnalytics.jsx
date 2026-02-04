import { useEffect } from "react"

export default function CampaignAnalytics({ campaign, onClose }) {
  if (!campaign) return null

  const sent = campaign.successCount || 0
  const failed = campaign.failureCount || 0
  const total = sent + failed
  const successRate = total ? Math.round((sent / total) * 100) : 0

  /* ESC close */
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[480px] rounded-2xl p-6 shadow-xl"
      >
        {/* HEADER */}
        <h2 className="text-xl font-semibold mb-1">
          Campaign Analytics
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          {campaign.subject || "—"}
        </p>

        {/* STATS */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>📤 Sent</span>
            <b>{sent}</b>
          </div>

          <div className="flex justify-between">
            <span>❌ Failed</span>
            <b>{failed}</b>
          </div>

          <div className="flex justify-between">
            <span>📦 Total</span>
            <b>{total}</b>
          </div>

          <div className="flex justify-between">
            <span>✅ Success Rate</span>
            <b>{successRate}%</b>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>

        {/* ACTION */}
        <div className="text-right mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
