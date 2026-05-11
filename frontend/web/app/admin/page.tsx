"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  ShoppingBag,
  Package,
  DollarSign,
  ArrowRight,
  Upload,
  Palette,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Stats {
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: string;
  totalUsers: number;
  activeTemplates: number;
  pendingApprovals: number;
}

interface RecentActivity {
  id: string;
  type: "store" | "order" | "user" | "template";
  message: string;
  timestamp: string;
  status: "success" | "pending" | "warning";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStores: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: "৳0",
    totalUsers: 0,
    activeTemplates: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    // Simulate fetching stats
    setTimeout(() => {
      setStats({
        totalStores: 12,
        totalProducts: 156,
        totalOrders: 89,
        totalRevenue: "৳45,230",
        totalUsers: 248,
        activeTemplates: 5,
        pendingApprovals: 3,
      });

      setRecentActivity([
        {
          id: "1",
          type: "store",
          message: "New store 'Fashion Hub' registered",
          timestamp: "2 min ago",
          status: "success",
        },
        {
          id: "2",
          type: "order",
          message: "Order #ORD-7823 placed for ৳3,450",
          timestamp: "15 min ago",
          status: "success",
        },
        {
          id: "3",
          type: "template",
          message: "Template 'Modern E-Commerce' uploaded",
          timestamp: "1 hour ago",
          status: "success",
        },
        {
          id: "4",
          type: "store",
          message: "Store 'TechMart' awaiting approval",
          timestamp: "2 hours ago",
          status: "pending",
        },
        {
          id: "5",
          type: "user",
          message: "User 'john@example.com' reported an issue",
          timestamp: "3 hours ago",
          status: "warning",
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: "Total Stores",
      value: stats.totalStores.toString(),
      icon: Store,
      color: "bg-blue-100 text-blue-600",
      href: "/admin/stores",
      trend: "+3 this week",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      icon: ShoppingBag,
      color: "bg-green-100 text-green-600",
      href: "/admin/products",
      trend: "+12 this week",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: Package,
      color: "bg-purple-100 text-purple-600",
      href: "/admin/orders",
      trend: "+8 this week",
    },
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      icon: DollarSign,
      color: "bg-orange-100 text-orange-600",
      href: "/admin/orders",
      trend: "+15% this month",
    },
  ];

  const secondaryStats = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "bg-pink-100 text-pink-600",
    },
    {
      title: "Active Templates",
      value: stats.activeTemplates.toString(),
      icon: Palette,
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals.toString(),
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  const quickActions = [
    {
      title: "Upload Template",
      description: "Add a new template from ZIP",
      icon: Upload,
      href: "/admin/templates",
      color: "bg-[#1d4ed8]/10 text-[#1d4ed8]",
    },
    {
      title: "Browse Templates",
      description: "View all available templates",
      icon: Palette,
      href: "/templates",
      color: "bg-green-100 text-green-600",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#1d4ed8]/30 border-t-[#1d4ed8] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's what's happening on your platform.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-[#1d4ed8] transition-colors"
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}
            >
              <action.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
            <ArrowRight className="ml-auto text-gray-400" />
          </Link>
        ))}
      </div>

      {/* Primary Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}
              >
                <card.icon size={20} />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {card.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
            <p className="text-sm text-gray-500">{card.title}</p>
          </Link>
        ))}
      </div>

      {/* Secondary Stats & Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Secondary Stats */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h2>
          {secondaryStats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            </div>
          ))}

          {/* System Health */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle size={14} /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle size={14} /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage</span>
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle size={14} /> Healthy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.status === "success"
                        ? "bg-green-500"
                        : activity.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                  {activity.status === "warning" && (
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  )}
                  {activity.status === "success" && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  {activity.status === "pending" && (
                    <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {recentActivity.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
