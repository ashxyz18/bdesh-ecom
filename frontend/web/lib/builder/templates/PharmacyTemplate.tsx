"use client";

import type { StoreTemplateProps } from "@/lib/store-templates/types";

export default function PharmacyTemplate({ store }: StoreTemplateProps) {
  const primary = store.theme?.primaryColor || "#dc2626";
  const categories = ["Prescription", "OTC Medicines", "Baby Care", "Vitamins", "First Aid", "Diabetes Care", "Skin Care", "Ayurvedic"];
  const popular = [
    { name: "Napa Extra", price: "৳30", type: "Pain Relief" },
    { name: "Fexo 120mg", price: "৳80", type: "Allergy" },
    { name: "Seclo 20mg", price: "৳120", type: "Gastric" },
    { name: "Vitamin C 500mg", price: "৳250", type: "Immune Support" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: `${primary}20` }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-lg">{store.name}</span>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium">Upload Prescription</button>
            <button className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: primary }}>Order Now</button>
          </div>
        </div>
      </header>
      <section className="relative h-[400px] flex items-end" style={{ background: `linear-gradient(135deg, ${primary}22, ${primary}11)` }}>
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Your Health, Delivered</h1>
          <p className="text-lg text-gray-600 max-w-lg mb-6">Upload prescription, get medicines delivered in hours.</p>
          <button className="px-6 py-3 rounded-xl text-white font-medium" style={{ backgroundColor: primary }}>Upload Prescription</button>
        </div>
      </section>
      <section className="py-12 max-w-7xl mx-auto px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
        <div className="flex gap-2 flex-wrap mb-10">
          {categories.map((c) => (
            <span key={c} className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-gray-400 cursor-pointer">{c}</span>
          ))}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Medicines</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {popular.map((p) => (
            <div key={p.name} className="p-4 rounded-2xl border border-gray-100 hover:shadow-lg">
              <p className="text-xs text-gray-400">{p.type}</p>
              <h3 className="font-semibold text-gray-900 mt-1">{p.name}</h3>
              <div className="flex items-center justify-between mt-3">
                <span className="font-bold" style={{ color: primary }}>{p.price}</span>
                <button className="px-3 py-1 rounded-lg text-xs text-white font-medium" style={{ backgroundColor: primary }}>Add</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-12 bg-gray-50 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Fast Delivery in Dhaka</h2>
        <p className="text-gray-500">2-4 hour delivery. Pharmacist consultation available.</p>
      </section>
    </div>
  );
}
