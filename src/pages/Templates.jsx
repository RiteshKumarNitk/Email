import { useState } from "react";
import Button from "../components/Button";

const DUMMY_TEMPLATES = [
  {
    id: "1",
    name: "Job Update",
    subject: "Application Update",
    preview: "Hello {{name}}, your application status...",
  },
  {
    id: "2",
    name: "Promotion",
    subject: "Special Offer 🎉",
    preview: "Don’t miss our exclusive offer...",
  },
];

export default function Templates() {
  const [templates] = useState(DUMMY_TEMPLATES);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Templates
          </h1>
          <p className="text-sm text-gray-500">
            Reusable email templates for faster campaigns
          </p>
        </div>

        <Button text="Create Template" />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium text-left">
                Name
              </th>
              <th className="px-4 py-3 font-medium text-left">
                Subject
              </th>
              <th className="px-4 py-3 font-medium text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {templates.map((t) => (
              <tr
                key={t.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium">
                  {t.name}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {t.subject}
                </td>

                <td className="px-4 py-3 text-right space-x-3">
                  <button className="text-blue-600 hover:underline">
                    Preview
                  </button>
                  <button className="text-blue-600 hover:underline">
                    Use
                  </button>
                  <button className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {templates.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No templates created yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
