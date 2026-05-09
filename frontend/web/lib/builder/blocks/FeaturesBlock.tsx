"use client";

import React from "react";
import { BlockComponentProps } from "./types";
import { EditableText } from "./EditableText";
import { Zap, Shield, Smartphone, Cloud, Star, Heart } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Zap, Shield, Smartphone, Cloud, Star, Heart
};

export function FeaturesBlock({ id, data, isEditable, isActive, onUpdate }: BlockComponentProps) {
  const { 
    title = "Why Choose Us",
    subtitle = "Discover what makes us different.",
    features = [
      { icon: "Zap", title: "Lightning Fast", description: "Optimized performance for the best user experience." },
      { icon: "Shield", title: "Secure", description: "Enterprise-grade security to protect your data." },
      { icon: "Smartphone", title: "Mobile Friendly", description: "Responsive design that works on all devices." },
      { icon: "Cloud", title: "Cloud Based", description: "Access your data from anywhere, anytime." },
      { icon: "Star", title: "Top Rated", description: "Highest customer satisfaction in the industry." },
      { icon: "Heart", title: "Made with Love", description: "Crafted with attention to every detail." }
    ]
  } = data.props;

  const handleFeatureChange = (index: number, field: string, value: string) => {
    if (!onUpdate) return;
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onUpdate(id, { props: { ...data.props, features: newFeatures } });
  };

  return (
    <div className={`py-20 px-6 bg-slate-50 ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <EditableText
            tagName="h2"
            className="text-4xl font-bold text-slate-900 mb-4"
            value={title}
            onChange={(val) => onUpdate?.(id, { props: { ...data.props, title: val } })}
            placeholder="Features Title"
          />
          <EditableText
            className="text-xl text-slate-600 max-w-2xl mx-auto"
            value={subtitle}
            multiline
            onChange={(val) => onUpdate?.(id, { props: { ...data.props, subtitle: val } })}
            placeholder="Features Subtitle"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature: any, i: number) => {
            const IconComponent = iconMap[feature.icon] || Zap;
            return (
              <div 
                key={i} 
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mb-6 flex items-center justify-center text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <IconComponent size={28} />
                </div>
                <EditableText
                  tagName="h3"
                  className="text-xl font-bold text-slate-900 mb-3"
                  value={feature.title}
                  onChange={(val) => handleFeatureChange(i, "title", val)}
                  placeholder="Feature Title"
                />
                <EditableText
                  className="text-slate-600 leading-relaxed"
                  value={feature.description}
                  multiline
                  onChange={(val) => handleFeatureChange(i, "description", val)}
                  placeholder="Feature Description"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
