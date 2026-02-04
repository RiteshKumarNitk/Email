import { useState } from "react"

export default function CampaignScheduleModal({ onSave, onClose }) {
  const [rate, setRate] = useState(60)
  const [time, setTime] = useState("")

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">
          Schedule Campaign
        </h2>

        <label className="text-sm">Emails per minute</label>
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="text-sm">Send at</label>
        <input
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ rate, time })}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
