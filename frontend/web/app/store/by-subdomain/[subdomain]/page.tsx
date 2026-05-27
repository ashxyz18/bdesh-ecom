import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ subdomain: string }>;
}

/**
 * Server-side fallback for subdomain routing. Normally the middleware
 * rewrites `<subdomain>.bdesh.com` directly to `/store/<id>` so this page
 * is only hit if the middleware is bypassed or someone navigates here
 * manually.
 */
export default async function SubdomainResolvePage({ params }: Params) {
  const { subdomain } = await params;
  const store = await prisma.store.findFirst({
    where: { subdomain, deletedAt: null },
    select: { id: true },
  });
  if (!store) notFound();
  redirect(`/store/${store.id}`);
}
