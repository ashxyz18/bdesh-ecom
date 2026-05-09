"use client";

import React, { useState } from "react";
import { BlockComponentProps } from "./types";
import { EditableText } from "./EditableText";
import { ChevronDown } from "lucide-react";

export function FAQBlock({ id, data, isEditable, isActive, onUpdate }: BlockComponentProps) {
  const { 
    title = "Frequently Asked Questions",
    subtitle = "Find answers to common questions.",
    questions = [
      { question: "What services do you offer?", answer: "We offer a wide range of services including web design, development, and digital marketing." },
      { question: "How long does it take to complete a project?", answer: "Most projects are completed within 2-4 weeks, depending on the scope and complexity." },
      { question: "Do you offer ongoing support?", answer: "Yes, we offer various support packages to ensure your website stays up-to-date and secure." },
      { question: "What is your pricing structure?", answer: "We offer flexible pricing based on project requirements. Contact us for a custom quote." },
      { question: "Can I see examples of your work?", answer: "Absolutely! Check out our portfolio section to see our recent projects." }
    ]
  } = data.props;

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleQuestionChange = (index: number, field: string, value: string) => {
    if (!onUpdate) return;
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    onUpdate(id, { props: { ...data.props, questions: newQuestions } });
  };

  return (
    <div className={`py-20 px-6 bg-white ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <EditableText
            tagName="h2"
            className="text-4xl font-bold text-slate-900 mb-4"
            value={title}
            onChange={(val) => onUpdate?.(id, { props: { ...data.props, title: val } })}
            placeholder="FAQ Title"
          />
          <EditableText
            className="text-xl text-slate-600 max-w-2xl mx-auto"
            value={subtitle}
            multiline
            onChange={(val) => onUpdate?.(id, { props: { ...data.props, subtitle: val } })}
            placeholder="FAQ Subtitle"
          />
        </div>
        
        <div className="space-y-4">
          {questions.map((item: any, i: number) => (
            <div 
              key={i} 
              className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden transition-all hover:shadow-md"
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => isEditable ? null : setOpenIndex(openIndex === i ? null : i)}
              >
                <EditableText
                  tagName="span"
                  className="font-bold text-slate-900 text-lg"
                  value={item.question}
                  onChange={(val) => handleQuestionChange(i, "question", val)}
                  placeholder="Question"
                />
                <ChevronDown 
                  size={20} 
                  className={`text-slate-500 transition-transform ${openIndex === i ? "rotate-180" : ""}`} 
                />
              </button>
              {(openIndex === i || isEditable) && (
                <div className="px-6 pb-6">
                  <EditableText
                    className="text-slate-600 leading-relaxed"
                    value={item.answer}
                    multiline
                    onChange={(val) => handleQuestionChange(i, "answer", val)}
                    placeholder="Answer"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
