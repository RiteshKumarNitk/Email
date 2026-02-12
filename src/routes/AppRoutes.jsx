import { Routes, Route } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import Login from "../pages/Login"
import Register from "../pages/Register"
import ForgotPassword from "../pages/ForgotPassword"
import Dashboard from "../pages/Dashboard"
import Compose from "../pages/Compose"
import Campaigns from "../pages/Campaigns"
import Profile from "../pages/Profile"

export default function AppRoutes() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Layout wrapper */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="compose" element={<Compose />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="profile" element={<Profile />} />
      </Route>

    </Routes>
  )
}
