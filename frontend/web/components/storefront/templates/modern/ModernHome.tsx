import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { HeroMedia } from "@/components/storefront/HeroMedia";
import "@/components/storefront/animations.css";
import type { StorefrontData } from "@/lib/storefront/types";

interface Props {
  data: StorefrontData;
}

/**
 * Modern Store — clean, contemporary, bright. Uses generous whitespace and
 * sharp typography. Works for any product category.
 */
export function ModernHome({ data }: Props) {
  const { store, products, featured, categories } = data;
  const currency = (store.settings.currency as string) || "BDT";
  const hero = store.settings.hero || {};
  const headline = hero.headline || `Welcome to ${store.name}`;
  const subtext =
    hero.subtext ||
    "Discover thoughtfully curated products with fast delivery and easy returns.";
  const ctaText = hero.buttonText || "Shop Now";
  const ctaUrl = hero.buttonUrl || `/store/${store.id}/products`;

  return (
    <main>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 sf-fade-up">
            <p
              className="text-sm font-medium tracking-wider uppercase mb-4"
              style={{ color: "var(--sf-accent)" }}
            >
              {categories.length > 0 ? `${categories.length}+ Categories` : "New arrivals"}
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
              style={{ fontFamily: "var(--sf-font-heading)" }}
            >
              {headline}
            </h1>
            <p className="mt-5 text-lg max-w-xl opacity-70 leading-relaxed">{subtext}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={ctaUrl.startsWith("/store/") || ctaUrl.startsWith("http") ? ctaUrl : `/store/${store.id}/products`}
                className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold"
                style={{
                  backgroundColor: "var(--sf-primary)",
                  color: "var(--sf-bg)",
                  borderRadius: "var(--sf-radius)",
                }}
              >
                {ctaText}
                <ArrowRight size={16} />
              </Link>
              <Link
                href={`/store/${store.id}/products`}
                className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold border"
                style={{
                  borderColor: "rgba(0,0,0,0.15)",
                  borderRadius: "var(--sf-radius)",
                }}
              >
                Browse all
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2 sf-fade-up sf-fade-up-delay-1">
            <div className="relative aspect-[4/5] lg:aspect-[5/6] overflow-hidden">
              <HeroMedia
                hero={hero}
                fallbackImage="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&h=1700&fit=crop"
                rounded
                overlay="none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section
        className="border-y"
        style={{ borderColor: "rgba(0,0,0,0.06)", backgroundColor: "rgba(0,0,0,0.015)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          {[
            { icon: Truck, label: "Free shipping over ৳1500" },
            { icon: ShieldCheck, label: "Secure payments" },
            { icon: RotateCcw, label: "Easy 7-day returns" },
            { icon: Headphones, label: "Friendly support" },
          ].map((vp) => (
            <div key={vp.label} className="flex items-center gap-3">
              <vp.icon size={18} style={{ color: "var(--sf-accent)" }} />
              <span className="font-medium opacity-80">{vp.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--sf-font-heading)" }}
            >
              Shop by category
            </h2>
            <Link
              href={`/store/${store.id}/products`}
              className="text-sm font-medium opacity-70 hover:opacity-100"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c}
                href={`/store/${store.id}/products?category=${encodeURIComponent(c)}`}
                className="aspect-square flex items-center justify-center text-center text-sm font-medium px-3 transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: "rgba(0,0,0,0.04)",
                  borderRadius: "var(--sf-radius)",
                }}
              >
                {c}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-baseline justify-between mb-8">
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--sf-font-heading)" }}
          >
            {featured === products ? "Latest products" : "Featured"}
          </h2>
          <Link
            href={`/store/${store.id}/products`}
            className="text-sm font-medium opacity-70 hover:opacity-100"
          >
            View all →
          </Link>
        </div>
        <ProductGrid
          storeId={store.id}
          products={featured.length ? featured : products.slice(0, 8)}
          currency={currency}
          emptyMessage="Add your first product from the dashboard to see it here."
        />
      </section>

      {/* Brand story */}
      {store.description ? (
        <section
          className="my-16 mx-4 sm:mx-6 lg:mx-auto lg:max-w-4xl py-16 px-6 text-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.03)",
            borderRadius: "var(--sf-radius)",
          }}
        >
          <p
            className="text-2xl sm:text-3xl font-medium leading-snug"
            style={{ fontFamily: "var(--sf-font-heading)" }}
          >
            {store.description}
          </p>
        </section>
      ) : null}
    </main>
  );
}
