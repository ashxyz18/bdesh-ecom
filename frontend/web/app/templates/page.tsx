"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { CategoryFilter } from "@/components/marketing/CategoryFilter";
import { TemplateCard } from "@/components/marketing/TemplateCard";
import {
  websiteTemplateCategories,
  getTemplatesByGroup,
} from "@/lib/marketing-data";

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("All Templates");

  const filteredTemplates = useMemo(() => {
    return getTemplatesByGroup(activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Start Free
          </Link>
        </div>
      </div>

      {/* Header Section */}
      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-gray-500 uppercase tracking-wider text-center mb-4"
          >
            Website Templates
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 text-center tracking-tight leading-tight max-w-3xl mx-auto"
          >
            Whatever website you&apos;ll build,
            <br /> it&apos;ll look good
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center text-gray-500 mt-4 max-w-xl mx-auto"
          >
            Choose from our collection of professionally designed templates for every type of business.
          </motion.p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            <CategoryFilter
              categories={websiteTemplateCategories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </motion.div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredTemplates.map((tpl, i) => (
                <TemplateCard key={tpl.id} template={tpl} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500">No templates found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to start your online store?
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Join thousands of Bangladeshi businesses already selling online with BdeshShop.
            </p>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-base font-semibold rounded-full shadow-lg shadow-black/20 hover:bg-gray-100 transition-colors duration-200"
              >
                Create Your Store — It&apos;s Free
                <ArrowLeft size={18} className="rotate-180" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
