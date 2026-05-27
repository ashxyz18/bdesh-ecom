"use client";

import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";
import { useStoreCart } from "@/components/storefront/StoreCartProvider";
import { QuantityStepper } from "@/components/storefront/QuantityStepper";
import { formatMoney } from "@/lib/storefront/format";

const FREE_DELIVERY_THRESHOLD = 1500;
const DEFAULT_DELIVERY_FEE = 120;

export function CartPageContent({ storeId }: { storeId: string }) {
  const cart = useStoreCart();
  const currency = "BDT";

  if (cart.items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <ShoppingBag size={32} className="mx-auto mb-4 opacity-40" />
        <h1
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--sf-font-heading)" }}
        >
          Your bag is empty
        </h1>
        <p className="opacity-70 mb-7 max-w-md mx-auto">
          Looks like you haven&apos;t added anything yet. Browse the catalog and start filling your bag.
        </p>
        <Link
          href={`/store/${storeId}/products`}
          className="inline-block px-7 py-3.5 font-semibold"
          style={{
            backgroundColor: "var(--sf-primary)",
            color: "var(--sf-bg)",
            borderRadius: "var(--sf-radius)",
          }}
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  const deliveryFee = cart.subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;
  const total = cart.subtotal + deliveryFee;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1
        className="text-3xl sm:text-4xl font-bold tracking-tight mb-10"
        style={{ fontFamily: "var(--sf-font-heading)" }}
      >
        Your bag
      </h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        {/* Items */}
        <ul className="divide-y" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          {cart.items.map((item) => (
            <li key={`${item.productId}-${item.variantName ?? ""}`} className="py-5 flex gap-4">
              <Link
                href={`/store/${storeId}/products/${item.slug}`}
                className="block flex-shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover"
                  style={{ borderRadius: "var(--sf-radius)" }}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/store/${storeId}/products/${item.slug}`}
                  className="font-medium hover:underline line-clamp-2"
                >
                  {item.name}
                </Link>
                {item.variantName ? (
                  <p className="text-xs opacity-60 mt-0.5">{item.variantName}</p>
                ) : null}
                <p className="text-sm font-semibold mt-2">{formatMoney(item.price, currency)}</p>
                <div className="flex items-center justify-between mt-3">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(q) => cart.setQuantity(item.productId, item.variantName, q)}
                    size="sm"
                  />
                  <button
                    type="button"
                    onClick={() => cart.remove(item.productId, item.variantName)}
                    className="text-sm flex items-center gap-1.5 opacity-60 hover:opacity-100"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
              <p className="font-semibold whitespace-nowrap hidden sm:block">
                {formatMoney(item.price * item.quantity, currency)}
              </p>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside>
          <div
            className="p-6 sticky top-24"
            style={{
              backgroundColor: "rgba(0,0,0,0.03)",
              borderRadius: "var(--sf-radius)",
            }}
          >
            <h2 className="text-lg font-semibold mb-4">Order summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="opacity-70">Subtotal ({cart.count} items)</dt>
                <dd>{formatMoney(cart.subtotal, currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="opacity-70">Delivery</dt>
                <dd>
                  {deliveryFee === 0
                    ? "Free"
                    : formatMoney(deliveryFee, currency)}
                </dd>
              </div>
              <div
                className="flex justify-between pt-3 mt-3 border-t font-semibold text-base"
                style={{ borderColor: "rgba(0,0,0,0.08)" }}
              >
                <dt>Total</dt>
                <dd>{formatMoney(total, currency)}</dd>
              </div>
            </dl>

            <Link
              href={`/store/${storeId}/checkout`}
              className="block w-full text-center mt-6 py-3.5 font-semibold"
              style={{
                backgroundColor: "var(--sf-primary)",
                color: "var(--sf-bg)",
                borderRadius: "var(--sf-radius)",
              }}
            >
              Proceed to checkout
            </Link>
            <Link
              href={`/store/${storeId}/products`}
              className="block w-full text-center mt-2 py-3 text-sm opacity-70 hover:opacity-100"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
