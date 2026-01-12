export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded shadow">
          <p className="text-sm text-gray-500">Total Campaigns</p>
          <p className="text-2xl font-bold">12</p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <p className="text-sm text-gray-500">Scheduled</p>
          <p className="text-2xl font-bold">5</p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <p className="text-sm text-gray-500">Emails Sent</p>
          <p className="text-2xl font-bold">340</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded shadow">
        <p className="font-medium mb-2">Recent Campaigns</p>
        <p className="text-sm text-gray-500">
          No campaigns yet
        </p>
      </div>
    </div>
  );
}
