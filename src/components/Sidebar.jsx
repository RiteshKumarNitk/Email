import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `block px-3 py-2 rounded ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-800"
    }`;

  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-8">Email Sender</h1>

      <nav className="space-y-2">
        <Link className={linkClass("/")} to="/">Dashboard</Link>
        <Link className={linkClass("/compose")} to="/compose">Compose</Link>
        <Link className={linkClass("/campaigns")} to="/campaigns">Campaigns</Link>
      </nav>
    </aside>
  );
}
