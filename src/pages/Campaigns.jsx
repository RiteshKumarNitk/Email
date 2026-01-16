export default function Campaigns() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
        <p className="text-sm text-gray-500">
          Manage, edit and track your email campaigns
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Schedule</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* Row 1 */}
            <tr className="border-t hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium">
                Job Update Email
              </td>

              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                  Scheduled
                </span>
              </td>

              <td className="px-4 py-3 text-gray-600">
                Daily • 10:30 AM
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

            {/* Row 2 */}
            <tr className="border-t hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium">
                Promotion Mail
              </td>

              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-700">
                  Sent
                </span>
              </td>

              <td className="px-4 py-3 text-gray-600">
                One Time
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
