"use client";

import { useState } from "react";
import { Bot, X } from "lucide-react";
import { AIAssistantPanel } from "./AIAssistantPanel";

interface AIAssistantFABProps {
  lang: "en" | "bn";
}

export function AIAssistantFAB({ lang }: AIAssistantFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#008060] to-[#004c3f] text-white shadow-2xl shadow-[#008060]/30 flex items-center justify-center hover:scale-110 transition-all duration-300 group ${
          isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
        }`}
      >
        <Bot size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ffc453] text-black rounded-full text-[10px] font-bold flex items-center justify-center">
          AI
        </span>
      </button>

      {/* Panel */}
      <AIAssistantPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        lang={lang}
      />
    </>
  );
}
