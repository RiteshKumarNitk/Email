import { useState } from "react";
import Button from "./Button";

const TIMEZONES = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "Europe/London",
];

export default function ScheduleModal({ open, onClose, onDone }) {
  const [type, setType] = useState("one-time"); // one-time | daily | weekly
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [day, setDay] = useState("Monday");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  if (!open) return null;

  const handleDone = () => {
    onDone({
      type,
      date,
      time,
      day,
      timezone,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6 shadow space-y-4">
        <h2 className="text-lg font-semibold">Schedule Email</h2>

        {/* Schedule Type */}
        <div>
          <label className="block text-sm mb-1">Schedule Type</label>
          <select
            className="w-full border p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="one-time">One Time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        {/* Date (only for one-time) */}
        {type === "one-time" && (
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        )}

        {/* Day (only for weekly) */}
        {type === "weekly" && (
          <div>
            <label className="block text-sm mb-1">Day</label>
            <select
              className="w-full border p-2 rounded"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
              <option>Sunday</option>
            </select>
          </div>
        )}

        {/* Time */}
        <div>
          <label className="block text-sm mb-1">Time</label>
          <input
            type="time"
            className="w-full border p-2 rounded"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm mb-1">Timezone</label>
          <select
            className="w-full border p-2 rounded"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz}>{tz}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button text="Cancel" variant="secondary" onClick={onClose} />
          <Button text="Done" onClick={handleDone} />
        </div>
      </div>
    </div>
  );
}
