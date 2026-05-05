import React from "react";
import { BlockComponentProps } from "./types";
import { EditableText } from "./EditableText";
import { useBuilder } from "../BuilderContext";
import { Plus, X, Image as ImageIcon } from "lucide-react";

export function GalleryBlock({ id, data, isEditable, isActive, onUpdate }: BlockComponentProps) {
  const { title = "Gallery", images = [] } = data.props;
  const { openMediaLibrary } = useBuilder();

  const handleAddImage = () => {
    if (!isEditable) return;
    openMediaLibrary((url) => {
      onUpdate?.(id, { props: { ...data.props, images: [...images, url] } });
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onUpdate?.(id, { props: { ...data.props, images: newImages } });
  };

  return (
    <div className={`relative py-20 px-6 bg-white ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
      <div className="max-w-6xl mx-auto">
        <EditableText
          tagName="h2"
          className="text-3xl font-bold text-slate-900 text-center mb-12"
          value={title}
          onChange={(val) => onUpdate?.(id, { props: { ...data.props, title: val } })}
          placeholder="Gallery Title"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {images.map((url: string, i: number) => (
            <div key={i} className="group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
              <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              {isEditable && (
                <button 
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          
          {isEditable && (
            <button 
              onClick={handleAddImage}
              className="aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-slate-100 hover:border-emerald-500 hover:text-emerald-500 transition-all"
            >
              <Plus size={24} />
              <span className="text-sm font-medium">Add Image</span>
            </button>
          )}
        </div>
        
        {images.length === 0 && !isEditable && (
          <div className="py-20 text-center text-slate-400">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p>No images in gallery</p>
          </div>
        )}
      </div>
    </div>
  );
}
