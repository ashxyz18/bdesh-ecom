"use client";

import React, { useState, useEffect } from "react";
import { Upload, X, Search, Image as ImageIcon, Check, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

export function MediaLibrary({ 
  storeId, 
  onSelect, 
  onClose 
}: { 
  storeId: string; 
  onSelect: (url: string) => void; 
  onClose: () => void 
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Fetch media items
    const fetchMedia = async () => {
      try {
        const res = await fetch(`/api/${storeId}/media`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.media || []);
        }
      } catch (err) {
        console.error("Failed to fetch media", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [storeId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/${storeId}/media`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setItems([data.media, ...items]);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/${storeId}/media/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Media Library</h2>
            <p className="text-sm text-slate-500">Manage and select your store assets</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search media..." 
              className="pl-10 bg-white" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="shrink-0">
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="image/*" />
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${uploading ? "bg-slate-100 text-slate-400" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"}`}>
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                {uploading ? "Uploading..." : "Upload New"}
              </div>
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-emerald-600" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ImageIcon size={40} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No media found</h3>
              <p className="mt-1">Upload images to use them in your store.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-500 cursor-pointer transition-all"
                  onClick={() => onSelect(item.url)}
                >
                  <Image 
                    src={item.url} 
                    alt={item.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-all">
                    <p className="text-[10px] text-white truncate font-medium">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
