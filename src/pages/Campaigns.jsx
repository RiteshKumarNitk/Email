export default function Campaigns() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Campaigns</h1>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Schedule</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t">
              <td className="p-3">Job Update Email</td>
              <td className="p-3">
                <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
                  Scheduled
                </span>
              </td>
              <td className="p-3">Daily 10:30 AM</td>
              <td className="p-3 space-x-2">
                <button className="text-blue-600">Edit</button>
                <button className="text-red-600">Delete</button>
              </td>
            </tr>

            <tr className="border-t">
              <td className="p-3">Promotion Mail</td>
              <td className="p-3">
                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                  Sent
                </span>
              </td>
              <td className="p-3">One Time</td>
              <td className="p-3 space-x-2">
                <button className="text-blue-600">Edit</button>
                <button className="text-red-600">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
