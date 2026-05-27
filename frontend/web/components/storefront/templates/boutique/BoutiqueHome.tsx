import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { StorefrontData } from "@/lib/storefront/types";

interface Props {
  data: StorefrontData;
}

/**
 * Boutique — editorial, fashion-forward layout. Serif headings, asymmetric
 * hero, "shop the look" lookbook strip, and centered manifesto.
 */
export function BoutiqueHome({ data }: Props) {
  const { store, products, featured } = data;
  const currency = (store.settings.currency as string) || "BDT";
  const hero = store.settings.hero || {};
  const headline = hero.headline || "New season, timeless style";
  const subtext =
    hero.subtext ||
    "Hand-picked pieces for the modern wardrobe. Thoughtfully made, beautifully delivered.";
  const ctaText = hero.buttonText || "Shop the Collection";
  const heroImage =
    hero.image ||
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&h=1800&fit=crop";

  // Pick a hero product (the first featured or first product) for the look strip
  const lookbook = (featured.length ? featured : products).slice(0, 3);

  return (
    <main>
      {/* Editorial hero */}
      <section className="grid lg:grid-cols-12 min-h-[80vh]">
        <div className="lg:col-span-5 flex items-center px-6 sm:px-12 lg:pl-16 lg:pr-12 py-16 order-2 lg:order-1">
          <div className="max-w-md">
            <p className="text-xs tracking-[0.3em] uppercase mb-6 opacity-70">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} edition
            </p>
            <h1
              className="text-5xl lg:text-6xl xl:text-7xl leading-[1.05] tracking-tight"
              style={{ fontFamily: "var(--sf-font-heading)", fontWeight: 500 }}
            >
              {headline}
            </h1>
            <p className="mt-7 text-base opacity-75 leading-relaxed">{subtext}</p>
            <Link
              href={`/store/${store.id}/products`}
              className="mt-9 inline-flex items-center gap-3 text-sm font-medium tracking-wider uppercase pb-2"
              style={{
                borderBottom: "1px solid var(--sf-text)",
              }}
            >
              {ctaText}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-7 relative order-1 lg:order-2 min-h-[420px] lg:min-h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </section>

      {/* Manifesto */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p
          className="text-2xl sm:text-3xl leading-relaxed italic"
          style={{ fontFamily: "var(--sf-font-heading)" }}
        >
          {store.description ||
            `Pieces designed to last — sourced with care, finished by hand, and shipped to your door from ${store.name}.`}
        </p>
      </section>

      {/* Featured grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase mb-3 opacity-60">The Edit</p>
          <h2
            className="text-3xl sm:text-4xl"
            style={{ fontFamily: "var(--sf-font-heading)", fontWeight: 500 }}
          >
            Shop the season
          </h2>
        </div>
        <ProductGrid
          storeId={store.id}
          products={(featured.length ? featured : products).slice(0, 8)}
          currency={currency}
          columns={4}
          emptyMessage="The collection is empty. Add products from your dashboard to publish them here."
        />
      </section>

      {/* Lookbook strip */}
      {lookbook.length >= 3 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase mb-3 opacity-60">Lookbook</p>
            <h2
              className="text-3xl sm:text-4xl"
              style={{ fontFamily: "var(--sf-font-heading)", fontWeight: 500 }}
            >
              Three ways to wear it
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lookbook.map((p, i) => (
              <div key={p.id} className={i === 1 ? "md:translate-y-12" : ""}>
                <ProductCard storeId={store.id} product={p} currency={currency} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Newsletter */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <h3
          className="text-2xl sm:text-3xl mb-3"
          style={{ fontFamily: "var(--sf-font-heading)", fontWeight: 500 }}
        >
          Be the first to know
        </h3>
        <p className="opacity-70 mb-6">
          New arrivals, restocks, and members-only previews — delivered straight to your inbox.
        </p>
        <form className="flex max-w-md mx-auto gap-2">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-4 py-3 text-sm bg-transparent border outline-none"
            style={{
              borderColor: "rgba(0,0,0,0.2)",
              borderRadius: "var(--sf-radius)",
            }}
          />
          <button
            type="submit"
            className="px-6 py-3 text-sm font-semibold"
            style={{
              backgroundColor: "var(--sf-primary)",
              color: "var(--sf-bg)",
              borderRadius: "var(--sf-radius)",
            }}
          >
            Subscribe
          </button>
        </form>
      </section>
    </main>
  );
}
