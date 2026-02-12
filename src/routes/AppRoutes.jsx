// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import Dashboard from "../pages/Dashboard";
import Compose from "../pages/Compose";
import Campaigns from "../pages/Campaigns";
import Templates from "../pages/Templates";   // ← yeh add kar
import Queue from "../pages/Queue";           // ← yeh add kar
import Contacts from "../pages/Contacts";     // ← yeh add kar
import Groups from "../pages/Groups";         // ← yeh add kar
import Settings from "../pages/Settings";     // ← yeh add kar
import Profile from "../pages/Profile";

export default function AppRoutes() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected */}
      <Route
        path="/"
        element={token ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="compose" element={<Compose />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="templates" element={<Templates />} />     {/* ← yeh add */}
        <Route path="queue" element={<Queue />} />             {/* ← yeh add */}
        <Route path="contacts" element={<Contacts />} />       {/* ← yeh add */}
        <Route path="groups" element={<Groups />} />           {/* ← yeh add */}
        <Route path="settings" element={<Settings />} />       {/* ← yeh add */}
        <Route path="profile" element={<Profile />} />

        <Route path="*" element={<div className="p-10 text-center text-2xl">404 - Page nahi mila 😅</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}