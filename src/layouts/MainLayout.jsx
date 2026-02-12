import { Outlet, NavLink } from "react-router-dom";
import { Bell, User } from "lucide-react"; // agar icons use kar raha hai

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold">Email Sender</h2>
          <p className="text-sm text-gray-400">Campaign Manager</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg ${isActive ? "bg-slate-700" : "hover:bg-slate-800"}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/compose"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg ${isActive ? "bg-slate-700" : "hover:bg-slate-800"}`
            }
          >
            Compose
          </NavLink>
          <NavLink
            to="/campaigns"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg ${isActive ? "bg-slate-700" : "hover:bg-slate-800"}`
            }
          >
            Campaigns
          </NavLink>
          {/* Baaki links: Templates, Queue, Contacts, Groups, Settings */}
        </nav>
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Campaign Manager</h1>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell size={20} />
              {/* Notification badge agar chahiye */}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                D
              </div>
              <span>Devanshu</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}