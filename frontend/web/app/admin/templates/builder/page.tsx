"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { BuilderProvider, useBuilder } from "@/lib/template-builder/BuilderContext"
import type { TemplateConfig } from "@/lib/store-templates/engine/types"
import { SectionListPanel } from "@/lib/template-builder/SectionListPanel"
import { SectionEditorPanel } from "@/lib/template-builder/SectionEditorPanel"
import { ThemeSettingsPanel } from "@/lib/template-builder/ThemeSettingsPanel"
import { AddSectionPanel } from "@/lib/template-builder/AddSectionPanel"
import { BuilderPreview } from "@/lib/template-builder/BuilderPreview"
import { ArrowLeft, Save, Monitor, Tablet, Smartphone, Palette, Layers, Settings, Undo2, Eye } from "lucide-react"
import Link from "next/link"

function BuilderPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const templateId = searchParams.get("id")
  const [loading, setLoading] = useState(!!templateId)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"sections" | "theme" | "settings">("sections")
  const [showPreviewFullscreen, setShowPreviewFullscreen] = useState(false)

  return (
    <BuilderLoader
      templateId={templateId}
      setLoading={setLoading}
      setError={setError}
      loading={loading}
      error={error}
      router={router}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      showPreviewFullscreen={showPreviewFullscreen}
      setShowPreviewFullscreen={setShowPreviewFullscreen}
    />
  )
}

function BuilderLoader({
  templateId,
  setLoading,
  setError,
  loading,
  error,
  router,
  activeTab,
  setActiveTab,
  showPreviewFullscreen,
  setShowPreviewFullscreen,
}: {
  templateId: string | null
  setLoading: (v: boolean) => void
  setError: (v: string) => void
  loading: boolean
  error: string
  router: ReturnType<typeof useRouter>
  activeTab: "sections" | "theme" | "settings"
  setActiveTab: (v: "sections" | "theme" | "settings") => void
  showPreviewFullscreen: boolean
  setShowPreviewFullscreen: (v: boolean) => void
}) {
  const [initialConfig, setInitialConfig] = useState<TemplateConfig | null>(null)

  useEffect(() => {
    if (!templateId) {
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const res = await fetch(`/api/templates/${templateId}`)
        if (!res.ok) throw new Error("Failed to load template")
        const data = await res.json()
        setInitialConfig(data.config)
      } catch (err: any) {
        setError(err.message || "Failed to load template")
      } finally {
        setLoading(false)
      }
    })()
  }, [templateId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading template...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/admin/templates" className="text-emerald-400 hover:text-emerald-300 text-sm">
            ← Back to templates
          </Link>
        </div>
      </div>
    )
  }

  return (
    <BuilderProvider initialConfig={initialConfig || undefined}>
      <BuilderUI
        templateId={templateId}
        router={router}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showPreviewFullscreen={showPreviewFullscreen}
        setShowPreviewFullscreen={setShowPreviewFullscreen}
      />
    </BuilderProvider>
  )
}

function BuilderUI({
  templateId,
  router,
  activeTab,
  setActiveTab,
  showPreviewFullscreen,
  setShowPreviewFullscreen,
}: {
  templateId: string | null
  router: ReturnType<typeof useRouter>
  activeTab: "sections" | "theme" | "settings"
  setActiveTab: (v: "sections" | "theme" | "settings") => void
  showPreviewFullscreen: boolean
  setShowPreviewFullscreen: (v: boolean) => void
}) {
  const {
    config,
    selectedSectionIndex,
    previewDevice,
    isDirty,
    isSaving,
    showAddPanel,
    setPreviewDevice,
    setShowAddPanel,
    setSaving,
    markSaved,
    selectSection,
  } = useBuilder()

  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaveError("")
    setSaveSuccess(false)
    try {
      const payload = {
        ...(templateId ? {} : { name: config.name, slug: config.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }),
        description: config.description,
        category: config.category,
        configJson: JSON.stringify(config),
      }

      const res = templateId
        ? await fetch(`/api/templates/${templateId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, isPublic: true }),
          })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save template")
      }

      markSaved()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setSaveError(err.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }, [config, templateId, markSaved, setSaving])

  const deviceWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* ── Top Bar ── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/templates"
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-white">{config.name || "Untitled Template"}</h1>
            {isDirty && <span className="text-[10px] text-amber-400">Unsaved changes</span>}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          {([
            { device: "desktop" as const, icon: Monitor },
            { device: "tablet" as const, icon: Tablet },
            { device: "mobile" as const, icon: Smartphone },
          ]).map(({ device, icon: Icon }) => (
            <button
              key={device}
              onClick={() => setPreviewDevice(device)}
              className={`p-1.5 rounded-md transition-colors ${
                previewDevice === device ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreviewFullscreen(!showPreviewFullscreen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            title="Toggle fullscreen preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || (!isDirty && !!templateId)}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {templateId ? "Save" : "Create Template"}
          </button>
        </div>
      </header>

      {/* ── Save Status ── */}
      {saveError && (
        <div className="bg-red-900/50 border-b border-red-800 px-4 py-2 text-red-300 text-sm">{saveError}</div>
      )}
      {saveSuccess && (
        <div className="bg-emerald-900/50 border-b border-emerald-800 px-4 py-2 text-emerald-300 text-sm">
          ✓ Template saved successfully
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Sidebar ── */}
        {!showPreviewFullscreen && (
          <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
            {/* Tab Switcher */}
            <div className="flex border-b border-slate-800">
              {([
                { id: "sections" as const, icon: Layers, label: "Sections" },
                { id: "theme" as const, icon: Palette, label: "Theme" },
                { id: "settings" as const, icon: Settings, label: "Settings" },
              ]).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                    activeTab === id
                      ? "text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "sections" && !showAddPanel && <SectionListPanel />}
              {activeTab === "sections" && showAddPanel && <AddSectionPanel />}
              {activeTab === "theme" && <ThemeSettingsPanel />}
              {activeTab === "settings" && <SettingsTab />}
            </div>
          </aside>
        )}

        {/* ── Preview Area ── */}
        <main className="flex-1 bg-slate-950 overflow-auto">
          <div
            className="mx-auto transition-all duration-300"
            style={{ maxWidth: deviceWidths[previewDevice] }}
          >
            <BuilderPreview />
          </div>
        </main>

        {/* ── Right Sidebar: Section Editor ── */}
        {!showPreviewFullscreen && selectedSectionIndex !== null && (
          <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col flex-shrink-0">
            <SectionEditorPanel />
          </aside>
        )}
      </div>
    </div>
  )
}

function SettingsTab() {
  const { config, updateMeta, updateCustomCss } = useBuilder()

  return (
    <div className="p-4 space-y-5">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Template Name</label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => updateMeta({ name: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Tagline</label>
        <input
          type="text"
          value={config.tagline}
          onChange={(e) => updateMeta({ tagline: e.target.value } as any)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
        <textarea
          value={config.description}
          onChange={(e) => updateMeta({ description: e.target.value })}
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
        <select
          value={config.category}
          onChange={(e) => updateMeta({ category: e.target.value as any })}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        >
          <option value="general">General</option>
          <option value="fashion">Fashion</option>
          <option value="food">Food</option>
          <option value="electronics">Electronics</option>
          <option value="salon">Salon</option>
          <option value="portfolio">Portfolio</option>
          <option value="grocery">Grocery</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="clinic">Clinic</option>
          <option value="tuition">Tuition</option>
          <option value="corporate">Corporate</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Custom CSS</label>
        <textarea
          value={config.customCss || ""}
          onChange={(e) => updateCustomCss(e.target.value)}
          rows={8}
          placeholder=".my-custom-class { color: red; }"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
        />
        <p className="text-[10px] text-slate-500 mt-1">CSS is scoped to this template automatically</p>
      </div>
    </div>
  )
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BuilderPageInner />
    </Suspense>
  )
}
