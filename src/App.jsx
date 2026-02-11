import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import MainLayout from "./layouts/MainLayout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"))

  useEffect(() => {
    const checkToken = () => {
      setToken(localStorage.getItem("token"))
    }

    window.addEventListener("storage", checkToken)
    return () => window.removeEventListener("storage", checkToken)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/forgot-password"
          element={token ? <Navigate to="/" /> : <ForgotPassword />}
        />

        <Route
          path="/*"
          element={token ? <MainLayout /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  )
}
