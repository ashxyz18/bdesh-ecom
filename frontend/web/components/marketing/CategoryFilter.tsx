"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      setShowScrollBtn(el.scrollWidth > el.clientWidth + 4);
    };

    checkScroll();
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center gap-2">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
        role="tablist"
        aria-label="Template categories"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => onCategoryChange(cat)}
            className={`relative whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 ${
              activeCategory === cat
                ? "text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900"
            }`}
          >
            {activeCategory === cat && (
              <motion.span
                layoutId="activeCategoryBg"
                className="absolute inset-0 bg-black rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                style={{ zIndex: -1 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </button>
        ))}
      </div>

      {/* Scroll right button for mobile */}
      {showScrollBtn && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={scrollRight}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
          aria-label="Scroll categories right"
        >
          <ChevronRight size={16} className="text-gray-600" />
        </motion.button>
      )}
    </div>
  );
}
