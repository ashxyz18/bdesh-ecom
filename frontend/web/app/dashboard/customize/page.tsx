"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Loader2, Palette, AlertCircle,
  CheckCircle, X, Upload
} from "lucide-react";

interface ConfigField {
  type: "text" | "textarea" | "image" | "color" | "number" | "boolean" | "select";
  label: string;
  default?: string | number | boolean;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  description?: string;
}

interface ConfigSection {
  label: string;
  description?: string;
  fields: Record<string, ConfigField>;
}

interface TemplateManifest {
  id: string;
  name: string;
  configSchema?: Record<string, ConfigSection>;
}

interface StoreData {
  id: string;
  name: string;
  templateId?: string;
  settings?: Record<string, any>;
}

const PLATFORM_CUSTOMIZATION_SCHEMA: Record<string, ConfigSection> = {
  brand: {
    label: "Brand Identity",
    description: "Control the store name, logo, tagline, and brand voice used by compatible templates.",
    fields: {
      storeName: { type: "text", label: "Store display name", placeholder: "BixelBD Fashion" },
      tagline: { type: "text", label: "Tagline", placeholder: "Premium products, delivered fast" },
      logo: { type: "image", label: "Logo" },
      favicon: { type: "image", label: "Favicon" },
      brandTone: {
        type: "select",
        label: "Brand tone",
        default: "friendly",
        options: [
          { label: "Friendly", value: "friendly" },
          { label: "Premium", value: "premium" },
          { label: "Minimal", value: "minimal" },
          { label: "Bold", value: "bold" },
        ],
      },
    },
  },
  announcement: {
    label: "Announcement Bar",
    description: "Show delivery, sale, or campaign messaging above the storefront.",
    fields: {
      enabled: { type: "boolean", label: "Show announcement", default: true },
      message: { type: "text", label: "Message", default: "Free delivery on orders over ৳1500" },
      linkText: { type: "text", label: "Link text", placeholder: "Shop now" },
      linkUrl: { type: "text", label: "Link URL", placeholder: "/collections/sale" },
      backgroundColor: { type: "color", label: "Background color", default: "#111827" },
      textColor: { type: "color", label: "Text color", default: "#ffffff" },
    },
  },
  hero: {
    label: "Homepage Hero",
    description: "Edit the first major storefront section.",
    fields: {
      headline: { type: "text", label: "Headline", default: "Welcome to our store" },
      subtext: { type: "textarea", label: "Subtext", default: "Discover products selected for your customers." },
      image: { type: "image", label: "Hero image" },
      mobileImage: { type: "image", label: "Mobile hero image" },
      buttonText: { type: "text", label: "Button text", default: "Shop Now" },
      buttonUrl: { type: "text", label: "Button URL", default: "/store" },
      overlayOpacity: { type: "number", label: "Image overlay opacity", default: 20, description: "Use 0 to 80 for most templates." },
    },
  },
  theme: {
    label: "Theme & Layout",
    description: "Set colors, typography, spacing, and corner styles.",
    fields: {
      primaryColor: { type: "color", label: "Primary color", default: "#1d4ed8" },
      accentColor: { type: "color", label: "Accent color", default: "#16a34a" },
      backgroundColor: { type: "color", label: "Background color", default: "#ffffff" },
      textColor: { type: "color", label: "Text color", default: "#111827" },
      fontFamily: {
        type: "select",
        label: "Font family",
        default: "Inter",
        options: [
          { label: "Inter", value: "Inter" },
          { label: "Poppins", value: "Poppins" },
          { label: "Playfair Display", value: "Playfair Display" },
          { label: "Noto Sans Bengali", value: "Noto Sans Bengali" },
          { label: "Hind Siliguri", value: "Hind Siliguri" },
        ],
      },
      cornerRadius: {
        type: "select",
        label: "Corner style",
        default: "medium",
        options: [
          { label: "Sharp", value: "none" },
          { label: "Small", value: "small" },
          { label: "Medium", value: "medium" },
          { label: "Soft", value: "large" },
        ],
      },
    },
  },
  navigation: {
    label: "Navigation",
    description: "Configure menus and header behavior.",
    fields: {
      menuItems: { type: "textarea", label: "Menu items", placeholder: "Home=/\nSale=/sale\nContact=/contact" },
      stickyHeader: { type: "boolean", label: "Sticky header", default: true },
      showSearch: { type: "boolean", label: "Show search", default: true },
      showWishlist: { type: "boolean", label: "Show wishlist", default: true },
      showAccount: { type: "boolean", label: "Show account icon", default: true },
    },
  },
  productCards: {
    label: "Product Cards",
    description: "Control product listing visuals and purchase actions.",
    fields: {
      showBadges: { type: "boolean", label: "Show badges", default: true },
      showComparePrice: { type: "boolean", label: "Show compare price", default: true },
      showQuickAdd: { type: "boolean", label: "Show quick add", default: true },
      imageRatio: {
        type: "select",
        label: "Image ratio",
        default: "square",
        options: [
          { label: "Square", value: "square" },
          { label: "Portrait", value: "portrait" },
          { label: "Landscape", value: "landscape" },
        ],
      },
      productsPerRow: { type: "number", label: "Products per row", default: 4 },
    },
  },
  checkout: {
    label: "Checkout",
    description: "Set checkout defaults and payment method visibility.",
    fields: {
      enableCOD: { type: "boolean", label: "Cash on delivery", default: true },
      enableBkash: { type: "boolean", label: "bKash", default: true },
      enableNagad: { type: "boolean", label: "Nagad", default: true },
      enableRocket: { type: "boolean", label: "Rocket", default: false },
      requireEmail: { type: "boolean", label: "Require customer email", default: false },
      orderNotes: { type: "boolean", label: "Allow order notes", default: true },
    },
  },
  delivery: {
    label: "Delivery",
    description: "Control delivery messaging and fee rules used by compatible templates.",
    fields: {
      freeDeliveryThreshold: { type: "number", label: "Free delivery threshold", default: 1500 },
      defaultDeliveryCharge: { type: "number", label: "Default delivery charge", default: 120 },
      deliveryPromise: { type: "text", label: "Delivery promise", default: "Inside Dhaka 1-2 days, outside Dhaka 3-5 days" },
      pickupEnabled: { type: "boolean", label: "Allow pickup", default: false },
    },
  },
  seo: {
    label: "SEO & Sharing",
    description: "Improve how your store appears in search and social previews.",
    fields: {
      metaTitle: { type: "text", label: "Meta title" },
      metaDescription: { type: "textarea", label: "Meta description" },
      socialImage: { type: "image", label: "Social share image" },
      keywords: { type: "textarea", label: "Keywords", placeholder: "fashion, saree, dhaka" },
    },
  },
  social: {
    label: "Social Links",
    description: "Add public links shown in the storefront footer or contact areas.",
    fields: {
      facebook: { type: "text", label: "Facebook URL" },
      instagram: { type: "text", label: "Instagram URL" },
      tiktok: { type: "text", label: "TikTok URL" },
      youtube: { type: "text", label: "YouTube URL" },
      whatsapp: { type: "text", label: "WhatsApp number" },
    },
  },
  policies: {
    label: "Policies",
    description: "Add reusable policy copy for footer pages and checkout confidence blocks.",
    fields: {
      returnPolicy: { type: "textarea", label: "Return policy" },
      shippingPolicy: { type: "textarea", label: "Shipping policy" },
      privacyPolicy: { type: "textarea", label: "Privacy policy" },
      terms: { type: "textarea", label: "Terms and conditions" },
    },
  },
  advanced: {
    label: "Advanced",
    description: "Optional scripts and custom CSS for advanced templates.",
    fields: {
      customCss: { type: "textarea", label: "Custom CSS" },
      headerScripts: { type: "textarea", label: "Header scripts" },
      bodyScripts: { type: "textarea", label: "Body scripts" },
      maintenanceMode: { type: "boolean", label: "Maintenance mode", default: false },
    },
  },
};

export default function CustomizePage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [store, setStore] = useState<StoreData | null>(null);
  const [manifest, setManifest] = useState<TemplateManifest | null>(null);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    const storedStoreId = localStorage.getItem("storeId");
    if (!storedStoreId) {
      router.push("/login");
      return;
    }
    setStoreId(storedStoreId);
    loadData(storedStoreId);
  }, [router]);

  const loadData = async (sid: string) => {
    try {
      setLoading(true);
      // Fetch store
      const storeRes = await fetch(`/api/stores/${sid}`);
      const storeData = await storeRes.json();
      if (!storeData.store) {
        setError("Store not found");
        setLoading(false);
        return;
      }
      setStore(storeData.store);

      // Parse current settings
      const currentSettings =
        storeData.store.settings && typeof storeData.store.settings === "object"
          ? storeData.store.settings
          : {};
      setSettings(currentSettings);

      // Fetch template manifest
      const templateId = storeData.store.templateId;
      if (templateId) {
        const manifestRes = await fetch(`/api/templates/${templateId}`);
        const manifestData = await manifestRes.json();
        if (manifestData.success && manifestData.template?.manifest) {
          setManifest(manifestData.template.manifest);
        } else {
          // Fallback: try reading manifest directly
          try {
            const directRes = await fetch(`/templates/${templateId}/manifest.json`);
            if (directRes.ok) {
              const directManifest = await directRes.json();
              setManifest(directManifest);
            }
          } catch {
            console.log("No manifest found for template:", templateId);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load customization data");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (section: string, field: string, value: string | number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!storeId) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: any = { settings };
      
      // If the brand name or logo were changed in the customization UI, sync them to the root store fields
      if (settings.brand?.storeName) {
        payload.name = settings.brand.storeName;
      }
      if (settings.brand?.logo) {
        payload.logo = settings.brand.logo;
      }

      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setPreviewKey((k) => k + 1); // Refresh the preview iframe
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save settings");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (section: string, field: string, file: File) => {
    if (!storeId) return;
    const fieldKey = `${section}.${field}`;
    setUploadingField(fieldKey);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/stores/${storeId}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        handleFieldChange(section, field, data.url);
      } else {
        setError(data.error || "Failed to upload image");
      }
    } catch (err) {
      setError("Network error during upload");
    } finally {
      setUploadingField(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
      </div>
    );
  }

  if (error && !manifest?.configSchema) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      </div>
    );
  }

  const effectiveConfigSchema = mergeConfigSchemas(
    PLATFORM_CUSTOMIZATION_SCHEMA,
    manifest?.configSchema || {}
  );
  const hasConfig = Object.keys(effectiveConfigSchema).length > 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Panel: Form */}
        <div className={`${showPreview ? 'lg:w-1/2' : 'max-w-4xl w-full'}`}>
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Customize Your Store</h1>
        <p className="text-gray-500 mt-1">
          {manifest?.name
            ? `Personalize your ${manifest.name} template`
            : "Personalize your store appearance"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} />
          Settings saved successfully!
        </div>
      )}

      {!hasConfig ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Customization Options</h3>
          <p className="text-gray-500 mb-4">
            This template does not expose customization options yet.
          </p>
          <p className="text-sm text-gray-400">
            Template manifests can declare a <code className="bg-gray-100 px-1 rounded">configSchema</code> section
            to enable dynamic configuration.
          </p>
        </div>
      ) : (
        <>
          {Object.entries(effectiveConfigSchema).map(([sectionKey, section]) => (
            <div key={sectionKey} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900">{section.label}</h2>
              {section.description && (
                <p className="text-sm text-gray-500 mt-1 mb-4">{section.description}</p>
              )}
              {!section.description && <div className="mb-4" />}
              <div className="space-y-4">
                {Object.entries(section.fields).map(([fieldKey, field]) => {
                  const currentValue = settings[sectionKey]?.[fieldKey] ?? field.default ?? "";
                  return (
                    <div key={fieldKey}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      {field.type === "text" && (
                        <input
                          type="text"
                          value={String(currentValue)}
                          onChange={(e) => handleFieldChange(sectionKey, fieldKey, e.target.value)}
                          placeholder={String(field.placeholder || field.default || "")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                        />
                      )}
                      {field.type === "textarea" && (
                        <textarea
                          value={String(currentValue)}
                          onChange={(e) => handleFieldChange(sectionKey, fieldKey, e.target.value)}
                          placeholder={String(field.placeholder || field.default || "")}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                        />
                      )}
                      {field.type === "color" && (
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={String(currentValue || "#000000")}
                            onChange={(e) => handleFieldChange(sectionKey, fieldKey, e.target.value)}
                            className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={String(currentValue)}
                            onChange={(e) => handleFieldChange(sectionKey, fieldKey, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                          />
                        </div>
                      )}
                      {field.type === "number" && (
                        <input
                          type="number"
                          value={String(currentValue)}
                          onChange={(e) => handleFieldChange(sectionKey, fieldKey, Number(e.target.value))}
                          placeholder={String(field.placeholder || field.default || "")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                        />
                      )}
                      {field.type === "boolean" && (
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={Boolean(currentValue)}
                            onChange={(e) => handleFieldChange(sectionKey, fieldKey, e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-[#1d4ed8] focus:ring-[#1d4ed8]"
                          />
                          Enabled
                        </label>
                      )}
                      {field.type === "select" && (
                        <select
                          value={String(currentValue)}
                          onChange={(e) => handleFieldChange(sectionKey, fieldKey, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                        >
                          {(field.options || []).map((option: any, idx: number) => {
                            const val = typeof option === "string" ? option : option.value;
                            const lbl = typeof option === "string" ? option : option.label;
                            return (
                              <option key={val || idx} value={val}>
                                {lbl}
                              </option>
                            );
                          })}
                        </select>
                      )}
                      {field.type === "image" && (
                        <div className="space-y-2">
                          {currentValue && (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                              <img src={currentValue} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => handleFieldChange(sectionKey, fieldKey, "")}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          )}
                          <label className={`flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer text-sm text-gray-600 ${uploadingField === `${sectionKey}.${fieldKey}` ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}>
                            {uploadingField === `${sectionKey}.${fieldKey}` ? (
                              <Loader2 size={16} className="animate-spin text-blue-600" />
                            ) : (
                              <Upload size={16} />
                            )}
                            {uploadingField === `${sectionKey}.${fieldKey}`
                              ? "Uploading..."
                              : currentValue
                              ? "Change Image"
                              : "Upload Image"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingField === `${sectionKey}.${fieldKey}`}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(sectionKey, fieldKey, file);
                              }}
                            />
                          </label>
                        </div>
                      )}
                      {field.description && (
                        <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/dashboard"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </button>
          </div>
        </>
      )}
      </div>

      {/* Right Panel: Live Preview */}
      {showPreview && store && (
        <div className="hidden lg:block lg:w-1/2">
          <div className="sticky top-20">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-400 ml-2 font-mono">
                    {store.name?.toLowerCase().replace(/\s/g, '-')}.bdesh.com
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewKey((k) => k + 1)}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                    title="Refresh preview"
                  >
                    ↻ Refresh
                  </button>
                  <a
                    href={`/store/${storeId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#1d4ed8] hover:underline"
                  >
                    Open ↗
                  </a>
                </div>
              </div>
              <div className="aspect-[9/14] bg-gray-50 relative overflow-hidden">
                <iframe
                  key={previewKey}
                  src={`/store/${storeId}`}
                  className="absolute inset-0 w-full h-full border-0"
                  title="Live store preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function mergeConfigSchemas(
  base: Record<string, ConfigSection>,
  override: Record<string, any>
) {
  const merged: Record<string, ConfigSection> = { ...base };

  for (const [sectionKey, section] of Object.entries(override)) {
    // Normalize section title to label
    const normalizedSection = {
      ...section,
      label: section.label || section.title || sectionKey,
    };

    // Normalize fields array to object
    let normalizedFields: Record<string, any> = {};
    if (Array.isArray(section.fields)) {
      section.fields.forEach((field: any) => {
        if (field.id) {
          normalizedFields[field.id] = {
            ...field,
            label: field.label || field.name || field.id,
          };
        }
      });
    } else {
      normalizedFields = section.fields || {};
    }

    const existing = merged[sectionKey];
    merged[sectionKey] = existing
      ? {
          ...existing,
          ...normalizedSection,
          fields: {
            ...existing.fields,
            ...normalizedFields,
          },
        }
      : {
          ...normalizedSection,
          fields: normalizedFields,
        };
  }

  return merged;
}
