"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Palette, Plus, Eye, Trash2, Upload, Search, Filter,
  Check, ExternalLink, Loader2, X, FileJson, Sparkles,
  ArrowRight, Copy, MoreVertical, Star, Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDashboard } from "../DashboardContext"
import { TemplatePreview } from "@/components/marketing/TemplatePreview"
import { templateList } from "@/lib/store-templates/registry"
import { sampleConfigs } from "@/lib/store-templates/engine/sampleConfigs"
import type { TemplateConfig } from "@/lib/store-templates/engine/types"

interface CustomTemplate {
  id: string
  name: string
  slug: string
  description: string | null
  thumbnail: string | null
  category: string
  isPremium: boolean
  isPublic: boolean
  isBuiltIn: boolean
  downloads: number
  version: string
  createdAt: string
}

export default function TemplatesPage() {
  const { activeStore, user } = useDashboard()
  const isAdmin = user?.role === "ADMIN"
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showSampleModal, setShowSampleModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/templates?includeConfig=false")
      if (res.ok) {
        const data = await res.json()
        setCustomTemplates(data.templates || [])
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" })
      if (res.ok) {
        setCustomTemplates(prev => prev.filter(t => t.id !== id))
      }
    } catch {
      // Handle error
    } finally {
      setDeletingId(null)
    }
  }

  const handleApplyTemplate = async (templateId: string) => {
    if (!activeStore) return
    try {
      const res = await fetch(`/api/stores/${activeStore.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: { templateId } }),
      })
      if (res.ok) {
        alert("Template applied successfully!")
      }
    } catch {
      // Handle error
    }
  }

  // Combine built-in and custom templates
  const allTemplates = [
    ...templateList.map(t => ({ ...t, isBuiltIn: true, slug: t.id, description: t.description, thumbnail: null as string | null, downloads: 0, version: "1.0.0", createdAt: "", isPublic: true, category: "general" as string })),
    ...customTemplates.map(t => ({ ...t, isBuiltIn: false })),
  ]

  const filteredTemplates = allTemplates.filter(t => {
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || (t as any).category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = ["all", "general", "fashion", "food", "electronics", "grocery", "salon", "portfolio"]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-7 h-7 text-purple-600" />
            Templates
          </h1>
          <p className="text-slate-500 mt-1">{isAdmin ? "Browse, upload, and manage store templates" : "Browse and apply templates to your store"}</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowSampleModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Sparkles size={16} />
              Sample Templates
            </Button>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
            >
              <Upload size={16} />
              Upload Template
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Built-in Templates */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Star size={18} className="text-amber-500" />
          Built-in Templates
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templateList.map(tpl => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Live preview */}
              <div className="relative h-48">
                <TemplatePreview templateId={tpl.id} name={tpl.name} />
                {tpl.isPremium && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full z-10">PREMIUM</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-900">{tpl.name}</h3>
                  <span className="text-xs text-slate-400">{tpl.tagline}</span>
                </div>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{tpl.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tpl.features.slice(0, 3).map(f => (
                    <span key={f} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link href={`/preview/${tpl.id}`} target="_blank" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full flex items-center gap-1.5">
                      <Eye size={14} /> Preview
                    </Button>
                  </Link>
                  {activeStore && (
                    <Button
                      size="sm"
                      className="flex-1 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleApplyTemplate(tpl.id)}
                    >
                      <Check size={14} /> Apply
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Templates */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileJson size={18} className="text-purple-500" />
          Custom Templates
          {customTemplates.length > 0 && (
            <span className="text-sm font-normal text-slate-400">({customTemplates.length})</span>
          )}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : customTemplates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <FileJson className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No custom templates yet</h3>
            <p className="text-slate-500 mb-4">
              {isAdmin ? "Upload a template config JSON or start from a sample" : "Custom templates will appear here when available"}
            </p>
            {isAdmin && (
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setShowSampleModal(true)} className="flex items-center gap-2">
                  <Sparkles size={16} /> Browse Samples
                </Button>
                <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Upload size={16} /> Upload Template
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTemplates.map(tpl => (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="h-32 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center relative">
                  <FileJson size={40} className="text-purple-400" />
                  <span className="absolute top-3 left-3 text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {tpl.category}
                  </span>
                  {tpl.isPremium && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">PREMIUM</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-900">{tpl.name}</h3>
                    <span className="text-xs text-slate-400">v{tpl.version}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{tpl.description || "Custom template"}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1"><Download size={12} /> {tpl.downloads}</span>
                    <span>{new Date(tpl.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/preview/${tpl.slug}`} target="_blank" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full flex items-center gap-1.5">
                        <Eye size={14} /> Preview
                      </Button>
                    </Link>
                    {activeStore && (
                      <Button
                        size="sm"
                        className="flex-1 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApplyTemplate(tpl.slug)}
                      >
                        <Check size={14} /> Apply
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(tpl.id)}
                        disabled={deletingId === tpl.id}
                      >
                        {deletingId === tpl.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal — ADMIN only */}
      {isAdmin && showUploadModal && (
        <UploadTemplateModal
          onClose={() => setShowUploadModal(false)}
          onCreated={() => { setShowUploadModal(false); fetchTemplates() }}
        />
      )}

      {/* Sample Templates Modal — ADMIN only */}
      {isAdmin && showSampleModal && (
        <SampleTemplatesModal
          onClose={() => setShowSampleModal(false)}
          onCreated={() => { setShowSampleModal(false); fetchTemplates() }}
        />
      )}
    </div>
  )
}

// ─── Upload Template Modal ──────────────────────────────────────────
function UploadTemplateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<"form" | "json">("form")
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("general")
  const [isPublic, setIsPublic] = useState(true)
  const [jsonInput, setJsonInput] = useState("")
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  // Auto-generate slug from name
  useEffect(() => {
    if (name && !slug) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
    }
  }, [name])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setJsonInput(content)
      setStep("json")
    }
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    setUploading(true)
    setError("")

    // Validate JSON
    let configObj: any
    try {
      configObj = JSON.parse(jsonInput)
    } catch {
      setJsonError("Invalid JSON format")
      setUploading(false)
      return
    }

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || configObj.name,
          slug: slug || configObj.id,
          description: description || configObj.description,
          category: category || configObj.category,
          isPublic,
          config: configObj,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Failed to create template")
        if (data.errors) {
          setJsonError(data.errors.join("\n"))
        }
        return
      }

      onCreated()
    } catch {
      setError("Failed to upload template")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Upload size={20} /> Upload Template
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          {/* Step 1: Basic Info */}
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">Template Name</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="My Custom Template"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">Slug</Label>
                <Input
                  value={slug}
                  onChange={e => setSlug(e.target.value.replace(/[^a-z0-9-]/g, ""))}
                  placeholder="my-custom-template"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-1 block">Description</Label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="A brief description of your template"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">Category</Label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {["general", "fashion", "food", "electronics", "grocery", "salon", "portfolio", "pharmacy", "clinic", "tuition", "corporate"].map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Make template public</span>
                </label>
              </div>
            </div>
          </div>

          {/* Step 2: JSON Config */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-slate-700">Template Configuration (JSON)</Label>
              <label className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium">
                <FileJson size={14} />
                Import JSON File
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              value={jsonInput}
              onChange={e => { setJsonInput(e.target.value); setJsonError(null) }}
              placeholder='Paste your template JSON config here, or import a .json file...'
              rows={12}
              className={`w-full border ${jsonError ? "border-red-300" : "border-slate-200"} rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none resize-y`}
            />
            {jsonError && (
              <p className="text-sm text-red-600 mt-1">{jsonError}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading || !jsonInput || !name}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
            >
              {uploading ? (
                <><Loader2 size={16} className="animate-spin" /> Uploading...</>
              ) : (
                <><Upload size={16} /> Upload Template</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sample Templates Modal ─────────────────────────────────────────
function SampleTemplatesModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [creating, setCreating] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleCreateFromSample = async (key: string) => {
    const config = sampleConfigs[key]
    if (!config) return

    setCreating(key)
    setError("")

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: config.name,
          slug: config.id,
          description: config.description,
          category: config.category,
          isPublic: true,
          config,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Failed to create template")
        return
      }

      onCreated()
    } catch {
      setError("Failed to create template from sample")
    } finally {
      setCreating(null)
    }
  }

  const sampleEntries = Object.entries(sampleConfigs) as [string, TemplateConfig][]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles size={20} className="text-amber-500" /> Sample Templates
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-4">{error}</div>
          )}

          <p className="text-slate-500 mb-6">
            Start with a pre-built sample template. You can customize it after creation.
          </p>

          <div className="grid gap-4">
            {sampleEntries.map(([key, config]) => (
              <div
                key={key}
                className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all"
              >
                {/* Color preview */}
                <div
                  className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})` }}
                >
                  <span className="text-white font-bold text-xl">{config.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{config.name}</h3>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {config.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-1">{config.tagline}</p>
                  <p className="text-xs text-slate-400 line-clamp-2">{config.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {config.homePage.sections.slice(0, 4).map((s, i) => (
                      <span key={i} className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                        {s.type}
                      </span>
                    ))}
                    {config.homePage.sections.length > 4 && (
                      <span className="text-[10px] text-slate-400">+{config.homePage.sections.length - 4} more</span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleCreateFromSample(key)}
                  disabled={creating === key}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 shrink-0"
                >
                  {creating === key ? (
                    <><Loader2 size={14} className="animate-spin" /> Creating...</>
                  ) : (
                    <><Copy size={14} /> Use Template</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
