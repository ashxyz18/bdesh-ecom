import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Loader2, TrendingUp, Users, ShoppingCart, DollarSign, Eye, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AnalyticsDashboardPage({
  searchParams,
}: {
  searchParams: { storeId?: string; days?: string };
}) {
  const session = await getSession();
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MERCHANT")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You need merchant or admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const storeId = searchParams.storeId;
  const days = parseInt(searchParams.days || "30");
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Build where clause
  const where: any = {
    date: { gte: startDate },
  };
  
  if (session.user.role === "MERCHANT" && !storeId) {
    // Get first store owned by merchant
    const merchantStore = await prisma.store.findFirst({
      where: { ownerId: session.user.id, deletedAt: null },
    });
    if (merchantStore) where.storeId = merchantStore.id;
  } else if (storeId) {
    where.storeId = storeId;
  }

  // Get analytics data
  const [analytics, stores, totalVisitors, totalOrders, totalRevenue] = await Promise.all([
    prisma.analytics.findMany({
      where,
      orderBy: { date: "asc" },
    }),
    session.user.role === "ADMIN" 
      ? prisma.store.findMany({ where: { deletedAt: null }, select: { id: true, name: true } })
      : prisma.store.findMany({ where: { ownerId: session.user.id, deletedAt: null }, select: { id: true, name: true } }),
    prisma.analytics.groupBy({
      by: ["storeId"],
      where,
      _sum: { visitors: true },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: startDate },
        ...(where.storeId ? { storeId: where.storeId } : {}),
        paymentStatus: "PAID",
      },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate },
        ...(where.storeId ? { storeId: where.storeId } : {}),
        paymentStatus: "PAID",
      },
      _sum: { total: true },
    }),
  ]);

  // Calculate totals
  const totals = {
    visitors: analytics.reduce((sum, a) => sum + a.visitors, 0),
    pageviews: analytics.reduce((sum, a) => sum + a.pageviews, 0),
    orders: analytics.reduce((sum, a) => sum + a.orders, 0),
    revenue: analytics.reduce((sum, a) => sum + a.revenue, 0),
  };

  // Get top products
  const topProducts = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: {
        createdAt: { gte: startDate },
        ...(where.storeId ? { storeId: where.storeId } : {}),
        paymentStatus: "PAID",
      },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 10,
  });

  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });

  const topProductsWithNames = topProducts.map((p) => ({
    ...p,
    name: products.find((prod) => prod.id === p.productId)?.name || "Unknown",
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <div className="flex gap-2">
            <a href={`/dashboard/analytics?days=7`}>
              <Button variant={days === 7 ? "default" : "outline"} size="sm">7 Days</Button>
            </a>
            <a href={`/dashboard/analytics?days=30`}>
              <Button variant={days === 30 ? "default" : "outline"} size="sm">30 Days</Button>
            </a>
            <a href={`/dashboard/analytics?days=90`}>
              <Button variant={days === 90 ? "default" : "outline"} size="sm">90 Days</Button>
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Visitors</h3>
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{totals.visitors.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Pageviews</h3>
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold">{totals.pageviews.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Orders</h3>
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{totals.orders.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold">৳{totals.revenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Store Selector (Admin only) */}
        {session.user.role === "ADMIN" && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="font-semibold mb-4">Select Store</h3>
            <div className="flex gap-2 flex-wrap">
              {stores.map((store) => (
                <a key={store.id} href={`/dashboard/analytics?storeId=${store.id}&days=${days}`}>
                  <Button variant={storeId === store.id ? "default" : "outline"} size="sm">
                    {store.name}
                  </Button>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Top Products</h2>
          <div className="space-y-4">
            {topProductsWithNames.map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <p className="font-medium">{product.name}</p>
                </div>
                <p className="font-bold">{product._sum.quantity} sold</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Breakdown Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Daily Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-right py-2">Visitors</th>
                  <th className="text-right py-2">Pageviews</th>
                  <th className="text-right py-2">Orders</th>
                  <th className="text-right py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((day) => (
                  <tr key={day.date.toISOString()} className="border-b">
                    <td className="py-2">{day.date.toLocaleDateString()}</td>
                    <td className="text-right py-2">{day.visitors}</td>
                    <td className="text-right py-2">{day.pageviews}</td>
                    <td className="text-right py-2">{day.orders}</td>
                    <td className="text-right py-2">৳{day.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
