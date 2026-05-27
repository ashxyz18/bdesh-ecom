import { notFound } from "next/navigation";
import { loadStorefrontById } from "@/lib/storefront/data";
import { classifyStoreTemplate } from "@/lib/storefront/templateKind";
import { getTemplateHome } from "@/components/storefront/templates";
import { LegacyTemplateFrame } from "@/components/storefront/LegacyTemplateFrame";

interface Params {
  params: Promise<{ storeId: string }>;
}

// Storefront pages are dynamic — products and theme can change at any time.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StorefrontHomePage({ params }: Params) {
  const { storeId } = await params;
  const data = await loadStorefrontById(storeId);
  if (!data) notFound();

  const classification = await classifyStoreTemplate(data.store.templateId);

  // Legacy ZIP-uploaded templates: serve the original iframe pipeline so the
  // 7+ existing templates keep working. Long-term these can be migrated to
  // React templates; for now we preserve backward compatibility.
  if (classification.kind === "legacy-iframe") {
    return <LegacyTemplateFrame storeId={storeId} slug={classification.slug} title={data.store.name} />;
  }

  // React-builtin (or unknown — registry falls back to ModernHome).
  const TemplateHome = getTemplateHome(data.store.templateId);
  return <TemplateHome data={data} />;
}
