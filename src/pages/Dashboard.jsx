// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { api } from "../api";
import { motion } from "framer-motion";

console.log("Dashboard mounted");

/* CountUp component same rakh sakta hai – no change needed */
function CountUp({ value, duration = 800 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }
    const step = Math.max(1, Math.floor(end / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{count}</>;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    try {
      const data = await api("/campaigns/stats/dashboard");
      setStats(data);
      setError(null);
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError(err.message || "Stats load nahi hue");
      setStats({
        totalCampaigns: 0,
        emails: { success: 0, failure: 0 },
      });
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000); // 10 sec refresh
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <p className="p-6 text-center text-lg">Loading dashboard...</p>;

  const sent = stats.emails?.success || 0;
  const failed = stats.emails?.failure || 0;

  const cards = [
    { title: "Total Campaigns", value: stats.totalCampaigns || 0, gradient: "from-indigo-500 to-blue-500" },
    { title: "Emails Sent", value: sent, gradient: "from-emerald-500 to-green-500" },
    { title: "Failed Emails", value: failed, gradient: "from-rose-500 to-red-500" },
  ];

  return (
    <div className="p-8 space-y-10 bg-[#f7f8fa] min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Live email system overview (auto refresh every 10s)</p>
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </motion.div>

      {/* Cards and other sections same as before – no big change */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.04 }}
            className="relative overflow-hidden rounded-2xl bg-white border shadow-sm"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.gradient}`} />
            <div className="p-5">
              <p className="text-sm text-gray-500">{c.title}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                <CountUp value={c.value} />
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delivery Summary and System Status sections same */}
      {/* ... copy paste your original code here if you want ... */}
    </div>
  );
}