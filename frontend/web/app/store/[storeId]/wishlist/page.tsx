"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface StoreInfo {
  id: string;
  name: string;
  prebuiltWebsiteId?: string;
}

export default function StoreWishlistPage() {
  const params = useParams<{ storeId: string }>();
  const storeId = params.storeId;

  const [store, setStore] = useState<StoreInfo>({ id: storeId, name: "My Store" });
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await fetch(`/api/stores/${storeId}`);
        if (res.ok) {
          const response = await res.json();
          const storeData = response.store || response;
          const theme = typeof storeData.theme === "string" ? JSON.parse(storeData.theme) : (storeData.theme || {});
          setStore({
            id: storeId,
            name: storeData.name || "Store",
            prebuiltWebsiteId: theme.prebuiltWebsiteId
          });
        }
      } catch {
        // fallback
      }
    }
    fetchStore();
  }, [storeId]);

  useEffect(() => {
    const saved = localStorage.getItem(`store-wishlist-${storeId}`);
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        setWishlistItems(ids);
      } catch {}
    }
    setLoading(false);
  }, [storeId]);

  if (store.prebuiltWebsiteId === "koskii") {
    return <KoskiiWishlistPage store={store} wishlistItems={wishlistItems} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">My Wishlist</h1>
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500">Your wishlist is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {wishlistItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function KoskiiWishlistPage({ store, wishlistItems }: { store: StoreInfo; wishlistItems: any[] }) {
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        .wishlist-page { padding: 100px 0 40px; min-height: 100vh; }
        .wishlist-page .container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
        .wishlist-page h1 { font-family: 'Playfair Display', serif; font-size: 28px; text-align: center; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 2px; }
        .wishlist-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .wishlist-empty { text-align: center; padding: 80px 20px; }
        .wishlist-empty i { font-size: 64px; color: #e0e0e0; margin-bottom: 16px; }
        .wishlist-empty h2 { font-size: 20px; margin-bottom: 8px; }
        .wishlist-empty p { color: #666; margin-bottom: 24px; }
        .btn-continue { display: inline-block; padding: 12px 32px; background: #1a1a1a; color: #fff; text-transform: uppercase; letter-spacing: 1px; font-size: 13px; font-weight: 600; border-radius: 4px; text-decoration: none; }
        .btn-continue:hover { background: #d4af37; }
        .announcement-bar { background: #1a1a1a; color: #fff; padding: 8px 0; overflow: hidden; white-space: nowrap; position: fixed; top: 0; left: 0; width: 100%; z-index: 1001; font-size: 12px; }
        .scroll-text { display: inline-block; animation: scrollText 20s linear infinite; padding-left: 100%; }
        @keyframes scrollText { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        .main-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; position: fixed; top: 36px; left: 0; right: 0; z-index: 999; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
        .header-left, .header-right { display: flex; align-items: center; gap: 16px; }
        .menu-btn, .header-icon { background: none; border: none; font-size: 20px; cursor: pointer; padding: 4px; color: #1a1a1a; }
        .logo img { height: 32px; width: auto; }
        .sticky-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; display: flex; justify-content: space-around; align-items: center; padding: 8px 0 6px; box-shadow: 0 -2px 12px rgba(0,0,0,0.08); z-index: 1000; border-top: 1px solid #e0e0e0; }
        .sticky-item { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 10px; color: #666; padding: 4px 12px; position: relative; text-decoration: none; }
        .sticky-item i { font-size: 20px; margin-bottom: 2px; }
        .sticky-item.active { color: #1a1a1a; }
        @media (min-width: 768px) { .wishlist-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .wishlist-grid { grid-template-columns: repeat(4, 1fr); } }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="wishlist-page">
        <div className="announcement-bar">
          <div className="scroll-text">
            Get extra 5% off Use: FLASH5 on Min.2490 | Save More! Use: KOSKIILUV10 for extra 10% discount | Only on App use: APPFIRST & Get extra 15% Off |
          </div>
        </div>

        <header className="main-header">
          <div className="header-left">
            <Link href={`/store/${store.id}`} className="menu-btn">
              <i className="fas fa-arrow-left"></i>
            </Link>
          </div>
          <div className="logo">
            <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii_logo_left_right_white.0u84b2px.n_j~.png" alt="Koskii" style={{ filter: "none" }} />
          </div>
          <div className="header-right">
            <a href={`/store/${store.id}/account`} className="header-icon">
              <i className="far fa-user"></i>
            </a>
            <a href={`/store/${store.id}/wishlist`} className="header-icon">
              <i className="fas fa-heart"></i>
            </a>
            <a href={`/store/${store.id}/cart`} className="header-icon">
              <i className="fas fa-shopping-bag"></i>
              <span className="badge-count">0</span>
            </a>
          </div>
        </header>

        <div className="container">
          <h1>My Wishlist</h1>
          <div className="wishlist-grid">
            <div className="wishlist-empty">
              <i className="far fa-heart"></i>
              <h2>Your wishlist is empty</h2>
              <p>Save your favourite items to your wishlist and shop them later</p>
              <Link href={`/store/${store.id}`} className="btn-continue">Start Shopping</Link>
            </div>
          </div>
        </div>
      </div>

      <nav className="sticky-nav">
        <Link href={`/store/${store.id}`} className="sticky-item">
          <i className="fas fa-home"></i>
          <span>Home</span>
        </Link>
        <a href="#" className="sticky-item">
          <i className="fas fa-th-large"></i>
          <span>Categories</span>
        </a>
        <a href="#" className="sticky-item">
          <i className="fas fa-tag"></i>
          <span>Sale</span>
        </a>
        <a href={`/store/${store.id}/cart`} className="sticky-item">
          <i className="fas fa-shopping-bag"></i>
          <span>Bag</span>
          <span className="nav-badge">0</span>
        </a>
        <a href={`/store/${store.id}/account`} className="sticky-item">
          <i className="far fa-user"></i>
          <span>Account</span>
        </a>
      </nav>
    </div>
  );
}