"use client";

import { useState } from "react";
import { Heart, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { QuantityStepper } from "./QuantityStepper";
import { AddToCartButton } from "./AddToCartButton";
import { formatMoney, discountPercent } from "@/lib/storefront/format";
import type { StorefrontProduct } from "@/lib/storefront/types";

interface Props {
  storeId: string;
  product: StorefrontProduct;
  currency?: string;
}

export function ProductDetailPanel({ storeId, product, currency = "BDT" }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const discount = discountPercent(product.price, product.comparePrice);
  const images = product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop"];

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
      {/* Gallery */}
      <div className="space-y-4">
        <div
          className="relative aspect-square overflow-hidden"
          style={{
            backgroundColor: "rgba(0,0,0,0.04)",
            borderRadius: "var(--sf-radius)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeIndex]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {discount > 0 ? (
            <span
              className="absolute top-4 left-4 text-xs font-semibold tracking-wide uppercase px-2.5 py-1.5"
              style={{
                backgroundColor: "var(--sf-accent)",
                color: "#fff",
                borderRadius: "var(--sf-radius)",
              }}
            >
              -{discount}%
            </span>
          ) : null}
        </div>
        {images.length > 1 ? (
          <div className="grid grid-cols-5 gap-2">
            {images.map((img, i) => (
              <button
                key={`${img}-${i}`}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`aspect-square overflow-hidden ${
                  i === activeIndex ? "ring-2" : "opacity-70 hover:opacity-100"
                }`}
                style={{
                  borderRadius: "var(--sf-radius)",
                  // @ts-expect-error CSS custom property in style
                  "--tw-ring-color": "var(--sf-primary)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div>
        {product.category ? (
          <p className="text-xs tracking-wider uppercase opacity-60 mb-3">{product.category}</p>
        ) : null}
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight"
          style={{ fontFamily: "var(--sf-font-heading)" }}
        >
          {product.name}
        </h1>

        <div className="flex items-baseline gap-3 mt-5">
          <span className="text-3xl font-bold">
            {formatMoney(product.price, currency)}
          </span>
          {product.comparePrice && product.comparePrice > product.price ? (
            <span className="text-lg line-through opacity-50">
              {formatMoney(product.comparePrice, currency)}
            </span>
          ) : null}
        </div>

        {product.description ? (
          <p className="mt-6 text-base opacity-75 leading-relaxed">{product.description}</p>
        ) : null}

        {product.colors.length > 0 ? (
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Colors</p>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <span
                  key={c}
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: c, borderColor: "rgba(0,0,0,0.15)" }}
                  title={c}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex items-center gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Quantity</p>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={Math.max(1, product.stock || 99)}
            />
          </div>
          <p className="text-sm opacity-70 mt-7">
            {product.stock <= 0
              ? "Out of stock"
              : product.stock <= 5
              ? `Only ${product.stock} left`
              : "In stock"}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <div className="flex-1">
            <AddToCartButton
              storeId={storeId}
              product={product}
              quantity={quantity}
              currency={currency}
            />
          </div>
          <button
            type="button"
            aria-label="Wishlist"
            className="w-14 h-14 flex items-center justify-center"
            style={{
              border: "1px solid rgba(0,0,0,0.15)",
              borderRadius: "var(--sf-radius)",
            }}
          >
            <Heart size={18} />
          </button>
        </div>

        {/* Trust list */}
        <ul
          className="mt-10 space-y-3 pt-6 border-t"
          style={{ borderColor: "rgba(0,0,0,0.06)" }}
        >
          <li className="flex items-center gap-3 text-sm opacity-80">
            <Truck size={16} /> Free delivery on orders over ৳1500
          </li>
          <li className="flex items-center gap-3 text-sm opacity-80">
            <RotateCcw size={16} /> Easy 7-day returns
          </li>
          <li className="flex items-center gap-3 text-sm opacity-80">
            <ShieldCheck size={16} /> Secure checkout — bKash, Nagad, COD
          </li>
        </ul>
      </div>
    </div>
  );
}
