import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Login from "./pages/Login"

export default function App() {
  const token = localStorage.getItem("token")

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={token ? <Navigate to="/" /> : <Login />}
        />

        {/* Protected */}
        <Route
          path="/*"
          element={token ? <MainLayout /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  )
}
