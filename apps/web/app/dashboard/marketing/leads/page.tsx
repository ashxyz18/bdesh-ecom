"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Download, Filter, Search, Mail, Phone, Calendar,
  Tag, Trash2, Eye, MoreHorizontal, X, Plus, ChevronDown,
  UserPlus, ArrowUp, ArrowDown, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useDashboard } from "../../DashboardContext";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  tags: string[];
  createdAt: string;
}

const sourceColors: Record<string, string> = {
  NEWSLETTER: "bg-blue-50 text-blue-700 border-blue-200",
  CHECKOUT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  POPUP: "bg-purple-50 text-purple-700 border-purple-200",
  REFERRAL: "bg-amber-50 text-amber-700 border-amber-200",
  SOCIAL: "bg-pink-50 text-pink-700 border-pink-200",
  MANUAL: "bg-slate-100 text-slate-700 border-slate-200",
};

const sourceLabels: Record<string, string> = {
  NEWSLETTER: "Newsletter",
  CHECKOUT: "Checkout",
  POPUP: "Popup",
  REFERRAL: "Referral",
  SOCIAL: "Social",
  MANUAL: "Manual",
};

export default function LeadsPage() {
  const { activeStore } = useDashboard();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("ALL");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "MANUAL",
    tags: "",
  });

  const fetchLeads = useCallback(async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/marketing/leads?storeId=${activeStore.id}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(
          (data.leads || []).map((l: any) => ({
            ...l,
            tags: typeof l.tags === "string" ? JSON.parse(l.tags) : l.tags || [],
          }))
        );
      }
    } catch {
      // Use empty array on error
    } finally {
      setLoading(false);
    }
  }, [activeStore]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleAddLead = async () => {
    if (!activeStore) return;
    setAdding(true);
    try {
      const res = await fetch("/api/marketing/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: activeStore.id,
          name: newLead.name || undefined,
          email: newLead.email || undefined,
          phone: newLead.phone || undefined,
          source: newLead.source,
          tags: JSON.stringify(newLead.tags.split(",").map((t) => t.trim()).filter(Boolean)),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads((prev) => [{ ...data.lead, tags: newLead.tags.split(",").map((t) => t.trim()).filter(Boolean) }, ...prev]);
        setShowAddModal(false);
        setNewLead({ name: "", email: "", phone: "", source: "MANUAL", tags: "" });
      }
    } catch {
      // Silently fail
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    try {
      const res = await fetch(`/api/marketing/leads?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        setSelectedLeads((prev) => { const next = new Set(prev); next.delete(id); return next; });
      }
    } catch {
      // Silently fail
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedLeads.size} leads?`)) return;
    for (const id of selectedLeads) {
      await fetch(`/api/marketing/leads?id=${id}`, { method: "DELETE" });
    }
    setLeads((prev) => prev.filter((l) => !selectedLeads.has(l.id)));
    setSelectedLeads(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filtered.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filtered.map((l) => l.id)));
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Source", "Tags", "Date"];
    const rows = filtered.map((l) => [
      l.name || "",
      l.email || "",
      l.phone || "",
      l.source,
      l.tags.join("; "),
      new Date(l.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${activeStore?.subdomain || "export"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (l.name || "").toLowerCase().includes(q) ||
      (l.email || "").toLowerCase().includes(q) ||
      (l.phone || "").toLowerCase().includes(q);
    const matchesSource = filterSource === "ALL" || l.source === filterSource;
    return matchesSearch && matchesSource;
  });

  const sourceCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.source] = (acc[l.source] || 0) + 1;
    return acc;
  }, {});

  const stats = {
    total: leads.length,
    withEmail: leads.filter((l) => l.email).length,
    withPhone: leads.filter((l) => l.phone).length,
    thisMonth: leads.filter((l) => {
      const d = new Date(l.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={24} className="text-[#008060]" /> Customer Leads
          </h1>
          <p className="text-slate-500 mt-1">Manage customer leads and build your email list</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportCSV}
            variant="outline"
            className="text-sm border-slate-200 text-slate-700"
            disabled={filtered.length === 0}
          >
            <Download size={14} className="mr-1.5" /> Export CSV
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#008060] hover:bg-[#006A4E] text-white text-sm"
          >
            <UserPlus size={14} className="mr-1.5" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Leads", value: stats.total, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "With Email", value: stats.withEmail, icon: Mail, color: "text-emerald-600 bg-emerald-50" },
          { label: "With Phone", value: stats.withPhone, icon: Phone, color: "text-purple-600 bg-purple-50" },
          { label: "This Month", value: stats.thisMonth, icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                <s.icon size={14} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Source Breakdown */}
      {Object.keys(sourceCounts).length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs font-medium text-slate-500 mr-1">Sources:</span>
          {Object.entries(sourceCounts).map(([source, count]) => (
            <span key={source} className={`px-2.5 py-1 rounded-full text-xs font-medium border ${sourceColors[source] || sourceColors.MANUAL}`}>
              {sourceLabels[source] || source}: {count}
            </span>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {["ALL", "NEWSLETTER", "CHECKOUT", "POPUP", "REFERRAL", "SOCIAL"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSource(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filterSource === s
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s === "ALL" ? "All" : sourceLabels[s] || s}
            </button>
          ))}
        </div>
        {selectedLeads.size > 0 && (
          <Button
            onClick={handleDeleteSelected}
            className="text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
          >
            <Trash2 size={14} className="mr-1.5" /> Delete ({selectedLeads.size})
          </Button>
        )}
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#008060] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              {search || filterSource !== "ALL" ? "No matching leads" : "No leads yet"}
            </h3>
            <p className="text-slate-500 mb-6">
              {search || filterSource !== "ALL"
                ? "Try adjusting your search or filters"
                : "Leads will appear when customers sign up via newsletter, checkout, or popups"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLeads.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-[#008060] focus:ring-[#008060]"
                    />
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Email</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Phone</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Source</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Tags</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className={`hover:bg-slate-50/50 border-b border-slate-50 ${selectedLeads.has(lead.id) ? "bg-[#008060]/5" : ""}`}>
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="rounded border-slate-300 text-[#008060] focus:ring-[#008060]"
                      />
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-900">
                      {lead.name || <span className="text-slate-400 italic">Unknown</span>}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="hover:text-[#008060] transition-colors">{lead.email}</a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="hover:text-[#008060] transition-colors">{lead.phone}</a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${sourceColors[lead.source] || sourceColors.MANUAL}`}>
                        {sourceLabels[lead.source] || lead.source}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {lead.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            {tag}
                          </span>
                        ))}
                        {lead.tags.length > 2 && (
                          <span className="text-[10px] text-slate-400">+{lead.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Add Lead</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                  placeholder="Customer name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                    placeholder="017XXXXXXXX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Source</label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                >
                  <option value="MANUAL">Manual Entry</option>
                  <option value="NEWSLETTER">Newsletter</option>
                  <option value="CHECKOUT">Checkout</option>
                  <option value="POPUP">Popup</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="SOCIAL">Social Media</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newLead.tags}
                  onChange={(e) => setNewLead({ ...newLead, tags: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                  placeholder="vip, repeat-buyer, dhaka"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="text-sm">
                Cancel
              </Button>
              <Button
                onClick={handleAddLead}
                disabled={adding || (!newLead.email && !newLead.phone)}
                className="bg-[#008060] hover:bg-[#006A4E] text-white text-sm"
              >
                {adding ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <UserPlus size={14} className="mr-1.5" />
                )}
                Add Lead
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
