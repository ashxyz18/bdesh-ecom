import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ domain: string }>;
}

/**
 * Server-side fallback for custom-domain routing. The middleware should
 * normally rewrite custom domains directly so this is rarely reached.
 */
export default async function DomainResolvePage({ params }: Params) {
  const { domain } = await params;
  const normalized = decodeURIComponent(domain).toLowerCase();
  const store = await prisma.store.findFirst({
    where: { customDomain: normalized, deletedAt: null },
    select: { id: true },
  });
  if (!store) notFound();
  redirect(`/store/${store.id}`);
}
