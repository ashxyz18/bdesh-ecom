"use client";

import React from "react";
import { BlockComponentProps } from "./types";
import { EditableText } from "./EditableText";
import { Check } from "lucide-react";

export function PricingBlock({ id, data, isEditable, isActive, onUpdate }: BlockComponentProps) {
  const { 
    title = "Pricing Plans", 
    subtitle = "Choose the plan that fits your needs.",
    plans = [
      { name: "Basic", price: "$9", period: "/month", features: ["1 Website", "10GB Storage", "Basic Support"] },
      { name: "Pro", price: "$29", period: "/month", features: ["5 Websites", "50GB Storage", "Priority Support", "Analytics"] },
      { name: "Enterprise", price: "$99", period: "/month", features: ["Unlimited Websites", "Unlimited Storage", "24/7 Support", "Custom Solutions"] }
    ]
  } = data.props;

  const handlePlanChange = (index: number, field: string, value: string) => {
    if (!onUpdate) return;
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    onUpdate(id, { props: { ...data.props, plans: newPlans } });
  };

  const handleFeatureChange = (planIndex: number, featureIndex: number, value: string) => {
    if (!onUpdate) return;
    const newPlans = [...plans];
    newPlans[planIndex].features[featureIndex] = value;
    onUpdate(id, { props: { ...data.props, plans: newPlans } });
  };

  return (
    <div className={`py-20 px-6 bg-white ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <EditableText
            tagName="h2"
            className="text-4xl font-bold text-slate-900 mb-4"
            value={title}
            onChange={(val) => onUpdate?.(id, { props: { ...data.props, title: val } })}
            placeholder="Pricing Title"
          />
          <EditableText
            className="text-xl text-slate-600 max-w-2xl mx-auto"
            value={subtitle}
            multiline
            onChange={(val) => onUpdate?.(id, { props: { ...data.props, subtitle: val } })}
            placeholder="Pricing Subtitle"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan: any, i: number) => (
            <div 
              key={i} 
              className={`bg-white rounded-3xl p-8 border-2 transition-all hover:shadow-xl ${
                i === 1 ? "border-emerald-500 shadow-lg scale-105" : "border-slate-100 hover:border-slate-200"
              }`}
            >
              <EditableText
                tagName="h3"
                className="text-xl font-bold text-slate-900 mb-2"
                value={plan.name}
                onChange={(val) => handlePlanChange(i, "name", val)}
                placeholder="Plan Name"
              />
              <div className="flex items-baseline gap-1 mb-6">
                <EditableText
                  className="text-4xl font-extrabold text-emerald-600"
                  value={plan.price}
                  onChange={(val) => handlePlanChange(i, "price", val)}
                  placeholder="$0"
                />
                <EditableText
                  className="text-slate-500"
                  value={plan.period}
                  onChange={(val) => handlePlanChange(i, "period", val)}
                  placeholder="/month"
                />
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature: string, j: number) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} />
                    </div>
                    <EditableText
                      className="text-slate-700"
                      value={feature}
                      onChange={(val) => handleFeatureChange(i, j, val)}
                      placeholder="Feature"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
