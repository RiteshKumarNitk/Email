import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";   // ← yeh import kar (path sahi kar le)
import Topbar from "../components/Topbar";     // ← yeh import kar (agar Topbar.jsx hai)

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Asli Sidebar component use karo – duplicate code hata do */}
      <Sidebar />

      {/* Right side: Topbar + content */}
      <div className="flex-1 flex flex-col">
        {/* Asli Topbar component use karo */}
        <Topbar />

        {/* Page content yahan aayega */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}