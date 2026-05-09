"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, ArrowRight, Wand2 } from "lucide-react";
import { TemplatePreview } from "./TemplatePreview";
import type { Template } from "@/lib/marketing-data";

interface TemplateCardProps {
  template: Template;
  index: number;
}

export function TemplateCard({ template, index }: TemplateCardProps) {
  const isBuilder = template.isBuilder;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      {/* Template Preview */}
      <div className="relative overflow-hidden">
        <TemplatePreview templateId={template.id} name={template.name} isBuilder={isBuilder} />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-auto">
            {isBuilder && (
              <span className="px-2.5 py-1 bg-blue-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                Prebuilt
              </span>
            )}
            {template.isNew && (
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                New
              </span>
            )}
            {template.isPopular && (
              <span className="px-2.5 py-1 bg-amber-400/90 backdrop-blur-sm text-black text-[10px] font-bold rounded-full uppercase tracking-wider">
                Popular
              </span>
            )}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-auto">
            <div>
              <span className="text-white font-semibold text-sm drop-shadow-md">
                {template.name}
              </span>
              <p className="text-white/80 text-xs drop-shadow-sm">
                {template.tagline}
              </p>
            </div>
            {isBuilder ? (
              <Link href={`/dashboard/builder?template=${template.id}`} target="_blank">
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-9 h-9 bg-white rounded-full shadow-lg cursor-pointer"
                >
                  <Wand2 size={14} className="text-gray-700" />
                </motion.span>
              </Link>
            ) : (
              <Link href={`/preview/${template.id}`} target="_blank">
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-9 h-9 bg-white rounded-full shadow-lg cursor-pointer"
                >
                  <Eye size={14} className="text-gray-700" />
                </motion.span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {template.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{template.tagline}</p>
          </div>
          {isBuilder ? (
            <Link
              href={`/dashboard/builder?template=${template.id}`}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors duration-200"
            >
              <Wand2 size={14} />
            </Link>
          ) : (
            <Link
              href={`/register?template=${template.id}`}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white text-gray-600 transition-colors duration-200"
            >
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
