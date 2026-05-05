"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboard } from "../../../DashboardContext";
import { slugify } from "@bdesh/shared";

interface VariantRow {
  id?: string;
  name: string;
  sku: string;
  price: string;
  quantity: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { activeStore } = useDashboard();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Basic fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [trackStock, setTrackStock] = useState(true);
  const [status, setStatus] = useState<"active" | "draft" | "archived">("active");
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  // Variants
  const [variants, setVariants] = useState<VariantRow[]>([]);

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");

  // Fetch product data
  useEffect(() => {
    if (!activeStore || !productId) return;

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/${activeStore!.id}/products/${productId}`);
        if (!res.ok) {
          setError("Product not found");
          return;
        }
        const data = await res.json();
        const p = data.product;

        setName(p.name || "");
        setDescription(p.description || "");
        setPrice(p.price?.toString() || "");
        setComparePrice(p.comparePrice?.toString() || "");
        setSku(p.sku || "");
        setBarcode(p.barcode || "");
        setQuantity(p.quantity?.toString() || "0");
        setTrackStock(p.trackStock ?? true);
        setStatus(p.status || "active");
        setFeatured(p.featured ?? false);
        setImages(p.images || []);
        setSeoTitle(p.seoTitle || "");
        setSeoDesc(p.seoDesc || "");

        if (p.variants?.length > 0) {
          setVariants(
            p.variants.map((v: any) => ({
              id: v.id,
              name: v.name || "",
              sku: v.sku || "",
              price: v.price?.toString() || "",
              quantity: v.quantity?.toString() || "0",
            }))
          );
        }
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [activeStore, productId]);

  const slug = slugify(name);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          setImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { name: "", sku: "", price: "", quantity: "0" },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof VariantRow,
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore) {
      setError("No store selected");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/${activeStore.id}/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description: description || undefined,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
          sku: sku || undefined,
          barcode: barcode || undefined,
          quantity: parseInt(quantity) || 0,
          trackStock,
          status,
          featured,
          images,
          seoTitle: seoTitle || undefined,
          seoDesc: seoDesc || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to update product");
        return;
      }

      router.push("/dashboard/products");
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

  if (!activeStore) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select a store first.</p>
        <Link href="/dashboard" className="text-primary hover:underline mt-2 inline-block">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/products"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-sm text-gray-500">{name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>

              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cotton T-Shirt"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={slug} readOnly className="bg-gray-50 text-gray-500" />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Describe your product..."
                />
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Product Images</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50 group">
                    <img
                      src={img}
                      alt={`Product ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}

                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Variants</h2>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus size={14} className="mr-1" /> Add Variant
                </Button>
              </div>

              {variants.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No variants. The base price and stock will be used.
                </p>
              ) : (
                <div className="space-y-3">
                  {variants.map((variant, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">Name</Label>
                          <Input
                            value={variant.name}
                            onChange={(e) =>
                              updateVariant(i, "name", e.target.value)
                            }
                            placeholder="e.g. Red / Large"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">SKU</Label>
                          <Input
                            value={variant.sku}
                            onChange={(e) =>
                              updateVariant(i, "sku", e.target.value)
                            }
                            placeholder="SKU"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Price (৳)</Label>
                          <Input
                            type="number"
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(i, "price", e.target.value)
                            }
                            placeholder="0.00"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Qty</Label>
                          <Input
                            type="number"
                            value={variant.quantity}
                            onChange={(e) =>
                              updateVariant(i, "quantity", e.target.value)
                            }
                            placeholder="0"
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="p-1.5 text-gray-400 hover:text-red-500 mt-5"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">SEO Settings</h2>
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Title for search engines"
                />
              </div>
              <div>
                <Label htmlFor="seoDesc">SEO Description</Label>
                <textarea
                  id="seoDesc"
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Description for search engines"
                />
              </div>
            </div>
          </div>

          {/* Sidebar - 1 col */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Pricing</h2>
              <div>
                <Label htmlFor="price">Price (৳) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="comparePrice">Compare Price (৳)</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Inventory</h2>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU-001"
                />
              </div>
              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Barcode"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={trackStock}
                  onChange={(e) => setTrackStock(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Track stock
              </label>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Status</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={status === "active"}
                    onChange={() => setStatus("active")}
                    className="text-primary"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === "draft"}
                    onChange={() => setStatus("draft")}
                    className="text-primary"
                  />
                  Draft
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="status"
                    value="archived"
                    checked={status === "archived"}
                    onChange={() => setStatus("archived")}
                    className="text-primary"
                  />
                  Archived
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Featured product
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={saving || !name || !price}>
                <Save size={16} className="mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Link href="/dashboard/products">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
