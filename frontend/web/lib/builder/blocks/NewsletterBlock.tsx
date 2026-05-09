"use client";

import React, { useState } from "react";
import { BlockComponentProps } from "./types";
import { EditableText } from "./EditableText";
import { Mail, ArrowRight, Check } from "lucide-react";

export function NewsletterBlock({ id, data, isEditable, isActive, onUpdate }: BlockComponentProps) {
  const { 
    title = "Stay Updated",
    subtitle = "Subscribe to our newsletter for the latest news and updates.",
    buttonText = "Subscribe",
    placeholder = "Enter your email address",
    successMessage = "Thank you for subscribing!",
    backgroundColor = "bg-slate-900",
    textColor = "text-white"
  } = data.props;

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <div className={`py-20 px-6 ${backgroundColor} ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
      <div className="max-w-4xl mx-auto text-center">
        <EditableText
          tagName="h2"
          className={`text-4xl font-bold ${textColor} mb-4`}
          value={title}
          onChange={(val) => onUpdate?.(id, { props: { ...data.props, title: val } })}
          placeholder="Newsletter Title"
        />
        <EditableText
          className={`text-xl opacity-80 ${textColor} max-w-2xl mx-auto mb-8`}
          value={subtitle}
          multiline
          onChange={(val) => onUpdate?.(id, { props: { ...data.props, subtitle: val } })}
          placeholder="Newsletter Subtitle"
        />
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              readOnly={isEditable}
            />
          </div>
          <button
            type="submit"
            disabled={submitted || isEditable}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {submitted ? (
              <>
                <Check size={18} />
                Subscribed
              </>
            ) : (
              <>
                <EditableText
                  tagName="span"
                  className=""
                  value={buttonText}
                  onChange={(val) => onUpdate?.(id, { props: { ...data.props, buttonText: val } })}
                  placeholder="Button Text"
                />
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
        
        {submitted && (
          <p className={`mt-4 text-emerald-400 font-medium`}>
            {successMessage}
          </p>
        )}
      </div>
    </div>
  );
}
