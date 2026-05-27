import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { HeroMedia } from "@/components/storefront/HeroMedia";
import "@/components/storefront/animations.css";
import type { StorefrontData } from "@/lib/storefront/types";

interface Props {
  data: StorefrontData;
}

/**
 * Aurora — cinematic, motion-rich storefront for lifestyle, fashion, and
 * beauty brands. The hero supports a looping background video out of the
 * box (set hero.videoUrl in the dashboard). When no video is configured it
 * falls back to a generated animated gradient mesh + the hero image.
 *
 * All animations honor `prefers-reduced-motion`.
 */
export function AuroraHome({ data }: Props) {
  const { store, products, featured, categories } = data;
  const currency = (store.settings.currency as string) || "BDT";
  const hero = store.settings.hero || {};
  const headline = hero.headline || `Made to move.`;
  const subtext =
    hero.subtext ||
    "Designed in studio, finished by hand. Every piece is built to last.";

  const browseHref = `/store/${store.id}/products`;
  const showcase = (featured.length ? featured : products).slice(0, 6);

  return (
    <main>
      {/* ── Hero — full-bleed, video or animated mesh ── */}
      <section className="relative h-[85vh] min-h-[560px] overflow-hidden flex items-center">
        {/* Animated gradient mesh sits behind any video so the page never
            feels empty even when the video hasn't loaded yet. */}
        <div
          className="sf-mesh"
          style={{
            background:
              "radial-gradient(40% 50% at 20% 30%, var(--sf-accent), transparent 70%)," +
              "radial-gradient(35% 45% at 75% 70%, #6366f1, transparent 65%)," +
              "radial-gradient(35% 50% at 50% 90%, #ec4899, transparent 70%)",
          }}
        />
        <HeroMedia
          hero={hero}
          fallbackImage="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&h=1200&fit=crop"
          overlay="gradient"
        />

        <div className="relative max-w-7xl w-full mx-auto px-6 lg:px-12 py-16">
          <div className="max-w-2xl text-white">
            <p className="sf-fade-up inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase opacity-90 mb-5 backdrop-blur-md bg-white/10 px-3 py-1.5 rounded-full">
              <Sparkles size={12} />
              {store.settings.announcement?.message || "New collection"}
            </p>
            <h1
              className="sf-fade-up sf-fade-up-delay-1 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight"
              style={{ fontFamily: "var(--sf-font-heading)" }}
            >
              {headline}
            </h1>
            <p className="sf-fade-up sf-fade-up-delay-2 mt-6 text-lg max-w-lg opacity-90 leading-relaxed">
              {subtext}
            </p>
            <div className="sf-fade-up sf-fade-up-delay-3 mt-9 flex flex-wrap gap-3">
              <Link
                href={browseHref}
                className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold backdrop-blur"
                style={{
                  backgroundColor: "#fff",
                  color: "#000",
                  borderRadius: "var(--sf-radius)",
                }}
              >
                {hero.buttonText || "Shop now"}
                <ArrowRight size={16} />
              </Link>
              {hero.secondaryButtonText ? (
                <Link
                  href={hero.secondaryButtonUrl || browseHref}
                  className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-white border border-white/40 backdrop-blur"
                  style={{ borderRadius: "var(--sf-radius)" }}
                >
                  <Play size={14} />
                  {hero.secondaryButtonText}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee strip (subtle, ecommerce trust signals) ── */}
      <section className="border-y" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="overflow-hidden py-4">
          <div className="sf-marquee">
            {Array.from({ length: 2 }).map((_, dupe) => (
              <div key={dupe} className="flex items-center gap-12 px-6 text-sm font-medium opacity-70">
                <span>Free express shipping over ৳2500</span>
                <span>·</span>
                <span>14-day no-questions returns</span>
                <span>·</span>
                <span>bKash, Nagad &amp; cash on delivery</span>
                <span>·</span>
                <span>Hand-finished in Dhaka</span>
                <span>·</span>
                <span>Real customer support, real fast</span>
                <span>·</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Showcase: large + small grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase opacity-60 mb-2">The Drop</p>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--sf-font-heading)" }}
            >
              Featured this week
            </h2>
          </div>
          <Link
            href={browseHref}
            className="text-sm font-medium opacity-70 hover:opacity-100 hidden sm:inline-flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {showcase.length >= 4 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Big feature card */}
            <Link
              href={`/store/${store.id}/products/${showcase[0].slug}`}
              className="lg:row-span-2 lg:col-span-2 group relative aspect-[4/3] lg:aspect-auto overflow-hidden"
              style={{
                borderRadius: "var(--sf-radius)",
                backgroundColor: "rgba(0,0,0,0.04)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  showcase[0].images[0] ||
                  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=900&fit=crop"
                }
                alt={showcase[0].name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                <p className="text-xs tracking-[0.2em] uppercase opacity-80 mb-2">Editor&apos;s pick</p>
                <h3
                  className="text-2xl sm:text-3xl font-semibold"
                  style={{ fontFamily: "var(--sf-font-heading)" }}
                >
                  {showcase[0].name}
                </h3>
              </div>
            </Link>

            {/* Smaller cards */}
            {showcase.slice(1, 5).map((p) => (
              <ProductCard key={p.id} storeId={store.id} product={p} currency={currency} />
            ))}
          </div>
        ) : (
          <ProductGrid
            storeId={store.id}
            products={showcase}
            currency={currency}
            emptyMessage="Add products from your dashboard to feature them here."
          />
        )}
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-8"
            style={{ fontFamily: "var(--sf-font-heading)" }}
          >
            Shop by category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((c, i) => (
              <Link
                key={c}
                href={`${browseHref}?category=${encodeURIComponent(c)}`}
                className="group relative aspect-[4/3] overflow-hidden flex items-end p-5 transition-transform hover:-translate-y-0.5"
                style={{
                  borderRadius: "var(--sf-radius)",
                  background: `linear-gradient(135deg, hsl(${(i * 47) % 360}, 60%, 90%), hsl(${(i * 47 + 30) % 360}, 70%, 78%))`,
                }}
              >
                <span className="font-semibold text-lg" style={{ fontFamily: "var(--sf-font-heading)" }}>
                  {c}
                </span>
                <ArrowRight
                  size={18}
                  className="absolute top-5 right-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Story / brand block ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div
            className="aspect-[4/5] relative overflow-hidden"
            style={{ borderRadius: "var(--sf-radius)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&h=1100&fit=crop"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs tracking-[0.3em] uppercase opacity-60 mb-3">Our story</p>
            <h2
              className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight"
              style={{ fontFamily: "var(--sf-font-heading)" }}
            >
              {store.description ? "What we make" : "Built for the way you live"}
            </h2>
            <p className="mt-5 text-base opacity-75 leading-relaxed">
              {store.description ||
                `${store.name} is built around one idea: products you'll actually keep using. Curated, supported, and shipped fast — anywhere in Bangladesh.`}
            </p>
            <Link
              href={browseHref}
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold tracking-wider uppercase pb-2"
              style={{ borderBottom: "1px solid var(--sf-text)" }}
            >
              Browse the catalog <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
