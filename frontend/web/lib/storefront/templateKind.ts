import "server-only";

import fs from "fs";
import path from "path";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { isBuiltinSlug } from "./templates";

/**
 * The platform supports two kinds of templates:
 *
 *   1. react-builtin — first-party React components in components/storefront/
 *      templates/<slug>. These read products directly from the database via
 *      `loadStorefrontById` and never need an adapter or iframe.
 *
 *   2. legacy-iframe — ZIP uploads dropped into `public/templates/<slug>/`.
 *      Served via /api/templates/serve in an iframe. They're expected to call
 *      /api/adapters/<slug>/products to fetch real catalog data — see
 *      docs/TEMPLATE_AUTHORING.md.
 *
 * `classifyStoreTemplate` accepts whatever value is stored on `Store.templateId`
 * — a builtin slug, a filesystem slug, or a Template DB-row cuid — and resolves
 * it to one of these two kinds (or `unknown` if nothing matches).
 */

export type TemplateKind =
  | { kind: "react-builtin"; slug: string }
  | { kind: "legacy-iframe"; slug: string }
  | { kind: "unknown" };

const TEMPLATES_ROOT = path.join(process.cwd(), "public", "templates");

function legacyTemplateExists(slug: string): boolean {
  if (!slug || slug.includes("/") || slug.includes("..")) return false;
  const indexPath = path.join(TEMPLATES_ROOT, slug, "index.html");
  return fs.existsSync(indexPath);
}

export const classifyStoreTemplate = cache(
  async (templateId: string | null | undefined): Promise<TemplateKind> => {
    if (!templateId) return { kind: "unknown" };

    // 1. First-class React template (modern / boutique / tech-store / aurora).
    if (isBuiltinSlug(templateId)) {
      return { kind: "react-builtin", slug: templateId };
    }

    // 2. Direct filesystem slug (e.g. "koskii", "pandx" — what you'd type in
    //    bdesh.dashboard.example.json).
    if (legacyTemplateExists(templateId)) {
      return { kind: "legacy-iframe", slug: templateId };
    }

    // 3. Template DB-row cuid — look up the row and see what slug it points at.
    const tpl = await prisma.template.findUnique({
      where: { id: templateId },
      select: { slug: true },
    });
    if (tpl?.slug) {
      if (isBuiltinSlug(tpl.slug)) {
        return { kind: "react-builtin", slug: tpl.slug };
      }
      if (legacyTemplateExists(tpl.slug)) {
        return { kind: "legacy-iframe", slug: tpl.slug };
      }
    }

    return { kind: "unknown" };
  },
);
