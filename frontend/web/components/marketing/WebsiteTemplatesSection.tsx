"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CategoryFilter } from "./CategoryFilter";
import { TemplateCard } from "./TemplateCard";
import {
  websiteTemplateCategories,
  getTemplatesByGroup,
} from "@/lib/marketing-data";

interface WebsiteTemplatesSectionProps {
  /** Max number of templates to show. Homepage uses 8 (2 rows × 4 cols). Pass undefined for all. */
  maxTemplates?: number;
  /** Whether to show the "Browse All Templates" CTA */
  showBrowseAll?: boolean;
}

export function WebsiteTemplatesSection({
  maxTemplates = 8,
  showBrowseAll = true,
}: WebsiteTemplatesSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All Templates");

  const filteredTemplates = useMemo(() => {
    const templates = getTemplatesByGroup(activeCategory);
    return maxTemplates ? templates.slice(0, maxTemplates) : templates;
  }, [activeCategory, maxTemplates]);

  return (
    <section className="w-full bg-[#fafafa] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4"
          >
            Website Templates
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight"
          >
            Whatever website you'll build,
            <br className="hidden sm:block" /> it'll look good
          </motion.h2>
        </div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <CategoryFilter
            categories={websiteTemplateCategories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </motion.div>

        {/* Templates Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          >
            {filteredTemplates.map((tpl, i) => (
              <TemplateCard key={tpl.id} template={tpl} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Browse All Templates CTA */}
        {showBrowseAll && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-14"
          >
            <Link href="/templates">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-base font-semibold rounded-full shadow-lg shadow-black/20 hover:bg-gray-900 transition-colors duration-200"
              >
                Browse All Templates
                <ArrowRight size={18} />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
