"use client";

import React, { useState } from "react";
import { BlockComponentProps } from "./types";
import { EditableText } from "./EditableText";
import { BookingModal } from "../components/BookingModal";
import { Calendar } from "lucide-react";

export function ServicesBlock({ id, data, isEditable, isActive, onUpdate, storeId }: BlockComponentProps) {
  const { 
    title = "Our Services", 
    services = ["Web Design", "Marketing", "SEO Optimization"],
    bookingEnabled = true 
  } = data.props;

  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleServiceChange = (index: number, value: string) => {
    if (!onUpdate) return;
    const newServices = [...services];
    newServices[index] = value;
    onUpdate(id, { props: { ...data.props, services: newServices } });
  };

  return (
    <div className={`relative py-20 px-6 bg-slate-50 ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
      <div className="max-w-6xl mx-auto">
        <EditableText
          tagName="h2"
          className="text-4xl font-bold text-slate-900 text-center mb-16"
          value={title}
          onChange={(val) => onUpdate?.(id, { props: { ...data.props, title: val } })}
          placeholder="Section Title"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service: string, i: number) => (
            <div 
              key={i} 
              className={`group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1 ${!isEditable && bookingEnabled ? "cursor-pointer" : ""}`}
              onClick={() => !isEditable && bookingEnabled && setSelectedService(service)}
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mb-6 flex items-center justify-center text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                ❖
              </div>
              <EditableText
                className="text-xl font-bold text-slate-900 mb-4"
                value={service}
                onChange={(val) => handleServiceChange(i, val)}
              />
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Premium quality service tailored to your business needs and goals.
              </p>
              {!isEditable && bookingEnabled && (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <Calendar size={14} /> Book Now
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedService && storeId && (
        <BookingModal 
          storeId={storeId} 
          serviceName={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
    </div>
  );
}
