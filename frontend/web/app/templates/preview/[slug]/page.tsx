import { notFound } from "next/navigation";
import { isBuiltinSlug } from "@/lib/storefront/templates";
import { buildSampleStorefront } from "@/lib/storefront/sampleData";
import { buildThemeStyle } from "@/lib/storefront/theme";
import { getTemplateHome, getHeaderVariant } from "@/components/storefront/templates";
import { StoreCartProvider } from "@/components/storefront/StoreCartProvider";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartDrawer } from "@/components/storefront/CartDrawer";

interface Params {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-static";

export default async function TemplatePreviewPage({ params }: Params) {
  const { slug } = await params;
  if (!isBuiltinSlug(slug)) notFound();

  const data = buildSampleStorefront(slug);
  const TemplateHome = getTemplateHome(slug);
  const variant = getHeaderVariant(slug);
  const themeStyle = buildThemeStyle(slug, data.store.theme);

  return (
    <div style={themeStyle} className="min-h-screen flex flex-col">
      <StoreCartProvider storeId={data.store.id}>
        <PreviewBanner slug={slug} />
        <StorefrontHeader store={data.store} categories={data.categories} variant={variant} />
        <div className="flex-1">
          <TemplateHome data={data} />
        </div>
        <StorefrontFooter store={data.store} variant={variant} />
        <CartDrawer storeId={data.store.id} />
      </StoreCartProvider>
    </div>
  );
}

function PreviewBanner({ slug }: { slug: string }) {
  return (
    <div className="bg-amber-100 text-amber-900 text-xs sm:text-sm px-4 py-2 text-center">
      Live preview of the <strong className="font-semibold">{slug}</strong> template using
      sample products.{" "}
      <a href="/signup" className="underline font-semibold">Start with this template →</a>
    </div>
  );
}
