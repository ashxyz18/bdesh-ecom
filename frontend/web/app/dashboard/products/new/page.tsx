"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Plus, GripVertical, Save, Loader2, Upload, ImagePlus } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";

export default function NewProductPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("");
  const [variants, setVariants] = useState([{ size: "", stock: "" }]);
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const storedStoreId = localStorage.getItem("storeId");
    if (!userData || !storedStoreId) {
      router.push("/login");
      return;
    }
    setStoreId(storedStoreId);

    const loadData = async () => {
      try {
        const storeRes = await fetch(`/api/stores/${storedStoreId}`);
        const storeData = await storeRes.json();
        const templateId = storeData.store?.templateId;
        if (templateId) {
          const manifestRes = await fetch(`/api/templates/${templateId}`);
          const manifestData = await manifestRes.json();
          if (manifestData.success && manifestData.template?.manifest) {
            setManifest(manifestData.template.manifest);
          } else {
            // Fallback
            try {
              const directRes = await fetch(`/templates/${templateId}/manifest.json`);
              if (directRes.ok) {
                const directManifest = await directRes.json();
                setManifest(directManifest);
              }
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !storeId) return;
    setUploadingImages(true);
    setError(null);
    
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`/api/stores/${storeId}/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          uploadedUrls.push(data.url);
        } else {
          setError(data.error || `Failed to upload ${file.name}`);
        }
      }
      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (err) {
      setError("Network error during image upload");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    setVariants([...variants, { size: "", stock: "" }]);
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (key: string, value: any) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;

    setSaving(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          storeId,
          name,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
          description,
          images,
          stock: parseInt(stock) || 0,
          category,
          colors: colors.length > 0 ? colors : undefined,
          variants: variants.filter((v) => v.size && v.stock),
          attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
        }),
      });

      if (res.ok) {
        router.push("/dashboard/products");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
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
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Navy Blue Silk Saree"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compare at Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                  <input
                    type="number"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    placeholder="Optional"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <label
              className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                uploadingImages
                  ? "border-blue-400 bg-blue-50 text-blue-500"
                  : "border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600"
              }`}
            >
              {uploadingImages ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-xs mt-1">Uploading...</span>
                </>
              ) : (
                <>
                  <ImagePlus size={20} />
                  <span className="text-xs mt-1">Upload</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploadingImages}
                onChange={(e) => handleImageUpload(e.target.files)}
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="text-sm text-[#1d4ed8] hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> Add Variant
            </button>
          </div>
          {variants.map((variant, index) => (
            <div key={index} className="flex items-center gap-4 mb-4">
              <GripVertical size={16} className="text-gray-400 cursor-grab" />
              <input
                type="text"
                placeholder="Size (e.g. S, M, L)"
                value={variant.size}
                onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
              />
              <input
                type="number"
                placeholder="Stock"
                value={variant.stock}
                onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
              />
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href="/dashboard/products"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}