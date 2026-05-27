"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShoppingBag, Lock } from "lucide-react";
import { useStoreCart } from "@/components/storefront/StoreCartProvider";
import { formatMoney } from "@/lib/storefront/format";

type PaymentMethod = "cod" | "bkash" | "nagad" | "rocket";

interface Props {
  storeId: string;
  currency: string;
  paymentMethods: Array<{ id: PaymentMethod; label: string }>;
  deliveryConfig: {
    freeDeliveryThreshold: number;
    defaultDeliveryCharge: number;
  };
  requireEmail: boolean;
  allowOrderNotes: boolean;
}

export function CheckoutForm({
  storeId,
  currency,
  paymentMethods,
  deliveryConfig,
  requireEmail,
  allowOrderNotes,
}: Props) {
  const router = useRouter();
  const cart = useStoreCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(paymentMethods[0]?.id || "cod");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryFee = useMemo(
    () =>
      cart.subtotal >= deliveryConfig.freeDeliveryThreshold
        ? 0
        : deliveryConfig.defaultDeliveryCharge,
    [cart.subtotal, deliveryConfig],
  );
  const total = cart.subtotal + deliveryFee;

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag size={32} className="mx-auto mb-4 opacity-40" />
        <p className="opacity-70 mb-6">Your bag is empty.</p>
        <Link
          href={`/store/${storeId}/products`}
          className="inline-block px-6 py-3 font-medium"
          style={{
            backgroundColor: "var(--sf-primary)",
            color: "var(--sf-bg)",
            borderRadius: "var(--sf-radius)",
          }}
        >
          Browse products
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !district.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerInfo: { name, phone, email: email || undefined },
        shippingAddress: {
          name,
          phone,
          addressLine1,
          city,
          district,
          postalCode,
          country: "Bangladesh",
        },
        items: cart.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        paymentMethod,
        notes: notes || undefined,
        source: "website",
      };

      const res = await fetch(`/api/stores/${storeId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Could not place order. Please try again.");
      }

      const orderNumber = data.order?.orderNumber || data.order?.id;
      cart.clear();
      router.replace(`/store/${storeId}/checkout/success?orderNumber=${orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid lg:grid-cols-[1fr_360px] gap-10 items-start"
    >
      {/* Form */}
      <div className="space-y-8">
        <Section title="Contact">
          <Field label="Full name" required>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className={inputClass}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone" required>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                className={inputClass}
              />
            </Field>
            <Field label="Email" required={requireEmail}>
              <input
                type="email"
                required={requireEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        <Section title="Delivery address">
          <Field label="Address" required>
            <input
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              autoComplete="street-address"
              className={inputClass}
            />
          </Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="City" required>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
                className={inputClass}
              />
            </Field>
            <Field label="District" required>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                autoComplete="address-level1"
                className={inputClass}
              />
            </Field>
            <Field label="Postal code">
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                autoComplete="postal-code"
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        <Section title="Payment">
          <div className="space-y-2">
            {paymentMethods.map((m) => (
              <label
                key={m.id}
                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer ${
                  paymentMethod === m.id ? "ring-2" : ""
                }`}
                style={{
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "var(--sf-radius)",
                  // @ts-expect-error CSS custom property
                  "--tw-ring-color": "var(--sf-accent)",
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.id}
                  checked={paymentMethod === m.id}
                  onChange={() => setPaymentMethod(m.id)}
                  className="accent-[var(--sf-accent)]"
                />
                <span className="font-medium">{m.label}</span>
                {m.id !== "cod" ? (
                  <span className="ml-auto text-xs opacity-60">
                    Pay through {m.label}
                  </span>
                ) : null}
              </label>
            ))}
          </div>
        </Section>

        {allowOrderNotes ? (
          <Section title="Order notes (optional)">
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything you'd like the seller to know about your order"
              className={inputClass}
            />
          </Section>
        ) : null}

        {error ? (
          <div
            className="p-4 text-sm"
            style={{
              backgroundColor: "rgba(239,68,68,0.08)",
              color: "#dc2626",
              borderRadius: "var(--sf-radius)",
            }}
          >
            {error}
          </div>
        ) : null}
      </div>

      {/* Summary */}
      <aside
        className="p-6 sticky top-24"
        style={{
          backgroundColor: "rgba(0,0,0,0.03)",
          borderRadius: "var(--sf-radius)",
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Your order</h2>
        <ul className="space-y-3 mb-5 max-h-[280px] overflow-y-auto">
          {cart.items.map((item) => (
            <li key={`${item.productId}-${item.variantName ?? ""}`} className="flex gap-3 text-sm">
              <div
                className="w-14 h-14 flex-shrink-0 overflow-hidden"
                style={{ borderRadius: "var(--sf-radius)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-1">{item.name}</p>
                <p className="opacity-60 text-xs">Qty {item.quantity}</p>
              </div>
              <p className="font-medium whitespace-nowrap">
                {formatMoney(item.price * item.quantity, currency)}
              </p>
            </li>
          ))}
        </ul>

        <dl
          className="space-y-2 text-sm pt-4 border-t"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          <div className="flex justify-between">
            <dt className="opacity-70">Subtotal</dt>
            <dd>{formatMoney(cart.subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="opacity-70">Delivery</dt>
            <dd>{deliveryFee === 0 ? "Free" : formatMoney(deliveryFee, currency)}</dd>
          </div>
          <div
            className="flex justify-between pt-3 mt-1 border-t font-semibold text-base"
            style={{ borderColor: "rgba(0,0,0,0.08)" }}
          >
            <dt>Total</dt>
            <dd>{formatMoney(total, currency)}</dd>
          </div>
        </dl>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 py-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          style={{
            backgroundColor: "var(--sf-primary)",
            color: "var(--sf-bg)",
            borderRadius: "var(--sf-radius)",
          }}
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Placing order…
            </>
          ) : (
            <>
              <Lock size={16} />
              Place order — {formatMoney(total, currency)}
            </>
          )}
        </button>
        <p className="text-xs opacity-60 text-center mt-3">
          By placing your order you agree to the store&apos;s policies.
        </p>
      </aside>
    </form>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-transparent text-sm outline-none focus:ring-2 transition-shadow";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset
      className="p-6 space-y-4"
      style={{
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "var(--sf-radius)",
      }}
    >
      <legend className="text-base font-semibold px-2 -mx-2">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">
        {label} {required ? <span className="opacity-50">*</span> : null}
      </span>
      <div
        className="bg-white"
        style={{
          border: "1px solid rgba(0,0,0,0.15)",
          borderRadius: "var(--sf-radius)",
        }}
      >
        {children}
      </div>
    </label>
  );
}
