import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Script from "next/script";
import type { Metadata } from "next";
import { getStoreTemplate, isBuiltInTemplate, getTemplateInfo } from "@/lib/store-templates/registry";
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
  searchParams: Promise<{ subdomain?: string; q?: string }>;
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
  const templateId = theme?.templateId || "default";
  const templateInfo = getTemplateInfo(templateId);
  const title = store.name ? `${store.name} | ${templateInfo?.name || "Online Store"}` : "Online Store";
  const description = store.description || templateInfo?.description || "Visit our online store";
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

  // Build store JSX
  let storeJSX: React.ReactNode;

  // 1. Check for specific system pages (Checkout, Cart, etc.)
  if (path && path[0] === "checkout") {
    const { ConfigCheckoutPage } = await import("@/lib/store-templates/engine/pages/ConfigCheckoutPage");
    // We need a dummy config for theme variables if using block builder
    const dummyConfig = {
      id: "system",
      theme: {
        colors: { primary: "#008060", secondary: "#2c3e50", bg: "#ffffff", text: "#1a1a1a" },
        fonts: { body: "Inter", heading: "Inter" },
        radius: "md",
        shadows: "sm"
      }
    };
    
    storeJSX = (
      <StoreProviders storeId={parsedStore.id}>
        <ConfigCheckoutPage 
          config={dummyConfig as any} 
          store={parsedStore} 
          formatPrice={(p) => `৳${p.toLocaleString()}`} 
          storeLink={(sub) => `/store?subdomain=${parsedStore.subdomain}${sub ? `&path=${sub}` : ""}`} 
        />
      </StoreProviders>
    );
  }
  // 2. Visual Builder blocks (Custom Drag-and-Drop)
  else if (parsedStore.theme?.blocks?.length > 0) {
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
  }
  // 2. AI-generated template
  else if (parsedStore.theme?.aiGenerated && parsedStore.theme?.templateConfig) {
    const configJson = JSON.stringify(parsedStore.theme.templateConfig);
    const { ConfigTemplateWrapper } = await import("@/lib/store-templates/engine/ConfigTemplateWrapper");
    storeJSX = (
      <StoreProviders storeId={parsedStore.id}>
        <ConfigTemplateWrapper store={parsedStore} path={path || []} configJson={configJson} />
      </StoreProviders>
    );
  }
  // 3. Built-in template
  else if (isBuiltInTemplate(templateId)) {
    const StoreTemplate = getStoreTemplate(templateId);
    storeJSX = (
      <StoreProviders storeId={parsedStore.id}>
        <StoreTemplate store={parsedStore} path={path || []} />
      </StoreProviders>
    );
  }
  // 4. Custom/uploaded template
  else {
    const templateRecord = await prisma.template.findUnique({
      where: { slug: templateId },
      select: { config: true },
    });

    if (!templateRecord?.config) {
      const StoreTemplate = getStoreTemplate("default");
      storeJSX = (
        <StoreProviders storeId={parsedStore.id}>
          <StoreTemplate store={parsedStore} path={path || []} />
        </StoreProviders>
      );
    } else {
      const configJson =
        typeof templateRecord.config === "string" ? templateRecord.config : JSON.stringify(templateRecord.config);
      const { ConfigTemplateWrapper } = await import("@/lib/store-templates/engine/ConfigTemplateWrapper");
      storeJSX = (
        <StoreProviders storeId={parsedStore.id}>
          <ConfigTemplateWrapper store={parsedStore} path={path || []} configJson={configJson} />
        </StoreProviders>
      );
    }
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
