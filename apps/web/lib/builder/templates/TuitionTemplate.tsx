"use client";

import type { StoreTemplateProps } from "@/lib/store-templates/types";

export default function TuitionTemplate({ store }: StoreTemplateProps) {
  const primary = store.theme?.primaryColor || "#1e40af";
  const courses = [
    { name: "SSC Mathematics", instructor: "Dr. Rahman", schedule: "Sat-Wed, 4PM", fee: "৳2,500/mo", students: 45 },
    { name: "HSC Physics", instructor: "Ms. Akhter", schedule: "Sun-Thu, 5PM", fee: "৳3,000/mo", students: 38 },
    { name: "English Language", instructor: "Mr. Hasan", schedule: "Fri-Sat, 10AM", fee: "৳2,000/mo", students: 52, popular: true },
    { name: "ICT & Programming", instructor: "Mr. Kabir", schedule: "Sat-Mon, 6PM", fee: "৳3,500/mo", students: 30 },
    { name: "Bangla Literature", instructor: "Mrs. Sultana", schedule: "Sun-Wed, 3PM", fee: "৳2,000/mo", students: 40 },
    { name: "Chemistry (HSC)", instructor: "Dr. Islam", schedule: "Sat-Wed, 7PM", fee: "৳3,000/mo", students: 35, popular: true },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: `${primary}20` }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-lg">{store.name}</span>
          <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primary }}>Enroll Now</button>
        </div>
      </header>
      <section className="py-16 md:py-24" style={{ background: `linear-gradient(135deg, ${primary}08, ${primary}15)` }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Unlock Your Potential</h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto mb-8">Expert tutoring from Bangladesh's best instructors.</p>
          <button className="px-8 py-3 rounded-xl text-white font-medium" style={{ backgroundColor: primary }}>Find a Course</button>
        </div>
      </section>
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Courses</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {courses.filter(c => c.popular).concat(courses.filter(c => !c.popular)).map((c) => (
            <div key={c.name} className="p-5 rounded-2xl border border-gray-100 hover:shadow-lg">
              {c.popular && <span className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white mb-2" style={{ backgroundColor: primary }}>Popular</span>}
              <h3 className="font-semibold text-gray-900">{c.name}</h3>
              <p className="text-sm text-gray-500">{c.instructor}</p>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span style={{ color: primary }} className="font-semibold">{c.fee}</span>
                <span className="text-gray-400">{c.students} students</span>
              </div>
              <button className="w-full mt-3 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primary }}>Enroll</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
