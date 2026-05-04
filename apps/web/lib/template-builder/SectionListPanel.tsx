"use client"

import { useBuilder } from "./BuilderContext"
import { SECTION_TYPES } from "./sectionSchemas"
import { GripVertical, Trash2, Copy, ChevronRight, Plus } from "lucide-react"

export function SectionListPanel() {
  const { config, selectedSectionIndex, selectSection, removeSection, duplicateSection, moveSection, setShowAddPanel } = useBuilder()

  const sections = config.homePage.sections

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Sections ({sections.length})</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm mb-4">No sections yet</p>
            <button
              onClick={() => setShowAddPanel(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Section
            </button>
          </div>
        ) : (
          sections.map((section, i) => {
            const typeConfig = SECTION_TYPES.find((s) => s.id === section.type)
            const isSelected = selectedSectionIndex === i
            return (
              <div
                key={i}
                onClick={() => selectSection(i)}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? "bg-emerald-600/20 border border-emerald-500/30"
                    : "hover:bg-slate-800 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (i > 0) moveSection(i, i - 1)
                    }}
                    className="p-0.5 hover:text-white text-slate-500 disabled:opacity-30"
                    disabled={i === 0}
                    title="Move up"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isSelected ? "text-emerald-300" : "text-slate-300"}`}>
                    {typeConfig?.label || section.type}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {getSectionSubtitle(section)}
                  </p>
                </div>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateSection(i)
                    }}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSection(i)
                    }}
                    className="p-1 hover:bg-red-900/50 rounded text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-slate-600"}`} />
              </div>
            )
          })
        )}
      </div>

      {sections.length > 0 && (
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => setShowAddPanel(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Section
          </button>
        </div>
      )}
    </div>
  )
}

function getSectionSubtitle(section: any): string {
  const props = section.props
  if (props.title) return props.title
  if (props.message) return props.message.substring(0, 30)
  if (props.heading) return props.heading
  if (props.items?.length) return `${props.items.length} items`
  if (props.steps?.length) return `${props.steps.length} steps`
  if (props.plans?.length) return `${props.plans.length} plans`
  if (props.members?.length) return `${props.members.length} members`
  return section.type
}
