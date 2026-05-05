"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, Clock, User, Phone, Mail, 
  CheckCircle2, XCircle, Clock4, Filter, Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "../DashboardContext";

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  serviceName: string;
  startTime: string;
  status: string;
  notes: string | null;
}

export default function BookingsPage() {
  const { activeStore } = useDashboard();
  const storeId = activeStore?.id;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetchBookings() {
      if (!storeId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/${storeId}/bookings`);
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [storeId]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/${storeId}/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookings = bookings.filter(b => 
    filter === "all" || b.status.toLowerCase() === filter.toLowerCase()
  );

  if (!storeId) {
    return (
      <div className="text-center py-24">
        <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
        <h2 className="text-xl font-bold">No Store Selected</h2>
        <p className="text-slate-500">Select a store to view bookings.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your service appointments</p>
        </div>
        <div className="flex items-center gap-2">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === s ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 animate-pulse h-32" />
          ))
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white py-20 rounded-3xl border border-slate-200 text-center">
            <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500">No bookings found for this filter.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  booking.status === "PENDING" ? "bg-amber-100 text-amber-600" :
                  booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-600" :
                  booking.status === "COMPLETED" ? "bg-blue-100 text-blue-600" :
                  "bg-slate-100 text-slate-500"
                }`}>
                  <Clock4 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{booking.serviceName}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><User size={14} /> {booking.customerName}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(booking.startTime).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {(booking.customerPhone || booking.customerEmail) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                      {booking.customerPhone && <span className="flex items-center gap-1.5"><Phone size={12} /> {booking.customerPhone}</span>}
                      {booking.customerEmail && <span className="flex items-center gap-1.5"><Mail size={12} /> {booking.customerEmail}</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {booking.status === "PENDING" && (
                  <>
                    <Button variant="ghost" onClick={() => handleStatusUpdate(booking.id, "CANCELLED")} className="text-red-600 hover:bg-red-50 rounded-xl">
                      <XCircle className="mr-2" size={16} /> Cancel
                    </Button>
                    <Button onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                      <CheckCircle2 className="mr-2" size={16} /> Confirm
                    </Button>
                  </>
                )}
                {booking.status === "CONFIRMED" && (
                  <Button onClick={() => handleStatusUpdate(booking.id, "COMPLETED")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    Mark Completed
                  </Button>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  booking.status === "PENDING" ? "bg-amber-100 text-amber-600" :
                  booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-600" :
                  booking.status === "COMPLETED" ? "bg-blue-100 text-blue-600" :
                  "bg-slate-100 text-slate-500"
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
