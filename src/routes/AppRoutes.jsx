// src/routes/AppRoutes.jsx  (ya jo bhi naam hai)
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import Dashboard from "../pages/Dashboard";
import Compose from "../pages/Compose";
import Campaigns from "../pages/Campaigns";
import Profile from "../pages/Profile";

export default function AppRoutes() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* Public routes – koi bhi dekh sakta */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes – sirf logged-in user */}
      <Route
        path="/"
        element={
          token ? <MainLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="compose" element={<Compose />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="profile" element={<Profile />} />

        {/* Agar koi galat path daala to */}
        <Route path="*" element={<div className="p-10 text-center text-2xl">404 - Page nahi mila bhai 😅</div>} />
      </Route>

      {/* Agar bilkul galat URL daala (bahar protected area se) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}