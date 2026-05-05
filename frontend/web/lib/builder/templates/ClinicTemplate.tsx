"use client";

import type { StoreTemplateProps } from "@/lib/store-templates/types";

export default function ClinicTemplate({ store }: StoreTemplateProps) {
  const primary = store.theme?.primaryColor || "#059669";
  const doctors = [
    { name: "Dr. Rahman", specialty: "General Medicine", experience: "15 yrs", available: "Today" },
    { name: "Dr. Akhter", specialty: "Pediatrics", experience: "12 yrs", available: "Tomorrow", popular: true },
    { name: "Dr. Hasan", specialty: "Cardiology", experience: "20 yrs", available: "Wed, 10AM" },
    { name: "Dr. Sultana", specialty: "Dermatology", experience: "8 yrs", available: "Today" },
    { name: "Dr. Kabir", specialty: "Orthopedics", experience: "14 yrs", available: "Thu, 2PM", popular: true },
    { name: "Dr. Islam", specialty: "ENT", experience: "10 yrs", available: "Tomorrow" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: `${primary}20` }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-lg">{store.name}</span>
          <button className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: primary }}>Book Appointment</button>
        </div>
      </header>
      <section className="relative h-[450px] flex items-end" style={{ background: `linear-gradient(135deg, ${primary}22, ${primary}11)` }}>
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Your Health, Our Priority</h1>
          <p className="text-lg text-gray-600 max-w-lg mb-6">Trusted healthcare with experienced doctors.</p>
          <button className="px-6 py-3 rounded-xl text-white font-medium" style={{ backgroundColor: primary }}>Book Appointment</button>
        </div>
      </section>
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Doctors</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {doctors.map((d) => (
            <div key={d.name} className="p-5 rounded-2xl border border-gray-100 hover:shadow-lg relative">
              {d.popular && <span className="absolute -top-2 right-4 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: primary }}>Available</span>}
              <h3 className="font-semibold text-gray-900">{d.name}</h3>
              <p className="text-sm" style={{ color: primary }}>{d.specialty}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>{d.experience}</span>
                <span>Next: {d.available}</span>
              </div>
              <button className="w-full mt-3 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primary }}>Book</button>
            </div>
          ))}
        </div>
      </section>
      <section className="py-12 bg-gray-50 text-center">
        <p className="text-lg font-semibold text-gray-900">Open 8AM - 10PM daily</p>
        <p className="text-gray-500">Emergency: {store.settings?.phone || "Call 01700000000"}</p>
      </section>
    </div>
  );
}
