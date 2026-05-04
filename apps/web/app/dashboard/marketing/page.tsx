"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Megaphone, Mail, Share2, Tag, BarChart3, Globe, TrendingUp,
  ArrowRight, Plus, Search, Eye, MoreHorizontal, Users, MousePointerClick,
  Star, Calendar, Check, Sparkles,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useDashboard } from "../DashboardContext";

const marketingFeatures = [
  {
    title: "SEO Optimization",
    description: "Improve your search rankings",
    metrics: "SEO score: 78/100",
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
    href: "/dashboard/marketing/seo",
  },
  {
    title: "Email Campaigns",
    description: "Engage customers via email",
    metrics: "0 active campaigns",
    icon: Mail,
    color: "from-emerald-500 to-teal-500",
    href: "/dashboard/marketing/campaigns",
  },
  {
    title: "Social Media",
    description: "Auto-post to social platforms",
    metrics: "Facebook, Instagram ready",
    icon: Share2,
    color: "from-purple-500 to-pink-500",
    href: "/dashboard/marketing/social",
  },
  {
    title: "Discounts & Coupons",
    description: "Create promotions & deals",
    metrics: "0 active coupons",
    icon: Tag,
    color: "from-amber-500 to-orange-500",
    href: "/dashboard/marketing/discounts",
  },
  {
    title: "Analytics",
    description: "Track store performance",
    metrics: "Real-time data",
    icon: BarChart3,
    color: "from-rose-500 to-red-500",
    href: "/dashboard/analytics",
  },
  {
    title: "Customer Leads",
    description: "Capture & manage leads",
    metrics: "0 leads captured",
    icon: Users,
    color: "from-indigo-500 to-violet-500",
    href: "/dashboard/marketing/leads",
  },
];

export default function MarketingOverviewPage() {
  const { activeStore } = useDashboard();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Megaphone size={24} className="text-[#008060]" />
          Marketing
        </h1>
        <p className="text-slate-500 mt-1">
          Grow your store with built-in marketing tools designed for Bangladesh
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#008060] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {marketingFeatures.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-lg hover:border-[#008060]/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon size={22} className="text-white" />
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-[#008060] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.description}</p>
                <p className="text-xs text-slate-400 mt-2">{feature.metrics}</p>
              </Link>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#008060]/5 to-teal-50 rounded-2xl p-6 border border-[#008060]/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#008060] flex items-center justify-center shrink-0">
                <Star size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  AI-Powered Marketing Tips
                </h3>
                <p className="text-sm text-slate-600">
                  Our AI analyzes your store and gives personalized recommendations to grow sales in Bangladesh.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button className="bg-[#008060] hover:bg-[#006A4E] text-white text-sm">
                    <Sparkles size={14} className="mr-1.5" />
                    Get AI Tips
                  </Button>
                  <Link href="/dashboard/analytics">
                    <Button variant="outline" className="text-sm text-slate-700 border-slate-200">
                      View Analytics <ArrowRight size={14} className="ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
