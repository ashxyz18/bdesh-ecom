import React from "react";
import { BlockComponentProps } from "./types";

export function ContactBlock({ data, isEditable, isActive, onUpdate }: BlockComponentProps) {
  const { title = "Contact Us", email = "hello@example.com", phone = "+880 1234 567890", address = "Dhaka, Bangladesh" } = data.props;

  return (
    <div className={`relative py-16 px-6 bg-white ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {isEditable ? (
          <input
            className="w-full text-3xl font-bold text-slate-900 outline-none border-b border-transparent focus:border-emerald-500 text-center bg-transparent"
            value={title}
            onChange={(e) => onUpdate?.(data.id, { props: { ...data.props, title: e.target.value } })}
            placeholder="Contact Title"
          />
        ) : (
          <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 rounded-xl">
            <div className="text-sm text-slate-500 mb-2">Email</div>
            {isEditable ? (
              <input
                className="w-full font-medium text-slate-900 outline-none border-b border-transparent focus:border-emerald-500 text-center bg-transparent"
                value={email}
                onChange={(e) => onUpdate?.(data.id, { props: { ...data.props, email: e.target.value } })}
              />
            ) : <div className="font-medium text-slate-900">{email}</div>}
          </div>
          <div className="p-6 bg-slate-50 rounded-xl">
            <div className="text-sm text-slate-500 mb-2">Phone</div>
            {isEditable ? (
              <input
                className="w-full font-medium text-slate-900 outline-none border-b border-transparent focus:border-emerald-500 text-center bg-transparent"
                value={phone}
                onChange={(e) => onUpdate?.(data.id, { props: { ...data.props, phone: e.target.value } })}
              />
            ) : <div className="font-medium text-slate-900">{phone}</div>}
          </div>
          <div className="p-6 bg-slate-50 rounded-xl">
            <div className="text-sm text-slate-500 mb-2">Address</div>
            {isEditable ? (
              <input
                className="w-full font-medium text-slate-900 outline-none border-b border-transparent focus:border-emerald-500 text-center bg-transparent"
                value={address}
                onChange={(e) => onUpdate?.(data.id, { props: { ...data.props, address: e.target.value } })}
              />
            ) : <div className="font-medium text-slate-900">{address}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
