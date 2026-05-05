import React from "react";
import { BlockComponentProps } from "./types";
import { EditableText } from "./EditableText";
import { useBuilder } from "../BuilderContext";
import { ImageIcon } from "lucide-react";

export function HeroBlock({ id, data, isEditable, isActive, onUpdate }: BlockComponentProps) {
  const { 
    title = "Welcome to Our Store", 
    subtitle = "Discover amazing products.", 
    ctaText = "Shop Now",
    backgroundImage = "" 
  } = data.props;
  
  const { openMediaLibrary } = useBuilder();

  const handleImageClick = () => {
    if (!isEditable) return;
    openMediaLibrary((url) => {
      onUpdate?.(id, { props: { ...data.props, backgroundImage: url } });
    });
  };

  const bgStyle = backgroundImage 
    ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div 
      className={`relative py-24 px-6 text-center bg-slate-900 text-white transition-all ${isActive ? "ring-2 ring-emerald-500" : ""} ${isEditable ? "hover:cursor-pointer group/hero" : ""}`}
      style={bgStyle}
      onClick={(e) => {
        if (isEditable && e.target === e.currentTarget) handleImageClick();
      }}
    >
      {isEditable && !backgroundImage && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity bg-black/20" onClick={handleImageClick}>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 text-sm font-medium">
            <ImageIcon size={16} /> Add Background Image
          </div>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto space-y-6 relative z-10 pointer-events-auto">
        <EditableText
          tagName="h1"
          className="text-5xl font-extrabold text-center tracking-tight"
          value={title}
          onChange={(val) => onUpdate?.(id, { props: { ...data.props, title: val } })}
          placeholder="Hero Title"
        />
        <EditableText
          className="text-xl text-slate-200 text-center max-w-2xl mx-auto leading-relaxed"
          value={subtitle}
          multiline
          onChange={(val) => onUpdate?.(id, { props: { ...data.props, subtitle: val } })}
          placeholder="Hero Subtitle"
        />
        <div className="flex justify-center pt-4">
          <EditableText
            tagName="div"
            className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold inline-block shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
            value={ctaText}
            onChange={(val) => onUpdate?.(id, { props: { ...data.props, ctaText: val } })}
            placeholder="Button Text"
          />
        </div>
      </div>
    </div>
  );
}
