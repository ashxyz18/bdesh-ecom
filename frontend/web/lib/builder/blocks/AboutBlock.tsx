import React from "react";
import { BlockComponentProps } from "./types";

export function AboutBlock({ data, isEditable, isActive, onUpdate }: BlockComponentProps) {
  const { title = "About Us", description = "We provide the best products." } = data.props;

  return (
    <div className={`relative py-16 px-6 bg-white ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
      {isEditable ? (
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <input
              className="w-full text-3xl font-bold text-slate-900 outline-none border-b border-transparent focus:border-emerald-500"
              value={title}
              onChange={(e) => onUpdate?.(data.id, { props: { ...data.props, title: e.target.value } })}
              placeholder="About Title"
            />
            <textarea
              className="w-full text-slate-600 outline-none border-b border-transparent focus:border-emerald-500 resize-none h-32"
              value={description}
              onChange={(e) => onUpdate?.(data.id, { props: { ...data.props, description: e.target.value } })}
              placeholder="About Description"
            />
          </div>
          <div className="flex-1 w-full h-64 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
            Image Placeholder
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
            <p className="text-slate-600 whitespace-pre-wrap">{description}</p>
          </div>
          <div className="flex-1 w-full h-64 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
            Image Placeholder
          </div>
        </div>
      )}
    </div>
  );
}
