/**
 * Money formatter for the storefront. Centralized so a future "change
 * currency" feature touches one place.
 */
export function formatMoney(amount: number, currency: string = "BDT"): string {
  if (currency === "BDT") {
    return `৳${Math.round(amount).toLocaleString("en-IN")}`;
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function discountPercent(price: number, comparePrice: number | null): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round((1 - price / comparePrice) * 100);
}
