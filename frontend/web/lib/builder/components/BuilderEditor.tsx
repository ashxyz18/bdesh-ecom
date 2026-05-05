"use client";

import React, { useState } from "react";
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
  TestimonialsBlock, HoursBlock, GalleryBlock, ContactFormBlock
} from "../blocks";
import { BlockSidebar } from "./BlockSidebar";
import { BlockPropertiesPanel } from "./BlockPropertiesPanel";
import { GripVertical } from "lucide-react";
import { BuilderProvider } from "../BuilderContext";

// Sortable wrapper for blocks
function SortableBlock({ 
  id, 
  data, 
  isActive, 
  onClick, 
  onUpdate,
  storeId
}: { 
  id: string; 
  data: BlockData; 
  isActive: boolean;
  onClick: () => void;
  onUpdate: (id: string, newData: Partial<BlockData>) => void;
  storeId?: string;
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
    const props = { id, data, isActive, isEditable: true, onUpdate, storeId };
    switch (data.type) {
      case "hero": return <HeroBlock {...props} />;
      case "about": return <AboutBlock {...props} />;
      case "services": return <ServicesBlock {...props} />;
      case "contact": return <ContactBlock {...props} />;
      case "contactForm": return <ContactFormBlock {...props} />;
      case "testimonials": return <TestimonialsBlock {...props} />;
      case "hours": return <HoursBlock {...props} />;
      case "gallery": return <GalleryBlock {...props} />;
      default: return null;
    }
  };

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
  storeId
}: { 
  initialBlocks?: BlockData[], 
  onSave?: (blocks: BlockData[]) => void,
  storeId?: string
}) {
  const [blocks, setBlocks] = useState<BlockData[]>(initialBlocks && initialBlocks.length > 0 ? initialBlocks : [
    { id: "1", type: "hero", props: { title: "Welcome to My Store", subtitle: "The best place to buy things." } },
    { id: "2", type: "services", props: {} },
    { id: "3", type: "contact", props: {} },
  ]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Auto-save whenever blocks change
  React.useEffect(() => {
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
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock: BlockData = { id: Date.now().toString(), type, props: {} };
    setBlocks([...blocks, newBlock]);
    setActiveBlockId(newBlock.id);
  };

  const handleUpdateBlock = (id: string, newData: Partial<BlockData>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...newData } : b));
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (activeBlockId === id) setActiveBlockId(null);
  };

  const activeBlock = blocks.find(b => b.id === activeBlockId) || null;

  return (
    <BuilderProvider storeId={storeId || ""}>
      <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
        {/* Left Sidebar */}
        <BlockSidebar onAddBlock={handleAddBlock} />

        {/* Main Builder Canvas */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center" onClick={() => setActiveBlockId(null)}>
          <div className="w-full max-w-5xl bg-white shadow-xl min-h-[800px] border border-slate-200">
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
                    />
                  ))
                )}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Right Properties Panel */}
        <BlockPropertiesPanel 
          activeBlock={activeBlock} 
          onRemove={handleRemoveBlock} 
          onClose={() => setActiveBlockId(null)} 
        />
      </div>
    </BuilderProvider>
  );
}
