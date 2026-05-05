import React from "react";
import { BlockComponentProps } from "./types";

export function HoursBlock({ data, isEditable, isActive, onUpdate }: BlockComponentProps) {
  const { title = "Business Hours", hours = ["Monday - Friday: 9 AM - 6 PM", "Saturday: 10 AM - 4 PM", "Sunday: Closed"] } = data.props;

  const handleHourChange = (index: number, value: string) => {
    if (!onUpdate) return;
    const newHours = [...hours];
    newHours[index] = value;
    onUpdate(data.id, { props: { ...data.props, hours: newHours } });
  };

  return (
    <div className={`relative py-16 px-6 bg-white ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
      <div className="max-w-2xl mx-auto bg-slate-50 p-8 rounded-3xl border border-slate-100 text-center">
        {isEditable ? (
          <input
            className="w-full text-2xl font-bold text-slate-900 outline-none border-b border-transparent focus:border-emerald-500 text-center mb-6 bg-transparent"
            value={title}
            onChange={(e) => onUpdate?.(data.id, { props: { ...data.props, title: e.target.value } })}
            placeholder="Hours Title"
          />
        ) : (
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{title}</h2>
        )}

        <div className="space-y-4">
          {hours.map((hour: string, i: number) => (
            <div key={i} className="flex justify-center border-b border-slate-200 pb-2 last:border-0">
              {isEditable ? (
                <input
                  className="w-full text-slate-700 outline-none border-b border-transparent focus:border-emerald-500 text-center bg-transparent"
                  value={hour}
                  onChange={(e) => handleHourChange(i, e.target.value)}
                />
              ) : (
                <span className="text-slate-700">{hour}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
