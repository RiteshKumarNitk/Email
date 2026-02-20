import { useState } from "react"
import { api } from "@/lib/api"
import { Sparkles, RefreshCcw, Check, Zap, ShieldCheck, Smile, X } from "lucide-react"

export default function AIPanel({ subject, html, onApply }) {
  const [loadingMode, setLoadingMode] = useState(null)
  const [result, setResult] = useState(null)

  const callAI = async (mode, extra = {}) => {
    setLoadingMode(mode)
    try {
      const res = await api("/ai", {
        method: "POST",
        body: {
          mode,
          subject,
          html,
          ...extra,
        },
      })
      setResult({ mode, data: res })
    } catch (err) {
      console.error(err)
      alert("AI Assistant error. Please try again.")
    } finally {
      setLoadingMode(null)
    }
  }

  const buttons = [
    { mode: "improve-subject", label: "Polish Subject", icon: <Sparkles size={14} /> },
    { mode: "subject-variants", label: "Variations", icon: <RefreshCcw size={14} /> },
    { mode: "rewrite-body", label: "Tone Up", icon: <Zap size={14} /> },
    { mode: "spam-check", label: "Spam Guard", icon: <ShieldCheck size={14} /> },
    { mode: "emoji-optimize", label: "Emoji Magic", icon: <Smile size={14} /> },
  ]

  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white">
          <Sparkles size={18} className="animate-pulse" />
          <span className="font-bold text-sm tracking-tight">AI CONTENT STUDIO</span>
        </div>
        {result && (
          <button onClick={() => setResult(null)} className="text-white/60 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-4 bg-gray-50/50">
        <div className="flex flex-wrap gap-2">
          {buttons.map((btn) => (
            <button
              key={btn.mode}
              onClick={() => callAI(btn.mode, btn.mode === "rewrite-body" ? { tone: "professional" } : {})}
              disabled={loadingMode !== null}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all
                ${loadingMode === btn.mode
                  ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600 shadow-sm active:scale-95"}
              `}
            >
              {loadingMode === btn.mode ? (
                <div className="w-3 h-3 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
              ) : btn.icon}
              {btn.label}
            </button>
          ))}
        </div>

        {result && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2">
            <div className="bg-white border-2 border-indigo-100 rounded-xl p-4 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Result</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <Check size={10} /> Ready
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-800 break-all max-h-40 overflow-y-auto border">
                {typeof result.data === 'object'
                  ? JSON.stringify(result.data, null, 2)
                  : result.data}
              </div>

              <button
                onClick={() => onApply(result)}
                className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Apply These Changes
              </button>
            </div>
          </div>
        )}

        {!result && !loadingMode && (
          <div className="mt-4 py-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-xs text-gray-400 font-medium">Select a tool above to enhance your email</p>
          </div>
        )}
      </div>
    </div>
  )
}
