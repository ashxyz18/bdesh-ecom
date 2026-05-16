import type { DashboardRequirement, TemplateManifest, DashboardCatalogConfig } from "./manifest";

const DEFAULT_REQUIREMENTS: DashboardRequirement[] = [
  {
    id: "brand",
    label: "Add store branding",
    description: "Set your logo, hero copy, and visual identity.",
    href: "/dashboard/customize",
    type: "branding",
    required: true,
  },
  {
    id: "products",
    label: "Add products",
    description: "Create the catalog this template will display.",
    href: "/dashboard/products/new",
    type: "products",
    required: true,
  },
  {
    id: "settings",
    label: "Review store settings",
    description: "Confirm currency, checkout, and business details.",
    href: "/dashboard/settings",
    type: "settings",
  },
];

const DEFAULT_NAVIGATION = [
  "overview",
  "products",
  "orders",
  "customers",
  "coupons",
  "marketing",
  "analytics",
  "couriers",
  "customize",
  "settings",
];

export function getTemplateDashboard(manifest?: TemplateManifest | null) {
  const templateNavigation = manifest?.dashboard?.navigation || DEFAULT_NAVIGATION;

  // Merge catalog deeply — template catalog should fully override if present
  const templateCatalog = manifest?.dashboard?.catalog || null;
  const catalog: DashboardCatalogConfig | null = templateCatalog
    ? {
        label: templateCatalog.label,
        itemLabel: templateCatalog.itemLabel || "Products",
        collections: templateCatalog.collections || [],
        filters: templateCatalog.filters || [],
        productFields: templateCatalog.productFields || [],
      }
    : null;

  return {
    navigation: Array.from(new Set([...templateNavigation, ...DEFAULT_NAVIGATION])),
    setupChecklist:
      manifest?.dashboard?.setupChecklist && manifest.dashboard.setupChecklist.length > 0
        ? manifest.dashboard.setupChecklist
        : DEFAULT_REQUIREMENTS,
    quickActions: manifest?.dashboard?.quickActions || [],
    catalog,
    pages: manifest?.dashboard?.pages || [],
    embed: manifest?.dashboard?.embed || null,
  };
}

export function getTemplateDefaultSettings(manifest?: TemplateManifest | null) {
  const defaults: Record<string, unknown> = { ...(manifest?.defaultSettings || {}) };

  for (const [sectionKey, section] of Object.entries(manifest?.configSchema || {})) {
    const sectionDefaults: Record<string, unknown> = {};

    for (const [fieldKey, field] of Object.entries(section.fields || {})) {
      if (field.default !== undefined) {
        sectionDefaults[fieldKey] = field.default;
      }
    }

    if (Object.keys(sectionDefaults).length > 0) {
      defaults[sectionKey] = {
        ...sectionDefaults,
        ...((defaults[sectionKey] as Record<string, unknown>) || {}),
      };
    }
  }

  return defaults;
}

export function mergeTemplateSettings(
  currentSettings: Record<string, unknown>,
  manifest?: TemplateManifest | null
) {
  return deepMerge(getTemplateDefaultSettings(manifest), currentSettings);
}

export function mergeTemplateTheme(
  currentTheme: Record<string, unknown>,
  manifest?: TemplateManifest | null
) {
  return {
    ...(manifest?.defaultTheme || {}),
    ...currentTheme,
  };
}

/**
 * Determine if a dashboard requirement has been completed based on
 * store data. This now supports ALL requirement types that a template
 * can declare in bdesh.dashboard.json, not just products and branding.
 */
export function getRequirementStatus(
  requirement: DashboardRequirement,
  context: {
    productCount: number;
    store?: {
      logo?: string | null;
      banner?: string | null;
      description?: string | null;
      settings?: Record<string, unknown> | null;
    } | null;
  }
) {
  switch (requirement.type) {
    case "products":
      return context.productCount > 0;

    case "branding":
    case "theme":
      return Boolean(
        context.store?.logo ||
          context.store?.banner ||
          getNestedValue(context.store?.settings || {}, "brand.logo") ||
          getNestedValue(context.store?.settings || {}, "brand.storeName") ||
          getNestedValue(context.store?.settings || {}, "hero.image") ||
          getNestedValue(context.store?.settings || {}, "hero.headline")
      );

    case "settings":
      // Considered complete if the store has any custom settings beyond defaults
      return Boolean(
        context.store?.settings &&
          Object.keys(context.store.settings).length > 0 &&
          (getNestedValue(context.store.settings, "checkout") ||
            getNestedValue(context.store.settings, "delivery") ||
            getNestedValue(context.store.settings, "brand.storeName"))
      );

    case "orders":
      // Orders setup is about enabling checkout — considered done if payment settings exist
      return Boolean(
        getNestedValue(context.store?.settings || {}, "checkout.enableCOD") !== undefined ||
          getNestedValue(context.store?.settings || {}, "checkout.enableBkash") !== undefined
      );

    case "couriers":
      // Courier setup is considered done if delivery settings exist
      return Boolean(
        getNestedValue(context.store?.settings || {}, "delivery.defaultDeliveryCharge") !== undefined ||
          getNestedValue(context.store?.settings || {}, "delivery.deliveryPromise")
      );

    case "content":
      // Content requirements — check if the store has customized hero/announcement/etc.
      return Boolean(
        getNestedValue(context.store?.settings || {}, "hero.headline") ||
          getNestedValue(context.store?.settings || {}, "announcement.message") ||
          getNestedValue(context.store?.settings || {}, "seo.metaTitle")
      );

    default:
      // For any custom requirement type, check if a matching settings key exists
      if (requirement.id && context.store?.settings) {
        const settingsValue = getNestedValue(context.store.settings, requirement.id);
        if (settingsValue !== undefined) return Boolean(settingsValue);
        // Also check by type name as a settings namespace
        if (requirement.type) {
          const typeValue = getNestedValue(context.store.settings, requirement.type);
          if (typeValue !== undefined) return Boolean(typeValue);
        }
      }
      return false;
  }
}

/**
 * Calculate overall template adoption readiness as a percentage.
 */
export function getTemplateReadinessScore(
  requirements: DashboardRequirement[],
  context: {
    productCount: number;
    store?: {
      logo?: string | null;
      banner?: string | null;
      description?: string | null;
      settings?: Record<string, unknown> | null;
    } | null;
  }
): { score: number; completed: number; total: number; requiredCompleted: number; requiredTotal: number } {
  if (requirements.length === 0) return { score: 100, completed: 0, total: 0, requiredCompleted: 0, requiredTotal: 0 };

  let completed = 0;
  let requiredCompleted = 0;
  const requiredTotal = requirements.filter((r) => r.required).length;

  for (const req of requirements) {
    if (getRequirementStatus(req, context)) {
      completed++;
      if (req.required) requiredCompleted++;
    }
  }

  // Score weights required items more heavily
  const requiredWeight = 0.7;
  const optionalWeight = 0.3;
  const requiredScore = requiredTotal > 0 ? (requiredCompleted / requiredTotal) * 100 : 100;
  const optionalTotal = requirements.length - requiredTotal;
  const optionalCompleted = completed - requiredCompleted;
  const optionalScore = optionalTotal > 0 ? (optionalCompleted / optionalTotal) * 100 : 100;
  const score = Math.round(requiredScore * requiredWeight + optionalScore * optionalWeight);

  return { score, completed, total: requirements.length, requiredCompleted, requiredTotal };
}

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>) {
  const result: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(override || {})) {
    const baseValue = result[key];
    if (isRecord(baseValue) && isRecord(value)) {
      result[key] = deepMerge(baseValue, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function getNestedValue(source: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((value, key) => {
    if (!isRecord(value)) return undefined;
    return value[key];
  }, source);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
