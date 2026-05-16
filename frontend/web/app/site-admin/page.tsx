"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Store, LayoutDashboard, ShoppingBag, Package, DollarSign, Users,
  Shield, Upload, Trash2, Eye, ExternalLink, X, Check, AlertCircle,
  Loader2, Search, FileText, LogOut, RefreshCw, Info, Clock,
  ArrowUpRight, TrendingUp, Palette, FolderArchive, CheckCircle, XCircle,
  Terminal, FolderOpen,
} from "lucide-react";

type Tab = "dashboard" | "stores" | "users" | "templates" | "orders";

interface Stats {
  totalStores: number;
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalTemplates: number;
  totalRevenue: number;
}

interface StoreItem { id: string; name: string; slug: string; status: string; websiteType: string; owner: { id: string; name: string; email: string }; createdAt: string; }
interface UserItem { id: string; name: string; email: string; role: string; storeCount?: number; createdAt: string; }
interface OrderItem { id: string; orderNumber: string; total: number; status: string; paymentStatus: string; customerInfo: { name: string; phone: string }; customerName?: string; createdAt: string; }
interface TemplateItem { id: string; name: string; description?: string; thumbnail?: string; previewUrl: string; pages?: number; size?: string; lastModified?: string; buildStatus?: "pending" | "installing" | "building" | "ready" | "failed"; buildLog?: string; }
interface UploadStats { totalFiles: number; htmlPages: number; }

export default function SiteAdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [stats, setStats] = useState<Stats | null>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({});
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Template upload / import
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<"zip" | "path">("zip");
  const [importPath, setImportPath] = useState("");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build log viewer
  const [showLogModal, setShowLogModal] = useState(false);
  const [logTemplate, setLogTemplate] = useState<TemplateItem | null>(null);
  const [logContent, setLogContent] = useState<string>("");
  const [logLoading, setLogLoading] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "stores", label: "Stores", icon: Store },
    { id: "users", label: "Users", icon: Users },
    { id: "templates", label: "Templates", icon: Palette },
    { id: "orders", label: "Orders", icon: Package },
  ];

  // Filter state
  const [storeStatusFilter, setStoreStatusFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState("");

  // Auth check
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { router.push("/login"); return; }
    try {
      const user = JSON.parse(userData);
      if (user.role === "admin") { setIsAdmin(true); fetchTabData("dashboard"); }
      else { router.push("/dashboard"); }
    } catch { router.push("/login"); }
    finally { setChecking(false); }
  }, []);

  const getUserId = () => {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    try { return JSON.parse(raw).id; } catch { return ""; }
  };

  const fetchTabData = useCallback(async (tab: Tab, p = 1, search = "", filter = "") => {
    setLoading(true);
    const uid = getUserId();
    const headers: HeadersInit = uid ? { "x-user-id": uid } : {};

    try {
      if (tab === "dashboard") {
        const res = await fetch("/api/site-admin/stats", { headers });
        const data = await res.json();
        if (data.success) { setStats(data.stats); setOrdersByStatus(data.ordersByStatus || {}); setRecentOrders(data.recentOrders || []); }
      } else if (tab === "stores") {
        const params = new URLSearchParams({ page: String(p), limit: "20" });
        if (search) params.set("search", search);
        if (filter) params.set("status", filter);
        const res = await fetch(`/api/site-admin/stores?${params}`, { headers });
        const data = await res.json();
        if (data.success) { setStores(data.stores); setTotalPages(data.totalPages); setTotalItems(data.total); setPage(data.page); }
      } else if (tab === "users") {
        const params = new URLSearchParams({ page: String(p), limit: "20" });
        if (search) params.set("search", search);
        if (filter) params.set("role", filter);
        const res = await fetch(`/api/site-admin/users?${params}`, { headers });
        const data = await res.json();
        if (data.success) { setUsers(data.users); setTotalPages(data.totalPages); setTotalItems(data.total); setPage(data.page); }
      } else if (tab === "orders") {
        const params = new URLSearchParams({ page: String(p), limit: "20" });
        if (filter) params.set("status", filter);
        const res = await fetch(`/api/site-admin/orders?${params}`, { headers });
        const data = await res.json();
        if (data.success) { setOrders(data.orders); setTotalPages(data.totalPages); setTotalItems(data.total); setPage(data.page); }
      } else if (tab === "templates") {
        const res = await fetch(`/api/site-admin/templates`, { headers });
        const data = await res.json();
        if (data.success) setTemplates(data.templates);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setPage(1);
    setTotalPages(1);
    setStoreStatusFilter("");
    setOrderStatusFilter("");
    setUsersRoleFilter("");
    setMessage(null);
    fetchTabData(tab);
  };

  const handleStoreAction = async (storeId: string, status: string) => {
    const uid = getUserId();
    const res = await fetch(`/api/site-admin/stores/${storeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-id": uid },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage({ type: "success", text: `Store ${status.toLowerCase()} successfully` });
      fetchTabData("stores", page);
    } else {
      setMessage({ type: "error", text: data.error || "Action failed" });
    }
  };

  // ─── Template handlers ───
  const pollBuildStatus = async (templateId: string) => {
    const uid = getUserId();
    try {
      const res = await fetch(`/api/site-admin/templates/${templateId}/status`, {
        headers: uid ? { "x-user-id": uid } : {},
      });
      const data = await res.json();
      if (data.success && data.template) {
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === templateId
              ? { ...t, buildStatus: data.template.buildStatus, buildLog: data.template.buildLog }
              : t
          )
        );
        if (data.template.buildStatus === "ready" || data.template.buildStatus === "failed") {
          return;
        }
        setTimeout(() => pollBuildStatus(templateId), 5000);
      }
    } catch (error) {
      console.error("Failed to poll build status:", error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadName.trim()) return;
    setUploading(true); setMessage(null);
    const uid = getUserId();
    const formData = new FormData();
    formData.append("zip", uploadFile);
    formData.append("name", uploadName);
    formData.append("description", uploadDescription);

    try {
      const res = await fetch("/api/site-admin/templates", {
        method: "POST",
        headers: uid ? { "x-user-id": uid } : {},
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Template "${data.name}" uploaded! Build status: ${data.buildStatus}` });
        setShowUploadForm(false); setUploadFile(null); setUploadName(""); setUploadDescription("");
        fetchTabData("templates");
        if (data.buildStatus !== "ready") {
          setTimeout(() => pollBuildStatus(data.templateId), 3000);
        }
      } else {
        const errText = data.error || "Upload failed";
        if (res.status === 403) setMessage({ type: "error", text: "Access denied. Admin login required." });
        else if (res.status === 409) setMessage({ type: "error", text: errText });
        else setMessage({ type: "error", text: errText });
      }
    } catch { setMessage({ type: "error", text: "Network error" }); }
    finally { setUploading(false); }
  };

  const handleDelete = async (tid: string, tname: string) => {
    if (!confirm(`Delete "${tname}"?`)) return;
    setDeleting(tid); setMessage(null);
    const uid = getUserId();
    try {
      const res = await fetch(`/api/site-admin/templates?templateId=${tid}`, {
        method: "DELETE",
        headers: uid ? { "x-user-id": uid } : {},
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(prev => prev.filter((t) => t.id !== tid));
        setMessage({ type: "success", text: `"${tname}" deleted` });
      } else setMessage({ type: "error", text: data.error || "Delete failed" });
    } catch { setMessage({ type: "error", text: "Delete failed" }); }
    finally { setDeleting(null); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".zip")) setUploadFile(f);
    else setMessage({ type: "error", text: "Please drop a .zip file" });
  };

  const handleViewLog = async (template: TemplateItem) => {
    setLogTemplate(template);
    setShowLogModal(true);
    setLogLoading(true);
    setLogContent("");
    const uid = getUserId();
    try {
      const res = await fetch(`/api/site-admin/templates/${template.id}/status`, {
        headers: uid ? { "x-user-id": uid } : {},
      });
      const data = await res.json();
      if (data.success && data.template?.buildLog) {
        setLogContent(data.template.buildLog);
      } else {
        setLogContent("No build log available.");
      }
    } catch {
      setLogContent("Failed to load build log.");
    } finally {
      setLogLoading(false);
    }
  };

  const handleRetryBuild = async (template: TemplateItem) => {
    if (!confirm(`Retry build for "${template.name}"?`)) return;
    setMessage(null);
    const uid = getUserId();
    try {
      const res = await fetch(`/api/site-admin/templates/${template.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": uid },
        body: JSON.stringify({ action: "retry" }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Build retry started for "${template.name}"` });
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === template.id ? { ...t, buildStatus: "building" as const } : t
          )
        );
        pollBuildStatus(template.id);
      } else {
        setMessage({ type: "error", text: data.error || "Retry failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error during retry" });
    }
  };

  const handleImportFromPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importPath.trim() || !uploadName.trim()) return;
    setImporting(true);
    setMessage(null);
    const uid = getUserId();
    try {
      const res = await fetch("/api/site-admin/templates/import", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": uid },
        body: JSON.stringify({
          name: uploadName,
          description: uploadDescription,
          sourcePath: importPath,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Template "${data.name}" imported! Build status: ${data.buildStatus}` });
        setShowUploadForm(false);
        setImportPath("");
        setUploadName("");
        setUploadDescription("");
        fetchTabData("templates");
        if (data.buildStatus !== "ready") {
          setTimeout(() => pollBuildStatus(data.templateId), 3000);
        }
      } else {
        setMessage({ type: "error", text: data.error || "Import failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setImporting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("storeId");
    router.push("/");
  };

  // ─── Login screen ───
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1d4ed8]/30 border-t-[#1d4ed8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">Admin access required.</p>
          <button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af]">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    { label: "Total Stores", value: stats.totalStores, icon: Store, color: "text-blue-600 bg-blue-50" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-pink-600 bg-pink-50" },
    { label: "Total Products", value: stats.totalProducts, icon: ShoppingBag, color: "text-green-600 bg-green-50" },
    { label: "Total Orders", value: stats.totalOrders, icon: Package, color: "text-purple-600 bg-purple-50" },
    { label: "Total Revenue", value: `৳${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-orange-600 bg-orange-50" },
    { label: "Active Templates", value: stats.totalTemplates, icon: Palette, color: "text-cyan-600 bg-cyan-50" },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1d4ed8] rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Site Admin</h1>
              <p className="text-xs text-gray-500">Platform management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { fetchTabData(activeTab, page); }} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Refresh"><RefreshCw size={18} /></button>
            <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"><LogOut size={16} /> Logout</button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => switchTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? "border-[#1d4ed8] text-[#1d4ed8]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : message.type === "info" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            {message.type === "success" ? <Check size={18} /> : message.type === "info" ? <Info size={18} /> : <AlertCircle size={18} />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage(null)} className="shrink-0 hover:opacity-70"><X size={18} /></button>
          </div>
        )}

        {/* ─────── DASHBOARD ─────── */}
        {activeTab === "dashboard" && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" /></div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                  {statCards.map((c) => (
                    <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color}`}><c.icon size={20} /></div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                      <p className="text-xs text-gray-500">{c.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Orders by Status</h3>
                    <div className="space-y-3">
                      {Object.entries(ordersByStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{status}</span>
                          <span className="text-sm font-semibold text-gray-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
                    {recentOrders.length === 0 ? (
                      <p className="text-sm text-gray-400">No orders yet</p>
                    ) : (
                      <div className="space-y-3">
                        {recentOrders.map((o) => (
                          <div key={o.id} className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-medium text-gray-900">{o.orderNumber}</span>
                              <span className="text-gray-500 ml-2">by {o.customerName || o.customerInfo?.name || "Unknown"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-900 font-medium">৳{o.total.toLocaleString()}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${o.status === "delivered" ? "bg-green-100 text-green-700" : o.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ─────── STORES ─────── */}
        {activeTab === "stores" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search stores..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); fetchTabData("stores", 1, e.target.value, storeStatusFilter); }} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={storeStatusFilter} onChange={(e) => { setStoreStatusFilter(e.target.value); fetchTabData("stores", 1, searchQuery, e.target.value); }} className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              <span className="text-sm text-gray-500">{totalItems} stores</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" /></div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stores.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                          <Store className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          No stores found{searchQuery || storeStatusFilter ? " matching filters" : ""}
                        </td></tr>
                      ) : stores.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3"><span className="font-medium text-gray-900">{s.name}</span><br /><span className="text-xs text-gray-400">{s.slug}</span></td>
                          <td className="px-4 py-3 text-gray-700">{s.owner?.name || "—"}<br /><span className="text-xs text-gray-400">{s.owner?.email || ""}</span></td>
                          <td className="px-4 py-3 text-gray-600">{s.websiteType}</td>
                          <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === "APPROVED" ? "bg-green-100 text-green-700" : s.status === "SUSPENDED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{s.status}</span></td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-2 justify-end">
                              <a href={`/store/${s.id}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"><ExternalLink size={12} /></a>
                              {s.status !== "APPROVED" && <button onClick={() => handleStoreAction(s.id, "APPROVED")} className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">Approve</button>}
                              {s.status !== "SUSPENDED" && <button onClick={() => handleStoreAction(s.id, "SUSPENDED")} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Suspend</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─────── USERS ─────── */}
        {activeTab === "users" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); fetchTabData("users", 1, e.target.value, usersRoleFilter); }} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={usersRoleFilter} onChange={(e) => { setUsersRoleFilter(e.target.value); fetchTabData("users", 1, searchQuery, e.target.value); }} className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="CUSTOMER">Customer</option>
              </select>
              <span className="text-sm text-gray-500">{totalItems} users</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" /></div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-600">Stores</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                          <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          No users found{searchQuery || usersRoleFilter ? " matching filters" : ""}
                        </td></tr>
                      ) : users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                          <td className="px-4 py-3 text-gray-600">{u.email}</td>
                          <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{u.role}</span></td>
                          <td className="px-4 py-3 text-center text-gray-600">{u.storeCount ?? 0}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─────── TEMPLATES ─────── */}
        {activeTab === "templates" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowUploadForm(true); setImportMode("zip"); }} className="px-5 py-2.5 bg-[#1d4ed8] text-white rounded-xl hover:bg-[#1e40af] flex items-center gap-2 font-medium"><Upload size={18} /> Upload ZIP</button>
                <button onClick={() => { setShowUploadForm(true); setImportMode("path"); }} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center gap-2 font-medium"><FolderOpen size={18} /> Import Path</button>
              </div>
            </div>

            {/* Upload / Import Modal */}
            {showUploadForm && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={(e) => { if (e.target === e.currentTarget) setShowUploadForm(false); }}
              >
                <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {importMode === "zip" ? "Upload React Template" : "Import from Path"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {importMode === "zip" ? "ZIP file of React project (without node_modules)" : "Local directory path on the server"}
                      </p>
                    </div>
                    <button onClick={() => setShowUploadForm(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                  </div>

                  {/* Mode tabs */}
                  <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setImportMode("zip")}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${importMode === "zip" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      Upload ZIP
                    </button>
                    <button
                      onClick={() => setImportMode("path")}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${importMode === "path" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      Import Path
                    </button>
                  </div>

                  {importMode === "zip" ? (
                    <form onSubmit={handleUpload} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Template Name <span className="text-red-500">*</span></label>
                        <input type="text" required placeholder="e.g., My Fashion Store" value={uploadName} onChange={(e) => setUploadName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea placeholder="Brief description..." value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y" />
                      </div>
                      <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragOver ? "border-blue-500 bg-blue-50" : uploadFile ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}`} onClick={() => fileInputRef.current?.click()}>
                        {uploadFile ? (
                          <><FolderArchive className="w-12 h-12 text-green-500 mx-auto mb-3" /><p className="text-green-700 font-medium">{uploadFile.name}</p><p className="text-sm text-green-600 mt-1">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p><button type="button" onClick={(e) => { e.stopPropagation(); setUploadFile(null); }} className="mt-3 text-sm text-red-600 hover:text-red-700 underline">Remove</button></>
                        ) : (
                          <><Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" /><p className="text-gray-600 font-medium mb-1">Drag & drop ZIP here</p><p className="text-sm text-gray-400 mb-3">or click to browse</p><p className="text-xs text-gray-400">ZIP • Max 100MB • Must contain HTML or package.json</p></>
                        )}
                        <input ref={fileInputRef} type="file" accept=".zip" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="hidden" />
                      </div>
                      {uploading && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600"><Loader2 size={14} className="animate-spin" /> Uploading...</div>
                          <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-[#1d4ed8] h-2 rounded-full animate-pulse w-3/4" /></div>
                        </div>
                      )}
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => { setShowUploadForm(false); setUploadFile(null); setUploadName(""); setUploadDescription(""); }} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium">Cancel</button>
                        <button type="submit" disabled={uploading || !uploadFile || !uploadName.trim()} className="flex-1 px-4 py-2.5 bg-[#1d4ed8] text-white rounded-xl hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed font-medium">{uploading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Deploying...</span> : <span className="flex items-center justify-center gap-2"><Upload size={16} /> Upload</span>}</button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleImportFromPath} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Template Name <span className="text-red-500">*</span></label>
                        <input type="text" required placeholder="e.g., My Fashion Store" value={uploadName} onChange={(e) => setUploadName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea placeholder="Brief description..." value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Source Path <span className="text-red-500">*</span></label>
                        <input type="text" required placeholder="e.g., D:\\templates\\my-store or /home/user/templates/my-store" value={importPath} onChange={(e) => setImportPath(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
                        <p className="text-xs text-gray-400 mt-1">Absolute path to a local directory containing the template source.</p>
                      </div>
                      {importing && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600"><Loader2 size={14} className="animate-spin" /> Importing & building...</div>
                          <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-[#1d4ed8] h-2 rounded-full animate-pulse w-3/4" /></div>
                        </div>
                      )}
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => { setShowUploadForm(false); setImportPath(""); setUploadName(""); setUploadDescription(""); }} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium">Cancel</button>
                        <button type="submit" disabled={importing || !importPath.trim() || !uploadName.trim()} className="flex-1 px-4 py-2.5 bg-[#1d4ed8] text-white rounded-xl hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed font-medium">{importing ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Importing...</span> : <span className="flex items-center justify-center gap-2"><FolderOpen size={16} /> Import</span>}</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Build Log Modal */}
            {showLogModal && logTemplate && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={(e) => { if (e.target === e.currentTarget) setShowLogModal(false); }}
              >
                <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <Terminal size={16} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Build Log</h2>
                        <p className="text-xs text-gray-500">{logTemplate.name} <code className="bg-gray-100 px-1 rounded">{logTemplate.id}</code></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {logTemplate.buildStatus === "failed" && (
                        <button
                          onClick={() => { setShowLogModal(false); handleRetryBuild(logTemplate); }}
                          className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-1.5"
                        >
                          <RefreshCw size={14} /> Retry
                        </button>
                      )}
                      <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-0">
                    {logLoading ? (
                      <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
                    ) : (
                      <pre className="text-xs font-mono text-gray-300 bg-gray-900 p-6 whitespace-pre-wrap break-words min-h-[300px]">
                        {logContent || "No build log available."}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" /></div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><FolderArchive size={20} className="text-blue-600" /></div><div><p className="text-2xl font-bold text-gray-900">{templates.length}</p><p className="text-xs text-gray-500">Templates</p></div></div></div>
                </div>
                {templates.filter((t) => !searchQuery || t.name.toLowerCase().includes(searchQuery) || t.description?.toLowerCase().includes(searchQuery)).length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5"><FolderArchive className="w-10 h-10 text-gray-300" /></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
                    <p className="text-gray-500 mb-6">{searchQuery ? "Try a different search term." : "Upload your first website template."}</p>
                    {!searchQuery && (
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => { setShowUploadForm(true); setImportMode("zip"); }} className="px-6 py-3 bg-[#1d4ed8] text-white rounded-xl hover:bg-[#1e40af] font-medium"><Upload size={18} className="inline mr-2" />Upload ZIP</button>
                        <button onClick={() => { setShowUploadForm(true); setImportMode("path"); }} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"><FolderOpen size={18} className="inline mr-2" />Import Path</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {templates.filter((t) => !searchQuery || t.name.toLowerCase().includes(searchQuery) || t.description?.toLowerCase().includes(searchQuery)).map((template) => {
                      const getStatusBadge = (status: string) => {
                        switch (status) {
                          case "ready":
                            return <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"><Check size={10} /> Ready</span>;
                          case "failed":
                            return <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full"><XCircle size={10} /> Failed</span>;
                          case "building":
                          case "installing":
                            return <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"><Loader2 size={10} className="animate-spin" /> Building</span>;
                          default:
                            return <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"><Clock size={10} /> Pending</span>;
                        }
                      };
                      return (
                        <div key={template.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg hover:border-gray-300 transition-all">
                          <div className="aspect-video bg-gray-100 relative overflow-hidden">
                            {template.thumbnail ? <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"><FileText className="w-12 h-12 text-gray-300" /></div>}
                            <div className="absolute top-2 left-2">{getStatusBadge(template.buildStatus || "pending")}</div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              {template.buildStatus === "ready" && (
                                <>
                                  <a href={template.previewUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white rounded-full text-gray-700 hover:text-blue-600 shadow-lg"><Eye size={18} /></a>
                                  <a href={template.previewUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white rounded-full text-gray-700 hover:text-blue-600 shadow-lg"><ExternalLink size={18} /></a>
                                </>
                              )}
                              {template.buildStatus === "failed" && (
                                <button onClick={() => handleRetryBuild(template)} className="p-2.5 bg-white rounded-full text-gray-700 hover:text-blue-600 shadow-lg" title="Retry build"><RefreshCw size={18} /></button>
                              )}
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">{template.name}</h3>
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-[2.5rem]">{template.description || "No description"}</p>
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                              <span className="flex items-center gap-1"><FileText size={12} /> React App</span>
                              <span className="flex items-center gap-1"><Package size={12} /> {template.buildStatus === "ready" ? "Built" : template.buildStatus === "failed" ? "Failed" : "Pending"}</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <button
                                onClick={() => handleViewLog(template)}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                                title="View build log"
                              >
                                <Terminal size={12} /> Log
                              </button>
                              <div className="flex items-center gap-1">
                                <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-2">{template.id}</code>
                                <button onClick={() => handleDelete(template.id, template.name)} disabled={deleting === template.id} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50">{deleting === template.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ─────── ORDERS ─────── */}
        {activeTab === "orders" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <select value={orderStatusFilter} onChange={(e) => { setOrderStatusFilter(e.target.value); fetchTabData("orders", 1, "", e.target.value); }} className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className="text-sm text-gray-500">{totalItems} orders</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" /></div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No orders found</td></tr>
                      ) : orders.map((o) => (
                        <tr key={o.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{o.orderNumber}</td>
                          <td className="px-4 py-3 text-gray-700">{o.customerInfo?.name || "—"}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">৳{(o.total || 0).toLocaleString()}</td>
                          <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${o.status === "delivered" ? "bg-green-100 text-green-700" : o.status === "cancelled" ? "bg-red-100 text-red-700" : o.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{o.status}</span></td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button disabled={page <= 1} onClick={() => { setPage(page - 1); fetchTabData(activeTab, page - 1, searchQuery); }} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => { setPage(page + 1); fetchTabData(activeTab, page + 1, searchQuery); }} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-gray-400">
          Site Admin • Bdesh E-Commerce Platform
        </div>
      </footer>
    </div>
  );
}
