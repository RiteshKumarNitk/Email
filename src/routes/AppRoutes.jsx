import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Compose from "../pages/Compose";
import Campaigns from "../pages/Campaigns";
import Templates from "../pages/Templates";
import Contacts from "../pages/Contacts";
import Settings from "../pages/Settings";
import ScheduleModal from "../components/ScheduleModal";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/compose" element={<Compose />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/scheduleModal" element={<ScheduleModal />} />


    </Routes>
  );
}
