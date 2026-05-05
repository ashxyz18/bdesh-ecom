"use client"

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react"
import type { TemplateConfig, HomeSectionConfig } from "../store-templates/engine/types"
import { createNewSection } from "./sectionSchemas"

interface BuilderState {
  config: TemplateConfig
  selectedSectionIndex: number | null
  previewDevice: "desktop" | "tablet" | "mobile"
  isDirty: boolean
  isSaving: boolean
  showAddPanel: boolean
  canUndo: boolean
  canRedo: boolean
}

interface BuilderActions {
  setConfig: (config: TemplateConfig) => void
  updateMeta: (updates: Partial<Pick<TemplateConfig, "name" | "description" | "category">>) => void
  updateColors: (colors: Partial<TemplateConfig["colors"]>) => void
  updateTypography: (typography: Partial<TemplateConfig["typography"]>) => void
  updateLayout: (layout: Partial<TemplateConfig["layout"]>) => void
  updateCustomCss: (css: string) => void
  addSection: (type: string) => void
  removeSection: (index: number) => void
  moveSection: (fromIndex: number, toIndex: number) => void
  duplicateSection: (index: number) => void
  updateSectionProps: (index: number, props: Record<string, any>) => void
  updateSectionProp: (index: number, key: string, value: any) => void
  selectSection: (index: number | null) => void
  setPreviewDevice: (device: "desktop" | "tablet" | "mobile") => void
  setShowAddPanel: (show: boolean) => void
  markSaved: () => void
  setSaving: (saving: boolean) => void
  resetConfig: (config: TemplateConfig) => void
  undo: () => void
  redo: () => void
}

type BuilderContextType = BuilderState & BuilderActions

const BuilderContext = createContext<BuilderContextType | null>(null)

export function useBuilder() {
  const ctx = useContext(BuilderContext)
  if (!ctx) throw new Error("useBuilder must be used within BuilderProvider")
  return ctx
}

const MAX_HISTORY = 50

function createDefaultConfig(): TemplateConfig {
  return {
    id: "",
    name: "New Template",
    tagline: "Custom template",
    description: "Custom template built with the visual builder",
    version: "1.0.0",
    category: "general",
    isPremium: false,
    colors: {
      primary: "#10b981",
      secondary: "#059669",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f9fafb",
      text: "#111827",
      textMuted: "#6b7280",
      border: "#e5e7eb",
      success: "#22c55e",
      error: "#ef4444",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "700",
      borderRadius: "lg",
    },
    layout: {
      maxWidth: "1280px",
      sectionSpacing: "normal",
      cardStyle: "shadowed",
      productColumns: 4,
    },
    navbar: {
      style: "sticky-white",
      showSearch: true,
      showWishlist: true,
      showUserMenu: true,
      layout: "centered",
    },
    footer: {
      style: "dark",
      showNewsletter: true,
      showSocial: true,
      columns: 3,
    },
    homePage: {
      sections: [],
    },
    productPage: {
      imageLayout: "stacked",
      showReviews: true,
      showRecentlyViewed: true,
      showRelatedProducts: true,
      showWishlist: true,
      showFeatures: true,
      features: [],
    },
    collectionPage: {
      showFilters: true,
      gridColumns: 3,
      cardStyle: "standard",
    },
    customCss: "",
  }
}

export function BuilderProvider({ children, initialConfig }: { children: ReactNode; initialConfig?: TemplateConfig }) {
  const [config, setConfigState] = useState<TemplateConfig>(initialConfig || createDefaultConfig())
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)

  // Undo/redo history
  const historyRef = useRef<TemplateConfig[]>([initialConfig || createDefaultConfig()])
  const historyIndexRef = useRef(0)
  const [, forceRender] = useState(0)

  const pushHistory = useCallback((newConfig: TemplateConfig) => {
    const idx = historyIndexRef.current
    // Discard any redo states beyond current index
    const newHistory = historyRef.current.slice(0, idx + 1)
    newHistory.push(JSON.parse(JSON.stringify(newConfig)))
    if (newHistory.length > MAX_HISTORY) newHistory.shift()
    historyRef.current = newHistory
    historyIndexRef.current = newHistory.length - 1
    forceRender((n) => n + 1)
  }, [])

  const setConfig = useCallback((newConfig: TemplateConfig) => {
    setConfigState(newConfig)
    pushHistory(newConfig)
    setIsDirty(true)
  }, [pushHistory])

  const markDirty = useCallback(() => setIsDirty(true), [])

  const updateMeta = useCallback((updates: Partial<Pick<TemplateConfig, "name" | "description" | "category">>) => {
    setConfigState((prev) => {
      const next = { ...prev, ...updates }
      pushHistory(next)
      return next
    })
    markDirty()
  }, [markDirty, pushHistory])

  const updateColors = useCallback((colors: Partial<TemplateConfig["colors"]>) => {
    setConfigState((prev) => {
      const next = { ...prev, colors: { ...prev.colors, ...colors } }
      pushHistory(next)
      return next
    })
    markDirty()
  }, [markDirty, pushHistory])

  const updateTypography = useCallback((typography: Partial<TemplateConfig["typography"]>) => {
    setConfigState((prev) => {
      const next = { ...prev, typography: { ...prev.typography, ...typography } }
      pushHistory(next)
      return next
    })
    markDirty()
  }, [markDirty, pushHistory])

  const updateLayout = useCallback((layout: Partial<TemplateConfig["layout"]>) => {
    setConfigState((prev) => {
      const next = { ...prev, layout: { ...prev.layout, ...layout } }
      pushHistory(next)
      return next
    })
    markDirty()
  }, [markDirty, pushHistory])

  const updateCustomCss = useCallback((customCss: string) => {
    setConfigState((prev) => {
      const next = { ...prev, customCss }
      pushHistory(next)
      return next
    })
    markDirty()
  }, [markDirty, pushHistory])

  const addSection = useCallback((type: string) => {
    const newSection = createNewSection(type)
    setConfigState((prev) => {
      const sections = [...prev.homePage.sections, newSection as HomeSectionConfig]
      setSelectedSectionIndex(sections.length - 1)
      const next = { ...prev, homePage: { ...prev.homePage, sections } }
      pushHistory(next)
      return next
    })
    setShowAddPanel(false)
    markDirty()
  }, [markDirty, pushHistory])

  const removeSection = useCallback((index: number) => {
    setConfigState((prev) => {
      const next = {
        ...prev,
        homePage: {
          ...prev.homePage,
          sections: prev.homePage.sections.filter((_, i) => i !== index),
        },
      }
      pushHistory(next)
      return next
    })
    setSelectedSectionIndex(null)
    markDirty()
  }, [markDirty, pushHistory])

  const moveSection = useCallback((fromIndex: number, toIndex: number) => {
    setConfigState((prev) => {
      const sections = [...prev.homePage.sections]
      const [moved] = sections.splice(fromIndex, 1)
      sections.splice(toIndex, 0, moved)
      const next = { ...prev, homePage: { ...prev.homePage, sections } }
      pushHistory(next)
      return next
    })
    setSelectedSectionIndex((prev) => {
      if (prev === fromIndex) return toIndex
      return prev
    })
    markDirty()
  }, [markDirty, pushHistory])

  const duplicateSection = useCallback((index: number) => {
    setConfigState((prev) => {
      const section = prev.homePage.sections[index]
      const duplicated: HomeSectionConfig = {
        type: section.type,
        props: JSON.parse(JSON.stringify(section.props)),
      } as HomeSectionConfig
      const sections = [...prev.homePage.sections]
      sections.splice(index + 1, 0, duplicated)
      const next = { ...prev, homePage: { ...prev.homePage, sections } }
      pushHistory(next)
      return next
    })
    markDirty()
  }, [markDirty, pushHistory])

  const updateSectionProps = useCallback((index: number, props: Record<string, any>) => {
    setConfigState((prev) => {
      const sections = [...prev.homePage.sections]
      const current = sections[index]
      sections[index] = { type: current.type, props: { ...current.props, ...props } } as HomeSectionConfig
      const next = { ...prev, homePage: { ...prev.homePage, sections } }
      pushHistory(next)
      return next
    })
    markDirty()
  }, [markDirty, pushHistory])

  const updateSectionProp = useCallback((index: number, key: string, value: any) => {
    setConfigState((prev) => {
      const sections = [...prev.homePage.sections]
      const current = sections[index]
      sections[index] = { type: current.type, props: { ...current.props, [key]: value } } as HomeSectionConfig
      const next = { ...prev, homePage: { ...prev.homePage, sections } }
      pushHistory(next)
      return next
    })
    markDirty()
  }, [markDirty, pushHistory])

  const selectSection = useCallback((index: number | null) => {
    setSelectedSectionIndex(index)
  }, [])

  const markSaved = useCallback(() => setIsDirty(false), [])
  const setSaving = useCallback((saving: boolean) => setIsSaving(saving), [])

  const resetConfig = useCallback((newConfig: TemplateConfig) => {
    setConfigState(newConfig)
    setSelectedSectionIndex(null)
    setIsDirty(false)
    historyRef.current = [JSON.parse(JSON.stringify(newConfig))]
    historyIndexRef.current = 0
    forceRender((n) => n + 1)
  }, [])

  const undo = useCallback(() => {
    const idx = historyIndexRef.current
    if (idx > 0) {
      historyIndexRef.current = idx - 1
      const prevConfig = JSON.parse(JSON.stringify(historyRef.current[idx - 1]))
      setConfigState(prevConfig)
      setIsDirty(true)
      forceRender((n) => n + 1)
    }
  }, [])

  const redo = useCallback(() => {
    const idx = historyIndexRef.current
    if (idx < historyRef.current.length - 1) {
      historyIndexRef.current = idx + 1
      const nextConfig = JSON.parse(JSON.stringify(historyRef.current[idx + 1]))
      setConfigState(nextConfig)
      setIsDirty(true)
      forceRender((n) => n + 1)
    }
  }, [])

  const canUndo = historyIndexRef.current > 0
  const canRedo = historyIndexRef.current < historyRef.current.length - 1

  return (
    <BuilderContext.Provider
      value={{
        config,
        selectedSectionIndex,
        previewDevice,
        isDirty,
        isSaving,
        showAddPanel,
        canUndo,
        canRedo,
        setConfig,
        updateMeta,
        updateColors,
        updateTypography,
        updateLayout,
        updateCustomCss,
        addSection,
        removeSection,
        moveSection,
        duplicateSection,
        updateSectionProps,
        updateSectionProp,
        selectSection,
        setPreviewDevice,
        setShowAddPanel,
        markSaved,
        setSaving,
        resetConfig,
        undo,
        redo,
      }}
    >
      {children}
    </BuilderContext.Provider>
  )
}
