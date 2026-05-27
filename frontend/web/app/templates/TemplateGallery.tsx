"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/shared/Button";

export interface GalleryTemplate {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  thumbnail: string | null;
  category: string | null;
  previewUrl: string;
  isBuiltIn: boolean;
}

const CATEGORIES = ["All", "Fashion", "Electronics", "Food", "Home", "Other"];

function categoryOf(t: GalleryTemplate): string {
  if (t.category) {
    const norm = t.category.toLowerCase();
    if (/fashion|clothing|apparel/.test(norm)) return "Fashion";
    if (/electron|tech|gadget/.test(norm)) return "Electronics";
    if (/food|restaurant|grocery/.test(norm)) return "Food";
    if (/home|furniture|living/.test(norm)) return "Home";
    if (/general/.test(norm)) return "Other";
  }
  const text = `${t.name} ${t.description || ""}`.toLowerCase();
  if (text.match(/fashion|clothing|apparel|shoe|wear|street/)) return "Fashion";
  if (text.match(/electron|tech|gadget|phone|computer/)) return "Electronics";
  if (text.match(/food|restaurant|grocery|cafe|menu/)) return "Food";
  if (text.match(/home|furniture|living|decor/)) return "Home";
  return "Other";
}

interface Props {
  templates: GalleryTemplate[];
}

/**
 * Client-side filter wrapper. The server already rendered the full template
 * list into the initial HTML, so the gallery is visible instantly. Search
 * and category buttons just re-filter what's already in memory.
 */
export function TemplateGallery({ templates }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return templates.filter((t) => {
      if (category !== "All" && categoryOf(t) !== category) return false;
      if (!needle) return true;
      return (
        t.name.toLowerCase().includes(needle) ||
        (t.description || "").toLowerCase().includes(needle) ||
        t.id.toLowerCase().includes(needle)
      );
    });
  }, [templates, search, category]);

  return (
    <>
      <div className="max-w-2xl mx-auto mb-10 space-y-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === c
                  ? "bg-[#1d4ed8] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {search || category !== "All"
              ? "No templates match your filters."
              : "No templates available yet."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filtered.map((t) => (
            <article
              key={t.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                {t.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.thumbnail}
                    alt={t.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                    <span className="text-4xl">🎨</span>
                  </div>
                )}
                <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                  {categoryOf(t)}
                </span>
                {t.isBuiltIn ? (
                  <span className="absolute top-4 right-4 px-2 py-0.5 bg-blue-600 text-white text-[11px] font-semibold rounded">
                    Built-in
                  </span>
                ) : null}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {t.description || "Pre-built ecommerce template."}
                </p>
                <div className="flex gap-3">
                  <Link href={t.previewUrl} className="flex-1">
                    <Button variant="outline" className="w-full justify-center">
                      Preview
                    </Button>
                  </Link>
                  <Link href={`/templates/${t.id}/use`} className="flex-1">
                    <Button className="w-full justify-center bg-[#1d4ed8] hover:bg-[#1e40af] text-white">
                      Use Template
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
