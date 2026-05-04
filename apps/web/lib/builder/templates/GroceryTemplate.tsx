"use client";

import type { StoreTemplateProps } from "@/lib/store-templates/types";

export default function GroceryTemplate({ store }: StoreTemplateProps) {
  const primary = store.theme?.primaryColor || "#16a34a";
  const categories = ["Fresh Vegetables", "Fruits", "Dairy & Eggs", "Meat & Fish", "Rice & Grains", "Cooking Oil", "Spices", "Beverages", "Snacks", "Household"];
  const deals = [
    { name: "Fresh Tomatoes (1kg)", price: "৳60", oldPrice: "৳80", type: "Vegetable" },
    { name: "Eggs (12 pcs)", price: "৳150", oldPrice: "৳180", type: "Dairy", popular: true },
    { name: "Chicken (1kg)", price: "৳240", type: "Meat" },
    { name: "Miniket Rice (5kg)", price: "৳420", oldPrice: "৳480", type: "Rice" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: `${primary}20` }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-lg">{store.name}</span>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Search products..." className="hidden md:block px-4 py-2 border border-gray-200 rounded-xl text-sm w-64" />
            <button className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: primary }}>Shop Now</button>
          </div>
        </div>
      </header>
      <section className="relative h-[400px] flex items-end" style={{ background: `linear-gradient(135deg, ${primary}22, ${primary}11)` }}>
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Fresh Groceries, Delivered Fast</h1>
          <p className="text-lg text-gray-600 max-w-lg mb-6">Quality groceries and daily essentials delivered in 30 minutes.</p>
          <button className="px-6 py-3 rounded-xl text-white font-medium" style={{ backgroundColor: primary }}>Shop Now</button>
        </div>
      </section>
      <section className="py-8 max-w-7xl mx-auto px-4 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map((c) => (
            <span key={c} className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-gray-400 cursor-pointer whitespace-nowrap">{c}</span>
          ))}
        </div>
      </section>
      <section className="py-8 max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Deals</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {deals.map((d) => (
            <div key={d.name} className="p-4 rounded-2xl border border-gray-100 hover:shadow-lg relative">
              {d.popular && <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: primary }}>Best Deal</span>}
              <p className="text-xs text-gray-400">{d.type}</p>
              <h3 className="font-semibold text-gray-900 mt-1">{d.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-bold" style={{ color: primary }}>{d.price}</span>
                {d.oldPrice && <span className="text-sm text-gray-400 line-through">{d.oldPrice}</span>}
              </div>
              <button className="w-full mt-3 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primary }}>Add to Cart</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
