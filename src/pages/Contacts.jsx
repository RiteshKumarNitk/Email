import { useState } from "react";
import Button from "../components/Button";

const DUMMY_CONTACTS = [
  {
    id: "1",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    tag: "Job",
  },
  {
    id: "2",
    name: "Anjali Verma",
    email: "anjali@gmail.com",
    tag: "Marketing",
  },
];

export default function Contacts() {
  const [contacts] = useState(DUMMY_CONTACTS);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Contacts
          </h1>
          <p className="text-sm text-gray-500">
            Manage your email recipients and groups
          </p>
        </div>

        <div className="flex gap-2">
          <Button text="Import CSV" variant="secondary" />
          <Button text="Add Contact" />
        </div>
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
                Email
              </th>
              <th className="px-4 py-3 font-medium text-left">
                Tag
              </th>
              <th className="px-4 py-3 font-medium text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {contacts.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium">
                  {c.name}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {c.email}
                </td>

                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                    {c.tag}
                  </span>
                </td>

                <td className="px-4 py-3 text-right space-x-3">
                  <button className="text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {contacts.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No contacts added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
