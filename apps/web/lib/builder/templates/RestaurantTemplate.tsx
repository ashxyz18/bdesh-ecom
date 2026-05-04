"use client";

import type { StoreTemplateProps } from "@/lib/store-templates/types";

export default function RestaurantTemplate({ store }: StoreTemplateProps) {
  const primary = store.theme?.primaryColor || "#ea580c";
  const menu = [
    { name: "Chicken Biryani", price: "৳180", category: "Main Course", popular: true },
    { name: "Beef Kala Bhuna", price: "৳250", category: "Main Course", popular: true },
    { name: "Fish Curry", price: "৳220", category: "Main Course" },
    { name: "Dal", price: "৳60", category: "Sides" },
    { name: "Bhorta Platter", price: "৳150", category: "Sides" },
    { name: "Borhani", price: "৳40", category: "Drinks" },
    { name: "Faluda", price: "৳120", category: "Desserts", popular: true },
    { name: "Mishti Doi", price: "৳80", category: "Desserts" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: `${primary}20` }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-lg">{store.name}</span>
          <div className="flex items-center gap-3">
            <a href={`tel:${store.settings?.phone || "+8801700000000"}`} className="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium">Call to Order</a>
            <a href={`https://wa.me/${store.settings?.whatsapp || "8801700000000"}`} className="px-4 py-2 rounded-full text-white text-sm font-medium" style={{ backgroundColor: primary }}>WhatsApp Order</a>
          </div>
        </div>
      </header>
      <section className="relative h-[450px] flex items-end" style={{ background: `linear-gradient(135deg, ${primary}22, ${primary}11)` }}>
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Authentic Bangladeshi Cuisine</h1>
          <p className="text-lg text-gray-600 max-w-lg mb-6">Fresh, delicious food made with love. Dine-in, takeaway, or delivery.</p>
          <div className="flex gap-3">
            <button className="px-6 py-3 rounded-full text-white font-medium" style={{ backgroundColor: primary }}>Order Online</button>
            <button className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-medium">View Menu</button>
          </div>
        </div>
      </section>
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Menu</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {menu.map((item) => (
            <div key={item.name} className="p-4 rounded-2xl border border-gray-100 hover:shadow-lg relative">
              {item.popular && <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: primary }}>Popular</span>}
              <p className="text-xs text-gray-400">{item.category}</p>
              <h3 className="font-semibold text-gray-900 mt-1">{item.name}</h3>
              <p className="text-lg font-bold mt-2" style={{ color: primary }}>{item.price}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="py-12 bg-gray-50 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Open Daily</h2>
        <p className="text-gray-500">{store.settings?.hours || "10AM - 10PM"}</p>
        <p className="text-gray-500 mt-1">{store.settings?.address || "Dhaka, Bangladesh"}</p>
      </section>
    </div>
  );
}
