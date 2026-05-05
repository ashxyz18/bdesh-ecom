"use client";

import { useState } from "react";
import type { StoreTemplateProps } from "@/lib/store-templates/types";

export default function SalonTemplate({ store }: StoreTemplateProps) {
  const primary = store.theme?.primaryColor || "#d946ef";
  const services = [
    { name: "Haircut & Styling", price: "৳500-1500", duration: "45 min", popular: true },
    { name: "Facial & Skin Care", price: "৳800-2000", duration: "60 min" },
    { name: "Manicure & Pedicure", price: "৳400-800", duration: "30 min" },
    { name: "Makeup (Party)", price: "৳1500-5000", duration: "90 min", popular: true },
    { name: "Massage Therapy", price: "৳1200-2500", duration: "60 min" },
    { name: "Bridal Package", price: "৳15000-30000", duration: "Full Day" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: `${primary}20` }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primary }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white"><path d="M7 3L12 7L17 3L19 5L14 9L19 13L17 15L12 11L7 15L5 13L10 9L5 5L7 3Z" fill="currentColor"/></svg>
            </div>
            <span className="font-bold text-lg">{store.name}</span>
          </div>
          <button className="px-4 py-2 rounded-full text-white text-sm font-medium" style={{ backgroundColor: primary }}>Book Now</button>
        </div>
      </header>
      <section className="relative h-[500px] flex items-end" style={{ background: `linear-gradient(135deg, ${primary}22, ${primary}11)` }}>
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Look & Feel Beautiful</h1>
          <p className="text-lg text-gray-600 max-w-lg mb-6">Professional salon services by top stylists. Book online.</p>
          <button className="px-6 py-3 rounded-full text-white font-medium" style={{ backgroundColor: primary }}>Book Appointment</button>
        </div>
      </section>
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.name} className="relative p-5 rounded-2xl border border-gray-100 hover:shadow-lg">
              {s.popular && <span className="absolute -top-2 right-4 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: primary }}>Popular</span>}
              <h3 className="font-semibold text-gray-900">{s.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{s.duration}</p>
              <p className="text-lg font-bold mt-2" style={{ color: primary }}>{s.price}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="py-16 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Your Appointment</h2>
        <div className="flex justify-center gap-4">
          <a href={`tel:${store.settings?.phone || "+8801700000000"}`} className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-medium">Call Now</a>
          <a href={`https://wa.me/${store.settings?.whatsapp || "8801700000000"}`} className="px-6 py-3 rounded-full text-white font-medium" style={{ backgroundColor: primary }}>WhatsApp</a>
        </div>
      </section>
    </div>
  );
}
