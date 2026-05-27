import { ProductCard } from "./ProductCard";
import type { StorefrontProduct } from "@/lib/storefront/types";

interface Props {
  storeId: string;
  products: StorefrontProduct[];
  currency?: string;
  columns?: 2 | 3 | 4;
  emptyMessage?: string;
}

/**
 * Server-rendered grid that delegates per-card interactivity to ProductCard
 * (a client component). Used by the home page, catalog, and "related
 * products" sections in the PDP.
 */
export function ProductGrid({
  storeId,
  products,
  currency = "BDT",
  columns = 4,
  emptyMessage = "No products yet",
}: Props) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 opacity-60 text-sm">{emptyMessage}</div>
    );
  }

  const colsClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
      ? "grid-cols-2 md:grid-cols-3"
      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={`grid gap-x-4 gap-y-8 sm:gap-x-6 ${colsClass}`}>
      {products.map((p) => (
        <ProductCard key={p.id} storeId={storeId} product={p} currency={currency} />
      ))}
    </div>
  );
}
