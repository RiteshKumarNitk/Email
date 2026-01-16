export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Overview of your email campaigns
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Campaigns</p>
          <p className="text-3xl font-semibold mt-1">12</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Scheduled</p>
          <p className="text-3xl font-semibold mt-1">5</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Emails Sent</p>
          <p className="text-3xl font-semibold mt-1">340</p>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="font-medium mb-2">Recent Campaigns</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>No campaigns yet</span>
          <span className="text-blue-600 cursor-pointer hover:underline">
            Create Campaign
          </span>
        </div>
      </div>
    </div>
  );
}
