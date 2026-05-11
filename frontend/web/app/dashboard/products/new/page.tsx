"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Plus, GripVertical, Save } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [stock, setStock] = useState("");
  const [variants, setVariants] = useState([{ size: "", stock: "" }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedStoreId = localStorage.getItem("storeId");
    setStoreId(storedStoreId);
  }, []);

  const handleAddImage = () => {
    const url = prompt("Enter image URL:");
    if (url) setImages([...images, url]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;

    setSaving(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          name,
          price: parseFloat(price),
          description,
          images,
          stock: parseInt(stock) || 0,
          variants: variants.filter((v) => v.size && v.stock),
        }),
      });

      if (res.ok) {
        router.push("/dashboard/products");
      }
    } catch (error) {
      console.error("Failed to create product:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

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
            <div className="grid sm:grid-cols-2 gap-4">
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
            <button
              type="button"
              onClick={handleAddImage}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
            >
              <Plus size={20} />
              <span className="text-xs mt-1">Add Image</span>
            </button>
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
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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