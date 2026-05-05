"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, User, Phone, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BookingModalProps {
  storeId: string;
  serviceName: string;
  onClose: () => void;
}

export function BookingModal({ storeId, serviceName, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: new Date().toISOString().split('T')[0],
    time: "10:00",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          serviceName,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          date: form.date,
          time: form.time,
          notes: form.notes,
        }),
      });
      if (res.ok) {
        setStep(3);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
          <X size={20} />
        </button>

        {step === 1 && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Book Service</h2>
            <p className="text-slate-500 mb-6">{serviceName}</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block flex items-center gap-2"><Calendar size={14} /> Preferred Date</label>
                <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block flex items-center gap-2"><Clock size={14} /> Preferred Time</label>
                <Input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="rounded-xl" />
              </div>
              <Button onClick={() => setStep(2)} className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 rounded-xl text-lg font-bold">
                Next Step
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Details</h2>
            <p className="text-slate-500 mb-6">Enter your contact information</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block flex items-center gap-2"><User size={14} /> Full Name</label>
                <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="rounded-xl" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block flex items-center gap-2"><Phone size={14} /> Phone Number</label>
                <Input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="rounded-xl" placeholder="017xxxxxxxx" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block flex items-center gap-2"><Mail size={14} /> Email Address (Optional)</label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="rounded-xl" placeholder="john@example.com" />
              </div>
              <div className="pt-2 flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1 rounded-xl">Back</Button>
                <Button type="submit" disabled={loading} className="flex-[2] bg-emerald-600 hover:bg-emerald-700 py-6 rounded-xl text-lg font-bold">
                  {loading ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Received!</h2>
            <p className="text-slate-500 mb-8">We've received your request for <span className="font-semibold text-slate-700">{serviceName}</span>. We will contact you shortly to confirm.</p>
            <Button onClick={onClose} className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl py-6 font-bold">
              Got it
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
