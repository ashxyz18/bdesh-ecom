import { CartPageContent } from "./CartPageContent";

interface Params {
  params: Promise<{ storeId: string }>;
}

// The cart layout depends on per-customer localStorage so it must be rendered
// client-side. This page is a thin wrapper that just passes the storeId in.
export default async function CartPage({ params }: Params) {
  const { storeId } = await params;
  return <CartPageContent storeId={storeId} />;
}
