"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface BuilderState {
  // Wizard state
  currentStep: number
  businessName: string
  industry: string
  websiteType: string
  description: string
  
  // Template config
  templateConfig: Record<string, unknown> | null
  
  // UI state
  previewMode: "desktop" | "tablet" | "mobile"
  lang: "en" | "bn"
  showCustomizer: boolean
  
  // Actions
  setCurrentStep: (step: number) => void
  setBusinessName: (name: string) => void
  setIndustry: (industry: string) => void
  setWebsiteType: (type: string) => void
  setDescription: (desc: string) => void
  setTemplateConfig: (config: Record<string, unknown> | null) => void
  updateTemplateConfig: (updates: Record<string, unknown>) => void
  setPreviewMode: (mode: "desktop" | "tablet" | "mobile") => void
  setLang: (lang: "en" | "bn") => void
  setShowCustomizer: (show: boolean) => void
  resetBuilder: () => void
}

const initialState = {
  currentStep: 0,
  businessName: "",
  industry: "",
  websiteType: "ecommerce",
  description: "",
  templateConfig: null,
  previewMode: "desktop" as const,
  lang: "en" as const,
  showCustomizer: true,
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentStep: (step) => set({ currentStep: step }),
      setBusinessName: (name) => set({ businessName: name }),
      setIndustry: (industry) => set({ industry }),
      setWebsiteType: (type) => set({ websiteType: type }),
      setDescription: (desc) => set({ description: desc }),
      setTemplateConfig: (config) => set({ templateConfig: config }),
      updateTemplateConfig: (updates) =>
        set((state) => ({
          templateConfig: state.templateConfig
            ? { ...state.templateConfig, ...updates }
            : updates,
        })),
      setPreviewMode: (mode) => set({ previewMode: mode }),
      setLang: (lang) => set({ lang }),
      setShowCustomizer: (show) => set({ showCustomizer: show }),
      resetBuilder: () => set(initialState),
    }),
    {
      name: "bdesh-builder-storage",
      partialize: (state) => ({
        currentStep: state.currentStep,
        businessName: state.businessName,
        industry: state.industry,
        websiteType: state.websiteType,
        description: state.description,
        templateConfig: state.templateConfig,
        lang: state.lang,
      }),
    }
  )
)
