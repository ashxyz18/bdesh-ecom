"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus, X, Upload, Image, Loader2 } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("");
  const [status, setStatus] = useState<"active" | "draft" | "archived">("draft");
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState("");
  const [attributes, setAttributes] = useState<Record<string, any>>({});

  const [manifest, setManifest] = useState<any>(null);

  useEffect(() => {
    if (!productId) return;
    const storedStoreId = localStorage.getItem("storeId");
    if (!storedStoreId) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        // Fetch store & template manifest
        const storeRes = await fetch(`/api/stores/${storedStoreId}`);
        const storeData = await storeRes.json();
        const templateId = storeData.store?.templateId;
        if (templateId) {
          const manifestRes = await fetch(`/api/templates/${templateId}`);
          const manifestData = await manifestRes.json();
          if (manifestData.success && manifestData.template?.manifest) {
            setManifest(manifestData.template.manifest);
          } else {
            try {
              const directRes = await fetch(`/templates/${templateId}/manifest.json`);
              if (directRes.ok) {
                const directManifest = await directRes.json();
                setManifest(directManifest);
              }
            } catch {}
          }
        }

        // Fetch product data
        const prodRes = await fetch(`/api/products/${productId}`);
        const prodData = await prodRes.json();
        if (prodData.product) {
          setName(prodData.product.name || "");
          setDescription(prodData.product.description || "");
          setPrice(prodData.product.price?.toString() || "");
          setComparePrice(prodData.product.comparePrice?.toString() || "");
          setStock(prodData.product.stock?.toString() || "0");
          setCategory(prodData.product.category || "");
          setColors(prodData.product.colors || []);
          setStatus(prodData.product.status || "draft");
          setImages(prodData.product.images || []);
          setAttributes(prodData.product.metadata || {});
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId, router]);

  const handleAddImage = () => {
    if (newImage && !images.includes(newImage)) {
      setImages([...images, newImage]);
      setNewImage("");
    }
  };

  const handleRemoveImage = (url: string) => {
    setImages(images.filter((img) => img !== url));
  };

  const handleAttributeChange = (key: string, value: any) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setSaving(true);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
          stock: parseInt(stock) || 0,
          category,
          colors: colors.length > 0 ? colors : undefined,
          status,
          images,
          attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/products");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
      </div>
    );
  }

  const catalog = manifest?.dashboard?.catalog;
  const hasCollections = catalog?.collections && catalog.collections.length > 0;
  const hasFilters = catalog?.filters && catalog.filters.length > 0;
  const hasCustomFields = catalog?.productFields && catalog.productFields.length > 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/products"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500 mt-1">Update product information</p>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
        >
          <Trash2 size={18} />
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                placeholder="e.g., Navy Blue Zariwork Silk Saree"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (৳) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare at Price (৳)
                </label>
                <input
                  type="number"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category {hasCollections && '*'}</label>
                {hasCollections ? (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  >
                    <option value="">Select a category</option>
                    {catalog.collections.map((col: any) => (
                      <option key={col.id} value={col.id}>{col.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Men's Shoes"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colors</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColor || "#000000"}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newColor && !colors.includes(newColor)) {
                        setColors([...colors, newColor]);
                        setNewColor("");
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Add
                  </button>
                </div>
                {colors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colors.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: c }} />
                        <button type="button" onClick={() => setColors(colors.filter((x) => x !== c))} className="text-gray-400 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {hasFilters && (
              <div className="pt-4 border-t border-gray-100 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Template Filters</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {catalog.filters.map((filter: any) => (
                    <div key={filter.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {filter.label} {filter.required && '*'}
                      </label>
                      <select
                        value={attributes[filter.id] || ""}
                        onChange={(e) => handleAttributeChange(filter.id, e.target.value)}
                        required={filter.required}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                      >
                        <option value="">Select {filter.label}</option>
                        {(filter.options || []).map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasCustomFields && (
              <div className="pt-4 border-t border-gray-100 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Template Specific Fields</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {catalog.productFields.map((field: any) => (
                    <div key={field.key}>
                      {field.type === 'boolean' ? (
                        <label className="flex items-center gap-2 mt-6 text-sm font-medium text-gray-700 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={!!attributes[field.key]} 
                            onChange={(e) => handleAttributeChange(field.key, e.target.checked)} 
                            className="w-4 h-4 rounded border-gray-300 text-[#1d4ed8] focus:ring-[#1d4ed8]" 
                          />
                          {field.label} {field.required && '*'}
                        </label>
                      ) : (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label} {field.required && '*'}
                          </label>
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={attributes[field.key] || ""}
                            onChange={(e) => handleAttributeChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                            required={field.required}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                placeholder="Describe your product..."
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Images</h2>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            <input
              type="url"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              placeholder="Enter image URL"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Image
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="text-green-600 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}