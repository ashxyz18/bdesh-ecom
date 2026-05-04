"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail, Plus, Search, Play, Pause, Trash2, MoreHorizontal,
  Send, Eye, MousePointerClick, Calendar, Filter, X, Copy,
  Check, Clock, AlertCircle, BarChart3,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useDashboard } from "../../DashboardContext";

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  subject?: string;
  sent: number;
  opens: number;
  clicks: number;
  conversions: number;
  createdAt: string;
  scheduledAt?: string;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PAUSED: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
};

const typeLabels: Record<string, string> = {
  EMAIL: "Email",
  SMS: "SMS",
  SOCIAL: "Social",
  DISCOUNT: "Discount",
  FLASH_SALE: "Flash Sale",
};

export default function CampaignsPage() {
  const { activeStore } = useDashboard();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "EMAIL",
    subject: "",
    content: "",
    scheduledAt: "",
  });

  const fetchCampaigns = useCallback(async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/marketing/campaigns?storeId=${activeStore.id}`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch {
      // Use empty array on error
    } finally {
      setLoading(false);
    }
  }, [activeStore]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleCreate = async () => {
    if (!newCampaign.name.trim() || !activeStore) return;
    setCreating(true);
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: activeStore.id,
          name: newCampaign.name,
          type: newCampaign.type,
          config: JSON.stringify({
            subject: newCampaign.subject,
            content: newCampaign.content,
            scheduledAt: newCampaign.scheduledAt || undefined,
          }),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns((prev) => [data.campaign, ...prev]);
        setShowCreateModal(false);
        setNewCampaign({ name: "", type: "EMAIL", subject: "", content: "", scheduledAt: "" });
      }
    } catch {
      // Silently fail
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status } : c))
        );
      }
    } catch {
      // Silently fail
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      const res = await fetch(`/api/marketing/campaigns?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      // Silently fail
    }
  };

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "ALL" || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "ACTIVE").length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent, 0),
    avgOpenRate: campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + (c.sent > 0 ? (c.opens / c.sent) * 100 : 0), 0) / campaigns.filter((c) => c.sent > 0).length || 0
      : 0,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mail size={24} className="text-[#008060]" /> Email Campaigns
          </h1>
          <p className="text-slate-500 mt-1">Create and manage email & SMS marketing campaigns</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#008060] hover:bg-[#006A4E] text-white"
        >
          <Plus size={16} className="mr-2" /> New Campaign
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Campaigns", value: stats.total, icon: Mail, color: "text-blue-600 bg-blue-50" },
          { label: "Active", value: stats.active, icon: Play, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total Sent", value: stats.totalSent.toLocaleString(), icon: Send, color: "text-purple-600 bg-purple-50" },
          { label: "Avg Open Rate", value: `${stats.avgOpenRate.toFixed(1)}%`, icon: Eye, color: "text-amber-600 bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                <s.icon size={14} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {["ALL", "DRAFT", "ACTIVE", "PAUSED", "COMPLETED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filterStatus === s
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#008060] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Mail size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              {search || filterStatus !== "ALL" ? "No matching campaigns" : "No campaigns yet"}
            </h3>
            <p className="text-slate-500 mb-6">
              {search || filterStatus !== "ALL"
                ? "Try adjusting your search or filters"
                : "Create your first campaign to engage customers"}
            </p>
            {!search && filterStatus === "ALL" && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#008060] hover:bg-[#006A4E] text-white"
              >
                <Plus size={16} className="mr-2" /> Create Campaign
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Campaign</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Sent</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Opens</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Clicks</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Conv.</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 border-b border-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} /> {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">{typeLabels[c.type] || c.type}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[c.status] || statusColors.DRAFT}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{c.sent.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {c.sent > 0 ? `${((c.opens / c.sent) * 100).toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {c.sent > 0 ? `${((c.clicks / c.sent) * 100).toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{c.conversions || 0}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {c.status === "DRAFT" && (
                          <button
                            onClick={() => handleStatusChange(c.id, "ACTIVE")}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="Activate"
                          >
                            <Play size={14} />
                          </button>
                        )}
                        {c.status === "ACTIVE" && (
                          <button
                            onClick={() => handleStatusChange(c.id, "PAUSED")}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                            title="Pause"
                          >
                            <Pause size={14} />
                          </button>
                        )}
                        {c.status === "PAUSED" && (
                          <button
                            onClick={() => handleStatusChange(c.id, "ACTIVE")}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="Resume"
                          >
                            <Play size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Create Campaign</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                  placeholder="e.g., Eid Sale 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Campaign Type</label>
                <select
                  value={newCampaign.type}
                  onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                >
                  <option value="EMAIL">Email Campaign</option>
                  <option value="SMS">SMS Campaign</option>
                  <option value="SOCIAL">Social Media Post</option>
                  <option value="DISCOUNT">Discount Promotion</option>
                  <option value="FLASH_SALE">Flash Sale</option>
                </select>
              </div>
              {(newCampaign.type === "EMAIL" || newCampaign.type === "SMS") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {newCampaign.type === "EMAIL" ? "Email Subject" : "SMS Message"}
                  </label>
                  <input
                    type="text"
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                    placeholder={newCampaign.type === "EMAIL" ? "Special offer inside!" : "Get 20% off this Eid!"}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Content</label>
                <textarea
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm resize-none"
                  placeholder="Write your campaign content here..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Schedule (optional — leave empty for draft)
                </label>
                <input
                  type="datetime-local"
                  value={newCampaign.scheduledAt}
                  onChange={(e) => setNewCampaign({ ...newCampaign, scheduledAt: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="text-sm">
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !newCampaign.name.trim()}
                className="bg-[#008060] hover:bg-[#006A4E] text-white text-sm"
              >
                {creating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Plus size={14} className="mr-1.5" />
                )}
                Create Campaign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
