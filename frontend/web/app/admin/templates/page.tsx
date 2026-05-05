"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Palette, Plus, Trash2, Upload, Search, Eye, Loader2, X,
  FileJson, Sparkles, Star, Download, ExternalLink, Hammer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "../AdminContext";
import { templateList } from "@/lib/store-templates/registry";
import { sampleConfigs } from "@/lib/store-templates/engine/sampleConfigs";
import { validateTemplateConfig } from "@/lib/store-templates/engine/types";

interface CustomTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  category: string;
  isPremium: boolean;
  isPublic: boolean;
  isBuiltIn: boolean;
  downloads: number;
  version: string;
  createdAt: string;
}

export default function AdminTemplatesPage() {
  const { user } = useAdmin();
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/templates?includeConfig=false");
      if (res.ok) {
        const data = await res.json();
        setCustomTemplates(data.templates || []);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCustomTemplates(prev => prev.filter(t => t.id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete template");
      }
    } catch {
      alert("Failed to delete template");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateFromSample = async (key: string) => {
    const sample = sampleConfigs[key];
    if (!sample) return;
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sample.name,
          slug: key,
          description: sample.description,
          category: sample.category,
          config: sample,
          isPublic: true,
        }),
      });
      if (res.ok) {
        setShowSampleModal(false);
        fetchTemplates();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create template");
      }
    } catch {
      alert("Failed to create template");
    }
  };

  const allTemplates = [
    ...templateList.map(t => ({
      ...t, isBuiltIn: true, slug: t.id, description: t.description,
      thumbnail: null as string | null, downloads: 0, version: "1.0.0",
      createdAt: "", isPublic: true, category: "general" as string, isPremium: false,
    })),
    ...customTemplates.map(t => ({ ...t, isBuiltIn: false })),
  ];

  const filteredTemplates = allTemplates.filter(t => {
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || (t as any).category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "general", "fashion", "food", "electronics", "grocery", "salon", "portfolio"];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Palette className="w-7 h-7 text-amber-500" />
            Template Management
          </h1>
          <p className="text-slate-400 mt-1">Upload, manage, and organize store templates</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/templates/builder">
            <Button
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
            >
              <Hammer size={16} />
              Build Template
            </Button>
          </Link>
          <Button
            onClick={() => setShowSampleModal(true)}
            variant="outline"
            className="flex items-center gap-2 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600"
          >
            <Sparkles size={16} />
            Sample Templates
          </Button>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20"
          >
            <Upload size={16} />
            Upload Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-20">
          <Palette className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No templates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map(tpl => (
            <div key={tpl.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white text-sm">{tpl.name}</h3>
                  {tpl.isBuiltIn && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">Built-in</span>
                  )}
                </div>
                {tpl.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{tpl.description}</p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{(tpl as any).category || "general"}</span>
                  {tpl.isPremium && (
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded flex items-center gap-0.5">
                      <Star size={8} /> Premium
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/preview/${tpl.slug}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <Eye size={12} /> Preview
                  </a>
                  {!tpl.isBuiltIn && (
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      disabled={deletingId === tpl.id}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {deletingId === tpl.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadTemplateModal
          onClose={() => setShowUploadModal(false)}
          onCreated={() => { setShowUploadModal(false); fetchTemplates(); }}
        />
      )}

      {/* Sample Templates Modal */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} />
                Sample Templates
              </h2>
              <button onClick={() => setShowSampleModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(sampleConfigs).map(([key, sample]) => (
                <div key={key} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{sample.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{sample.description}</p>
                      <span className="inline-block text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded mt-2">
                        {sample.category}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleCreateFromSample(key)}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Plus size={14} className="mr-1" /> Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadTemplateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [isPremium, setIsPremium] = useState(false);
  const [configInput, setConfigInput] = useState("");
  const [configFile, setConfigFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setConfigFile(file);
      setConfigInput("");
      const reader = new FileReader();
      reader.onload = (ev) => {
        setConfigInput(ev.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const configText = configInput || (configFile ? await configFile.text() : "");
    if (!name || !slug || !configText) {
      setErrors(["Name, slug, and config are required"]);
      return;
    }

    let configObj;
    try {
      configObj = JSON.parse(configText);
    } catch {
      setErrors(["Invalid JSON format"]);
      return;
    }

    const validation = validateTemplateConfig(configObj);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, slug, description, category, isPremium,
          config: configObj, isPublic: true,
        }),
      });
      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        setErrors([data.message || "Failed to create template"]);
      }
    } catch {
      setErrors(["Network error"]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Upload className="text-amber-500" size={20} />
            Upload Template
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {errors.map((err, i) => (
                <p key={i} className="text-sm text-red-400">{err}</p>
              ))}
            </div>
          )}

          <div>
            <Label className="text-slate-300">Template Name *</Label>
            <Input
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g., Fashion Boutique"
              className="mt-1 bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div>
            <Label className="text-slate-300">Slug *</Label>
            <Input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="e.g., fashion-boutique"
              className="mt-1 bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div>
            <Label className="text-slate-300">Description</Label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of the template..."
              rows={2}
              className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Category</Label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                {["general", "fashion", "food", "electronics", "grocery", "salon", "portfolio"].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={e => setIsPremium(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800"
                />
                <span className="text-sm text-slate-300">Premium template</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Template Config (JSON) *</Label>
            <div className="mt-1 flex items-center gap-3 mb-2">
              <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 transition-colors">
                <FileJson size={14} className="text-amber-400" />
                <span className="text-xs text-slate-300">Import File</span>
                <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
              </label>
              <span className="text-xs text-slate-500">or paste JSON below</span>
            </div>
            <textarea
              value={configInput}
              onChange={e => { setConfigInput(e.target.value); setConfigFile(null); }}
              placeholder='{"name": "My Template", "colors": {...}, ...}'
              rows={8}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-slate-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}
              className="flex-1 border-slate-700 text-slate-300 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}
              className="flex-1 bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {submitting ? "Uploading..." : "Upload Template"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
