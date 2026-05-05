import React, { useState } from "react";
import { BlockComponentProps } from "./types";
import { EditableText } from "./EditableText";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ContactFormBlock({ data, isEditable, isActive, onUpdate, storeId }: BlockComponentProps) {
  const { 
    title = "Send us a message", 
    description = "We'll get back to you as soon as possible.",
    buttonText = "Send Message",
    fields = [
      { type: "text", label: "Name", placeholder: "Your Name", required: true },
      { type: "email", label: "Email", placeholder: "your@email.com", required: true },
      { type: "textarea", label: "Message", placeholder: "How can we help?", required: true }
    ]
  } = data.props;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEditable || !storeId) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          formId: data.id,
          data: formValues,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Form submission failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative py-16 px-6 bg-white ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <EditableText
            tagName="h2"
            className="text-3xl font-bold text-slate-900"
            value={title}
            onChange={(val) => onUpdate?.(data.id, { props: { ...data.props, title: val } })}
            placeholder="Form Title"
          />
          <EditableText
            className="text-slate-600 mt-2"
            value={description}
            onChange={(val) => onUpdate?.(data.id, { props: { ...data.props, description: val } })}
            placeholder="Form Description"
          />
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl text-center">
            <h3 className="text-emerald-900 font-bold text-xl mb-2">Message Sent!</h3>
            <p className="text-emerald-700">Thank you for reaching out. We will contact you soon.</p>
            <Button variant="outline" className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-100" onClick={() => setSubmitted(false)}>
              Send another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field: any, i: number) => (
              <div key={i} className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.label}
                    readOnly={isEditable}
                    disabled={loading}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-32"
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.label}
                    readOnly={isEditable}
                    disabled={loading}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                )}
              </div>
            ))}
            <div className="pt-2">
              <Button type="submit" disabled={isEditable || loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl text-lg font-bold">
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                {buttonText}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
