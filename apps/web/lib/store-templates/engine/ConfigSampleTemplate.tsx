"use client"

import { useMemo } from "react"
import ConfigTemplate from "./ConfigTemplate"
import { sampleConfigs } from "./sampleConfigs"
import type { StoreTemplateProps } from "../types"

/**
 * Adapter that renders a sample config-driven template as a built-in template.
 * Used for Bangladesh-specific templates (salon, tuition, clinic, pharmacy, corporate, portfolio)
 * that are defined purely through config rather than custom React components.
 */
export function createConfigSampleTemplate(configKey: string) {
  return function ConfigSampleTemplate({ store, path = [] }: StoreTemplateProps) {
    const config = useMemo(() => sampleConfigs[configKey], [configKey])

    if (!config) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Template Not Found</h2>
            <p className="text-gray-500">The template configuration "{configKey}" could not be loaded.</p>
          </div>
        </div>
      )
    }

    return <ConfigTemplate config={config} store={store} path={path} />
  }
}
