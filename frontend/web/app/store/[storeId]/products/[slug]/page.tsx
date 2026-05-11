"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/context/CartContext";
import { useToast } from "@/lib/context/ToastContext";
import { CartProvider } from "@/lib/context/CartContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import { Heart, Minus, Plus, Truck, RotateCcw, Shield, ChevronRight, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  status: string;
}

function ProductContent() {
  const params = useParams();
  const storeId = params.storeId as string;
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem, isInCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    if (!storeId || !slug) return;

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/stores/${storeId}`);
        if (!res.ok) throw new Error("Failed to load store");
        
        const data = await res.json();
        const products = data.products || [];
        setStoreProducts(products.filter((p: Product) => p.id !== slug).slice(0, 4));

        const found = products.find((p: Product) => p.id === slug);
        if (found) {
          setProduct(found);
        } else {
          setProduct({
            id: slug,
            name: slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            description: "Product details coming soon.",
            price: 0,
            images: ["https://via.placeholder.com/600"],
            stock: 0,
            status: "draft",
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [storeId, slug]);

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        variantName: undefined,
        price: product.price,
        name: product.name,
        image: product.images[0] || "https://via.placeholder.com/400",
      });
    }

    setAddedToCart(true);
    showToast("Added to Bag", `${product.name} (x${quantity}) added to your bag`, "success");
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1d4ed8]/30 border-t-[#1d4ed8] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Product</h1>
          <p className="text-gray-500">{error}</p>
          <Link href={`/store/${storeId}`} className="mt-4 inline-block text-[#1d4ed8] hover:underline">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
          <p className="text-gray-500">This product does not exist or has been removed.</p>
          <Link href={`/store/${storeId}`} className="mt-4 inline-block text-[#1d4ed8] hover:underline">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.comparePrice && product.price < product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 py-3 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/store/${storeId}`} className="hover:text-[#1d4ed8] transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href={`/store/${storeId}`} className="hover:text-[#1d4ed8] transition-colors">Products</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 truncate max-w-[300px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-zoom-in">
              <img
                src={product.images[selectedImage] || "https://via.placeholder.com/600"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImage === index ? "border-[#1d4ed8]" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2">
              {product.status === "draft" && (
                <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded mb-2">Draft</span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                ৳{product.price.toLocaleString()}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ৳{product.comparePrice.toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded">
                      {discount}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
            )}

            {product.stock > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Quantity</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-medium select-none">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-3 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.stock > 10 ? "In Stock" : `Only ${product.stock} left`}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-4 rounded-lg transition-all font-medium flex items-center justify-center gap-2 ${
                  product.stock === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : addedToCart
                    ? "bg-green-600 text-white"
                    : "bg-[#1d4ed8] text-white hover:bg-[#1e40af]"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {product.stock === 0
                  ? "Out of Stock"
                  : addedToCart
                  ? "Added to Bag!"
                  : `Add to Bag - ৳${(product.price * quantity).toLocaleString()}`}
              </button>
              <button 
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => showToast("Wishlist", "Added to wishlist", "info")}
              >
                <Heart className="w-6 h-6 text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <div className="space-y-4 py-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Free shipping on orders over ৳2000</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Easy 7-day returns</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">100% authentic products</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Product Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-gray-500">Product ID</dt>
                  <dd className="text-gray-900 font-mono">{product.id.slice(0, 8)}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-gray-500">Status</dt>
                  <dd className="text-gray-900 capitalize">{product.status}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-gray-500">Stock</dt>
                  <dd className="text-gray-900">{product.stock} units</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {storeProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">More Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {storeProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/store/${storeId}/products/${p.id}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={p.images[0] || "https://via.placeholder.com/400"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{p.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-gray-900">৳{p.price.toLocaleString()}</span>
                      {p.comparePrice && p.comparePrice > p.price && (
                        <span className="text-sm text-gray-400 line-through">৳{p.comparePrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductPage() {
  return (
    <CartProvider>
      <ToastProvider>
        <ProductContent />
      </ToastProvider>
    </CartProvider>
  );
}