"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDashboard } from "../DashboardContext";
import { useSearchParams } from "next/navigation";
import { BuilderEditor, PreviewMode } from "@/lib/builder/components/BuilderEditor";
import { Loader2, MonitorSmartphone, Undo, Redo, Monitor, Smartphone, Tablet, History, X, Check, AlertTriangle, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlockData } from "@/lib/builder/blocks/types";
import { websiteTemplates } from "@/lib/builder/templates/registry";

interface HistoryState {
  blocks: BlockData[];
  timestamp: number;
  description: string;
}

interface BuilderHistory {
  states: HistoryState[];
  currentIndex: number;
}

export default function BuilderPage() {
  const { activeStore } = useDashboard();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [history, setHistory] = useState<BuilderHistory>({ states: [], currentIndex: -1 });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [builderKey, setBuilderKey] = useState(0);
  const [initDone, setInitDone] = useState(false);
  const maxHistorySize = 50;
  const isUndoing = useRef(false);

  // Load blocks from store theme or localStorage (for demo mode without store)
  // Also check for ?template=... query param to pre-load a template
  useEffect(() => {
    if (initDone) return;
    setInitDone(true);

    const urlTemplateId = searchParams.get("template");
    const urlTemplate = urlTemplateId ? websiteTemplates.find(t => t.id === urlTemplateId) : null;

    if (urlTemplate) {
      // Pre-load builder template from query param
      const loadedBlocks = urlTemplate.blocks;
      setBlocks(loadedBlocks);
      const initialState: HistoryState = {
        blocks: [...loadedBlocks],
        timestamp: Date.now(),
        description: `Loaded template: ${urlTemplate.name}`
      };
      setHistory({
        states: [initialState],
        currentIndex: 0
      });
      setToast({ message: `Loaded template: ${urlTemplate.name}`, type: "success" });
      return;
    }

    if (activeStore?.theme) {
      const themeData = typeof activeStore.theme === "string" 
        ? JSON.parse(activeStore.theme) 
        : activeStore.theme || {};
      const loadedBlocks = themeData.blocks || [];
      setBlocks(loadedBlocks);
      // Initialize history
      const initialState: HistoryState = {
        blocks: [...loadedBlocks],
        timestamp: Date.now(),
        description: "Initial state"
      };
      setHistory({
        states: [initialState],
        currentIndex: 0
      });
    } else {
      // Load from localStorage for demo mode
      const saved = localStorage.getItem("builder-demo-blocks");
      if (saved) {
        const parsedBlocks = JSON.parse(saved) as BlockData[];
        setBlocks(parsedBlocks);
        const initialState: HistoryState = {
          blocks: [...parsedBlocks],
          timestamp: Date.now(),
          description: "Initial state"
        };
        setHistory({
          states: [initialState],
          currentIndex: 0
        });
      } else {
        // Default blocks
        const defaultBlocks: BlockData[] = [
          { id: "1", type: "hero", props: { title: "Welcome to My Store", subtitle: "The best place to buy things." } },
          { id: "2", type: "services", props: {} },
          { id: "3", type: "contact", props: {} },
        ];
        setBlocks(defaultBlocks);
        const initialState: HistoryState = {
          blocks: [...defaultBlocks],
          timestamp: Date.now(),
          description: "Initial state"
        };
        setHistory({
          states: [initialState],
          currentIndex: 0
        });
      }
    }
  }, [activeStore, searchParams, initDone]);

  // Update canUndo/canRedo when history changes
  useEffect(() => {
    setCanUndo(history.currentIndex > 0);
    setCanRedo(history.currentIndex < history.states.length - 1);
  }, [history]);

  const addToHistory = useCallback((newBlocks: BlockData[], description: string = "Change") => {
    if (isUndoing.current) return;
    
    setHistory(prev => {
      const newHistory = prev.states.slice(0, prev.currentIndex + 1);
      newHistory.push({
        blocks: [...newBlocks],
        timestamp: Date.now(),
        description
      });
      // Keep only the last maxHistorySize states
      if (newHistory.length > maxHistorySize) {
        return {
          states: newHistory.slice(newHistory.length - maxHistorySize),
          currentIndex: maxHistorySize - 1
        };
      }
      return {
        states: newHistory,
        currentIndex: prev.currentIndex + 1
      };
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (history.currentIndex > 0) {
      isUndoing.current = true;
      const newIndex = history.currentIndex - 1;
      const newBlocks = history.states[newIndex].blocks;
      setHistory(prev => ({ ...prev, currentIndex: newIndex }));
      setBlocks(newBlocks);
      setTimeout(() => { isUndoing.current = false; }, 10);
    }
  }, [history]);

  const handleRedo = useCallback(() => {
    if (history.currentIndex < history.states.length - 1) {
      isUndoing.current = true;
      const newIndex = history.currentIndex + 1;
      const newBlocks = history.states[newIndex].blocks;
      setHistory(prev => ({ ...prev, currentIndex: newIndex }));
      setBlocks(newBlocks);
      setTimeout(() => { isUndoing.current = false; }, 10);
    }
  }, [history]);

  const handleBlocksChange = useCallback((newBlocks: BlockData[]) => {
    if (isUndoing.current) return;
    setBlocks(newBlocks);
    addToHistory(newBlocks, "Modified blocks");
  }, [addToHistory]);

  const handlePublish = async () => {
    if (activeStore) {
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
          setToast({ message: "Published successfully!", type: "success" });
        }
      } catch (e) {
        console.error("Publish failed", e);
        setToast({ message: "Publish failed", type: "info" });
      } finally {
        setSaving(false);
      }
    } else {
      // Demo mode - save to localStorage
      localStorage.setItem("builder-demo-blocks", JSON.stringify(blocks));
      setToast({ message: "Saved to demo mode! Create a store to publish.", type: "success" });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Toast timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadHistoryState = (index: number) => {
    if (index >= 0 && index < history.states.length) {
      isUndoing.current = true;
      const newBlocks = history.states[index].blocks;
      setHistory(prev => ({ ...prev, currentIndex: index }));
      setBlocks(newBlocks);
      setTimeout(() => { isUndoing.current = false; }, 10);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleLoadTemplate = (templateBlocks: BlockData[]) => {
    setBlocks(templateBlocks);
    addToHistory(templateBlocks, "Loaded template");
    setBuilderKey(prev => prev + 1);
    setShowTemplates(false);
    setToast({ message: "Template loaded!", type: "success" });
  };

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg transition-all transform translate-y-0 ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
        }`}>
          {toast.type === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MonitorSmartphone className="h-6 w-6 text-blue-600" />
            Visual Builder
            {!activeStore && <span className="text-sm font-normal text-slate-500">(Demo Mode)</span>}
          </h1>
          <p className="text-slate-500 mt-1">
            {activeStore 
              ? `Building: ${activeStore.name}` 
              : "Design your store pages visually. Create a store to publish."}
          </p>
        </div>
        <div className="flex gap-3">
          {/* Undo/Redo Buttons */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`p-2 rounded hover:bg-slate-100 transition-colors ${!canUndo ? "opacity-40 cursor-not-allowed" : ""}`}
              title="Undo (Ctrl+Z)"
            >
              <Undo size={16} className="text-slate-700" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`p-2 rounded hover:bg-slate-100 transition-colors ${!canRedo ? "opacity-40 cursor-not-allowed" : ""}`}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo size={16} className="text-slate-700" />
            </button>
          </div>

          {/* Templates Button */}
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <LayoutTemplate size={16} />
            <span className="text-sm font-medium">Templates</span>
          </button>

          {/* Version History Button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showHistory ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <History size={16} />
            <span className="text-sm font-medium">History</span>
          </button>

          {/* Preview Mode Toggle */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {(["desktop", "tablet", "mobile"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`p-2 rounded transition-colors ${
                  previewMode === mode 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} Preview`}
              >
                {mode === "desktop" && <Monitor size={16} />}
                {mode === "tablet" && <Tablet size={16} />}
                {mode === "mobile" && <Smartphone size={16} />}
              </button>
            ))}
          </div>

          {!activeStore && (
            <Link href="/dashboard/new-store">
              <Button variant="outline">Create Store to Publish</Button>
            </Link>
          )}
          <Button 
            onClick={handlePublish}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {activeStore ? 'Publish' : 'Save Demo'}
          </Button>
        </div>
      </div>

      {/* Version History Panel */}
      {showHistory && (
        <div className="fixed right-4 top-20 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Version History</h3>
            <button 
              onClick={() => setShowHistory(false)}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X size={16} className="text-slate-500" />
            </button>
          </div>
          <div className="p-2 space-y-1">
            {history.states.map((state, index) => (
              <button
                key={index}
                onClick={() => loadHistoryState(index)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  index === history.currentIndex 
                    ? "bg-blue-50 border border-blue-200" 
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">Version {index + 1}</span>
                  <span className="text-xs text-slate-500">{formatTime(state.timestamp)}</span>
                </div>
                <p className="text-xs text-slate-600">{state.description}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-slate-400">{state.blocks.length} blocks</span>
                  {index === history.currentIndex && (
                    <span className="text-xs text-blue-600 font-medium ml-2">Current</span>
                  )}
                </div>
              </button>
            ))}
            {history.states.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">No history available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Overlay */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Choose a Template</h3>
                <p className="text-sm text-slate-500 mt-1">Start with a pre-built template for your store.</p>
              </div>
              <button 
                onClick={() => setShowTemplates(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {websiteTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleLoadTemplate(template.blocks)}
                    className="text-left group relative bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <template.icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{template.name}</h4>
                        <p className="text-xs text-slate-500">{template.blocks.length} blocks</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.blocks.map((block) => (
                        <span key={block.id} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full uppercase font-medium tracking-wider">
                          {block.type}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto pt-3 border-t border-slate-100">
                      <span className="text-xs font-medium text-blue-600 group-hover:underline">
                        Load Template →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden transition-all duration-300 ${
        previewMode === "tablet" ? "max-w-3xl mx-auto" : previewMode === "mobile" ? "max-w-md mx-auto" : ""
      }`} style={{ minHeight: "700px" }}>
        <BuilderEditor
          key={builderKey}
          initialBlocks={blocks}
          onSave={handleBlocksChange}
          storeId={activeStore?.id}
          previewMode={previewMode}
        />
      </div>
    </div>
  );
}
