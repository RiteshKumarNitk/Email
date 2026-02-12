import { useState } from "react";
import { api } from "../api";
import Button from "../components/Button";

export default function Settings() {
  const [form, setForm] = useState({
    host: "smtp.gmail.com",
    port: "587", // string rakha input ke liye (587 TLS ke liye default)
    user: "",
    pass: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveSMTP = async () => {
    setLoading(true);
    setMessage(null);

    // Validation
    if (!form.host.trim() || !form.port.trim() || !form.user.trim() || !form.pass.trim()) {
      setMessage({
        type: "error",
        text: "Sab fields bhar do bhai",
      });
      setLoading(false);
      return;
    }

    const payload = {
      host: form.host.trim(),
      port: Number(form.port.trim()),
      user: form.user.trim(),
      pass: form.pass.trim(),
    };

    console.log("Sending SMTP payload:", payload);

    try {
      await api("/smtp", {
        method: "POST",
        body: payload, // object bhej – api.js stringify karega
      });

      setMessage({
        type: "success",
        text: "✅ SMTP verified & saved successfully!",
      });

      setForm({ ...form, pass: "" });
    } catch (err) {
      console.error("SMTP save error:", err);
      let errorText = err.message || "SMTP setup failed";

      if (errorText.includes("JSON")) {
        errorText = "Invalid data format – check all fields";
      } else if (errorText.includes("400")) {
        errorText = "Invalid SMTP details – check host/port/user/pass";
      } else if (errorText.includes("500")) {
        errorText = "Server error – check backend logs on Render";
      }

      setMessage({
        type: "error",
        text: errorText,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">SMTP Settings</h1>

      <p className="text-sm text-gray-600">
        Configure your email SMTP. Emails will be sent from this address.
      </p>

      {message && (
        <div
          className={`p-4 rounded text-sm border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
          <input
            name="host"
            placeholder="smtp.gmail.com"
            value={form.host}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
          <input
            name="port"
            type="number"
            placeholder="587 (TLS) or 465 (SSL)"
            value={form.port}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (SMTP User)</label>
          <input
            name="user"
            placeholder="yourname@gmail.com"
            value={form.user}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">App Password</label>
          <input
            name="pass"
            type="password"
            placeholder="16-character App Password"
            value={form.pass}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Button
        text={loading ? "Saving & Verifying..." : "Save & Verify SMTP"}
        onClick={saveSMTP}
        disabled={loading}
      />

      <div className="text-xs text-gray-500 mt-6 space-y-1">
        <p>⚠️ Gmail users: Use <strong>App Password</strong>, not normal password.</p>
        <p>Generate here: <a 
          href="https://myaccount.google.com/apppasswords" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          https://myaccount.google.com/apppasswords
        </a></p>
      </div>
    </div>
  );
}