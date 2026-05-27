import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStorefrontById } from "@/lib/storefront/data";
import { buildThemeStyle } from "@/lib/storefront/theme";
import { StoreCartProvider } from "@/components/storefront/StoreCartProvider";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { getHeaderVariant } from "@/components/storefront/templates";

interface Params {
  params: Promise<{ storeId: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { storeId } = await params;
  const data = await loadStorefrontById(storeId);
  if (!data) return { title: "Store not found" };
  const seo = (data.store.settings.seo as Record<string, string> | undefined) || {};
  const title = seo.metaTitle || data.store.name;
  const description = seo.metaDescription || data.store.description || `Shop ${data.store.name}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: data.store.banner ? [{ url: data.store.banner }] : undefined,
    },
    icons: data.store.settings.brand && (data.store.settings.brand as Record<string, string>).favicon
      ? { icon: (data.store.settings.brand as Record<string, string>).favicon }
      : undefined,
  };
}

export default async function StorefrontLayout({
  params,
  children,
}: Params & { children: ReactNode }) {
  const { storeId } = await params;
  const data = await loadStorefrontById(storeId);
  if (!data) notFound();

  const { store, categories } = data;
  const variant = getHeaderVariant(store.templateId);
  const themeStyle = buildThemeStyle(store.templateId, store.theme);
  const currency = (store.settings.currency as string) || "BDT";
  const freeDeliveryThreshold =
    (store.settings.delivery as Record<string, number> | undefined)?.freeDeliveryThreshold ?? 1500;

  return (
    <div style={themeStyle} className="min-h-screen flex flex-col">
      <StoreCartProvider storeId={store.id}>
        <StorefrontHeader store={store} categories={categories} variant={variant} />
        <div className="flex-1">{children}</div>
        <StorefrontFooter store={store} variant={variant} />
        <CartDrawer
          storeId={store.id}
          currency={currency}
          freeDeliveryThreshold={freeDeliveryThreshold}
        />
      </StoreCartProvider>
    </div>
  );
}
