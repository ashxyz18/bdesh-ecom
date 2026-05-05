"use client"

import { useMemo } from "react"
import ConfigTemplate from "./ConfigTemplate"
import type { TemplateConfig } from "./types"
import type { StoreTemplateProps } from "../types"
import { validateTemplateConfig } from "./types"

/**
 * Wrapper that adapts the config-driven template engine to the StoreTemplateProps interface.
 * This allows custom/uploaded templates to be rendered alongside built-in React templates.
 *
 * Usage: <ConfigTemplateWrapper store={store} path={path} configJson={jsonString} />
 */
export function ConfigTemplateWrapper({ store, path = [], configJson }: StoreTemplateProps & { configJson: string }) {
  const config = useMemo<TemplateConfig | null>(() => {
    try {
      const parsed = JSON.parse(configJson)
      const validation = validateTemplateConfig(parsed)
      if (!validation.valid) {
        console.error("Invalid template config:", validation.errors)
        return null
      }
      return parsed as TemplateConfig
    } catch (err) {
      console.error("Failed to parse template config JSON:", err)
      return null
    }
  }, [configJson])

  if (!config) {
    // Fallback: render a simple error state
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Template Configuration Error</h2>
          <p className="text-gray-500">This template has an invalid configuration. Please contact the store owner.</p>
        </div>
      </div>
    )
  }

  return <ConfigTemplate config={config} store={store} path={path} />
}
