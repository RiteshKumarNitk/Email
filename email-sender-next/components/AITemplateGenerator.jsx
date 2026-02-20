import { useState } from "react"
import { api } from "@/lib/api"
import { Sparkles, Wand2, Lightbulb } from "lucide-react"

export default function AITemplateGenerator({ onUse = () => { } }) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)

  const suggestions = [
    "Welcome email for new subscribers",
    "Flash sale announcement for jewelry",
    "Monthly tech newsletter with 3 articles",
    "Abandoned cart recovery with 10% discount",
  ]

  const generate = async () => {
    if (!prompt) return
    setLoading(true)

    try {
      const res = await api("/templates/ai", {
        method: "POST",
        body: { prompt }, // api lib handles JSON.stringify
      })

      if (res) {
        onUse(res)
      }
    } catch (err) {
      console.error("AI Generation failed:", err)
      alert("AI Assistant is currently unavailable. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={120} className="text-indigo-600" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">AI Template Magic</h3>
              <p className="text-sm text-indigo-600 font-medium">Describe your vision, and I'll build the template</p>
            </div>
          </div>

          <div className="relative group">
            <textarea
              placeholder="e.g. A minimalist welcome email for my minimalist furniture brand..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all h-32 resize-none bg-white shadow-inner"
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                onClick={generate}
                disabled={loading || !prompt}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Working Magic...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    <span>Generate Template</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-72 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Lightbulb size={14} />
            <span>Try these ideas</span>
          </div>
          <div className="flex flex-col gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setPrompt(s)}
                className="text-left text-xs p-3 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-xl transition-all text-gray-600 hover:text-indigo-700 font-medium shadow-sm"
              >
                "{s}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
