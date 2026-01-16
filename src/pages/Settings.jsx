import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Settings() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-gray-500">
          Manage your account and email preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b">
        {["profile", "smtp", "email"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 capitalize text-sm font-medium transition ${
              tab === t
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === "profile" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4 max-w-xl">
          <Input label="Name" placeholder="Your name" />
          <Input label="Email" placeholder="you@email.com" />
          <div className="pt-2">
            <Button text="Update Profile" />
          </div>
        </div>
      )}

      {/* SMTP */}
      {tab === "smtp" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4 max-w-xl">
          <Input label="SMTP Host" placeholder="smtp.gmail.com" />
          <Input label="SMTP Port" placeholder="587" />
          <Input label="Username" placeholder="email@gmail.com" />
          <Input label="Password" placeholder="********" />

          <div className="flex gap-3 pt-2">
            <Button text="Save SMTP" />
            <Button text="Test SMTP" variant="secondary" />
          </div>
        </div>
      )}

      {/* Email */}
      {tab === "email" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium mb-1">
              Default Footer
            </label>
            <textarea
              className="w-full border rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Regards, Team"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" className="rounded" />
            Automatically add unsubscribe link
          </label>

          <div className="pt-2">
            <Button text="Save Email Settings" />
          </div>
        </div>
      )}
    </div>
  );
}
