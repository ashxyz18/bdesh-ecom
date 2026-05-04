"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Store, Search, ExternalLink, CheckCircle2, XCircle, Clock,
  ChevronLeft, ChevronRight, Eye, Loader2, ShieldCheck, ShieldX, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from "../AdminContext";

interface StoreOwner {
  id: string;
  name: string;
  email: string;
}

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  description: string | null;
  status: string;
  createdAt: string;
  owner: StoreOwner;
  _count: { products: number; orders: number };
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Pending", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
  APPROVED: { label: "Approved", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  SUSPENDED: { label: "Suspended", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
};

export default function AdminStoresPage() {
  const { user } = useAdmin();
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchStores = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/stores?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStores(data.stores || []);
        setTotal(data.total || 0);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleStatusChange = async (storeId: string, newStatus: string) => {
    setUpdating(storeId);
    try {
      const res = await fetch(`/api/admin/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchStores();
      }
    } catch {
      // Handle error
    } finally {
      setUpdating(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStores();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Store Management</h1>
        <p className="text-slate-400 mt-1">Manage all stores on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores by name or subdomain..."
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-amber-500/50"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Store</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Products</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Orders</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm mt-2">Loading stores...</p>
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Building2 className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-400">No stores found</p>
                  </td>
                </tr>
              ) : (
                stores.map((store) => {
                  const status = statusConfig[store.status] || statusConfig.PENDING;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={store.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white">{store.name}</p>
                          <p className="text-xs text-slate-500">{store.subdomain}.bdesh.com</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-slate-300">{store.owner.name}</p>
                          <p className="text-xs text-slate-500">{store.owner.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-slate-300">{store._count.products}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-slate-300">{store._count.orders}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-400">
                          {new Date(store.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {store.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                              disabled={updating === store.id}
                              onClick={() => handleStatusChange(store.id, "APPROVED")}
                            >
                              <ShieldCheck size={12} className="mr-1" />
                              Approve
                            </Button>
                          )}
                          {store.status === "APPROVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              disabled={updating === store.id}
                              onClick={() => handleStatusChange(store.id, "SUSPENDED")}
                            >
                              <ShieldX size={12} className="mr-1" />
                              Suspend
                            </Button>
                          )}
                          {store.status === "SUSPENDED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                              disabled={updating === store.id}
                              onClick={() => handleStatusChange(store.id, "APPROVED")}
                            >
                              <ShieldCheck size={12} className="mr-1" />
                              Reactivate
                            </Button>
                          )}
                          <a
                            href={`/store?store=${store.subdomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <p className="text-sm text-slate-400">
              Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-sm text-slate-400">{page} / {totalPages}</span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
