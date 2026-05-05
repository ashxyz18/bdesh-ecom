"use client";

import { Loader2, Sparkles } from "lucide-react";

interface SparkleButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function SparkleButton({
  onClick,
  loading = false,
  label = "AI Suggest",
  size = "sm",
  className = "",
}: SparkleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg transition-all ${
        size === "sm"
          ? "px-2.5 py-1 text-[11px]"
          : "px-4 py-2 text-sm"
      } bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 shadow-sm ${className}`}
    >
      {loading ? (
        <Loader2 size={size === "sm" ? 11 : 14} className="animate-spin" />
      ) : (
        <Sparkles size={size === "sm" ? 11 : 14} />
      )}
      {label}
    </button>
  );
}
