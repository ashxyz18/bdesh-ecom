"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "../DashboardContext";
import {
  Truck, Plus, Search, Phone, MapPin, Star, Edit2, Trash2, X, Check,
  Package, Clock, CheckCircle2, User, Mail, ChevronDown, ChevronUp,
  AlertCircle, Shield, Zap,
} from "lucide-react";

interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  zone: string;
  status: "active" | "inactive";
  rating: number;
  totalDeliveries: number;
  pendingDeliveries: number;
}

interface AssignableOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  shipping: { name: string; phone: string; address: string; city: string; district: string } | null;
  assignedPartner?: string;
}

// Local storage key for delivery partners
const DP_KEY = (storeId: string) => `bdesh_delivery_partners_${storeId}`;
const ASSIGN_KEY = (storeId: string) => `bdesh_order_assignments_${storeId}`;

export default function DeliveryPartnersPage() {
  const { activeStore } = useDashboard();
  const storeId = activeStore?.id;
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [orders, setOrders] = useState<AssignableOrder[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"partners" | "assign">("partners");

  // Form state
  const [form, setForm] = useState({ name: "", phone: "", email: "", zone: "" });

  // Load partners from localStorage + orders from API
  useEffect(() => {
    if (!storeId) { setLoading(false); return; }

    // Load partners
    try {
      const saved = localStorage.getItem(DP_KEY(storeId));
      if (saved) setPartners(JSON.parse(saved));
    } catch {}

    // Load assignments
    try {
      const saved = localStorage.getItem(ASSIGN_KEY(storeId));
      if (saved) setAssignments(JSON.parse(saved));
    } catch {}

    // Load confirmed/processing orders for assignment
    fetch(`/api/${storeId}/orders`)
      .then((r) => r.json())
      .then((d) => {
        const assignable = (d.orders || []).filter(
          (o: any) => ["CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.status)
        );
        setOrders(assignable);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId]);

  // Save partners
  const savePartners = (list: DeliveryPartner[]) => {
    setPartners(list);
    if (storeId) localStorage.setItem(DP_KEY(storeId), JSON.stringify(list));
  };

  // Save assignments
  const saveAssignments = (map: Record<string, string>) => {
    setAssignments(map);
    if (storeId) localStorage.setItem(ASSIGN_KEY(storeId), JSON.stringify(map));
  };

  const handleAdd = () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    const newPartner: DeliveryPartner = {
      id: `dp-${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      zone: form.zone.trim(),
      status: "active",
      rating: 5.0,
      totalDeliveries: 0,
      pendingDeliveries: 0,
    };
    savePartners([...partners, newPartner]);
    setForm({ name: "", phone: "", email: "", zone: "" });
    setShowAddForm(false);
  };

  const handleEdit = (id: string) => {
    const p = partners.find((x) => x.id === id);
    if (!p) return;
    setForm({ name: p.name, phone: p.phone, email: p.email, zone: p.zone });
    setEditingId(id);
    setShowAddForm(true);
  };

  const handleUpdate = () => {
    if (!editingId || !form.name.trim()) return;
    savePartners(
      partners.map((p) =>
        p.id === editingId ? { ...p, name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), zone: form.zone.trim() } : p
      )
    );
    setForm({ name: "", phone: "", email: "", zone: "" });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    savePartners(partners.filter((p) => p.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    savePartners(
      partners.map((p) => (p.id === id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p))
    );
  };

  const handleAssign = async (orderId: string, partnerId: string) => {
    const newAssignments = { ...assignments, [orderId]: partnerId };
    saveAssignments(newAssignments);

    // Also update order status to SHIPPED if not already
    if (storeId) {
      try {
        await fetch(`/api/${storeId}/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "SHIPPED" }),
        });
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "SHIPPED" } : o)));
      } catch {}
    }

    // Update partner stats
    savePartners(
      partners.map((p) =>
        p.id === partnerId ? { ...p, pendingDeliveries: p.pendingDeliveries + 1, totalDeliveries: p.totalDeliveries + 1 } : p
      )
    );
  };

  const filteredPartners = partners.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.zone.toLowerCase().includes(search.toLowerCase())
  );

  const activePartners = partners.filter((p) => p.status === "active");

  if (!storeId) {
    return (
      <div className="text-center py-24">
        <Truck className="mx-auto text-slate-300 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Store Selected</h2>
        <p className="text-slate-500">Select a store to manage delivery partners.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck size={24} className="text-emerald-600" /> Delivery Partners
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage delivery partners and assign orders</p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null); setForm({ name: "", phone: "", email: "", zone: "" }); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus size={16} /> Add Partner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Partners", value: partners.length, color: "text-blue-600", bg: "bg-blue-50", icon: User },
          { label: "Active Partners", value: activePartners.length, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
          { label: "Pending Deliveries", value: orders.filter((o) => o.status !== "DELIVERED").length, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
          { label: "Orders to Assign", value: orders.filter((o) => !assignments[o.id]).length, color: "text-purple-600", bg: "bg-purple-50", icon: Package },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit">
        <button onClick={() => setTab("partners")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "partners" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
          <User size={14} className="inline mr-1.5" /> Partners ({partners.length})
        </button>
        <button onClick={() => setTab("assign")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "assign" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
          <Package size={14} className="inline mr-1.5" /> Assign Orders ({orders.filter((o) => !assignments[o.id]).length})
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAddForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">{editingId ? "Edit Partner" : "Add Delivery Partner"}</h3>
              <button onClick={() => setShowAddForm(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Full Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rahman Ali" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone Number *</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Delivery Zone</label>
                <input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="e.g. Dhaka, Chittagong" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                disabled={!form.name.trim() || !form.phone.trim()}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {editingId ? "Update Partner" : "Add Partner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partners Tab */}
      {tab === "partners" && (
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input placeholder="Search partners..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
          </div>

          {filteredPartners.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200/80">
              <Truck className="mx-auto text-slate-300 mb-3" size={40} />
              <h3 className="font-bold text-slate-900 mb-1">No delivery partners yet</h3>
              <p className="text-sm text-slate-500 mb-4">Add your first delivery partner to start assigning orders.</p>
              <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                <Plus size={14} className="inline mr-1" /> Add Partner
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPartners.map((p) => (
                <div key={p.id} className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all ${p.status === "active" ? "border-slate-200/80" : "border-slate-200/50 opacity-60"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{p.name}</h3>
                        <p className="text-xs text-slate-400">{p.zone || "All zones"}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5"><Phone size={12} /> {p.phone}</p>
                    {p.email && <p className="text-xs text-slate-500 flex items-center gap-1.5"><Mail size={12} /> {p.email}</p>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" /> {p.rating.toFixed(1)}</span>
                    <span className="flex items-center gap-1"><Package size={12} /> {p.totalDeliveries} delivered</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {p.pendingDeliveries} pending</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleStatus(p.id)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${p.status === "active" ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>
                      {p.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => handleEdit(p.id)} className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assign Orders Tab */}
      {tab === "assign" && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200/80">
              <Package className="mx-auto text-slate-300 mb-3" size={40} />
              <h3 className="font-bold text-slate-900 mb-1">No orders to assign</h3>
              <p className="text-sm text-slate-500">Confirmed orders will appear here for delivery assignment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const assignedPartnerId = assignments[order.id];
                const assignedPartner = partners.find((p) => p.id === assignedPartnerId);

                return (
                  <div key={order.id} className="bg-white rounded-xl border border-slate-200/80 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{order.orderNumber}</p>
                        <p className="text-xs text-slate-400">{order.shipping?.name} · {order.shipping?.district} · ৳{Math.round(Number(order.total)).toLocaleString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${order.status === "SHIPPED" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                        {order.status}
                      </span>
                    </div>

                    {assignedPartner ? (
                      <div className="flex items-center gap-3 bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800">Assigned to {assignedPartner.name}</p>
                          <p className="text-xs text-emerald-600">{assignedPartner.phone} · {assignedPartner.zone}</p>
                        </div>
                      </div>
                    ) : activePartners.length === 0 ? (
                      <div className="flex items-center gap-2 bg-amber-50 rounded-lg p-3 border border-amber-200 text-sm text-amber-700">
                        <AlertCircle size={16} /> Add delivery partners first to assign orders.
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-slate-500 mb-2">Assign to delivery partner:</p>
                        <div className="flex flex-wrap gap-2">
                          {activePartners.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleAssign(order.id, p.id)}
                              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                            >
                              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                                {p.name.charAt(0)}
                              </div>
                              <span className="text-slate-700 font-medium">{p.name}</span>
                              <span className="text-xs text-slate-400">{p.zone}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
