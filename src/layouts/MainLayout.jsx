import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useState } from "react";
import ScheduleModal from "../components/ScheduleModal";


export default function MainLayout({ children }) {
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <Topbar />

          <main className="flex-1 p-6 overflow-y-auto">
            {/* 👇 context pass kar sakta hai baad me */}
            {children}
          </main>
        </div>
      </div>

      {/* ✅ MODAL AT ROOT LEVEL */}
      <ScheduleModal
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
      />
    </>
  );
}
