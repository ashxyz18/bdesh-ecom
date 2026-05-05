"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Search, ChevronLeft, ChevronRight, Loader2,
  Shield, UserCheck, UserX, Mail, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from "../AdminContext";

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  emailVerified: string | null;
  createdAt: string;
  _count: { stores: number; orders: number };
}

const roleConfig: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  ADMIN: { label: "Admin", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Shield },
  MERCHANT: { label: "Merchant", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: UserCheck },
  CUSTOMER: { label: "Customer", color: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: Users },
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAdmin();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (searchQuery) params.set("search", searchQuery);
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotal(data.total || 0);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        await fetchUsers();
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
    fetchUsers();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-slate-400 mt-1">Manage platform users and their roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Users", value: total, color: "text-white" },
          { label: "Admins", value: users.filter(u => u.role === "ADMIN").length, color: "text-amber-400" },
          { label: "Merchants", value: users.filter(u => u.role === "MERCHANT").length, color: "text-blue-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-amber-500/50"
          />
        </form>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MERCHANT">Merchant</option>
          <option value="CUSTOMER">Customer</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Stores</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Orders</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm mt-2">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Users className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-400">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const role = roleConfig[user.role] || roleConfig.CUSTOMER;
                  const RoleIcon = role.icon;
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                            {user.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Mail size={10} />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${role.color}`}>
                          <RoleIcon size={12} />
                          {role.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-slate-300">{user._count.stores}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-slate-300">{user._count.orders}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-slate-400">
                          <Calendar size={12} />
                          {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {isSelf ? (
                            <span className="text-xs text-slate-500 italic">You</span>
                          ) : (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              disabled={updating === user.id}
                              className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-white focus:border-amber-500/50 disabled:opacity-50"
                            >
                              <option value="ADMIN">Admin</option>
                              <option value="MERCHANT">Merchant</option>
                              <option value="CUSTOMER">Customer</option>
                            </select>
                          )}
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
