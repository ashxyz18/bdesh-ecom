"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BlockData, BlockType } from "../blocks/types";
import { 
  HeroBlock, AboutBlock, ServicesBlock, ContactBlock, 
  TestimonialsBlock, HoursBlock, GalleryBlock, ContactFormBlock,
  PricingBlock, FeaturesBlock, FAQBlock, TeamBlock, NewsletterBlock, StatsBlock,
  ProductGridBlock, FeaturedProductsBlock, CartSummaryBlock
} from "../blocks";
import { BlockSidebar } from "./BlockSidebar";
import { BlockPropertiesPanel } from "./BlockPropertiesPanel";
import { GripVertical, Smartphone, Tablet, Monitor, Undo, Redo } from "lucide-react";
import { BuilderProvider } from "../BuilderContext";

export type PreviewMode = "desktop" | "tablet" | "mobile";

// History management for undo/redo
interface HistoryState {
  blocks: BlockData[];
  timestamp: number;
  description: string;
}

interface BuilderEditorProps {
  initialBlocks?: BlockData[];
  onSave?: (blocks: BlockData[]) => void;
  storeId?: string;
  previewMode?: PreviewMode;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
  onTriggerUndo?: () => void;
  onTriggerRedo?: () => void;
}

// Sortable wrapper for blocks
function SortableBlock({ 
  id, 
  data, 
  isActive, 
  onClick, 
  onUpdate,
  storeId,
  isPreview
}: { 
  id: string; 
  data: BlockData; 
  isActive: boolean;
  onClick: () => void;
  onUpdate: (id: string, newData: Partial<BlockData>) => void;
  storeId?: string;
  isPreview?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const renderBlock = () => {
    const props = { id, data, isActive, isEditable: !isPreview, onUpdate, storeId };
    switch (data.type) {
      case "hero": return <HeroBlock {...props} />;
      case "about": return <AboutBlock {...props} />;
      case "services": return <ServicesBlock {...props} />;
      case "contact": return <ContactBlock {...props} />;
      case "contactForm": return <ContactFormBlock {...props} />;
      case "testimonials": return <TestimonialsBlock {...props} />;
      case "hours": return <HoursBlock {...props} />;
      case "gallery": return <GalleryBlock {...props} />;
      case "pricing": return <PricingBlock {...props} />;
      case "features": return <FeaturesBlock {...props} />;
      case "faq": return <FAQBlock {...props} />;
      case "team": return <TeamBlock {...props} />;
      case "newsletter": return <NewsletterBlock {...props} />;
      case "stats": return <StatsBlock {...props} />;
      case "productGrid": return <ProductGridBlock {...props} />;
      case "featuredProducts": return <FeaturedProductsBlock {...props} />;
      case "cartSummary": return <CartSummaryBlock {...props} />;
      default: return null;
    }
  };

  if (isPreview) {
    return (
      <div className="relative">
        <div className={isDragging ? "shadow-2xl ring-2 ring-emerald-500 rounded-xl overflow-hidden scale-[1.02]" : ""}>
          {renderBlock()}
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className={`absolute left-2 top-2 z-20 w-8 h-8 bg-white shadow-md rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing border border-slate-200 transition-opacity ${isActive || isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <GripVertical size={16} className="text-slate-500" />
      </div>
      
      {/* Block Content */}
      <div className={`transition-all ${isDragging ? "shadow-2xl ring-2 ring-emerald-500 rounded-xl overflow-hidden scale-[1.02]" : ""}`}>
        {renderBlock()}
      </div>
    </div>
  );
}

export function BuilderEditor({ 
  initialBlocks, 
  onSave,
  storeId,
  previewMode = "desktop",
  onHistoryChange,
  onTriggerUndo,
  onTriggerRedo
}: BuilderEditorProps) {
  const [blocks, setBlocks] = useState<BlockData[]>(initialBlocks && initialBlocks.length > 0 ? initialBlocks : [
    { id: "1", type: "hero", props: { title: "Welcome to My Store", subtitle: "The best place to buy things." } },
    { id: "2", type: "services", props: {} },
    { id: "3", type: "contact", props: {} },
  ]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  
  // History management
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const maxHistorySize = 50;
  const isUndoing = React.useRef(false);

  // Initialize history with initial blocks
  useEffect(() => {
    if (initialBlocks && initialBlocks.length > 0 && history.length === 0) {
      const initialState: HistoryState = {
        blocks: [...initialBlocks],
        timestamp: Date.now(),
        description: "Initial state"
      };
      setHistory([initialState]);
      setHistoryIndex(0);
    }
  }, [initialBlocks]);

  // Notify parent of history changes
  useEffect(() => {
    onHistoryChange?.(historyIndex > 0, historyIndex < history.length - 1);
  }, [historyIndex, history.length, onHistoryChange]);

  // Handle external undo/redo triggers
  useEffect(() => {
    if (onTriggerUndo) {
      // This will be handled by the parent component calling a method
    }
  }, [onTriggerUndo]);

  useEffect(() => {
    if (onTriggerRedo) {
      // This will be handled by the parent component calling a method
    }
  }, [onTriggerRedo]);

  const addToHistory = useCallback((newBlocks: BlockData[], description: string = "Change") => {
    if (isUndoing.current) return;
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ 
        blocks: [...newBlocks], 
        timestamp: Date.now(),
        description 
      });
      // Keep only the last maxHistorySize states
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(newHistory.length - maxHistorySize);
      }
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoing.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex].blocks);
      setTimeout(() => { isUndoing.current = false; }, 10);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoing.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex].blocks);
      setTimeout(() => { isUndoing.current = false; }, 10);
    }
  }, [historyIndex, history]);

  // Expose undo/redo methods through window for keyboard shortcuts
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

  // Auto-save whenever blocks change
  useEffect(() => {
    onSave?.(blocks);
  }, [blocks, onSave]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newBlocks = arrayMove(items, oldIndex, newIndex);
        addToHistory(newBlocks, "Reordered blocks");
        return newBlocks;
      });
    }
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock: BlockData = { id: Date.now().toString(), type, props: {} };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    setActiveBlockId(newBlock.id);
    addToHistory(newBlocks, `Added ${type} block`);
  };

  const handleUpdateBlock = (id: string, newData: Partial<BlockData>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...newData } : b));
  };

  const handleRemoveBlock = (id: string) => {
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    if (activeBlockId === id) setActiveBlockId(null);
    addToHistory(newBlocks, "Removed block");
  };

  const activeBlock = blocks.find(b => b.id === activeBlockId) || null;

  const isPreview = previewMode === "tablet" || previewMode === "mobile";

  return (
    <BuilderProvider storeId={storeId || ""}>
      <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
        {/* Left Sidebar - Hidden in preview mode */}
        {!isPreview && <BlockSidebar onAddBlock={handleAddBlock} />}

        {/* Main Builder Canvas */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center" onClick={() => setActiveBlockId(null)}>
          <div className={`bg-white shadow-xl min-h-[800px] border border-slate-200 transition-all duration-300 ${
            previewMode === "tablet" ? "w-[768px] max-w-full" : 
            previewMode === "mobile" ? "w-[375px] max-w-full" : 
            "w-full max-w-5xl"
          }`}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-32">
                    <p>Drag or click blocks from the sidebar to start building.</p>
                  </div>
                ) : (
                  blocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      id={block.id}
                      data={block}
                      isActive={activeBlockId === block.id}
                      onClick={() => setActiveBlockId(block.id)}
                      onUpdate={handleUpdateBlock}
                      storeId={storeId}
                      isPreview={isPreview}
                    />
                  ))
                )}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Right Properties Panel - Hidden in preview mode */}
        {!isPreview && (
          <BlockPropertiesPanel 
            activeBlock={activeBlock} 
            onRemove={handleRemoveBlock} 
            onClose={() => setActiveBlockId(null)} 
          />
        )}
        
        {/* Preview Mode Overlay */}
        {isPreview && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
            {previewMode === "tablet" ? "Tablet Preview" : "Mobile Preview"}
          </div>
        )}
      </div>
    </BuilderProvider>
  );
}

// Export history management hooks
export function useBuilderHistory() {
  const [history, setHistoryState] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  return {
    history,
    historyIndex,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
}
