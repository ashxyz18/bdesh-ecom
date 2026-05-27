import { notFound } from "next/navigation";
import { loadStorefrontById } from "@/lib/storefront/data";
import { getTemplateHome } from "@/components/storefront/templates";

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

  // Pick the right Home component for this store's template. ModernHome is
  // the safe default if templateId is missing or unknown.
  const TemplateHome = getTemplateHome(data.store.templateId);
  return <TemplateHome data={data} />;
}
