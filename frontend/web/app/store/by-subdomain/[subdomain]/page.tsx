"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * This page is hit via middleware rewrite when a user visits mystore.bdesh.com.
 * It looks up the store by subdomain and redirects to the actual store page.
 */
export default function SubdomainStorePage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  useEffect(() => {
    if (!subdomain) return;

    fetch(`/api/stores?subdomain=${subdomain}`)
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
  }, [subdomain, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
