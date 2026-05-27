import type { CSSProperties } from "react";
import type { StoreTheme } from "./types";
import { getBuiltinTemplate, resolveTemplateSlug } from "./templates";

/**
 * Combine the built-in template's default theme with whatever the merchant
 * has saved in `store.theme`, then expose the result as CSS variables. This
 * is the single way themes get applied — so every storefront component just
 * uses var(--sf-primary) etc. and stays template-agnostic.
 */
export function buildThemeStyle(
  templateId: string | null | undefined,
  storeTheme: StoreTheme,
): CSSProperties {
  const builtin = getBuiltinTemplate(resolveTemplateSlug(templateId));
  const merged: Required<StoreTheme> = {
    primaryColor: storeTheme.primaryColor || builtin.defaultTheme.primaryColor,
    accentColor: storeTheme.accentColor || builtin.defaultTheme.accentColor,
    backgroundColor: storeTheme.backgroundColor || builtin.defaultTheme.backgroundColor,
    textColor: storeTheme.textColor || builtin.defaultTheme.textColor,
    mutedColor: storeTheme.mutedColor || builtin.defaultTheme.mutedColor,
    fontFamilyHeading: storeTheme.fontFamilyHeading || builtin.defaultTheme.fontFamilyHeading,
    fontFamilyBody: storeTheme.fontFamilyBody || builtin.defaultTheme.fontFamilyBody,
    cornerRadius: storeTheme.cornerRadius || builtin.defaultTheme.cornerRadius,
  };

  const radiusMap = { none: "0px", small: "4px", medium: "10px", large: "20px" };

  return {
    "--sf-primary": merged.primaryColor,
    "--sf-accent": merged.accentColor,
    "--sf-bg": merged.backgroundColor,
    "--sf-text": merged.textColor,
    "--sf-muted": merged.mutedColor,
    "--sf-font-heading": merged.fontFamilyHeading,
    "--sf-font-body": merged.fontFamilyBody,
    "--sf-radius": radiusMap[merged.cornerRadius],
    backgroundColor: "var(--sf-bg)",
    color: "var(--sf-text)",
    fontFamily: "var(--sf-font-body)",
  } as CSSProperties;
}
