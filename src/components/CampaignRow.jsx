export default function CampaignRow({
  campaign,
  onSend,
  onDelete,
  onPreview,
  onAnalytics,
  onSchedule,
}) {
  return (
    <tr className="border-b hover:bg-gray-50">
      {/* SUBJECT */}
      <td className="px-4 py-3 font-medium">
        {campaign.subject || "—"}
      </td>

      {/* STATUS */}
      <td className="px-4 py-3 capitalize">
        <span
          className={`px-2 py-1 rounded text-xs ${
            campaign.status === "draft"
              ? "bg-gray-100"
              : campaign.status === "sending"
              ? "bg-blue-100 text-blue-700"
              : campaign.status === "sent"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {campaign.status}
        </span>
      </td>

      {/* SOURCE */}
      <td className="px-4 py-3">
        {campaign.source || "Manual"}
      </td>

      {/* PROGRESS */}
      <td className="px-4 py-3 text-center">
        {campaign.successCount || 0}/{campaign.totalRecipients || 0}
      </td>

      {/* ACTIONS */}
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2 flex-wrap">
          {/* PREVIEW */}
          <button
            onClick={onPreview}
            className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
          >
            👁 Preview
          </button>

          {/* ANALYTICS */}
          <button
            onClick={onAnalytics}
            className="px-3 py-1 text-xs rounded bg-indigo-100 text-indigo-700"
          >
            📊 Stats
          </button>

          {/* DRAFT → SEND */}
          {campaign.status === "draft" && (
            <button
              onClick={onSend}
              className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              🚀 Send
            </button>
          )}

          {/* DRAFT → SCHEDULE */}
          {campaign.status === "draft" && onSchedule && (
            <button
              onClick={onSchedule}
              className="px-3 py-1 text-xs rounded bg-orange-100 text-orange-700"
            >
              ⏰ Schedule
            </button>
          )}

          {/* DELETE */}
          <button
            onClick={onDelete}
            className="px-3 py-1 text-xs rounded bg-red-100 text-red-700"
          >
            🗑 Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
