import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Compose from "../pages/Compose";
import Campaigns from "../pages/Campaigns";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/compose" element={<Compose />} />
      <Route path="/campaigns" element={<Campaigns />} />
    </Routes>
  );
}
