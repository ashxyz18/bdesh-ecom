"use client"

import { useMemo } from "react"
import { useBuilder } from "./BuilderContext"
import { getDemoStore } from "../store-templates/shared/demoData"
import ConfigTemplate from "../store-templates/engine/ConfigTemplate"
import { CustomerAuthProvider } from "../store-templates/shared/context/CustomerAuthContext"
import { CartProvider } from "../store-templates/shared/context/CartContext"
import { PreviewDeviceToggle } from "./PreviewDeviceToggle"

const DEVICE_WIDTHS: Record<string, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
}

export function BuilderPreview() {
  const { config, selectedSectionIndex, selectSection, previewDevice } = useBuilder()

  const store = useMemo(() => getDemoStore(config.id || "default"), [config.id])
  const storeId = store.id || "builder-preview"
  const width = DEVICE_WIDTHS[previewDevice] || "100%"

  return (
    <div className="flex flex-col h-full">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="text-xs text-slate-500 font-medium">
          Preview — {previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)}
        </div>
        <PreviewDeviceToggle />
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-slate-100/50">
        <div
          className="mx-auto transition-all duration-300 ease-in-out bg-white min-h-full shadow-sm"
          style={{
            width,
            maxWidth: "100%",
          }}
        >
          <div className="relative">
            {/* Section click overlays */}
            <div className="absolute inset-0 z-50 pointer-events-none">
              {config.homePage.sections.map((_, i) => (
                <SectionOverlay
                  key={i}
                  index={i}
                  isSelected={selectedSectionIndex === i}
                  onSelect={() => selectSection(i)}
                />
              ))}
            </div>

            {/* Live preview with required providers */}
            <CustomerAuthProvider storeId={storeId}>
              <CartProvider storeId={storeId}>
                <ConfigTemplate config={config} store={store} path={[]} />
              </CartProvider>
            </CustomerAuthProvider>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionOverlay({
  index,
  isSelected,
  onSelect,
}: {
  index: number
  isSelected: boolean
  onSelect: () => void
}) {
  // Placeholder — in a real implementation, we'd use refs to measure
  // each section's position. For now, invisible click targets.
  return null
}
