"use client";

import Link from "next/link";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import { useStoreCart } from "./StoreCartProvider";
import { QuantityStepper } from "./QuantityStepper";
import { formatMoney } from "@/lib/storefront/format";

interface Props {
  storeId: string;
  currency?: string;
  freeDeliveryThreshold?: number;
}

export function CartDrawer({ storeId, currency = "BDT", freeDeliveryThreshold = 1500 }: Props) {
  const cart = useStoreCart();

  const remainingForFree = Math.max(0, freeDeliveryThreshold - cart.subtotal);
  const progress = Math.min(100, (cart.subtotal / freeDeliveryThreshold) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={cart.close}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          cart.isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] flex flex-col transition-transform duration-300 ${
          cart.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--sf-bg)",
          color: "var(--sf-text)",
          boxShadow: "-20px 0 40px rgba(0,0,0,0.15)",
        }}
        aria-label="Shopping bag"
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag size={18} />
            Your bag ({cart.count})
          </h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={cart.close}
            className="p-2 hover:opacity-70"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free shipping progress */}
        {cart.count > 0 && freeDeliveryThreshold > 0 ? (
          <div className="px-5 py-3 border-b text-xs" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            {remainingForFree > 0 ? (
              <p className="opacity-80">
                Add <strong>{formatMoney(remainingForFree, currency)}</strong> more for free shipping
              </p>
            ) : (
              <p className="font-medium" style={{ color: "var(--sf-accent)" }}>
                You qualify for free shipping
              </p>
            )}
            <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.08)" }}>
              <div
                className="h-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: "var(--sf-accent)" }}
              />
            </div>
          </div>
        ) : null}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {cart.items.length === 0 ? (
            <div className="py-20 text-center opacity-60">
              <ShoppingBag size={28} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Your bag is empty</p>
              <Link
                href={`/store/${storeId}/products`}
                onClick={cart.close}
                className="mt-4 inline-block text-sm font-medium underline"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              {cart.items.map((item) => (
                <li key={`${item.productId}-${item.variantName ?? ""}`} className="py-4 flex gap-3">
                  <Link
                    href={`/store/${storeId}/products/${item.slug}`}
                    onClick={cart.close}
                    className="block flex-shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover"
                      style={{ borderRadius: "var(--sf-radius)" }}
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/store/${storeId}/products/${item.slug}`}
                      onClick={cart.close}
                      className="text-sm font-medium line-clamp-2 hover:underline"
                    >
                      {item.name}
                    </Link>
                    {item.variantName ? (
                      <p className="text-xs opacity-60 mt-0.5">{item.variantName}</p>
                    ) : null}
                    <p className="text-sm font-semibold mt-1">
                      {formatMoney(item.price, currency)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(q) => cart.setQuantity(item.productId, item.variantName, q)}
                        size="sm"
                      />
                      <button
                        type="button"
                        aria-label="Remove"
                        onClick={() => cart.remove(item.productId, item.variantName)}
                        className="p-1.5 opacity-50 hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 ? (
          <div className="border-t p-5 space-y-3" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm opacity-70">Subtotal</span>
              <span className="text-lg font-semibold">{formatMoney(cart.subtotal, currency)}</span>
            </div>
            <p className="text-xs opacity-60">Shipping calculated at checkout.</p>
            <Link
              href={`/store/${storeId}/checkout`}
              onClick={cart.close}
              className="block w-full text-center py-3.5 font-semibold"
              style={{
                backgroundColor: "var(--sf-primary)",
                color: "var(--sf-bg)",
                borderRadius: "var(--sf-radius)",
              }}
            >
              Checkout
            </Link>
            <Link
              href={`/store/${storeId}/cart`}
              onClick={cart.close}
              className="block w-full text-center py-3 font-medium text-sm border"
              style={{
                borderColor: "rgba(0,0,0,0.12)",
                borderRadius: "var(--sf-radius)",
              }}
            >
              View full bag
            </Link>
          </div>
        ) : null}
      </aside>
    </>
  );
}
