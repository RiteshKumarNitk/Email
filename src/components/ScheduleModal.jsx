import { useState } from "react"
import Button from "./Button"

const TIMEZONES = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "Europe/London",
]

export default function ScheduleModal({ open, onClose, onDone }) {
  const [type, setType] = useState("one-time")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [day, setDay] = useState("Monday")
  const [timezone, setTimezone] = useState("Asia/Kolkata")

  if (!open) return null

const handleDone = () => {
  if (!time) {
    alert("Please select time")
    return
  }

  if (type === "one-time" && !date) {
    alert("Please select date")
    return
  }

  onDone({
    type,
    date,
    time,
    day,
    timezone,
  })

  onClose()
}
const getScheduleLabel = (c) => {
  if (!c.scheduledAt) return null

  if (c.scheduleType === "daily") return "Daily"
  if (c.scheduleType === "weekly")
    return `Weekly (${c.scheduleDay || "—"})`

  return "One Time"
}


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Schedule Email</h2>

        {/* TYPE */}
        <select
          className="w-full border p-2 rounded"
          value={type}
          onChange={(e) => {
            setType(e.target.value)
            if (!time) setTime("09:00")
          }}
        >
          <option value="one-time">One Time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>

        {/* DATE */}
        {type === "one-time" && (
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        )}

        {/* DAY */}
        {type === "weekly" && (
          <select
            className="w-full border p-2 rounded"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        )}

        {/* TIME */}
        <input
          type="time"
          className="w-full border p-2 rounded"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        {/* TIMEZONE */}
        <select
          className="w-full border p-2 rounded"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz}>{tz}</option>
          ))}
        </select>

        <div className="flex justify-end gap-3 pt-4">
          <Button text="Cancel" variant="secondary" onClick={onClose} />
          <Button text="Done" onClick={handleDone} />
        </div>
      </div>
    </div>
  )
}
