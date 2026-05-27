import type { StorefrontData, StorefrontProduct } from "./types";
import { BUILTIN_TEMPLATES, type BuiltinTemplateSlug } from "./templates";

/**
 * Synthesises a fake StorefrontData per builtin template so the marketing
 * site can render a working live demo of each template without touching
 * the database. Categories and product imagery match the template's intent
 * (clothing for boutique/aurora, gadgets for tech-store, etc.).
 */

function makeProduct(
  i: number,
  name: string,
  price: number,
  comparePrice: number | null,
  image: string,
  category: string,
  featured = false,
): StorefrontProduct {
  return {
    id: `demo-${i}`,
    storeId: "demo",
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: "Sample product used to demonstrate this template.",
    price,
    comparePrice,
    images: [image],
    stock: 24,
    status: "active",
    featured,
    category,
    colors: [],
    tags: [category],
  };
}

const SAMPLES: Record<BuiltinTemplateSlug, StorefrontProduct[]> = {
  modern: [
    makeProduct(1, "Linen Blend Throw", 1490, 1990, "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=750&fit=crop", "Home", true),
    makeProduct(2, "Ceramic Pour-Over Set", 2350, null, "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=750&fit=crop", "Kitchen", true),
    makeProduct(3, "Walnut Desk Organizer", 3200, 4200, "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=750&fit=crop", "Office"),
    makeProduct(4, "Minimal Wall Clock", 1850, null, "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=600&h=750&fit=crop", "Home"),
    makeProduct(5, "Brass Reading Lamp", 4900, 5800, "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=750&fit=crop", "Home"),
    makeProduct(6, "Cotton Tote Bag", 690, null, "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&h=750&fit=crop", "Accessories"),
    makeProduct(7, "Daily Planner", 950, null, "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=750&fit=crop", "Office"),
    makeProduct(8, "Espresso Cups (Set of 4)", 1750, 2200, "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&h=750&fit=crop", "Kitchen"),
  ],
  boutique: [
    makeProduct(1, "Silk Wrap Dress", 6900, 8900, "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=750&fit=crop", "Dresses", true),
    makeProduct(2, "Cashmere Knit Cardigan", 8400, null, "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=750&fit=crop", "Knits", true),
    makeProduct(3, "Leather Crossbody Bag", 5400, 6900, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=750&fit=crop", "Bags"),
    makeProduct(4, "Silk Scarf in Sage", 1900, null, "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=750&fit=crop", "Accessories"),
    makeProduct(5, "Tailored Wool Trousers", 4900, null, "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=750&fit=crop", "Bottoms"),
    makeProduct(6, "Linen Shirt Dress", 4200, 5400, "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop", "Dresses"),
    makeProduct(7, "Suede Loafers", 7900, null, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=750&fit=crop", "Shoes"),
    makeProduct(8, "Pearl Drop Earrings", 2400, null, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=750&fit=crop", "Jewellery"),
  ],
  "tech-store": [
    makeProduct(1, "Aurora Pro Wireless Headphones", 18500, 22900, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", "Audio", true),
    makeProduct(2, "Nimbus Smartwatch GTR", 24900, null, "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop", "Wearables", true),
    makeProduct(3, "Mesh Wi-Fi 6 System", 12990, 15500, "https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?w=600&h=600&fit=crop", "Networking"),
    makeProduct(4, "USB-C 100W Charger", 2890, null, "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop", "Accessories"),
    makeProduct(5, "Mechanical Keyboard 75%", 9990, 12990, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop", "Peripherals"),
    makeProduct(6, "4K Webcam Pro", 7490, null, "https://images.unsplash.com/photo-1623949556303-b0d17d198863?w=600&h=600&fit=crop", "Peripherals"),
    makeProduct(7, "Active Noise Earbuds", 6790, 8490, "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=600&fit=crop", "Audio"),
    makeProduct(8, "Portable SSD 1TB", 8990, null, "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=600&fit=crop", "Storage"),
  ],
  aurora: [
    makeProduct(1, "Silk Slip Dress in Indigo", 7900, 9900, "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&h=1200&fit=crop", "Dresses", true),
    makeProduct(2, "Linen Blazer", 8900, null, "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1200&fit=crop", "Outerwear", true),
    makeProduct(3, "Hand-Knit Cardigan", 6400, null, "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=1200&fit=crop", "Knits"),
    makeProduct(4, "Leather Mules", 5900, 7400, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&h=1200&fit=crop", "Shoes"),
    makeProduct(5, "Crepe Trousers", 4900, null, "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900&h=1200&fit=crop", "Bottoms"),
    makeProduct(6, "Structured Tote", 6700, null, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&h=1200&fit=crop", "Bags"),
  ],
};

export function buildSampleStorefront(slug: BuiltinTemplateSlug): StorefrontData {
  const template = BUILTIN_TEMPLATES.find((t) => t.slug === slug)!;
  const products = SAMPLES[slug];
  return {
    store: {
      id: `preview-${slug}`,
      name: previewName(slug),
      slug,
      subdomain: slug,
      customDomain: null,
      description:
        "Live preview powered by sample data. Sign up to publish your own version.",
      logo: null,
      banner: null,
      templateId: slug,
      theme: template.defaultTheme,
      settings: template.defaultSettings,
    },
    products,
    featured: products.filter((p) => p.featured),
    categories: Array.from(new Set(products.map((p) => p.category!).filter(Boolean))),
  };
}

function previewName(slug: BuiltinTemplateSlug): string {
  switch (slug) {
    case "modern":
      return "North & Co.";
    case "boutique":
      return "Atelier Maison";
    case "tech-store":
      return "Volt Electronics";
    case "aurora":
      return "Aurora Studio";
  }
}
