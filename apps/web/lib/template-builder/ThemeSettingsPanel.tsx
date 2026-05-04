"use client"

import { useBuilder } from "./BuilderContext"

const FONT_OPTIONS = [
  "Inter",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Playfair Display",
  "Merriweather",
  "Source Sans Pro",
  "Nunito",
  "Raleway",
  "Work Sans",
  "DM Sans",
  "Manrope",
  "Space Grotesk",
]

export function ThemeSettingsPanel() {
  const { config, updateColors, updateTypography, updateLayout } = useBuilder()

  return (
    <div className="p-4 space-y-6">
      {/* Colors */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Colors</h4>
        <div className="space-y-3">
          <ColorField label="Primary" value={config.colors.primary} onChange={(v) => updateColors({ primary: v })} />
          <ColorField label="Secondary" value={config.colors.secondary} onChange={(v) => updateColors({ secondary: v })} />
          <ColorField label="Accent" value={config.colors.accent} onChange={(v) => updateColors({ accent: v })} />
          <ColorField label="Background" value={config.colors.background} onChange={(v) => updateColors({ background: v })} />
          <ColorField label="Surface" value={config.colors.surface} onChange={(v) => updateColors({ surface: v })} />
          <ColorField label="Text" value={config.colors.text} onChange={(v) => updateColors({ text: v })} />
          <ColorField label="Text Muted" value={config.colors.textMuted} onChange={(v) => updateColors({ textMuted: v })} />
          <ColorField label="Border" value={config.colors.border} onChange={(v) => updateColors({ border: v })} />
          <ColorField label="Success" value={config.colors.success} onChange={(v) => updateColors({ success: v })} />
          <ColorField label="Error" value={config.colors.error} onChange={(v) => updateColors({ error: v })} />
        </div>
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Typography</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Heading Font</label>
            <select
              value={config.typography.headingFont}
              onChange={(e) => updateTypography({ headingFont: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Body Font</label>
            <select
              value={config.typography.bodyFont}
              onChange={(e) => updateTypography({ bodyFont: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Heading Weight</label>
            <select
              value={config.typography.headingWeight}
              onChange={(e) => updateTypography({ headingWeight: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semibold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extrabold (800)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Border Radius</label>
            <select
              value={config.typography.borderRadius}
              onChange={(e) => updateTypography({ borderRadius: e.target.value as any })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="none">None</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
              <option value="2xl">2XL</option>
              <option value="full">Full (Pill)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Layout</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Max Width</label>
            <select
              value={config.layout.maxWidth}
              onChange={(e) => updateLayout({ maxWidth: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="1024px">1024px (Narrow)</option>
              <option value="1152px">1152px</option>
              <option value="1280px">1280px (Standard)</option>
              <option value="1400px">1400px (Wide)</option>
              <option value="1536px">1536px (Full)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Section Spacing</label>
            <select
              value={config.layout.sectionSpacing}
              onChange={(e) => updateLayout({ sectionSpacing: e.target.value as any })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Card Style</label>
            <select
              value={config.layout.cardStyle}
              onChange={(e) => updateLayout({ cardStyle: e.target.value as any })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="flat">Flat</option>
              <option value="bordered">Bordered</option>
              <option value="shadowed">Shadowed</option>
              <option value="elevated">Elevated</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Product Columns</label>
            <select
              value={config.layout.productColumns}
              onChange={(e) => updateLayout({ productColumns: Number(e.target.value) as any })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Navigation</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Navbar Style</label>
            <select
              value={config.navbar.style}
              onChange={(e) => updateLayout({ } as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="sticky-white">Sticky White</option>
              <option value="sticky-blur">Sticky Blur</option>
              <option value="sticky-dark">Sticky Dark</option>
              <option value="transparent">Transparent</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Footer Style</label>
            <select
              value={config.footer.style}
              onChange={(e) => updateLayout({ } as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Color Presets */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Color Presets</h4>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => updateColors(preset.colors)}
              className="group relative aspect-square rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-500 transition-colors"
              title={preset.name}
            >
              <div className="absolute inset-0 flex">
                <div className="flex-1" style={{ backgroundColor: preset.colors.primary }} />
                <div className="flex-1" style={{ backgroundColor: preset.colors.accent }} />
                <div className="flex-1" style={{ backgroundColor: preset.colors.background }} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent flex-shrink-0"
      />
      <div className="flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <span className="text-[10px] text-slate-500 w-16 text-right">{label}</span>
    </div>
  )
}

const COLOR_PRESETS = [
  {
    name: "Emerald",
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
  },
  {
    name: "Rose",
    colors: {
      primary: "#f43f5e",
      secondary: "#e11d48",
      accent: "#8b5cf6",
      background: "#ffffff",
      surface: "#fff1f2",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#fecdd3",
      success: "#22c55e",
      error: "#dc2626",
    },
  },
  {
    name: "Ocean",
    colors: {
      primary: "#0ea5e9",
      secondary: "#0284c7",
      accent: "#f97316",
      background: "#ffffff",
      surface: "#f0f9ff",
      text: "#0c4a6e",
      textMuted: "#64748b",
      border: "#bae6fd",
      success: "#22c55e",
      error: "#ef4444",
    },
  },
  {
    name: "Violet",
    colors: {
      primary: "#8b5cf6",
      secondary: "#7c3aed",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f5f3ff",
      text: "#1e1b4b",
      textMuted: "#6b7280",
      border: "#ddd6fe",
      success: "#22c55e",
      error: "#ef4444",
    },
  },
  {
    name: "Amber",
    colors: {
      primary: "#f59e0b",
      secondary: "#d97706",
      accent: "#10b981",
      background: "#ffffff",
      surface: "#fffbeb",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#fde68a",
      success: "#22c55e",
      error: "#ef4444",
    },
  },
  {
    name: "Slate",
    colors: {
      primary: "#475569",
      secondary: "#334155",
      accent: "#10b981",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
      success: "#22c55e",
      error: "#ef4444",
    },
  },
  {
    name: "Dark",
    colors: {
      primary: "#a78bfa",
      secondary: "#8b5cf6",
      accent: "#fbbf24",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f1f5f9",
      textMuted: "#94a3b8",
      border: "#334155",
      success: "#4ade80",
      error: "#f87171",
    },
  },
  {
    name: "Forest",
    colors: {
      primary: "#16a34a",
      secondary: "#15803d",
      accent: "#ca8a04",
      background: "#fefce8",
      surface: "#f7fee7",
      text: "#1a2e05",
      textMuted: "#4d7c0f",
      border: "#d9f99d",
      success: "#22c55e",
      error: "#ef4444",
    },
  },
]
