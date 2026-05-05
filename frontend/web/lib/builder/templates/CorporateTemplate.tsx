"use client";

import type { StoreTemplateProps } from "@/lib/store-templates/types";

export default function CorporateTemplate({ store }: StoreTemplateProps) {
  const primary = store.theme?.primaryColor || "#1e293b";
  const services = [
    { title: "Digital Consulting", desc: "Strategy & transformation" },
    { title: "Web Development", desc: "Custom web applications" },
    { title: "Cloud Solutions", desc: "AWS, GCP migrations" },
    { title: "AI & Automation", desc: "ML models & RPA" },
    { title: "Cybersecurity", desc: "Audit & compliance" },
    { title: "IT Support", desc: "24/7 managed support" },
  ];
  const stats = [
    { value: "500+", label: "Projects" },
    { value: "50+", label: "Clients" },
    { value: "200+", label: "Team" },
    { value: "12", label: "Countries" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-lg">{store.name}</span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">Services</a>
            <a href="#" className="hover:text-gray-900">About</a>
            <a href="#" className="hover:text-gray-900">Work</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </nav>
          <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primary }}>Get in Touch</button>
        </div>
      </header>
      <section className="py-24 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Enterprise Solutions for Modern Business</h1>
            <p className="text-gray-300 text-lg mb-8">Digital transformation and technology solutions for growing businesses in Bangladesh.</p>
            <button className="px-6 py-3 rounded-lg bg-white text-gray-900 font-medium">Explore Services</button>
          </div>
        </div>
      </section>
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.title} className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg">
              <h3 className="font-semibold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold" style={{ color: primary }}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
