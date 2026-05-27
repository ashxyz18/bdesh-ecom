"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useStoreCart } from "./StoreCartProvider";
import { formatMoney } from "@/lib/storefront/format";
import type { StorefrontProduct } from "@/lib/storefront/types";

interface Props {
  storeId: string;
  product: StorefrontProduct;
  quantity: number;
  currency?: string;
  variantName?: string;
}

export function AddToCartButton({ storeId, product, quantity, currency = "BDT", variantName }: Props) {
  const cart = useStoreCart();
  const [justAdded, setJustAdded] = useState(false);

  if (product.stock <= 0) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-4 font-medium text-base opacity-50 cursor-not-allowed"
        style={{
          backgroundColor: "rgba(0,0,0,0.06)",
          color: "var(--sf-text)",
          borderRadius: "var(--sf-radius)",
        }}
      >
        Out of stock
      </button>
    );
  }

  const handleClick = () => {
    cart.add({
      productId: product.id,
      storeId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0] || "",
      variantName,
      quantity,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full py-4 font-semibold text-base flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
      style={{
        backgroundColor: justAdded ? "#16a34a" : "var(--sf-primary)",
        color: "var(--sf-bg)",
        borderRadius: "var(--sf-radius)",
      }}
    >
      {justAdded ? (
        <>
          <Check size={18} />
          Added to bag
        </>
      ) : (
        <>
          <ShoppingBag size={18} />
          Add to bag — {formatMoney(product.price * quantity, currency)}
        </>
      )}
    </button>
  );
}
