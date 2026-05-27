import { notFound } from "next/navigation";
import { loadStorefrontById } from "@/lib/storefront/data";
import { CheckoutForm } from "./CheckoutForm";

interface Params {
  params: Promise<{ storeId: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CheckoutPage({ params }: Params) {
  const { storeId } = await params;
  const data = await loadStorefrontById(storeId);
  if (!data) notFound();

  const checkout = (data.store.settings.checkout as Record<string, boolean> | undefined) || {};
  const delivery = (data.store.settings.delivery as Record<string, number> | undefined) || {};

  const paymentMethods: Array<{ id: "cod" | "bkash" | "nagad" | "rocket"; label: string }> = [];
  if (checkout.enableCOD !== false) paymentMethods.push({ id: "cod", label: "Cash on Delivery" });
  if (checkout.enableBkash !== false) paymentMethods.push({ id: "bkash", label: "bKash" });
  if (checkout.enableNagad !== false) paymentMethods.push({ id: "nagad", label: "Nagad" });
  if (checkout.enableRocket) paymentMethods.push({ id: "rocket", label: "Rocket" });
  if (paymentMethods.length === 0) {
    paymentMethods.push({ id: "cod", label: "Cash on Delivery" });
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1
        className="text-3xl sm:text-4xl font-bold tracking-tight mb-10"
        style={{ fontFamily: "var(--sf-font-heading)" }}
      >
        Checkout
      </h1>
      <CheckoutForm
        storeId={storeId}
        currency={(data.store.settings.currency as string) || "BDT"}
        paymentMethods={paymentMethods}
        deliveryConfig={{
          freeDeliveryThreshold: delivery.freeDeliveryThreshold ?? 1500,
          defaultDeliveryCharge: delivery.defaultDeliveryCharge ?? 120,
        }}
        requireEmail={Boolean(checkout.requireEmail)}
        allowOrderNotes={checkout.orderNotes !== false}
      />
    </main>
  );
}
