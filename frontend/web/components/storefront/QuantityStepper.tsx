"use client";

import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}

export function QuantityStepper({ value, onChange, min = 1, max = 99, size = "md" }: Props) {
  const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const text = size === "sm" ? "text-sm" : "text-base";

  return (
    <div
      className="inline-flex items-center select-none"
      style={{
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: "var(--sf-radius)",
      }}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${dim} flex items-center justify-center disabled:opacity-30`}
      >
        <Minus size={14} />
      </button>
      <span className={`${dim} flex items-center justify-center font-medium ${text}`}>{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${dim} flex items-center justify-center disabled:opacity-30`}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
