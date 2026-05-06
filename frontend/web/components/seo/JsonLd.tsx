import { prisma } from "@/lib/prisma";

interface ProductJsonLdProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    images?: string;
    sku?: string;
    slug: string;
    store: { name: string };
  };
  storeUrl: string;
}

export function ProductJsonLd({ product, storeUrl }: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `${storeUrl}/products/${product.slug}`,
    },
    ...(product.images && product.images.length > 0
      ? { image: JSON.parse(product.images)[0] }
      : {}),
    brand: {
      "@type": "Brand",
      name: product.store.name,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface StoreJsonLdProps {
  store: {
    name: string;
    description?: string;
    logo?: string;
    url: string;
  };
}

export function StoreJsonLd({ store }: StoreJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    description: store.description,
    ...(store.logo && { logo: store.logo }),
    url: store.url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface OrganizationJsonLdProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
}

export function OrganizationJsonLd({ name, url, logo, description }: OrganizationJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    ...(logo && { logo }),
    ...(description && { description }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
