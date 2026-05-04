"use client";

import { AIWebsiteBuilder } from "@/components/ai/AIWebsiteBuilder";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AIBuilderPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <AIWebsiteBuilder />
      </div>
    </div>
  );
}
