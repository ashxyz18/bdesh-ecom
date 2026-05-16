"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  Loader2,
  Mail,
  Phone,
  Search,
  ShoppingBag,
  UserPlus,
  Users,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  tags: string[];
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const storeId = typeof window !== "undefined" ? localStorage.getItem("storeId") : null;

  useEffect(() => {
    if (!storeId) return;

    setLoading(true);
    fetch(`/api/stores/${storeId}/customers?limit=100`)
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers || []))
      .catch((error) => console.error("Failed to fetch customers:", error))
      .finally(() => setLoading(false));
  }, [storeId]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter((customer) =>
      [customer.name, customer.phone, customer.email || ""].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [customers, search]);

  const totalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const totalOrders = customers.reduce((sum, customer) => sum + customer.totalOrders, 0);
  const bestCustomer = customers.reduce<Customer | null>((best, customer) => {
    if (!best || customer.totalSpent > best.totalSpent) return customer;
    return best;
  }, null);

  const exportCSV = () => {
    const rows = filteredCustomers.map((customer) => [
      customer.name,
      customer.phone,
      customer.email || "",
      customer.totalOrders,
      customer.totalSpent,
    ]);
    const csv = [["Name", "Phone", "Email", "Orders", "Total Spent"], ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Understand buyers, repeat orders, and lifetime value.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <Download size={16} />
            Export
          </button>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] text-sm font-medium"
          >
            <UserPlus size={16} />
            Create Order
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Metric label="Customers" value={customers.length.toString()} icon={Users} tone="blue" />
        <Metric label="Total Orders" value={totalOrders.toString()} icon={ShoppingBag} tone="green" />
        <Metric label="Lifetime Revenue" value={`৳${totalSpent.toLocaleString()}`} icon={ShoppingBag} tone="purple" />
        <Metric label="Top Customer" value={bestCustomer?.name || "None yet"} icon={UserPlus} tone="orange" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by customer name, phone, or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900">No customers found</h2>
            <p className="text-gray-500 mt-2">Customers are created from order shipping details.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total Spent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{customer.name || "Unnamed Customer"}</p>
                      <p className="text-xs text-gray-400 font-mono">{customer.id.slice(0, 16)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2"><Phone size={14} /> {customer.phone || "No phone"}</p>
                        <p className="flex items-center gap-2"><Mail size={14} /> {customer.email || "No email"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{customer.totalOrders}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">৳{customer.totalSpent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString("en-BD")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  tone: "blue" | "green" | "purple" | "orange";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
