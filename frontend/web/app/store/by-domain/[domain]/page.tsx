"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * This page is hit via middleware rewrite when a user visits a custom domain.
 * It looks up the store by custom domain and redirects to the actual store page.
 */
export default function CustomDomainStorePage() {
  const params = useParams();
  const router = useRouter();
  const domain = params.domain as string;

  useEffect(() => {
    if (!domain) return;

    fetch(`/api/stores?domain=${domain}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.store?.id) {
          // Use replace so the URL bar stays clean
          router.replace(`/store/${data.store.id}`);
        } else {
          router.replace("/404");
        }
      })
      .catch(() => {
        router.replace("/404");
      });
  }, [domain, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
