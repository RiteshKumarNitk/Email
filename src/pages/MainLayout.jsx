import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"

export default function MainLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <Outlet />
      </div>
    </div>
  )
}
