import React from "react";
import { BlockData } from "../blocks/types";
import { Trash2 } from "lucide-react";

export function BlockPropertiesPanel({ 
  activeBlock, 
  onRemove, 
  onClose 
}: { 
  activeBlock: BlockData | null; 
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  if (!activeBlock) {
    return (
      <div className="w-64 bg-white border-l border-slate-200 h-full p-6 flex flex-col items-center justify-center text-center">
        <div className="text-slate-400 mb-2">No Block Selected</div>
        <p className="text-xs text-slate-500">Click on a block in the preview to edit its properties.</p>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-l border-slate-200 h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 capitalize">{activeBlock.type} Properties</h3>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-sm text-slate-600 mb-6">
          Edit the content directly in the preview area. Changes are saved automatically.
        </p>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={() => {
              onRemove(activeBlock.id);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 size={16} />
            Remove Block
          </button>
        </div>
      </div>
    </div>
  );
}
