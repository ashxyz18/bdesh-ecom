"use client";

import dynamic from "next/dynamic";
import type { StoreTemplateProps } from "@/lib/store-templates/types";

// Dynamic imports for all template components
const templateComponents: Record<string, React.ComponentType<StoreTemplateProps>> = {
  default: dynamic(() => import("@/lib/store-templates/default/DefaultStoreFront")),
  roseo: dynamic(() => import("@/lib/store-templates/roseo/RoseoStoreFront")),
  shopify: dynamic(() => import("@/lib/store-templates/shopify/MinimalStoreFront")),
  shopnest: dynamic(() => import("@/lib/store-templates/shopnest/ShopnestStoreFront")),
  food: dynamic(() => import("@/lib/store-templates/food/FoodStoreFront")),
  electro: dynamic(() => import("@/lib/store-templates/electro/ElectroStoreFront")),
  boutique: dynamic(() => import("@/lib/store-templates/boutique/BoutiqueStoreFront")),
  grocer: dynamic(() => import("@/lib/store-templates/grocer/GrocerStoreFront")),
  salon: dynamic(() => import("@/lib/store-templates/engine/ConfigSampleTemplates").then(mod => ({ default: mod.SalonTemplate }))),
  tuition: dynamic(() => import("@/lib/store-templates/engine/ConfigSampleTemplates").then(mod => ({ default: mod.TuitionTemplate }))),
  clinic: dynamic(() => import("@/lib/store-templates/engine/ConfigSampleTemplates").then(mod => ({ default: mod.ClinicTemplate }))),
  pharmacy: dynamic(() => import("@/lib/store-templates/engine/ConfigSampleTemplates").then(mod => ({ default: mod.PharmacyTemplate }))),
  corporate: dynamic(() => import("@/lib/store-templates/engine/ConfigSampleTemplates").then(mod => ({ default: mod.CorporateTemplate }))),
  portfolio: dynamic(() => import("@/lib/store-templates/engine/ConfigSampleTemplates").then(mod => ({ default: mod.PortfolioTemplate }))),
};

// Client-side demo store data
const demoStore = {
  id: "demo-store",
  name: "Demo Store",
  slug: "demo",
  subdomain: "demo",
  description: "A demo store for preview",
  logo: null,
  banner: null,
  theme: { templateId: "default", primaryColor: "#006A4E", secondaryColor: "#F42A41" },
  settings: { phone: "+8801700000000", whatsapp: "8801700000000", address: "Dhaka, Bangladesh", hours: "9AM-10PM", currency: "BDT" },
  products: [
    { id: "p1", name: "Demo Product 1", slug: "demo-product-1", description: "A great product", price: 1000, comparePrice: 1200, images: ["/placeholder.svg"], featured: true, status: "active", collectionIds: ["c1"], attributes: {}, reviews: [], averageRating: 0, reviewCount: 0 },
    { id: "p2", name: "Demo Product 2", slug: "demo-product-2", description: "Another great product", price: 2000, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active", collectionIds: ["c1"], attributes: {}, reviews: [], averageRating: 0, reviewCount: 0 },
  ],
  collections: [
    { id: "c1", name: "All Products", slug: "all-products", image: null },
  ],
};

interface TemplatePreviewProps {
  templateId: string;
}

export function TemplatePreview({ templateId }: TemplatePreviewProps) {
  const TemplateComponent = templateComponents[templateId];

  if (!TemplateComponent) return null;

  return (
    <div className="w-full overflow-hidden rounded-t-2xl" style={{ height: "200px" }}>
      <div
        className="w-[1200px] h-[800px] origin-top-left"
        style={{
          transform: "scale(0.25)",
          transformOrigin: "top left",
        }}
      >
        <TemplateComponent store={demoStore} path={[]} />
      </div>
    </div>
  );
}
