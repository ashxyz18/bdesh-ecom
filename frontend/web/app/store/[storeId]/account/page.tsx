"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Package, Menu, X } from "lucide-react";

interface StoreInfo {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  color?: string;
  templateId?: string;
  prebuiltWebsiteId?: string;
}

export default function StoreAccountPage() {
  const params = useParams<{ storeId: string }>();
  const storeId = params.storeId;

  const [store, setStore] = useState<StoreInfo>({ id: storeId, name: "My Store" });
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
            description: storeData.description,
            logo: storeData.logo,
            color: storeData.color,
            templateId: theme.templateId,
            prebuiltWebsiteId: theme.prebuiltWebsiteId
          });
        }
      } catch {
        // fallback
      }
    }
    fetchStore();
  }, [storeId]);

  if (store.prebuiltWebsiteId) {
    if (store.prebuiltWebsiteId === "koskii") {
      return <KoskiiAccountPage store={store} />;
    }
  }

  return <DefaultAccountPage store={store} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />;
}

function DefaultAccountPage({ store, mobileNavOpen, setMobileNavOpen }: { store: StoreInfo; mobileNavOpen: boolean; setMobileNavOpen: (open: boolean) => void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/store/${store.id}`} className="flex items-center gap-2">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="h-8" />
              ) : (
                <Package className="text-slate-900" size={24} />
              )}
              <span className="font-bold text-lg text-slate-900">{store.name}</span>
            </Link>

            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden p-2">
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">My Account</h1>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Package className="text-slate-400" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Welcome!</h2>
          <p className="text-slate-500 mb-6">Sign in to access your account, track orders, and more.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
              Sign In
            </button>
            <button className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
              Create Account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function KoskiiAccountPage({ store }: { store: StoreInfo }) {
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        .account-page { min-height: 100vh; padding-bottom: 80px; }
        .account-header { background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 40px 0 30px; text-align: center; color: #fff; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 600; margin-bottom: 8px; letter-spacing: 1px; color: #fff; }
        .page-subtitle { font-size: 14px; color: rgba(255,255,255,0.7); }
        .guest-welcome { padding: 30px 0; background: #f5f5f5; }
        .welcome-card { background: #fff; border-radius: 12px; padding: 32px 24px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.06); max-width: 400px; margin: 0 auto; }
        .welcome-icon { width: 80px; height: 80px; border-radius: 50%; background: #f5f5f5; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .welcome-icon i { font-size: 36px; color: #666; }
        .welcome-card h2 { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1a1a1a; }
        .welcome-card p { font-size: 14px; color: #666; margin-bottom: 20px; }
        .btn-login { display: inline-block; padding: 14px 40px; background: #1a1a1a; color: #fff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-radius: 4px; text-decoration: none; }
        .btn-login:hover { background: #d4af37; }
        .sticky-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; display: flex; justify-content: space-around; align-items: center; padding: 8px 0 6px; box-shadow: 0 -2px 12px rgba(0,0,0,0.08); z-index: 1000; border-top: 1px solid #e0e0e0; }
        .sticky-item { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 10px; color: #666; padding: 4px 12px; position: relative; text-decoration: none; }
        .sticky-item i { font-size: 20px; margin-bottom: 2px; }
        .sticky-item.active { color: #1a1a1a; }
        .announcement-bar { background: #1a1a1a; color: #fff; padding: 8px 0; overflow: hidden; white-space: nowrap; position: fixed; top: 0; left: 0; width: 100%; z-index: 1001; font-size: 12px; }
        .scroll-text { display: inline-block; animation: scrollText 20s linear infinite; padding-left: 100%; }
        @keyframes scrollText { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        .main-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; position: fixed; top: 36px; left: 0; right: 0; z-index: 999; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
        .header-left, .header-right { display: flex; align-items: center; gap: 16px; }
        .menu-btn, .search-btn, .header-icon { background: none; border: none; font-size: 20px; cursor: pointer; padding: 4px; color: #1a1a1a; }
        .logo img { height: 32px; width: auto; }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="account-page" style={{ paddingTop: "84px" }}>
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
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>
          <div className="logo">
            <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii_logo_left_right_white.0u84b2px.n_j~.png" alt="Koskii" style={{ filter: "none" }} />
          </div>
          <div className="header-right">
            <a href={`/store/${store.id}/account`} className="header-icon active">
              <i className="fas fa-user"></i>
            </a>
            <a href={`/store/${store.id}/wishlist`} className="header-icon">
              <i className="far fa-heart"></i>
            </a>
            <a href={`/store/${store.id}/cart`} className="header-icon">
              <i className="fas fa-shopping-bag"></i>
              <span className="badge-count">0</span>
            </a>
          </div>
        </header>

        <section className="account-header">
          <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
            <h1 className="page-title">My Account</h1>
            <p className="page-subtitle">Manage your orders, preferences, and more</p>
          </div>
        </section>

        <section className="guest-welcome">
          <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
            <div className="welcome-card">
              <div className="welcome-icon">
                <i className="far fa-user-circle"></i>
              </div>
              <h2>Welcome, Guest!</h2>
              <p>Login to access all features and track your orders</p>
              <a href="#" className="btn-login" id="loginBtn">Login Now</a>
            </div>
          </div>
        </section>
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
        <a href={`/store/${store.id}/account`} className="sticky-item active">
          <i className="fas fa-user"></i>
          <span>Account</span>
        </a>
      </nav>
    </div>
  );
}