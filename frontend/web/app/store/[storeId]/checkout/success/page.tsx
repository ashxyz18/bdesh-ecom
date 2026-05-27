import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface Params {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function CheckoutSuccessPage({ params, searchParams }: Params) {
  const { storeId } = await params;
  const { orderNumber } = await searchParams;

  return (
    <main className="max-w-2xl mx-auto px-6 py-24 text-center">
      <div
        className="inline-flex items-center justify-center w-16 h-16 mb-6"
        style={{
          backgroundColor: "rgba(34,197,94,0.12)",
          color: "#16a34a",
          borderRadius: "999px",
        }}
      >
        <CheckCircle2 size={32} />
      </div>
      <h1
        className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
        style={{ fontFamily: "var(--sf-font-heading)" }}
      >
        Order placed
      </h1>
      <p className="opacity-75 mb-8 max-w-md mx-auto leading-relaxed">
        Thank you! Your order has been received and the seller will be in touch shortly to
        confirm delivery details.
      </p>
      {orderNumber ? (
        <div
          className="inline-block px-5 py-3 mb-8"
          style={{
            backgroundColor: "rgba(0,0,0,0.04)",
            borderRadius: "var(--sf-radius)",
          }}
        >
          <span className="text-xs uppercase tracking-wider opacity-60 mr-2">Order</span>
          <span className="font-mono font-semibold">{orderNumber}</span>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/store/${storeId}/products`}
          className="px-6 py-3 font-medium"
          style={{
            backgroundColor: "var(--sf-primary)",
            color: "var(--sf-bg)",
            borderRadius: "var(--sf-radius)",
          }}
        >
          Continue shopping
        </Link>
        <Link
          href={`/store/${storeId}`}
          className="px-6 py-3 font-medium"
          style={{
            border: "1px solid rgba(0,0,0,0.15)",
            borderRadius: "var(--sf-radius)",
          }}
        >
          Back to store
        </Link>
      </div>
    </main>
  );
}
