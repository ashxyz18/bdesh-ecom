import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import type { StorefrontStore } from "@/lib/storefront/types";

interface Props {
  store: StorefrontStore;
  variant?: "light" | "dark";
}

export function StorefrontFooter({ store, variant = "light" }: Props) {
  const social = store.settings.social || {};
  const homeHref = `/store/${store.id}`;
  const browseHref = `/store/${store.id}/products`;
  const isDark = variant === "dark";

  return (
    <footer
      className="mt-20"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <h3
            className="text-xl font-semibold mb-3"
            style={{ fontFamily: "var(--sf-font-heading)" }}
          >
            {store.settings.brand?.storeName || store.name}
          </h3>
          {store.description ? (
            <p className="text-sm opacity-70 max-w-md leading-relaxed">{store.description}</p>
          ) : null}
          <div className="flex gap-3 mt-5">
            {social.facebook ? (
              <a href={social.facebook} target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100">
                <Facebook size={18} />
              </a>
            ) : null}
            {social.instagram ? (
              <a href={social.instagram} target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100">
                <Instagram size={18} />
              </a>
            ) : null}
            {social.youtube ? (
              <a href={social.youtube} target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100">
                <Youtube size={18} />
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3 opacity-90">Shop</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link href={homeHref}>Home</Link></li>
            <li><Link href={browseHref}>All Products</Link></li>
            <li><Link href={`${homeHref}/cart`}>Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3 opacity-90">Contact</h4>
          <ul className="space-y-2 text-sm opacity-70">
            {social.whatsapp ? <li>WhatsApp: {social.whatsapp}</li> : null}
            <li>Powered by <span className="font-medium">BixelBD</span></li>
          </ul>
        </div>
      </div>

      <div
        className="border-t py-5 text-center text-xs opacity-60"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}
      >
        &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
      </div>
    </footer>
  );
}
