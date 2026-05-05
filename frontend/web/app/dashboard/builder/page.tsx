"use client";

import { useState, useCallback } from "react";
import { useDashboard } from "../DashboardContext";
import { BuilderEditor } from "@/lib/builder/components/BuilderEditor";
import { Loader2, MonitorSmartphone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlockData } from "@/lib/builder/blocks/types";

export default function BuilderPage() {
  const { activeStore } = useDashboard();
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState<BlockData[]>([]);

  // We rely on the context's activeStore.theme to load initial blocks
  const initialBlocks = (activeStore?.theme as any)?.blocks || [];

  if (!activeStore) {
    return (
      <div className="max-w-lg mx-auto text-center py-24">
        <MonitorSmartphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Store Yet</h2>
        <p className="text-slate-500 mb-6">Create a store first to start building its pages.</p>
        <Link href="/dashboard/new-store">
          <Button className="bg-emerald-600 hover:bg-emerald-700">Create Store</Button>
        </Link>
      </div>
    );
  }

  const handlePublish = async () => {
    if (!activeStore) return;
    setSaving(true);
    try {
      const themeData = typeof activeStore.theme === "string" 
        ? JSON.parse(activeStore.theme) 
        : activeStore.theme || {};
        
      const res = await fetch(`/api/stores/${activeStore.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: JSON.stringify({
            ...themeData,
            blocks: blocks
          })
        })
      });
      if (res.ok) {
        alert("Store published successfully!");
      } else {
        alert("Failed to publish store");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen -m-6">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Visual Builder</h1>
          <p className="text-sm text-slate-500">Editing <span className="font-medium text-slate-700">{activeStore.name}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/store?subdomain=${activeStore.subdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Live Preview
          </a>
          <Button onClick={handlePublish} disabled={saving} className="bg-slate-900 hover:bg-slate-800">
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Publish"}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <BuilderEditor initialBlocks={initialBlocks} onSave={setBlocks} storeId={activeStore.id} />
      </div>
    </div>
  );
}
