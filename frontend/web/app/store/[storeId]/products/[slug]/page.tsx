import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { loadStorefrontProduct } from "@/lib/storefront/data";
import { ProductDetailPanel } from "@/components/storefront/ProductDetailPanel";
import { ProductGrid } from "@/components/storefront/ProductGrid";

interface Params {
  params: Promise<{ storeId: string; slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Params) {
  const { storeId, slug } = await params;
  const result = await loadStorefrontProduct(storeId, slug);
  if (!result) return { title: "Product not found" };
  return {
    title: result.product.name,
    description: result.product.description || `${result.product.name} on ${result.store.name}`,
  };
}

export default async function ProductPage({ params }: Params) {
  const { storeId, slug } = await params;
  const result = await loadStorefrontProduct(storeId, slug);
  if (!result) notFound();

  const { store, product, related } = result;
  const currency = (store.settings.currency as string) || "BDT";
  const browseHref = `/store/${storeId}/products`;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs opacity-60 mb-8">
        <Link href={`/store/${storeId}`} className="hover:underline">Home</Link>
        <ChevronRight size={12} />
        <Link href={browseHref} className="hover:underline">Products</Link>
        {product.category ? (
          <>
            <ChevronRight size={12} />
            <Link
              href={`${browseHref}?category=${encodeURIComponent(product.category)}`}
              className="hover:underline"
            >
              {product.category}
            </Link>
          </>
        ) : null}
        <ChevronRight size={12} />
        <span className="truncate max-w-[280px]">{product.name}</span>
      </nav>

      <ProductDetailPanel storeId={storeId} product={product} currency={currency} />

      {related.length > 0 ? (
        <section className="mt-20">
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-8"
            style={{ fontFamily: "var(--sf-font-heading)" }}
          >
            You may also like
          </h2>
          <ProductGrid storeId={storeId} products={related} currency={currency} columns={4} />
        </section>
      ) : null}
    </main>
  );
}
