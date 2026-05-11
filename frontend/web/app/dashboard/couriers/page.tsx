"use client";

import { useState, useEffect } from "react";
import {
  Truck, Plus, Loader2, Check, X, RefreshCw, Eye, Edit2,
  Trash2, Power, PowerOff, Key, AlertTriangle, Send
} from "lucide-react";

interface CourierAccount {
  id: string;
  provider: string;
  apiKey?: string;
  apiSecret?: string;
  storeId_: string;
  merchantName?: string;
  isDefault: boolean;
  active: boolean;
}

const COURIER_INFO: Record<string, { name: string; description: string; docsUrl: string; keyLabel: string }> = {
  pathao: {
    name: "Pathao",
    description: "Bangladesh's leading delivery service with extensive coverage and COD support",
    docsUrl: "https://dev.pathao.com",
    keyLabel: "API Access Token",
  },
  redx: {
    name: "RedX",
    description: "Fast and reliable courier service with real-time tracking",
    docsUrl: "https://openapi.redx.com.bd",
    keyLabel: "API Key",
  },
  steadfast: {
    name: "SteadFast",
    description: "Cost-effective courier with wide coverage across Bangladesh",
    docsUrl: "https://steadfastcourier.com",
    keyLabel: "API Key",
  },
  paperfly: {
    name: "Paperfly",
    description: "Express delivery service specializing in e-commerce parcels",
    docsUrl: "https://paperflybd.com",
    keyLabel: "API Token",
  },
};

const COURIER_PROVIDERS = ["pathao", "redx", "steadfast", "paperfly"] as const;

export default function CouriersPage() {
  const [accounts, setAccounts] = useState<CourierAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const storeId = typeof window !== "undefined" ? localStorage.getItem("storeId") : null;

  const [form, setForm] = useState({
    provider: "pathao" as string,
    apiKey: "",
    apiSecret: "",
    storeId_: "",
    merchantName: "",
    isDefault: false,
  });

  const fetchAccounts = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/courier-accounts`);
      const data = await res.json();
      if (data.success) setAccounts(data.accounts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [storeId]);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/courier-accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setAccounts([...accounts, data.account]);
        setShowAddForm(false);
        setForm({ provider: "pathao", apiKey: "", apiSecret: "", storeId_: "", merchantName: "", isDefault: false });
      } else {
        alert(data.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (accountId: string, active: boolean) => {
    await fetch(`/api/stores/${storeId}/courier-accounts`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, active }),
    });
    fetchAccounts();
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm("Delete this courier account?")) return;
    await fetch(`/api/stores/${storeId}/courier-accounts?accountId=${accountId}`, { method: "DELETE" });
    fetchAccounts();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courier Integration</h1>
          <p className="text-gray-500 mt-1">
            Connect your courier accounts for automated delivery booking
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2.5 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors font-medium"
        >
          <Plus size={18} /> Add Courier Account
        </button>
      </div>

      {/* Provider Info */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {COURIER_PROVIDERS.map((provider) => {
          const info = COURIER_INFO[provider];
          const existing = accounts.find((a) => a.provider === provider && a.active);
          return (
            <div key={provider} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">{info.name}</h3>
                {existing ? (
                  <span className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
                ) : (
                  <span className="w-2 h-2 bg-gray-300 rounded-full" title="Not connected" />
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">{info.description}</p>
              <a
                href={info.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#1d4ed8] hover:underline"
              >
                API Documentation &rarr;
              </a>
            </div>
          );
        })}
      </div>

      {/* Accounts List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
        </div>
      ) : accounts.length === 0 && !showAddForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courier accounts</h3>
          <p className="text-gray-500 mb-6">
            Add your courier API credentials to enable automated booking
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors font-medium"
          >
            <Plus size={18} /> Add Your First Courier
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => {
            const info = COURIER_INFO[account.provider];
            return (
              <div key={account.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1d4ed8]/10 rounded-xl flex items-center justify-center">
                      <Truck size={24} className="text-[#1d4ed8]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 capitalize">{info?.name || account.provider}</h3>
                      <p className="text-sm text-gray-500">
                        {account.apiKey
                          ? `${account.provider.toUpperCase()} - ${account.merchantName || account.storeId_ || "Configured"}`
                          : "Not configured"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {account.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                        Default
                      </span>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      account.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {account.active ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => handleToggleActive(account.id, !account.active)}
                      className={`p-2 rounded-lg transition-colors ${
                        account.active ? "text-gray-400 hover:text-red-600 hover:bg-red-50" : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                      }`}
                      title={account.active ? "Deactivate" : "Activate"}
                    >
                      {account.active ? <PowerOff size={16} /> : <Power size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Add Courier Account</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Courier Provider</label>
                <select
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                >
                  {COURIER_PROVIDERS.map((p) => (
                    <option key={p} value={p}>{COURIER_INFO[p]?.name || p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {COURIER_INFO[form.provider]?.keyLabel || "API Key"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  required
                  placeholder="Enter your API key"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>

              {(form.provider === "pathao" || form.provider === "redx") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {form.provider === "pathao" ? "Store ID (Merchant)" : "Merchant ID"}
                  </label>
                  <input
                    type="text"
                    value={form.storeId_}
                    onChange={(e) => setForm({ ...form, storeId_: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Merchant/Shop Name</label>
                <input
                  type="text"
                  value={form.merchantName}
                  onChange={(e) => setForm({ ...form, merchantName: e.target.value })}
                  placeholder="My Shop Name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default courier</label>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  <strong>Note:</strong> Your API keys are stored securely and only used for courier booking operations.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.apiKey}
                  className="flex-1 px-4 py-2.5 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] disabled:opacity-50 font-medium"
                >
                  {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Save Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}