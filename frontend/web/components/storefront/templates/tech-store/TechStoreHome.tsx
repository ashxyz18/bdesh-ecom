import Link from "next/link";
import { ArrowRight, Cpu, Truck, ShieldCheck, Zap } from "lucide-react";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { formatMoney, discountPercent } from "@/lib/storefront/format";
import type { StorefrontData, StorefrontProduct } from "@/lib/storefront/types";

interface Props {
  data: StorefrontData;
}

/**
 * TechStore — dark, high-contrast layout for electronics. The hero is split:
 * a marquee headline on the left, a "today's hero product" card on the right.
 */
export function TechStoreHome({ data }: Props) {
  const { store, products, featured, categories } = data;
  const currency = (store.settings.currency as string) || "BDT";
  const hero = store.settings.hero || {};
  const headline = hero.headline || "Tech that performs.";
  const subtext =
    hero.subtext ||
    "The latest electronics, vetted, supported, and shipped fast. Backed by a 30-day return policy.";

  const heroProduct: StorefrontProduct | null = featured[0] || products[0] || null;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, var(--sf-accent), transparent 40%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.4), transparent 40%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p
                className="inline-flex items-center gap-2 text-xs font-medium tracking-wider uppercase px-3 py-1 mb-6"
                style={{
                  border: "1px solid var(--sf-accent)",
                  color: "var(--sf-accent)",
                  borderRadius: "999px",
                }}
              >
                <Zap size={12} /> New drops weekly
              </p>
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
                style={{ fontFamily: "var(--sf-font-heading)" }}
              >
                {headline}
              </h1>
              <p className="mt-6 text-lg opacity-75 max-w-xl leading-relaxed">{subtext}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/store/${store.id}/products`}
                  className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold"
                  style={{
                    backgroundColor: "var(--sf-accent)",
                    color: "#0a0a0a",
                    borderRadius: "var(--sf-radius)",
                  }}
                >
                  Shop now <ArrowRight size={16} />
                </Link>
                <Link
                  href={`/store/${store.id}/products?featured=1`}
                  className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold"
                  style={{
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "var(--sf-radius)",
                  }}
                >
                  See deals
                </Link>
              </div>

              {/* Stats strip */}
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
                {[
                  { num: products.length.toString(), label: "Products" },
                  { num: "30d", label: "Returns" },
                  { num: "24h", label: "Dispatch" },
                ].map((s) => (
                  <div key={s.label}>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "var(--sf-accent)" }}
                    >
                      {s.num}
                    </div>
                    <div className="text-xs opacity-60 uppercase tracking-wider mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero product card */}
            {heroProduct ? (
              <Link
                href={`/store/${store.id}/products/${heroProduct.slug}`}
                className="block group"
              >
                <div
                  className="relative overflow-hidden border"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "var(--sf-radius)",
                    backgroundColor: "rgba(255,255,255,0.02)",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-50 pointer-events-none z-0"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--sf-accent), transparent 60%)",
                    }}
                  />
                  <div className="aspect-square relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        heroProduct.images[0] ||
                        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=800&fit=crop"
                      }
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="relative p-6 space-y-1.5">
                    <p className="text-xs tracking-wider uppercase opacity-60">Today&apos;s hero</p>
                    <h3
                      className="text-2xl font-semibold"
                      style={{ fontFamily: "var(--sf-font-heading)" }}
                    >
                      {heroProduct.name}
                    </h3>
                    <div className="flex items-baseline gap-3 pt-2">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: "var(--sf-accent)" }}
                      >
                        {formatMoney(heroProduct.price, currency)}
                      </span>
                      {heroProduct.comparePrice && heroProduct.comparePrice > heroProduct.price ? (
                        <>
                          <span className="text-sm line-through opacity-50">
                            {formatMoney(heroProduct.comparePrice, currency)}
                          </span>
                          <span
                            className="text-xs font-bold px-2 py-0.5"
                            style={{
                              backgroundColor: "var(--sf-accent)",
                              color: "#0a0a0a",
                              borderRadius: "999px",
                            }}
                          >
                            -{discountPercent(heroProduct.price, heroProduct.comparePrice)}%
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div
                className="aspect-square flex items-center justify-center text-center px-8 opacity-60 border"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  borderRadius: "var(--sf-radius)",
                }}
              >
                Add a product from the dashboard to feature it here.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c}
                href={`/store/${store.id}/products?category=${encodeURIComponent(c)}`}
                className="aspect-[4/3] flex flex-col items-center justify-center gap-2 text-sm font-medium px-3 transition-all hover:-translate-y-0.5"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "var(--sf-radius)",
                }}
              >
                <Cpu size={20} style={{ color: "var(--sf-accent)" }} />
                {c}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-baseline justify-between mb-10">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: "var(--sf-font-heading)" }}
          >
            Best sellers
          </h2>
          <Link
            href={`/store/${store.id}/products`}
            className="text-sm font-medium opacity-70 hover:opacity-100"
            style={{ color: "var(--sf-accent)" }}
          >
            View all →
          </Link>
        </div>
        <ProductGrid
          storeId={store.id}
          products={(featured.length ? featured : products).slice(0, 8)}
          currency={currency}
          emptyMessage="No products yet — add your first item from the dashboard."
        />
      </section>

      {/* Trust bar */}
      <section
        className="border-y"
        style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.02)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { icon: Truck, title: "Fast shipping", body: "Same-day dispatch on most orders" },
            { icon: ShieldCheck, title: "Genuine products", body: "Sourced direct from authorised brands" },
            { icon: Zap, title: "Real support", body: "Talk to a human, not a bot" },
          ].map((t) => (
            <div key={t.title} className="flex gap-4">
              <div
                className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "var(--sf-accent)",
                  color: "#0a0a0a",
                  borderRadius: "var(--sf-radius)",
                }}
              >
                <t.icon size={18} />
              </div>
              <div>
                <h4 className="font-semibold mb-1">{t.title}</h4>
                <p className="text-sm opacity-65">{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
