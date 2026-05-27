import Link from "next/link";
import { notFound } from "next/navigation";
import { loadStorefrontById } from "@/lib/storefront/data";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import type { StorefrontProduct } from "@/lib/storefront/types";

interface Params {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: "newest" | "price-asc" | "price-desc" | "name";
    featured?: string;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CatalogPage({ params, searchParams }: Params) {
  const { storeId } = await params;
  const { q, category, sort = "newest", featured } = await searchParams;

  const data = await loadStorefrontById(storeId);
  if (!data) notFound();

  const currency = (data.store.settings.currency as string) || "BDT";

  // Filter
  let products: StorefrontProduct[] = data.products;
  if (q) {
    const needle = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.description || "").toLowerCase().includes(needle) ||
        p.tags.some((t) => t.toLowerCase().includes(needle)),
    );
  }
  if (category) {
    products = products.filter((p) => p.category === category);
  }
  if (featured === "1") {
    products = products.filter((p) => p.featured);
  }

  // Sort
  switch (sort) {
    case "price-asc":
      products = [...products].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products = [...products].sort((a, b) => b.price - a.price);
      break;
    case "name":
      products = [...products].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
    default:
      // already in featured-first / createdAt-desc order from the loader
      break;
  }

  const browseHref = `/store/${storeId}/products`;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ fontFamily: "var(--sf-font-heading)" }}
        >
          {category ? category : q ? `Search: "${q}"` : "All products"}
        </h1>
        <p className="mt-2 text-sm opacity-60">
          {products.length} {products.length === 1 ? "item" : "items"}
        </p>
      </header>

      <div className="grid lg:grid-cols-[220px_1fr] gap-10">
        {/* Filters sidebar */}
        <aside>
          <h3 className="text-xs font-semibold tracking-wider uppercase mb-3 opacity-70">
            Categories
          </h3>
          <ul className="space-y-1.5 text-sm">
            <li>
              <Link
                href={browseHref}
                className={`hover:underline ${!category ? "font-semibold" : "opacity-75"}`}
              >
                All
              </Link>
            </li>
            {data.categories.map((c) => (
              <li key={c}>
                <Link
                  href={`${browseHref}?category=${encodeURIComponent(c)}`}
                  className={`hover:underline ${category === c ? "font-semibold" : "opacity-75"}`}
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>

          <h3 className="text-xs font-semibold tracking-wider uppercase mt-8 mb-3 opacity-70">
            Sort
          </h3>
          <ul className="space-y-1.5 text-sm">
            {(
              [
                { v: "newest", l: "Newest" },
                { v: "price-asc", l: "Price: low to high" },
                { v: "price-desc", l: "Price: high to low" },
                { v: "name", l: "Name (A-Z)" },
              ] as const
            ).map((s) => {
              const qs = new URLSearchParams();
              if (q) qs.set("q", q);
              if (category) qs.set("category", category);
              qs.set("sort", s.v);
              return (
                <li key={s.v}>
                  <Link
                    href={`${browseHref}?${qs.toString()}`}
                    className={`hover:underline ${sort === s.v ? "font-semibold" : "opacity-75"}`}
                  >
                    {s.l}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Grid */}
        <div>
          <ProductGrid
            storeId={storeId}
            products={products}
            currency={currency}
            columns={4}
            emptyMessage={
              q
                ? `No products match "${q}".`
                : "No products yet. Once the store owner adds products from their dashboard, they will appear here."
            }
          />
        </div>
      </div>
    </main>
  );
}
