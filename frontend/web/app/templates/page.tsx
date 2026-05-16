"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Button } from "@/components/shared/Button";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import Link from "next/link";
import { Loader2, FileText, Search, AlertCircle } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  previewUrl: string;
  entryPoint?: string;
  sections?: string[];
}

// Fallback templates shown when API fails
const fallbackTemplates: Template[] = [
  {
    id: "koskii",
    name: "Koskii Ethnic Wear",
    description:
      "A beautiful e-commerce template designed for ethnic wear, fashion boutiques, and clothing stores.",
    thumbnail:
      "https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-ranipink-zariwork-puresilk-designer-saree-saus0035699_ranipink_1_1.jpg?v=1721373197",
    previewUrl: "/prebuilt-templates/koskii/index.html",
    sections: ["Home", "Product", "Account", "Wishlist"],
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Fashion", "Electronics", "Food", "Beauty", "Corporate", "Other"];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.success && data.templates?.length > 0) {
        setTemplates(data.templates);
      } else {
        setTemplates(fallbackTemplates);
      }
    } catch {
      setTemplates(fallbackTemplates);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateCategory = (t: Template) => {
    const text = `${t.name} ${t.description || ""}`.toLowerCase();
    if (text.match(/fashion|clothing|apparel|shoe|wear/)) return "Fashion";
    if (text.match(/electronic|tech|gadget|phone|computer/)) return "Electronics";
    if (text.match(/food|restaurant|grocery|cafe|menu/)) return "Food";
    if (text.match(/beauty|cosmetic|skincare|makeup/)) return "Beauty";
    if (text.match(/corporate|business|agency|portfolio/)) return "Corporate";
    return "Other";
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (selectedCategory !== "All") {
      return getTemplateCategory(t) === selectedCategory;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Template
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our collection of pre-built website templates. Select one and
            start building your online store in minutes.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="max-w-2xl mx-auto mb-10 space-y-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-[#1d4ed8] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
              <p className="text-gray-500 text-sm">Loading templates...</p>
            </div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery || selectedCategory !== "All"
                ? "No templates match your filters."
                : "No templates available yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredTemplates.map((template, index) => {
              const category = getTemplateCategory(template);
              return (
              <div
                key={`${template.id}-${index}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 group">
                  {template.thumbnail ? (
                    <OptimizedImage
                      src={template.thumbnail}
                      alt={template.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="group-hover:scale-105 transition-transform duration-500"
                      containerClassName="w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white overflow-hidden pointer-events-none">
                      <iframe
                        src={template.previewUrl}
                        className="border-0 bg-white"
                        style={{
                          width: '400%',
                          height: '400%',
                          transform: 'scale(0.25)',
                          transformOrigin: '0 0',
                          pointerEvents: 'none',
                        }}
                        scrolling="no"
                        tabIndex={-1}
                        title={`Live Preview of ${template.name}`}
                      />
                    </div>
                  )}
                  <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                    {category}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {template.description || "No description available"}
                  </p>

                  {template.sections && template.sections.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.sections.map((section) => (
                        <span
                          key={section}
                          className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                        >
                          {section}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link
                      href={`/templates/${template.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-center"
                      >
                        Preview
                      </Button>
                    </Link>
                    <Link
                      href={`/templates/${template.id}/use`}
                      className="flex-1"
                    >
                      <Button className="w-full justify-center bg-[#1d4ed8] hover:bg-[#1e40af] text-white">
                        Use Template
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
