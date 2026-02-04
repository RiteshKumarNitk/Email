import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import AppRoutes from "./routes/AppRoutes"
import Login from "./pages/Login"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 PUBLIC */}
        <Route path="/login" element={<Login />} />

        {/* 🔐 PROTECTED */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <AppRoutes />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
