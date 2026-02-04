import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Input from "../components/Input"
import Button from "../components/Button"
import ScheduleModal from "../components/ScheduleModal"
import { api } from "../api"

export default function Compose() {
  const navigate = useNavigate()
  const location = useLocation()

  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [footer, setFooter] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)

  /* ================= PREFILL ================= */
  useEffect(() => {
    if (!location.state) return

    if (location.state.fromQueue || location.state.fromTemplate) {
      setTo(location.state.email || "")
      setSubject(location.state.subject || "")
      setBody(location.state.body || location.state.html || "")
      setFooter(location.state.footer || "")
    }
  }, [location.state])

  /* ================= VALIDATION ================= */
  const validate = () => {
    if (!to || !subject || !body) {
      alert("To, Subject and Body required")
      return false
    }
    return true
  }

  /* ================= ACTIONS ================= */
  const sendNow = async () => {
    if (!validate()) return

    try {
      setLoading(true)

      await api("/email/send", {
        method: "POST",
        body: JSON.stringify({
          email: to,          // ✅ STRING (comma separated)
          subject,
          html: body,
          footer,
        }),
      })

      navigate("/queue")
    } catch (e) {
      console.error(e)
      alert("Send failed")
    } finally {
      setLoading(false)
    }
  }

  const saveDraft = async () => {
    try {
      setLoading(true)

      await api("/email/draft", {
        method: "POST",
        body: JSON.stringify({
          email: to,
          subject,
          html: body,
          footer,
        }),
      })

      navigate("/campaigns")
    } catch (e) {
      alert("Draft save failed")
    } finally {
      setLoading(false)
    }
  }

  const scheduleMail = async (sendAt) => {
    if (!validate()) return

    try {
      setLoading(true)

      await api("/email/schedule", {
        method: "POST",
        body: JSON.stringify({
          email: to,
          subject,
          html: body,
          footer,
          sendAt,
        }),
      })

      navigate("/queue")
    } catch (e) {
      alert("Schedule failed")
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8">
      <h1 className="text-2xl font-semibold">Compose Email</h1>

      <div className="bg-white rounded-xl border p-6 space-y-6">
        <Input
          label="To (comma separated emails)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />

        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <div>
          <label className="text-sm font-medium">Email Body</label>
          <textarea
            className="w-full border rounded p-3 h-44"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Footer (optional)</label>
          <textarea
            className="w-full border rounded p-3 h-24"
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            text={loading ? "Sending..." : "Send Now"}
            disabled={loading}
            onClick={sendNow}
          />

          <Button
            text="Save Draft"
            variant="secondary"
            onClick={saveDraft}
          />

          <Button
            text="Schedule"
            variant="secondary"
            onClick={() => setShowSchedule(true)}
          />
        </div>
      </div>

      <ScheduleModal
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        onDone={({ scheduledAt }) => scheduleMail(scheduledAt)}
      />
    </div>
  )
}
