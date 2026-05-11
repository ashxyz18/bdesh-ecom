"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Search, X, Trash2 } from "lucide-react";

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  comparePrice?: number;
  image: string;
  stock: number;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    const storedStoreId = localStorage.getItem("storeId");
    setStoreId(storedStoreId);
  }, []);

  useEffect(() => {
    if (!storeId) return;

    async function fetchProducts() {
      try {
        const res = await fetch(`/api/stores/${storeId}`);
        const data = await res.json();
        const products = data.products || [];

        const wishlistData = products
          .filter((p: { status: string }) => p.status === "active")
          .slice(0, 4)
          .map((p: { id: string; name: string; price: number; comparePrice?: number; images: string[]; stock: number }) => ({
            id: `w-${p.id}`,
            productId: p.id,
            name: p.name,
            price: p.price,
            comparePrice: p.comparePrice,
            image: p.images?.[0] || "https://via.placeholder.com/400",
            stock: p.stock,
          }));

        setWishlist(wishlistData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [storeId]);

  const handleRemove = (id: string) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  const filteredWishlist = wishlist.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#1d4ed8]/30 border-t-[#1d4ed8] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
        <p className="text-gray-500 mt-1">{wishlist.length} items saved</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Save items you love by clicking the heart icon</p>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors"
          >
            <ShoppingBag size={18} />
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search wishlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  {item.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white px-3 py-1 rounded text-sm font-medium text-gray-900">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-gray-900">৳{item.price.toLocaleString()}</span>
                    {item.comparePrice && item.comparePrice > item.price && (
                      <span className="text-sm text-gray-400 line-through">
                        ৳{item.comparePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Link
                    href={storeId ? `/store/${storeId}/products/${item.productId}` : "#"}
                    target="_blank"
                    className="w-full py-2 border border-[#1d4ed8] text-[#1d4ed8] rounded-lg hover:bg-[#1d4ed8] hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingBag size={16} />
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}