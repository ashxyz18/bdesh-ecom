import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: { storeId: string } }): Promise<Metadata> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: params.storeId },
      select: { name: true, description: true, logo: true },
    });

    if (!store) {
      return {
        title: "Store Not Found",
        description: "The requested store could not be found.",
      };
    }

    return {
      title: store.name,
      description: store.description || `Shop at ${store.name} - Your one-stop destination for quality products.`,
      openGraph: {
        title: store.name,
        description: store.description || undefined,
        images: store.logo ? [store.logo] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: store.name,
        description: store.description || undefined,
        images: store.logo ? [store.logo] : undefined,
      },
    };
  } catch {
    return {
      title: "Store",
      description: "Welcome to our store.",
    };
  }
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
