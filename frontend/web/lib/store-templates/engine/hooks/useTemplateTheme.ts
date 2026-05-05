"use client"

import { useMemo } from "react"
import type { TemplateConfig, TemplateColors } from "../types"

export interface ResolvedTheme {
  // CSS custom properties object for style injection
  cssVars: Record<string, string>
  // Tailwind-compatible class fragments
  bgPrimary: string
  bgSecondary: string
  bgAccent: string
  bgSurface: string
  bgBackground: string
  textPrimary: string
  textMuted: string
  borderClass: string
  textOnPrimary: string
  // Radius
  radiusClass: string
  radiusValue: string
  // Spacing
  sectionPadding: string
  // Card
  cardClass: string
  // Max width
  maxWidthClass: string
  // Product columns
  productGridCols: string
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null
}

function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5
}

const RADIUS_MAP: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
}

const RADIUS_VALUE_MAP: Record<string, string> = {
  none: "0px",
  sm: "0.125rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  full: "9999px",
}

const SPACING_MAP: Record<string, string> = {
  compact: "py-8 md:py-12",
  normal: "py-12 md:py-16",
  spacious: "py-16 md:py-24",
}

const CARD_CLASS_MAP: Record<string, string> = {
  flat: "bg-[var(--tpl-surface)]",
  bordered: "bg-[var(--tpl-surface)] border border-[var(--tpl-border)]",
  shadowed: "bg-[var(--tpl-surface)] shadow-md",
  elevated: "bg-[var(--tpl-surface)] shadow-lg border border-[var(--tpl-border)]/50",
}

const MAX_WIDTH_MAP: Record<string, string> = {
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
}

const GRID_COLS_MAP: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}

export function useTemplateTheme(config: TemplateConfig): ResolvedTheme {
  return useMemo(() => {
    const colors = config.colors
    const typography = config.typography
    const layout = config.layout

    const cssVars: Record<string, string> = {
      "--tpl-primary": colors.primary,
      "--tpl-secondary": colors.secondary,
      "--tpl-accent": colors.accent,
      "--tpl-bg": colors.background,
      "--tpl-surface": colors.surface,
      "--tpl-text": colors.text,
      "--tpl-text-muted": colors.textMuted,
      "--tpl-border": colors.border,
      "--tpl-success": colors.success,
      "--tpl-error": colors.error,
      "--tpl-radius": RADIUS_VALUE_MAP[typography.borderRadius] || "0.75rem",
    }

    const primaryIsLight = isLightColor(colors.primary)
    const textOnPrimary = primaryIsLight ? "text-gray-900" : "text-white"

    return {
      cssVars,
      bgPrimary: "bg-[var(--tpl-primary)]",
      bgSecondary: "bg-[var(--tpl-secondary)]",
      bgAccent: "bg-[var(--tpl-accent)]",
      bgSurface: "bg-[var(--tpl-surface)]",
      bgBackground: "bg-[var(--tpl-bg)]",
      textPrimary: "text-[var(--tpl-text)]",
      textMuted: "text-[var(--tpl-text-muted)]",
      borderClass: "border-[var(--tpl-border)]",
      textOnPrimary,
      radiusClass: RADIUS_MAP[typography.borderRadius] || "rounded-xl",
      radiusValue: RADIUS_VALUE_MAP[typography.borderRadius] || "0.75rem",
      sectionPadding: SPACING_MAP[layout.sectionSpacing] || "py-12 md:py-16",
      cardClass: CARD_CLASS_MAP[layout.cardStyle] || "bg-[var(--tpl-surface)] border border-[var(--tpl-border)]",
      maxWidthClass: MAX_WIDTH_MAP[layout.maxWidth] || "max-w-7xl",
      productGridCols: GRID_COLS_MAP[layout.productColumns] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    }
  }, [config])
}
