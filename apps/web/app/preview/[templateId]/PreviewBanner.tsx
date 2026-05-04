"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, X, ArrowRight, Sparkles } from "lucide-react"

export function PreviewBanner({ templateId, templateName }: { templateId: string; templateName: string }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">Preview Mode</span>
          </div>
          <span className="text-sm text-slate-300">
            Viewing <span className="text-white font-semibold">{templateName}</span> template
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/new-store?template=${templateId}`}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Use This Template
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/#templates"
            className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-2"
          >
            All Templates
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
