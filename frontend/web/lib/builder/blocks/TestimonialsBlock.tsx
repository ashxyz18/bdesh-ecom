import React from "react";
import { BlockComponentProps } from "./types";

export function TestimonialsBlock({ data, isEditable, isActive, onUpdate }: BlockComponentProps) {
  const { title = "What People Say", testimonials = [{ quote: "Great service!", author: "John Doe" }, { quote: "Highly recommended.", author: "Jane Smith" }] } = data.props;

  const handleTestimonialChange = (index: number, field: "quote" | "author", value: string) => {
    if (!onUpdate) return;
    const newTestimonials = [...testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    onUpdate(data.id, { props: { ...data.props, testimonials: newTestimonials } });
  };

  return (
    <div className={`relative py-16 px-6 bg-slate-100 ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
      <div className="max-w-5xl mx-auto text-center">
        {isEditable ? (
          <input
            className="w-full text-3xl font-bold text-slate-900 outline-none border-b border-transparent focus:border-emerald-500 text-center mb-10 bg-transparent"
            value={title}
            onChange={(e) => onUpdate?.(data.id, { props: { ...data.props, title: e.target.value } })}
            placeholder="Testimonials Title"
          />
        ) : (
          <h2 className="text-3xl font-bold text-slate-900 mb-10">{title}</h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t: any, i: number) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm text-left relative">
              <div className="text-4xl text-emerald-200 absolute top-4 left-4">"</div>
              <div className="relative z-10">
                {isEditable ? (
                  <>
                    <textarea
                      className="w-full text-slate-700 italic outline-none border-b border-transparent focus:border-emerald-500 bg-transparent resize-none mb-4"
                      value={t.quote}
                      onChange={(e) => handleTestimonialChange(i, "quote", e.target.value)}
                    />
                    <input
                      className="w-full font-semibold text-slate-900 outline-none border-b border-transparent focus:border-emerald-500 bg-transparent"
                      value={t.author}
                      onChange={(e) => handleTestimonialChange(i, "author", e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <p className="text-slate-700 italic mb-4">"{t.quote}"</p>
                    <p className="font-semibold text-slate-900">- {t.author}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
