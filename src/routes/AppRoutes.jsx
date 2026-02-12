import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "../components/ProtectedRoute"
import MainLayout from "../layouts/MainLayout"

import Dashboard from "../pages/Dashboard"
import Login from "../pages/Login"
import Register from "../pages/Register"

export default function AppRoutes() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected with Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>

    </Routes>
  )
}
