import React from "react";
import { BlockType } from "../blocks/types";
import { Layout, Image, Info, Phone, Star, Clock, Grid } from "lucide-react";

export function BlockSidebar({ onAddBlock }: { onAddBlock: (type: BlockType) => void }) {
  const blocks: { type: BlockType; label: string; icon: any; description: string }[] = [
    { type: "hero", label: "Hero Section", icon: Layout, description: "Main banner with title and call-to-action." },
    { type: "about", label: "About Us", icon: Info, description: "Text and image section for company info." },
    { type: "services", label: "Services", icon: Grid, description: "Grid of services offered." },
    { type: "gallery", label: "Gallery", icon: Image, description: "Grid of images." },
    { type: "contact", label: "Contact Info", icon: Phone, description: "Contact details and location." },
    { type: "contactForm", label: "Contact Form", icon: Layout, description: "Lead generation form." },
    { type: "testimonials", label: "Testimonials", icon: Star, description: "Customer reviews and quotes." },
    { type: "hours", label: "Business Hours", icon: Clock, description: "Weekly opening hours display." },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-full overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Add Blocks</h3>
        <p className="text-xs text-slate-500 mt-1">Click a block to add it to your page.</p>
      </div>
      <div className="p-3 space-y-2 flex-1">
        {blocks.map((block) => (
          <button
            key={block.type}
            onClick={() => onAddBlock(block.type)}
            className="w-full flex items-center gap-3 p-3 text-left rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
              <block.icon size={18} />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">{block.label}</div>
              <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{block.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
