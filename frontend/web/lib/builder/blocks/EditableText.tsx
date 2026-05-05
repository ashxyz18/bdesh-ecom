"use client";

"use client";

import React, { useState, useEffect, useRef } from "react";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  tagName?: keyof React.JSX.IntrinsicElements;
}

export function EditableText({
  value,
  onChange,
  className = "",
  placeholder = "Click to edit...",
  multiline = false,
  tagName = "div",
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [html, setHtml] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHtml(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (ref.current && ref.current.innerHTML !== value) {
      onChange(ref.current.innerHTML);
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false, undefined);
    ref.current?.focus();
  };

  const Tag = tagName as React.ElementType;

  return (
    <div className="relative group/editable">
      {isEditing && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 text-white p-1 rounded-lg shadow-xl z-[60] border border-slate-800 scale-90 origin-bottom transition-all">
          <button 
            onMouseDown={(e) => { e.preventDefault(); execCommand("bold"); }}
            className="p-1.5 hover:bg-slate-800 rounded font-bold text-sm min-w-[28px]"
          >
            B
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); execCommand("italic"); }}
            className="p-1.5 hover:bg-slate-800 rounded italic text-sm min-w-[28px]"
          >
            I
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); execCommand("underline"); }}
            className="p-1.5 hover:bg-slate-800 rounded underline text-sm min-w-[28px]"
          >
            U
          </button>
          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button 
            onMouseDown={(e) => { e.preventDefault(); execCommand("justifyLeft"); }}
            className="p-1.5 hover:bg-slate-800 rounded text-xs"
          >
            Left
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); execCommand("justifyCenter"); }}
            className="p-1.5 hover:bg-slate-800 rounded text-xs"
          >
            Center
          </button>
        </div>
      )}
      <Tag
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className={`outline-none transition-all ${className} ${
          html === "" ? "opacity-50" : ""
        }`}
        onBlur={handleBlur}
        onFocus={() => setIsEditing(true)}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          if (!multiline && e.key === "Enter") {
            e.preventDefault();
            ref.current?.blur();
          }
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
