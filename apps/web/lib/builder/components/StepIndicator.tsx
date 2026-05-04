"use client";

import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
  labelBn: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  lang: "en" | "bn";
}

export function StepIndicator({ steps, currentStep, lang }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-[#008060] text-white"
                    : isCurrent
                    ? "bg-[#008060] text-white ring-4 ring-[#008060]/20"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap ${
                  isCurrent ? "text-[#008060]" : isCompleted ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {lang === "bn" ? step.labelBn : step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-8 md:w-16 ${
                  i < currentStep ? "bg-[#008060]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
