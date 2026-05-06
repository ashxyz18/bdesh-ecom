import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Loader2, Users, Store, ShoppingCart, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const session = await getSession();
  
  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  // Get statistics
  const [
    totalUsers,
    totalStores,
    totalOrders,
    totalRevenue,
    recentOrders,
    topStores,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.store.count({ where: { deletedAt: null } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID" },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        store: { select: { name: true } },
        customer: { select: { name: true, email: true } },
      },
    }),
    prisma.store.findMany({
      take: 5,
      orderBy: { orders: { _count: "desc" } },
      include: {
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Stores</h3>
              <Store className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{totalStores}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold">{totalOrders}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold">৳{totalRevenue._sum.total?.toFixed(2) || "0.00"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.store.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">৳{order.total}</p>
                    <p className="text-sm text-gray-600">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin/orders" className="block mt-4 text-center text-sm text-blue-600 hover:underline">
              View All Orders →
            </Link>
          </div>

          {/* Top Stores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Top Stores</h2>
            <div className="space-y-4">
              {topStores.map((store, index) => (
                <div key={store.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <p className="font-medium">{store.name}</p>
                  </div>
                  <p className="text-sm text-gray-600">{store._count.orders} orders</p>
                </div>
              ))}
            </div>
            <Link href="/admin/stores" className="block mt-4 text-center text-sm text-blue-600 hover:underline">
              View All Stores →
            </Link>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Recent Users</h2>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === "ADMIN" ? "bg-purple-100 text-purple-800" :
                    user.role === "MERCHANT" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/admin/users" className="block mt-4 text-center text-sm text-blue-600 hover:underline">
              View All Users →
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/admin/users" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <p className="font-medium">Manage Users</p>
                <p className="text-sm text-gray-600">View and manage all users</p>
              </Link>
              <Link href="/admin/stores" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <p className="font-medium">Manage Stores</p>
                <p className="text-sm text-gray-600">Approve, suspend, or delete stores</p>
              </Link>
              <Link href="/admin/orders" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <p className="font-medium">View Orders</p>
                <p className="text-sm text-gray-600">Track all orders across stores</p>
              </Link>
              <Link href="/dashboard/templates" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <p className="font-medium">Manage Templates</p>
                <p className="text-sm text-gray-600">Create and manage site templates</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
