"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useStoreCart } from "./StoreCartProvider";
import { discountPercent, formatMoney } from "@/lib/storefront/format";
import type { StorefrontProduct } from "@/lib/storefront/types";

interface Props {
  storeId: string;
  product: StorefrontProduct;
  currency?: string;
  layout?: "card" | "minimal";
}

export function ProductCard({ storeId, product, currency = "BDT", layout = "card" }: Props) {
  const cart = useStoreCart();
  const discount = discountPercent(product.price, product.comparePrice);
  const image =
    product.images[0] ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cart.add({
      productId: product.id,
      storeId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image,
    });
  };

  return (
    <Link
      href={`/store/${storeId}/products/${product.slug}`}
      className="group block"
      aria-label={product.name}
    >
      <div
        className="relative overflow-hidden aspect-[4/5] mb-3"
        style={{ borderRadius: "var(--sf-radius)", backgroundColor: "rgba(0,0,0,0.04)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {discount > 0 ? (
          <span
            className="absolute top-3 left-3 text-[11px] font-semibold tracking-wide uppercase px-2 py-1"
            style={{
              backgroundColor: "var(--sf-accent)",
              color: "#fff",
              borderRadius: "var(--sf-radius)",
            }}
          >
            -{discount}%
          </span>
        ) : null}

        {product.stock <= 0 ? (
          <span className="absolute inset-x-0 bottom-0 text-center bg-black/70 text-white text-xs py-2 font-medium">
            Out of stock
          </span>
        ) : null}

        {layout === "card" && product.stock > 0 ? (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              backgroundColor: "var(--sf-primary)",
              color: "var(--sf-bg)",
              borderRadius: "999px",
            }}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={16} />
          </button>
        ) : null}
      </div>

      <h3
        className="text-sm font-medium leading-snug line-clamp-2"
        style={{ fontFamily: "var(--sf-font-heading)" }}
      >
        {product.name}
      </h3>

      <div className="flex items-baseline gap-2 mt-1.5">
        <span className="text-base font-semibold">
          {formatMoney(product.price, currency)}
        </span>
        {product.comparePrice && product.comparePrice > product.price ? (
          <span className="text-sm line-through opacity-50">
            {formatMoney(product.comparePrice, currency)}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
