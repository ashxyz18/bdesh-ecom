"use client";

import type { StoreTemplateProps } from "@/lib/store-templates/types";

export default function PortfolioTemplate({ store }: StoreTemplateProps) {
  const primary = store.theme?.primaryColor || "#7c3aed";
  const projects = [
    { title: "Brand Identity", category: "Design" },
    { title: "Product Photography", category: "Photography" },
    { title: "UI/UX Design", category: "Design" },
    { title: "Wedding Film", category: "Video" },
    { title: "Illustration Series", category: "Illustration" },
    { title: "Portrait Session", category: "Photography" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-lg">{store.name}</span>
          <nav className="flex items-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">Work</a>
            <a href="#" className="hover:text-gray-900">About</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </nav>
        </div>
      </header>
      <section className="py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Hi, I'm a Creative Professional</h1>
        <p className="text-lg text-gray-500 max-w-md mx-auto mb-8">Based in Bangladesh. Specializing in design, photography, and digital art.</p>
        <button className="px-6 py-3 rounded-full text-white font-medium" style={{ backgroundColor: primary }}>View My Work</button>
      </section>
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Selected Work</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.title} className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer relative">
              <div className="text-center">
                <p className="font-semibold text-gray-900">{p.title}</p>
                <p className="text-xs text-gray-500">{p.category}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-12 text-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Let's Work Together</h2>
        <p className="text-gray-500 mb-4">Available for freelance projects</p>
        <button className="px-6 py-3 rounded-full text-white font-medium" style={{ backgroundColor: primary }}>Get in Touch</button>
      </section>
    </div>
  );
}
