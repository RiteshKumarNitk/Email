import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import Dashboard from "./pages/Dashboard"

export default function App() {
  const token = localStorage.getItem("token")

  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Layout */}
        <Route
          path="/"
          element={token ? <MainLayout /> : <Navigate to="/login" />}
        >
          {/* Nested Routes */}
          <Route index element={<Dashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}
