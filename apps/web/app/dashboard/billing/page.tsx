"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard, Check, Loader2, Crown, Zap, Rocket, Star,
  ChevronDown, ChevronUp, Shield, Clock, Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "../DashboardContext";

interface Plan {
  id: string;
  name: string;
  label: string;
  price: number;
  yearlyPrice: number | null;
  features: string[];
  isPopular: boolean;
  sortOrder: number;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: string;
  paymentMethod: string | null;
  plan: { name: string; label: string; price: number };
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  FREE: <Star size={20} className="text-slate-500" />,
  STARTER: <Zap size={20} className="text-blue-500" />,
  PRO: <Crown size={20} className="text-amber-500" />,
  ENTERPRISE: <Rocket size={20} className="text-purple-500" />,
};

const PLAN_COLORS: Record<string, string> = {
  FREE: "from-slate-100 to-slate-50 border-slate-200",
  STARTER: "from-blue-50 to-indigo-50 border-blue-200",
  PRO: "from-amber-50 to-orange-50 border-amber-200",
  ENTERPRISE: "from-purple-50 to-pink-50 border-purple-200",
};

export default function BillingPage() {
  const { activeStore, user } = useDashboard();
  const storeId = activeStore?.id;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState("FREE");
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "rocket" | "card">("bkash");
  const [trxId, setTrxId] = useState("");

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch {}
  }, []);

  const fetchSubscription = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await fetch(`/api/subscriptions?storeId=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
        setCurrentPlan(data.plan?.name || "FREE");
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchPlans();
    fetchSubscription();
  }, [fetchPlans, fetchSubscription]);

  const handleSubscribe = async (planId: string) => {
    if (!storeId) return;
    const plan = plans.find(p => p.id === planId);
    if (!plan || plan.name === "FREE") return;

    setSubscribing(planId);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          planId,
          paymentMethod: paymentMethod.toUpperCase(),
          trxId: trxId || undefined,
          billingPeriod,
        }),
      });

      if (res.ok) {
        await fetchSubscription();
        setShowPaymentModal(null);
        setTrxId("");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to subscribe");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    if (!storeId || !confirm("Are you sure you want to cancel your subscription?")) return;
    try {
      const res = await fetch(`/api/subscriptions?storeId=${storeId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchSubscription();
      }
    } catch {}
  };

  if (!storeId) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="text-slate-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Store Selected</h2>
        <p className="text-slate-500">Select a store from the sidebar to manage billing.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentPlanData = plans.find(p => p.name === currentPlan);

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Plans</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your subscription and payment methods</p>
        </div>
        {subscription && currentPlan !== "FREE" && (
          <Button
            variant="outline"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleCancel}
          >
            Cancel Subscription
          </Button>
        )}
      </div>

      {/* Current Plan Card */}
      {subscription && currentPlan !== "FREE" && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Current Plan</p>
              <h2 className="text-2xl font-bold mt-1">{subscription.plan?.label || currentPlan}</h2>
              <p className="text-emerald-100 text-sm mt-1">
                {subscription.status === "ACTIVE" ? "Active" : subscription.status} · Renews{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-BD", {
                  year: "numeric", month: "long", day: "numeric"
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">৳{subscription.plan?.price || 0}</p>
              <p className="text-emerald-100 text-sm">/month</p>
            </div>
          </div>
        </div>
      )}

      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setBillingPeriod("monthly")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            billingPeriod === "monthly"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingPeriod("yearly")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            billingPeriod === "yearly"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Yearly
          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
            Save 17%
          </span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(plan => {
          const isCurrent = plan.name === currentPlan;
          const price = billingPeriod === "yearly" && plan.yearlyPrice
            ? Math.round(plan.yearlyPrice / 12)
            : plan.price;
          const isDowngrade = plans.findIndex(p => p.name === currentPlan) > plans.findIndex(p => p.name === plan.name);

          return (
            <div
              key={plan.id}
              className={`relative bg-gradient-to-br ${PLAN_COLORS[plan.name] || PLAN_COLORS.FREE} rounded-2xl border-2 p-5 transition-all ${
                isCurrent ? "ring-2 ring-emerald-500 shadow-lg" : "hover:shadow-md"
              } ${plan.isPopular ? "border-amber-400" : ""}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                {PLAN_ICONS[plan.name]}
                <h3 className="font-bold text-slate-900">{plan.label}</h3>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900">৳{price}</span>
                <span className="text-slate-500 text-sm">/mo</span>
                {billingPeriod === "yearly" && plan.yearlyPrice && (
                  <p className="text-xs text-slate-400 mt-0.5">৳{plan.yearlyPrice}/year billed annually</p>
                )}
              </div>

              <ul className="space-y-2 mb-5">
                {(typeof plan.features === "string" ? JSON.parse(plan.features) : plan.features || []).map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button disabled className="w-full bg-emerald-100 text-emerald-700 cursor-default">
                  Current Plan
                </Button>
              ) : plan.price === 0 ? (
                <Button variant="outline" className="w-full" disabled>
                  Free Forever
                </Button>
              ) : (
                <Button
                  onClick={() => setShowPaymentModal(plan.id)}
                  disabled={subscribing === plan.id}
                  className={`w-full ${
                    plan.isPopular
                      ? "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                      : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                  }`}
                >
                  {subscribing === plan.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : isDowngrade ? (
                    "Downgrade"
                  ) : (
                    "Upgrade"
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Complete Payment</h3>
            <p className="text-sm text-slate-500 mb-5">
              Pay via your preferred method and enter the transaction ID to activate your plan.
            </p>

            {/* Payment Method Selection */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { id: "bkash" as const, label: "bKash", color: "bg-pink-50 border-pink-200 text-pink-700" },
                { id: "nagad" as const, label: "Nagad", color: "bg-orange-50 border-orange-200 text-orange-700" },
                { id: "rocket" as const, label: "Rocket", color: "bg-purple-50 border-purple-200 text-purple-700" },
                { id: "card" as const, label: "Card", color: "bg-blue-50 border-blue-200 text-blue-700" },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    paymentMethod === m.id ? m.color + " ring-2 ring-offset-1" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Payment Instructions */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4 text-sm">
              <p className="font-medium text-slate-700 mb-1">Payment Instructions:</p>
              {paymentMethod === "bkash" && (
                <p className="text-slate-500">Send payment to <strong>017XXXXXXXX</strong> (bKash Merchant) and enter the TrxID below.</p>
              )}
              {paymentMethod === "nagad" && (
                <p className="text-slate-500">Send payment to <strong>018XXXXXXXX</strong> (Nagad Merchant) and enter the TrxID below.</p>
              )}
              {paymentMethod === "rocket" && (
                <p className="text-slate-500">Send payment to <strong>016XXXXXXXX</strong> (Rocket Merchant) and enter the TrxID below.</p>
              )}
              {paymentMethod === "card" && (
                <p className="text-slate-500">You will be redirected to Stripe to complete payment securely.</p>
              )}
            </div>

            {/* Transaction ID Input */}
            {paymentMethod !== "card" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Transaction ID</label>
                <input
                  type="text"
                  value={trxId}
                  onChange={e => setTrxId(e.target.value)}
                  placeholder="e.g., 8KXX29XX01"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowPaymentModal(null); setTrxId(""); }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={paymentMethod !== "card" && !trxId.trim()}
                onClick={() => handleSubscribe(showPaymentModal)}
              >
                {subscribing === showPaymentModal ? <Loader2 className="animate-spin" size={16} /> : "Activate Plan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Comparison */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Feature Comparison</h2>
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left p-4 font-medium text-slate-500">Feature</th>
                {plans.map(p => (
                  <th key={p.id} className="p-4 font-medium text-slate-900 text-center">{p.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Products", values: ["25", "100", "1,000", "Unlimited"] },
                { label: "Orders/month", values: ["100", "500", "5,000", "Unlimited"] },
                { label: "Storage", values: ["50 MB", "500 MB", "2 GB", "Unlimited"] },
                { label: "AI Credits", values: ["3", "20", "100", "Unlimited"] },
                { label: "Custom Domain", values: [false, false, true, true] },
                { label: "Premium Templates", values: [false, false, true, true] },
                { label: "Analytics", values: [false, true, true, true] },
                { label: "White-Label", values: [false, false, false, true] },
                { label: "Priority Support", values: [false, false, true, true] },
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="p-4 text-slate-700 font-medium">{row.label}</td>
                  {row.values.map((v, j) => (
                    <td key={j} className="p-4 text-center">
                      {typeof v === "boolean" ? (
                        v ? <Check size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300">—</span>
                      ) : (
                        <span className="text-slate-600">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-8 flex items-center justify-center gap-8 text-slate-400">
        <div className="flex items-center gap-2 text-sm">
          <Shield size={16} /> Secure Payments
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock size={16} /> Cancel Anytime
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Headphones size={16} /> Priority Support
        </div>
      </div>
    </div>
  );
}
