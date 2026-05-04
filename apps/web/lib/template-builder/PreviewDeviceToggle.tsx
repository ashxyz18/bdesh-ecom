"use client"

import { Monitor, Tablet, Smartphone } from "lucide-react"
import { useBuilder } from "./BuilderContext"

const devices = [
  { key: "desktop" as const, label: "Desktop", icon: Monitor, width: "100%" },
  { key: "tablet" as const, label: "Tablet", icon: Tablet, width: "768px" },
  { key: "mobile" as const, label: "Mobile", icon: Smartphone, width: "375px" },
]

export function PreviewDeviceToggle() {
  const { previewDevice, setPreviewDevice } = useBuilder()

  return (
    <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
      {devices.map((device) => {
        const isActive = previewDevice === device.key
        return (
          <button
            key={device.key}
            onClick={() => setPreviewDevice(device.key)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
            title={`Preview on ${device.label} (${device.width})`}
          >
            <device.icon size={14} />
            <span className="hidden sm:inline">{device.label}</span>
          </button>
        )
      })}
    </div>
  )
}
