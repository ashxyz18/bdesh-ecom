import type { ComponentType } from "react";
import { ModernHome } from "./modern/ModernHome";
import { BoutiqueHome } from "./boutique/BoutiqueHome";
import { TechStoreHome } from "./tech-store/TechStoreHome";
import { AuroraHome } from "./aurora/AuroraHome";
import {
  resolveTemplateSlug,
  type BuiltinTemplateSlug,
} from "@/lib/storefront/templates";
import type { StorefrontData } from "@/lib/storefront/types";

interface TemplateHomeProps {
  data: StorefrontData;
}

const HOME_BY_SLUG: Record<BuiltinTemplateSlug, ComponentType<TemplateHomeProps>> = {
  modern: ModernHome,
  boutique: BoutiqueHome,
  "tech-store": TechStoreHome,
  aurora: AuroraHome,
};

/**
 * Looks up the right Home component for the storefront's templateId. Falls
 * back to ModernHome if the value is missing or unknown so that no store
 * ever fails to render.
 */
export function getTemplateHome(templateId: string | null | undefined): ComponentType<TemplateHomeProps> {
  return HOME_BY_SLUG[resolveTemplateSlug(templateId)];
}

export function getHeaderVariant(templateId: string | null | undefined): "light" | "dark" {
  return resolveTemplateSlug(templateId) === "tech-store" ? "dark" : "light";
}
