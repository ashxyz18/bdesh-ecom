"use client"

import { useState } from "react"
import { useBuilder } from "./BuilderContext"
import { SECTION_TYPES, type SectionTypeConfig } from "./sectionSchemas"
import { ArrowLeft, Search, Megaphone, Image, PanelTop, MousePointerClick, Minus, Grid3X3, Star, ShoppingBag, LayoutGrid, Quote, Mail, Award, Users, ShieldCheck, BarChart3, Timer, HelpCircle, CreditCard, GitBranch, Eye } from "lucide-react"

const ICON_MAP: Record<string, any> = {
  Megaphone, Image, PanelTop, MousePointerClick, Minus, Grid3X3, Star, ShoppingBag, LayoutGrid, Quote, Mail, Award, Users, ShieldCheck, BarChart3, Timer, HelpCircle, CreditCard, GitBranch, Eye,
}

export function AddSectionPanel() {
  const { addSection, setShowAddPanel } = useBuilder()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const categories = [
    { id: "all", label: "All" },
    { id: "basic", label: "Basic" },
    { id: "products", label: "Products" },
    { id: "social", label: "Social" },
    { id: "advanced", label: "Advanced" },
  ]

  const filtered = SECTION_TYPES.filter((s) => {
    const matchesSearch = s.label.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === "all" || s.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setShowAddPanel(false)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-semibold text-white">Add Section</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sections..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 p-2 border-b border-slate-800 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? "bg-emerald-600/20 text-emerald-400"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Section List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">No sections found</p>
          </div>
        ) : (
          filtered.map((sectionType) => (
            <SectionTypeCard
              key={sectionType.id}
              sectionType={sectionType}
              onAdd={() => addSection(sectionType.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function SectionTypeCard({ sectionType, onAdd }: { sectionType: SectionTypeConfig; onAdd: () => void }) {
  const Icon = ICON_MAP[sectionType.icon] || Grid3X3

  return (
    <button
      onClick={onAdd}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all text-left group"
    >
      <div className="w-9 h-9 rounded-lg bg-slate-800 group-hover:bg-emerald-600/20 flex items-center justify-center flex-shrink-0 transition-colors">
        <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{sectionType.label}</p>
        <p className="text-[10px] text-slate-500 line-clamp-1">{sectionType.description}</p>
      </div>
    </button>
  )
}
