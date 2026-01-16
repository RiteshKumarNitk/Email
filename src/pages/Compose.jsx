import { useParams } from "react-router-dom";
import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import ScheduleModal from "../components/ScheduleModal";

export default function Compose() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleInfo, setScheduleInfo] = useState(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          {isEdit ? "Edit Campaign" : "Compose Email"}
        </h1>
        <p className="text-sm text-gray-500">
          Create, schedule or save email campaigns
        </p>
      </div>

      {/* Scheduled Info */}
      {scheduleInfo && (
        <div className="bg-green-50 border border-green-100 text-green-700 p-3 rounded text-sm">
          📅 Scheduled for <b>{scheduleInfo.date}</b> at{" "}
          <b>{scheduleInfo.time}</b>
        </div>
      )}

      {/* Card */}
      <div className="bg-white rounded-xl border p-6 space-y-6">
        {/* Sender */}
        <div>
          <h2 className="text-lg font-medium mb-3">Sender</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="From Name" />
            <Input label="Reply To" />
          </div>
        </div>

        {/* Recipients */}
        <div>
          <h2 className="text-lg font-medium mb-3">Recipients</h2>
          <Input label="To" />

          <div className="flex gap-4 text-sm text-blue-600 mt-2">
            <button onClick={() => setShowCC(!showCC)}>+ CC</button>
            <button onClick={() => setShowBCC(!showBCC)}>+ BCC</button>
          </div>

          {showCC && <Input label="CC" className="mt-3" />}
          {showBCC && <Input label="BCC" className="mt-3" />}
        </div>

        {/* Content */}
        <div>
          <h2 className="text-lg font-medium mb-3">Content</h2>
          <Input label="Subject" />

          <textarea
            className="w-full mt-3 border rounded-lg p-3 h-40"
            placeholder="Write your email here..."
          />

          <textarea
            className="w-full mt-3 border rounded-lg p-3 h-24"
            placeholder="Footer"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button text={isEdit ? "Update Campaign" : "Send Now"} />
          <Button
            text="Schedule"
            variant="secondary"
            onClick={() => setShowSchedule(true)}
          />
          <Button text="Save Draft" variant="secondary" />
        </div>
      </div>

      {/* ✅ ONLY ONE MODAL */}
      <ScheduleModal
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        onDone={(data) => setScheduleInfo(data)}
      />
    </div>
  );
}
