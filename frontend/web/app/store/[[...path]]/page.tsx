import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Script from "next/script";
import type { Metadata } from "next";
import { StoreProviders } from "./providers";
import { BlockData } from "@/lib/builder/blocks/types";
import { 
  HeroBlock, AboutBlock, ServicesBlock, ContactBlock, 
  TestimonialsBlock, HoursBlock, GalleryBlock, ContactFormBlock
} from "@/lib/builder/blocks";

// ISR: revalidate store pages every 60 seconds
export const revalidate = 60;

// Map template IDs to website types for Schema.org
const TEMPLATE_TO_WEBSITE_TYPE: Record<string, string> = {
  roseo: "ecommerce",
  default: "ecommerce",
  shopify: "ecommerce",
  shopnest: "ecommerce",
  boutique: "ecommerce",
  electro: "ecommerce",
  grocer: "ecommerce",
  food: "restaurant",
  salon: "beauty",
  tuition: "education",
  clinic: "healthcare",
  pharmacy: "healthcare",
  corporate: "corporate",
  portfolio: "portfolio",
};

function getWebsiteType(templateId: string): string {
  return TEMPLATE_TO_WEBSITE_TYPE[templateId] || "ecommerce";
}

function getSchemaOrgType(websiteType: string): string {
  const map: Record<string, string> = {
    ecommerce: "Store",
    restaurant: "Restaurant",
    healthcare: "MedicalClinic",
    education: "EducationalOrganization",
    corporate: "Organization",
    portfolio: "Person",
    beauty: "BeautySalon",
  };
  return map[websiteType] || "Organization";
}

interface StorePageProps {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<{ subdomain?: string; q?: string; payment?: string; order?: string }>;
}

export async function generateMetadata({ searchParams }: StorePageProps): Promise<Metadata> {
  const { subdomain } = await searchParams;
  if (!subdomain) return {};

  const store = await prisma.store.findUnique({
    where: { subdomain },
    select: { name: true, description: true, logo: true, theme: true },
  });
  if (!store) return {};

  const theme = typeof store.theme === "string" ? JSON.parse(store.theme) : store.theme;
  const title = store.name ? `${store.name} | Online Store` : "Online Store";
  const description = store.description || "Visit our online store";
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/store?subdomain=${subdomain}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: store.name || undefined,
      locale: "en_BD",
      images: store.logo ? [{ url: store.logo, width: 1200, height: 630, alt: store.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: store.logo ? [store.logo] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { path } = await params;
  const { subdomain } = await searchParams;

  if (!subdomain) return notFound();

  const store = await prisma.store.findUnique({
    where: { subdomain },
    include: {
      products: {
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
        include: {
          collections: { select: { id: true } },
          reviews: {
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      collections: { orderBy: { name: "asc" } },
    },
  });

  if (!store || store.status === "SUSPENDED") return notFound();

  // Parse JSON strings for SQLite compatibility
  const parsedStore = {
    id: String((store as any).id),
    name: String((store as any).name),
    slug: String((store as any).slug),
    subdomain: String((store as any).subdomain),
    description: (store as any).description ? String((store as any).description) : null,
    logo: (store as any).logo,
    banner: (store as any).banner,
    status: String((store as any).status),
    theme: JSON.parse(typeof (store as any).theme === "string" ? (store as any).theme : "{}"),
    settings: JSON.parse(typeof (store as any).settings === "string" ? (store as any).settings : "{}"),
    createdAt: (store as any).createdAt,
    updatedAt: (store as any).updatedAt,
    products: (store as any).products.map((p: any) => {
      const reviews = (p.reviews || []).map((r: any) => ({
        id: r.id,
        rating: Number(r.rating),
        title: r.title,
        comment: r.comment,
        userName: r.user?.name || "Anonymous",
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      }));
      const averageRating =
        reviews.length > 0
          ? Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) * 10) / 10
          : 0;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        images: JSON.parse(typeof p.images === "string" ? p.images : "[]"),
        featured: p.featured,
        status: p.status,
        collectionIds: (p.collections || []).map((c: any) => c.id),
        attributes: JSON.parse(typeof p.attributes === "string" ? p.attributes : "{}"),
        reviews,
        averageRating,
        reviewCount: reviews.length,
      };
    }),
    collections: (store as any).collections.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
    })),
  };

  const templateId = parsedStore.theme?.templateId || "default";
  const websiteType = getWebsiteType(templateId);
  const schemaType = getSchemaOrgType(websiteType);
  const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/store?subdomain=${parsedStore.subdomain}`;

  // Build Schema.org structured data
  const schemas: object[] = [];

  // 1. LocalBusiness / Organization schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": schemaType,
    name: parsedStore.name,
    description: parsedStore.description,
    url: storeUrl,
    ...(parsedStore.logo && { logo: parsedStore.logo, image: parsedStore.logo }),
    ...(parsedStore.banner && { image: parsedStore.banner }),
    address: {
      "@type": "PostalAddress",
      addressCountry: "BD",
    },
  });

  // 2. BreadcrumbList schema
  const pathSegments = path || [];
  if (pathSegments.length > 0) {
    const breadcrumbs = pathSegments.map((segment, i) => {
      const breadcrumbPath = pathSegments.slice(0, i + 1).join("/");
      let name = segment;
      // Resolve human-readable names
      if (segment === "product") name = "Products";
      else if (segment === "collection") name = "Collections";
      else if (i > 0 && pathSegments[i - 1] === "product") {
        const product = parsedStore.products.find((p: any) => p.slug === segment);
        if (product) name = product.name;
      } else if (i > 0 && pathSegments[i - 1] === "collection") {
        const collection = parsedStore.collections.find((c: any) => c.slug === segment);
        if (collection) name = collection.name;
      }
      return {
        "@type": "ListItem",
        position: i + 2,
        name,
        item: `${storeUrl}&path=${breadcrumbPath}`,
      };
    });
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: parsedStore.name, item: storeUrl },
        ...breadcrumbs,
      ],
    });
  }

  // 3. Product schema for product detail pages
  if (pathSegments[0] === "product" && pathSegments[1]) {
    const product = parsedStore.products.find((p: any) => p.slug === pathSegments[1]);
    if (product) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || undefined,
        image: product.images.length > 0 ? product.images : undefined,
        url: `${storeUrl}&path=product/${product.slug}`,
        brand: {
          "@type": "Brand",
          name: parsedStore.name,
        },
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "BDT",
          availability: product.status === "active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: parsedStore.name },
        },
        ...(product.averageRating > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.averageRating,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      });
    }
  }

  // 4. ItemList schema for collection pages
  if (pathSegments[0] === "collection" && pathSegments[1]) {
    const collection = parsedStore.collections.find((c: any) => c.slug === pathSegments[1]);
    if (collection) {
      const collectionProducts = parsedStore.products.filter((p: any) =>
        p.collectionIds.includes(collection.id)
      );
      schemas.push({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: collection.name,
        numberOfItems: collectionProducts.length,
        itemListElement: collectionProducts.slice(0, 20).map((p: any, i: number) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${storeUrl}&path=product/${p.slug}`,
        })),
      });
    }
  }

  // Build store JSX using visual builder blocks only
  let storeJSX: React.ReactNode;

  if (parsedStore.theme?.blocks?.length > 0) {
    storeJSX = (
      <StoreProviders storeId={parsedStore.id}>
        <main className="flex-1 bg-white min-h-screen">
          {parsedStore.theme.blocks.map((block: any) => {
            const props = {
              id: block.id,
              data: block,
              isActive: false,
              isEditable: false,
              storeId: parsedStore.id,
            };
            switch (block.type) {
              case "hero": return <HeroBlock key={block.id} {...props} />;
              case "about": return <AboutBlock key={block.id} {...props} />;
              case "services": return <ServicesBlock key={block.id} {...props} />;
              case "contact": return <ContactBlock key={block.id} {...props} />;
              case "contactForm": return <ContactFormBlock key={block.id} {...props} />;
              case "testimonials": return <TestimonialsBlock key={block.id} {...props} />;
              case "hours": return <HoursBlock key={block.id} {...props} />;
              case "gallery": return <GalleryBlock key={block.id} {...props} />;
              default: return null;
            }
          })}
        </main>
      </StoreProviders>
    );
  } else {
    // Fallback: basic store page with products
    storeJSX = (
      <StoreProviders storeId={parsedStore.id}>
        <main className="min-h-screen bg-white">
          {/* Header */}
          <header className="border-b border-gray-200" style={{ backgroundColor: parsedStore.theme?.primaryColor || "#006A4E" }}>
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">{parsedStore.name}</h1>
              <nav className="flex items-center gap-4 text-white/80 text-sm">
                <a href={`/store?subdomain=${parsedStore.subdomain}`}>Home</a>
                <a href={`/store?subdomain=${parsedStore.subdomain}&path=products`}>Products</a>
              </nav>
            </div>
          </header>

          {/* Hero */}
          <section className="py-16 text-center" style={{ backgroundColor: `${parsedStore.theme?.primaryColor || "#006A4E"}10` }}>
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{parsedStore.name}</h2>
              {parsedStore.description && <p className="text-lg text-gray-600">{parsedStore.description}</p>}
            </div>
          </section>

          {/* Products */}
          <section className="max-w-7xl mx-auto px-4 py-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Products</h3>
            {parsedStore.products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {parsedStore.products.map((product: any) => (
                  <a
                    key={product.id}
                    href={`/store?subdomain=${parsedStore.subdomain}&path=product/${product.slug}`}
                    className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100">
                      {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">{product.name}</h4>
                      <p className="text-lg font-bold mt-1" style={{ color: parsedStore.theme?.secondaryColor || "#F42A41" }}>৳{product.price}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">No products available yet.</p>
            )}
          </section>

          {/* Footer */}
          <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500" style={{ backgroundColor: parsedStore.theme?.primaryColor || "#006A4E" }}>
            <p className="text-white/80">&copy; {new Date().getFullYear()} {parsedStore.name}. All rights reserved.</p>
          </footer>
        </main>
      </StoreProviders>
    );
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <Script key={i} id={`schema-org-${i}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </Script>
      ))}
      {storeJSX}
    </>
  );
}
