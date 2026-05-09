"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AIBuilderPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard/templates"); }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-slate-500">Redirecting to Templates...</p>
    </div>
  );
}
