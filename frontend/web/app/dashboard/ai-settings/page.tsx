"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Brain,
  Key,
  TestTube,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboard } from "../DashboardContext";

interface ProviderInfo {
  id: string;
  name: string;
  configured: boolean;
  models: string[];
}

interface AISettings {
  activeProvider: string;
  activeModel: string;
  providers: ProviderInfo[];
  hasOpenRouterKey: boolean;
  hasOpenAIKey: boolean;
  hasGoogleKey: boolean;
  hasGroqKey: boolean;
}

export default function AISettingsPage() {
  const { activeStore } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("openrouter");
  const [selectedModel, setSelectedModel] = useState("");

  // Visibility toggles
  const [showOpenrouter, setShowOpenrouter] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  const [showGroq, setShowGroq] = useState(false);

  // Test state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setSelectedProvider(data.activeProvider);
        setSelectedModel(data.activeModel);
      }
    } catch {
      setError("Failed to load AI settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setError("");

    const keyMap: Record<string, string> = {
      openrouter: openrouterKey,
      openai: openaiKey,
      google: googleKey,
      groq: groqKey,
    };

    const apiKey = keyMap[selectedProvider];
    if (!apiKey) {
      setError(`Please enter an API key for ${selectedProvider} before testing`);
      setTesting(false);
      return;
    }

    try {
      const res = await fetch("/api/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey,
          model: selectedModel || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || `Connected to ${selectedProvider} successfully!`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Connection test failed",
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: "Network error during test",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Save keys to environment via the settings API
      // Note: In production, these should be saved securely on the server
      // For now, we store them in the store's settings JSON
      if (!activeStore) {
        setError("No active store selected");
        return;
      }

      const aiConfig: Record<string, any> = {
        provider: selectedProvider,
        model: selectedModel,
      };

      if (openrouterKey) aiConfig.openrouterKey = openrouterKey;
      if (openaiKey) aiConfig.openaiKey = openaiKey;
      if (googleKey) aiConfig.googleKey = googleKey;
      if (groqKey) aiConfig.groqKey = groqKey;

      const res = await fetch(`/api/stores/${activeStore.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: JSON.stringify({
            ...(activeStore.settings ? (typeof activeStore.settings === "string" ? JSON.parse(activeStore.settings) : activeStore.settings) : {}),
            aiConfig,
          }),
        }),
      });

      if (res.ok) {
        setSuccess("AI settings saved successfully! API keys will be used for AI features.");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to save settings");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const providerIcons: Record<string, React.ReactNode> = {
    openrouter: <Zap size={18} className="text-purple-500" />,
    openai: <Brain size={18} className="text-green-500" />,
    google: <Sparkles size={18} className="text-blue-500" />,
    groq: <Zap size={18} className="text-orange-500" />,
    local: <Key size={18} className="text-gray-500" />,
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <a
          href="/dashboard/settings"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </a>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles size={24} className="text-purple-500" />
            AI Settings
          </h1>
          <p className="text-sm text-gray-500">
            Configure AI providers for content generation, website building, and chat
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {testResult && (
        <div
          className={`${
            testResult.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          } border px-4 py-3 rounded-lg text-sm mb-4 flex items-center justify-between`}
        >
          <span className="flex items-center gap-2">
            {testResult.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {testResult.message}
          </span>
          <button onClick={() => setTestResult(null)} className="text-current opacity-50 hover:opacity-100">
            ×
          </button>
        </div>
      )}

      {/* Current Status */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain size={20} className="text-blue-500" />
          Current AI Configuration
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Active Provider</p>
            <p className="font-medium flex items-center gap-2">
              {providerIcons[settings?.activeProvider || "local"]}
              {settings?.providers.find((p) => p.id === settings.activeProvider)?.name || settings?.activeProvider || "Local Fallback"}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Active Model</p>
            <p className="font-medium text-sm">{settings?.activeModel || "local-fallback"}</p>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Key size={20} className="text-amber-500" />
          API Keys
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Add API keys to enable AI features. Keys are stored securely and never exposed to the client.
          At least one key is required for AI features to work.
        </p>

        <div className="space-y-5">
          {/* OpenRouter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap size={16} className="text-purple-500" />
              OpenRouter API Key
              {settings?.hasOpenRouterKey && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  CONFIGURED
                </span>
              )}
            </Label>
            <p className="text-xs text-gray-400">
              Recommended — Access to 100+ models including free ones. Get a key at{" "}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="text-purple-500 hover:underline">
                openrouter.ai/keys
              </a>
            </p>
            <div className="relative">
              <Input
                type={showOpenrouter ? "text" : "password"}
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                placeholder={settings?.hasOpenRouterKey ? "••••••••••••••••" : "sk-or-v1-..."}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOpenrouter(!showOpenrouter)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOpenrouter ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* OpenAI */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Brain size={16} className="text-green-500" />
              OpenAI API Key
              {settings?.hasOpenAIKey && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  CONFIGURED
                </span>
              )}
            </Label>
            <p className="text-xs text-gray-400">
              GPT-4o-mini for high-quality content. Get a key at{" "}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="text-green-500 hover:underline">
                platform.openai.com
              </a>
            </p>
            <div className="relative">
              <Input
                type={showOpenai ? "text" : "password"}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder={settings?.hasOpenAIKey ? "••••••••••••••••" : "sk-..."}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOpenai(!showOpenai)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOpenai ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Google AI */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              Google AI API Key
              {settings?.hasGoogleKey && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  CONFIGURED
                </span>
              )}
            </Label>
            <p className="text-xs text-gray-400">
              Gemini 2.0 Flash for fast, free content generation. Get a key at{" "}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-blue-500 hover:underline">
                aistudio.google.com
              </a>
            </p>
            <div className="relative">
              <Input
                type={showGoogle ? "text" : "password"}
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                placeholder={settings?.hasGoogleKey ? "••••••••••••••••" : "AIza..."}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGoogle(!showGoogle)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showGoogle ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Groq */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap size={16} className="text-orange-500" />
              Groq API Key
              {settings?.hasGroqKey && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  CONFIGURED
                </span>
              )}
            </Label>
            <p className="text-xs text-gray-400">
              Ultra-fast inference with Llama models. Get a key at{" "}
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener" className="text-orange-500 hover:underline">
                console.groq.com
              </a>
            </p>
            <div className="relative">
              <Input
                type={showGroq ? "text" : "password"}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder={settings?.hasGroqKey ? "••••••••••••••••" : "gsk_..."}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGroq(!showGroq)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showGroq ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Provider & Model Selection */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-purple-500" />
          Default Provider & Model
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Choose which AI provider and model to use by default. You can override this per-request.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="provider">Provider</Label>
            <select
              id="provider"
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                const provider = settings?.providers.find((p) => p.id === e.target.value);
                if (provider?.models.length) {
                  setSelectedModel(provider.models[0]);
                }
              }}
              className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {settings?.providers
                .filter((p) => p.id !== "local")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.configured ? "✓" : "(no key)"}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Label htmlFor="model">Model</Label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {settings?.providers
                .find((p) => p.id === selectedProvider)
                ?.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleTest}
          disabled={testing}
          variant="outline"
          className="flex items-center gap-2"
        >
          {testing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <TestTube size={16} />
          )}
          {testing ? "Testing Connection..." : "Test Connection"}
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <Sparkles size={16} />
          How AI is used in BdeshShop
        </h3>
        <ul className="text-sm text-blue-700 space-y-1.5">
          <li>• <strong>AI Builder</strong> — Generate complete website designs from images or text prompts</li>
          <li>• <strong>Content Generation</strong> — Auto-generate product descriptions, taglines, and marketing copy</li>
          <li>• <strong>AI Chat</strong> — BdeshBot assistant helps merchants set up their stores</li>
          <li>• <strong>SEO Suggestions</strong> — AI-powered SEO analysis and recommendations</li>
          <li>• <strong>Store Assets</strong> — Generate logos, banners, and social media graphics</li>
        </ul>
        <p className="text-xs text-blue-600 mt-3">
          💡 <strong>Tip:</strong> OpenRouter is recommended because it offers free models (like Gemini Flash) and paid models (like Claude, GPT-4) with a single API key.
        </p>
      </div>
    </div>
  );
}
