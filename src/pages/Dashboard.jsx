import { useEffect, useState } from "react"
import { api } from "../api"
import { motion } from "framer-motion"

/* 🔢 COUNT UP COMPONENT */
function CountUp({ value, duration = 800 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = Number(value) || 0
    if (end === 0) {
      setCount(0)
      return
    }

    const step = Math.max(1, Math.floor(end / (duration / 16)))

    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value, duration])

  return <>{count}</>
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  // 🔄 FETCH FUNCTION
  const loadStats = async () => {
    const data = await api("/campaigns/stats/dashboard")
    setStats(data)
  }

  // 🔥 AUTO REFRESH EVERY 10 SEC
  useEffect(() => {
    loadStats() // initial load

    const interval = setInterval(() => {
      loadStats()
    }, 10000) // 10 sec

    return () => clearInterval(interval) // 🧹 cleanup
  }, [])

  if (!stats) return <p className="p-6">Loading...</p>

  const cards = [
    {
      title: "Total Campaigns",
      value: stats.total,
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      title: "Emails Sent",
      value: stats.status.sent,
      gradient: "from-emerald-500 to-green-500",
    },
    {
      title: "Failed",
      value: stats.status.failed,
      gradient: "from-rose-500 to-red-500",
    },
    {
      title: "Pending",
      value: stats.status.pending,
      gradient: "from-amber-400 to-yellow-500",
    },
    {
      title: "Drafts",
      value: stats.status.draft,
      gradient: "from-slate-400 to-slate-600",
    },
  ]

  return (
    <div className="p-8 space-y-10 bg-[#f7f8fa] min-h-screen">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Live email system overview (auto refresh)
        </p>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.04 }}
            className="relative overflow-hidden rounded-2xl bg-white shadow-sm border"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.gradient}`}
            />

            <div className="p-5">
              <p className="text-sm text-gray-500">
                {c.title}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                <CountUp value={c.value} />
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* SECONDARY INFO */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="rounded-2xl border bg-white p-6">
          <h3 className="font-semibold text-gray-800 mb-2">
            Delivery Summary
          </h3>

          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-gray-500 text-sm">Success</p>
              <p className="text-2xl font-semibold text-emerald-600">
                <CountUp value={stats.emails.success} />
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Failure</p>
              <p className="text-2xl font-semibold text-rose-600">
                <CountUp value={stats.emails.failure} />
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h3 className="font-semibold text-gray-800 mb-2">
            System Status
          </h3>

          <p className="text-gray-500 text-sm mt-4">
            Real-time monitoring enabled.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 text-sm font-medium">
            ● Auto refresh every 10 sec
          </div>
        </div>
      </motion.div>
    </div>
  )
}
