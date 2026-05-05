"use client"

import { useState } from "react"
import { useBuilder } from "./BuilderContext"
import { getSectionTypeConfig, getSectionFields, type FieldDef } from "./sectionSchemas"
import { X, Trash2, Copy, ArrowUp, ArrowDown } from "lucide-react"

export function SectionEditorPanel() {
  const {
    config,
    selectedSectionIndex,
    updateSectionProp,
    removeSection,
    duplicateSection,
    moveSection,
    selectSection,
  } = useBuilder()

  if (selectedSectionIndex === null || !config.homePage.sections[selectedSectionIndex]) return null

  const section = config.homePage.sections[selectedSectionIndex]
  const typeConfig = getSectionTypeConfig(section.type)
  const fields = getSectionFields(section.type)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{typeConfig?.label || section.type}</h3>
          <p className="text-[10px] text-slate-500">{typeConfig?.description}</p>
        </div>
        <button
          onClick={() => selectSection(null)}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-3 border-b border-slate-800 flex items-center gap-1">
        <button
          onClick={() => selectedSectionIndex > 0 && moveSection(selectedSectionIndex, selectedSectionIndex - 1)}
          disabled={selectedSectionIndex === 0}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
          title="Move up"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => selectedSectionIndex < config.homePage.sections.length - 1 && moveSection(selectedSectionIndex, selectedSectionIndex + 1)}
          disabled={selectedSectionIndex === config.homePage.sections.length - 1}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
          title="Move down"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => duplicateSection(selectedSectionIndex)}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          title="Duplicate"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => removeSection(selectedSectionIndex)}
          className="p-1.5 hover:bg-red-900/50 rounded text-slate-400 hover:text-red-400 transition-colors"
          title="Delete section"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {fields.map((field) => (
          <FieldEditor
            key={field.key}
            field={field}
            value={(section.props as any)[field.key]}
            onChange={(value) => updateSectionProp(selectedSectionIndex, field.key, value)}
          />
        ))}
      </div>
    </div>
  )
}

function FieldEditor({ field, value, onChange }: { field: FieldDef; value: any; onChange: (value: any) => void }) {
  if (field.type === "list") {
    return <ListFieldEditor field={field} value={value || []} onChange={onChange} />
  }

  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{field.label}</label>
      {field.type === "text" && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        />
      )}
      {field.type === "textarea" && (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
        />
      )}
      {field.type === "number" && (
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          min={field.min}
          max={field.max}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        />
      )}
      {field.type === "select" && (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      {field.type === "color" && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-mono"
          />
        </div>
      )}
      {field.type === "boolean" && (
        <button
          onClick={() => onChange(!value)}
          className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-emerald-600" : "bg-slate-700"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-5" : ""}`}
          />
        </button>
      )}
      {field.type === "image" && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        />
      )}
    </div>
  )
}

function ListFieldEditor({ field, value, onChange }: { field: FieldDef; value: any[]; onChange: (value: any) => void }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const addItem = () => {
    const newItem = field.newItemDefault ? { ...field.newItemDefault } : {}
    onChange([...value, newItem])
    setExpandedIndex(value.length)
  }

  const removeItem = (index: number) => {
    const updated = value.filter((_, i) => i !== index)
    onChange(updated)
    if (expandedIndex === index) setExpandedIndex(null)
  }

  const updateItem = (index: number, key: string, itemValue: any) => {
    const updated = [...value]
    updated[index] = { ...updated[index], [key]: itemValue }
    onChange(updated)
  }

  const moveItem = (from: number, to: number) => {
    const updated = [...value]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    onChange(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-slate-400">{field.label}</label>
        <button
          onClick={addItem}
          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium"
        >
          + Add
        </button>
      </div>
      <div className="space-y-1">
        {value.map((item: any, i: number) => (
          <div key={i} className="border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/50 hover:bg-slate-800 transition-colors text-left"
            >
              <span className="text-xs text-slate-300 truncate">
                {item.name || item.title || item.question || `${field.label} ${i + 1}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); removeItem(i) }}
                  className="p-0.5 hover:text-red-400 text-slate-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </button>
            {expandedIndex === i && field.itemFields && (
              <div className="p-3 space-y-3 bg-slate-800/30 border-t border-slate-700">
                {field.itemFields.map((itemField) => (
                  <div key={itemField.key}>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">{itemField.label}</label>
                    {itemField.type === "text" && (
                      <input
                        type="text"
                        value={item[itemField.key] || ""}
                        onChange={(e) => updateItem(i, itemField.key, e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    )}
                    {itemField.type === "textarea" && (
                      <textarea
                        value={item[itemField.key] || ""}
                        onChange={(e) => updateItem(i, itemField.key, e.target.value)}
                        rows={2}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                      />
                    )}
                    {itemField.type === "select" && (
                      <select
                        value={item[itemField.key] || ""}
                        onChange={(e) => updateItem(i, itemField.key, e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        {itemField.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}
                    {itemField.type === "number" && (
                      <input
                        type="number"
                        value={item[itemField.key] ?? ""}
                        onChange={(e) => updateItem(i, itemField.key, Number(e.target.value))}
                        min={itemField.min}
                        max={itemField.max}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    )}
                    {itemField.type === "boolean" && (
                      <button
                        onClick={() => updateItem(i, itemField.key, !item[itemField.key])}
                        className={`relative w-8 h-4 rounded-full transition-colors ${item[itemField.key] ? "bg-emerald-600" : "bg-slate-700"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${item[itemField.key] ? "translate-x-4" : ""}`} />
                      </button>
                    )}
                    {itemField.type === "image" && (
                      <input
                        type="text"
                        value={item[itemField.key] || ""}
                        onChange={(e) => updateItem(i, itemField.key, e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

