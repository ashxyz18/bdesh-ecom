"use client";

import { useEffect, useState } from "react";
import { PrebuiltWebsite, getPrebuiltWebsite, koskiiProducts } from "./registry";

interface PrebuiltWebsiteRendererProps {
  websiteId: string;
  storeId: string;
}

export function PrebuiltWebsiteRenderer({ websiteId, storeId }: PrebuiltWebsiteRendererProps) {
  const website = getPrebuiltWebsite(websiteId);
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [products, setProducts] = useState(koskiiProducts);

  useEffect(() => {
    const savedCart = localStorage.getItem(`store-cart-${storeId}`);
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        setCartCount(items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0));
      } catch {}
    }
    const savedWishlist = localStorage.getItem(`store-wishlist-${storeId}`);
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch {}
    }
    const handleScroll = () => setHeaderScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [storeId]);

  useEffect(() => {
    if (websiteId === "koskii") {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % 3);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [websiteId]);

  if (!website) return null;

  if (websiteId === "koskii") {
    return <KoskiiRenderer
      website={website}
      storeId={storeId}
      cartCount={cartCount}
      setCartCount={setCartCount}
      wishlist={wishlist}
      setWishlist={setWishlist}
      currentSlide={currentSlide}
      setCurrentSlide={setCurrentSlide}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
      searchOpen={searchOpen}
      setSearchOpen={setSearchOpen}
      cartOpen={cartOpen}
      setCartOpen={setCartOpen}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      headerScrolled={headerScrolled}
      products={products}
    />;
  }

  return null;
}

interface KoskiiRendererProps {
  website: PrebuiltWebsite;
  storeId: string;
  cartCount: number;
  setCartCount: (count: number) => void;
  wishlist: string[];
  setWishlist: (wishlist: string[]) => void;
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  headerScrolled: boolean;
  products: typeof koskiiProducts;
}

function KoskiiRenderer({
  website,
  storeId,
  cartCount,
  setCartCount,
  wishlist,
  setWishlist,
  currentSlide,
  setCurrentSlide,
  mobileMenuOpen,
  setMobileMenuOpen,
  searchOpen,
  setSearchOpen,
  cartOpen,
  setCartOpen,
  searchQuery,
  setSearchQuery,
  headerScrolled,
  products,
}: KoskiiRendererProps) {
  const addToCart = (productId: string, size: string = "Free Size") => {
    const cartKey = `store-cart-${storeId}`;
    const saved = localStorage.getItem(cartKey);
    const cart = saved ? JSON.parse(saved) : [];
    const existing = cart.find((item: any) => item.id === productId && item.size === size);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: productId, size, quantity: 1 });
    }
    localStorage.setItem(cartKey, JSON.stringify(cart));
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    showToast("Added to Bag", "Item was added successfully");
  };

  const toggleWishlist = (productId: string) => {
    const wishlistKey = `store-wishlist-${storeId}`;
    let newWishlist: string[];
    if (wishlist.includes(productId)) {
      newWishlist = wishlist.filter(id => id !== productId);
    } else {
      newWishlist = [...wishlist, productId];
    }
    setWishlist(newWishlist);
    localStorage.setItem(wishlistKey, JSON.stringify(newWishlist));
    showToast(
      wishlist.includes(productId) ? "Removed" : "Added",
      wishlist.includes(productId) ? "Removed from wishlist" : "Added to wishlist"
    );
  };

  const showToast = (title: string, message: string) => {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fas fa-check-circle"></i><div class="toast-content"><h4>${title}</h4><p>${message}</p></div>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  };

  const filteredProducts = searchQuery
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        .koskii-root {
          --primary: ${website.cssVariables["--primary"]};
          --accent: ${website.cssVariables["--accent"]};
          --text: ${website.cssVariables["--text"]};
          --text-muted: ${website.cssVariables["--text-muted"]};
          --bg: ${website.cssVariables["--bg"]};
          --white: ${website.cssVariables["--white"]};
          --border: ${website.cssVariables["--border"]};
          --sale: ${website.cssVariables["--sale"]};
        }
        .koskii-root .announcement-bar {
          background: var(--primary);
          color: var(--white);
          padding: 8px 0;
          overflow: hidden;
          white-space: nowrap;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1001;
        }
        .koskii-root .scroll-text {
          display: inline-block;
          animation: scrollText 20s linear infinite;
          font-size: 12px;
          padding-left: 100%;
        }
        @keyframes scrollText {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .koskii-root .main-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          position: fixed;
          top: 36px;
          left: 0;
          right: 0;
          z-index: 999;
          transition: background 0.3s ease, box-shadow 0.3s ease;
          background: transparent;
        }
        .koskii-root .main-header:not(.scrolled) {
          background: transparent;
        }
        .koskii-root .main-header.scrolled {
          background: var(--white);
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .koskii-root .main-header.scrolled .menu-btn,
        .koskii-root .main-header.scrolled .search-btn,
        .koskii-root .main-header.scrolled .header-icon {
          color: var(--text);
          text-shadow: none;
        }
        .koskii-root .main-header:not(.scrolled) .menu-btn,
        .koskii-root .main-header:not(.scrolled) .search-btn,
        .koskii-root .main-header:not(.scrolled) .header-icon {
          color: var(--white);
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .koskii-root .logo img { height: 32px; width: auto; }
        .koskii-root .header-left, .koskii-root .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .koskii-root .menu-btn, .koskii-root .search-btn, .koskii-root .header-icon {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
        }
        .koskii-root .header-icon { position: relative; }
        .koskii-root .header-icon .badge-count {
          position: absolute;
          top: -2px;
          right: -2px;
          background: var(--accent);
          color: var(--white);
          font-size: 10px;
          font-weight: 700;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .koskii-root .hero-section {
          position: relative;
          overflow: hidden;
          height: 100vh;
          min-height: 600px;
        }
        .koskii-root .hero-slider { position: relative; width: 100%; height: 100%; }
        .koskii-root .hero-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.8s ease;
        }
        .koskii-root .hero-slide.active { opacity: 1; z-index: 2; }
        .koskii-root .hero-slide img { width: 100%; height: 100%; object-fit: cover; }
        .koskii-root .hero-slide .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%);
          z-index: 1;
        }
        .koskii-root .hero-content {
          position: absolute;
          bottom: 100px;
          left: 0;
          right: 0;
          text-align: center;
          padding: 0 20px;
          color: var(--white);
          z-index: 3;
        }
        .koskii-root .hero-content h2 {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 20px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .koskii-root .hero-content .btn-shop {
          display: inline-block;
          padding: 14px 40px;
          background: var(--white);
          color: var(--text);
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          text-decoration: none;
        }
        .koskii-root .hero-content .btn-shop:hover { background: var(--accent); color: var(--white); }
        .koskii-root .hero-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          position: absolute;
          bottom: 30px;
          left: 0;
          right: 0;
          z-index: 4;
        }
        .koskii-root .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          cursor: pointer;
          border: 2px solid transparent;
        }
        .koskii-root .dot.active { background: var(--white); width: 30px; border-radius: 5px; border-color: var(--accent); }
        .koskii-root .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 600;
          text-align: center;
          margin: 40px 0 24px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          position: relative;
          padding-bottom: 12px;
        }
        .koskii-root .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 3px;
          background: var(--accent);
        }
        .koskii-root .category-icons { padding: 24px 0; background: var(--bg); }
        .koskii-root .icon-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
        .koskii-root .icon-item { text-align: center; transition: transform 0.2s; text-decoration: none; color: var(--text); }
        .koskii-root .icon-item:hover { transform: translateY(-4px); }
        .koskii-root .icon-item img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 50%; margin-bottom: 6px; }
        .koskii-root .icon-item span { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: block; line-height: 1.2; }
        .koskii-root .container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
        .koskii-root .product-slider {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: 8px 16px 24px;
          scrollbar-width: none;
        }
        .koskii-root .product-slider::-webkit-scrollbar { display: none; }
        .koskii-root .product-card {
          flex: 0 0 180px;
          scroll-snap-align: start;
          background: var(--white);
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .koskii-root .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .koskii-root .product-image { position: relative; overflow: hidden; }
        .koskii-root .product-image img { width: 100%; aspect-ratio: 2/3; object-fit: cover; transition: transform 0.5s ease; }
        .koskii-root .product-card:hover .product-image img { transform: scale(1.05); }
        .koskii-root .quick-add {
          position: absolute;
          bottom: -40px;
          left: 0;
          right: 0;
          padding: 10px;
          background: var(--primary);
          color: var(--white);
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          border: none;
          cursor: pointer;
          transition: bottom 0.3s ease;
        }
        .koskii-root .product-card:hover .quick-add { bottom: 0; }
        .koskii-root .quick-add:hover { background: var(--accent); }
        .koskii-root .badge {
          position: absolute;
          top: 8px;
          left: 8px;
          padding: 4px 8px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          background: var(--accent);
          color: var(--white);
          border-radius: 2px;
        }
        .koskii-root .product-rating {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 600;
          background: var(--white);
          border-radius: 2px;
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .koskii-root .product-wishlist {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(255,255,255,0.9);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 2;
        }
        .koskii-root .product-wishlist:hover { transform: scale(1.1); background: var(--white); }
        .koskii-root .product-wishlist.active { color: var(--sale); }
        .koskii-root .product-info { padding: 12px; }
        .koskii-root .product-info h3 {
          font-size: 13px;
          font-weight: 400;
          line-height: 1.5;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          color: var(--text-muted);
          min-height: 39px;
        }
        .koskii-root .product-card:hover .product-info h3 { color: var(--text); }
        .koskii-root .sale-price { font-size: 14px; font-weight: 600; color: var(--text); }
        .koskii-root .original-price { font-size: 12px; color: var(--text-muted); text-decoration: line-through; }
        .koskii-root .discount { font-size: 11px; color: var(--sale); font-weight: 600; }
        .koskii-root .main-footer { background: var(--primary); color: var(--white); padding-top: 48px; }
        .koskii-root .footer-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; padding-bottom: 40px; }
        .koskii-root .footer-col h4 { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px; color: var(--white); }
        .koskii-root .footer-col ul { list-style: none; }
        .koskii-root .footer-col ul li { margin-bottom: 10px; }
        .koskii-root .footer-col ul li a { font-size: 13px; color: rgba(255,255,255,0.7); text-decoration: none; }
        .koskii-root .footer-col ul li a:hover { color: var(--white); }
        .koskii-root .footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding: 32px 0; text-align: center; }
        .koskii-root .copyright { font-size: 12px; color: rgba(255,255,255,0.5); }
        .koskii-root .sticky-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--white);
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 8px 0 6px;
          box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
          z-index: 1000;
          border-top: 1px solid var(--border);
        }
        .koskii-root .sticky-item { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 10px; color: var(--text-muted); padding: 4px 12px; position: relative; text-decoration: none; }
        .koskii-root .sticky-item i { font-size: 20px; margin-bottom: 2px; }
        .koskii-root .sticky-item.active { color: var(--primary); }
        .koskii-root .toast-container { position: fixed; top: 20px; right: 20px; z-index: 5000; display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
        .koskii-root .toast { background: var(--white); padding: 16px 20px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 12px; min-width: 300px; transform: translateX(120%); transition: transform 0.4s ease; pointer-events: all; border-left: 4px solid var(--accent); }
        .koskii-root .toast.show { transform: translateX(0); }
        .koskii-root .mobile-menu { position: fixed; top: 0; left: -100%; width: 85%; max-width: 360px; height: 100%; background: var(--white); z-index: 2001; transition: left 0.35s ease; overflow-y: auto; box-shadow: 4px 0 20px rgba(0,0,0,0.1); }
        .koskii-root .mobile-menu.active { left: 0; }
        .koskii-root .menu-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
        .koskii-root .menu-overlay.active { opacity: 1; visibility: visible; }
        .koskii-root .menu-header { padding: 20px 16px; background: linear-gradient(135deg, var(--primary) 0%, #333 100%); display: flex; align-items: center; gap: 16px; }
        .koskii-root .close-menu { background: none; border: none; color: var(--white); font-size: 24px; cursor: pointer; }
        .koskii-root .menu-logo img { height: 28px; filter: brightness(0) invert(1); }
        .koskii-root .menu-list { list-style: none; padding: 0; }
        .koskii-root .menu-list li { border-bottom: 1px solid var(--border); }
        .koskii-root .menu-list li a { display: flex; justify-content: space-between; align-items: center; padding: 18px 16px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text); text-decoration: none; }
        .koskii-root .menu-list li a:hover { background: var(--bg); padding-left: 20px; }
        .koskii-root .menu-list li a i { font-size: 12px; color: var(--text-muted); }
        @media (min-width: 768px) {
          .koskii-root .hero-content h2 { font-size: 36px; }
          .koskii-root .icon-grid { max-width: 800px; margin: 0 auto; }
          .koskii-root .product-card { flex: 0 0 220px; }
          .koskii-root .footer-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1024px) {
          .koskii-root .hero-content h2 { font-size: 48px; }
          .koskii-root .section-title { font-size: 28px; }
          .koskii-root .product-card { flex: 0 0 250px; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="koskii-root">
        <div className="announcement-bar">
          <div className="scroll-text">
            Get extra 5% off Use: FLASH5 on Min.2490 | Save More! Use: KOSKIILUV10 for extra 10% discount | Only on App use: APPFIRST & Get extra 15% Off |
          </div>
        </div>

        <header className={`main-header ${headerScrolled ? "scrolled" : ""}`}>
          <div className="header-left">
            <button className="menu-btn" onClick={() => setMobileMenuOpen(true)}>
              <i className="fas fa-bars"></i>
            </button>
            <button className="search-btn" onClick={() => setSearchOpen(true)}>
              <i className="fas fa-search"></i>
            </button>
          </div>
          <div className="logo">
            <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii_logo_left_right_white.0u84b2px.n_j~.png" alt="Koskii" style={{ filter: headerScrolled ? "none" : "brightness(0) invert(1)" }} />
          </div>
          <div className="header-right">
            <a href="#" className="header-icon" onClick={(e) => { e.preventDefault(); setCartOpen(true); }}>
              <i className="far fa-heart"></i>
            </a>
            <a href="#" className="header-icon" onClick={(e) => { e.preventDefault(); setCartOpen(true); }}>
              <i className="fas fa-shopping-bag"></i>
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </a>
          </div>
        </header>

        <div className={`menu-overlay ${mobileMenuOpen ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)} />
        <nav className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
          <div className="menu-header">
            <button className="close-menu" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="menu-logo">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii_logo_left_right_white.0u84b2px.n_j~.png" alt="Koskii" />
            </div>
          </div>
          <ul className="menu-list">
            {["SALE", "SAREES", "SALWAR SUITS", "DRESS MATERIALS", "LEHENGAS", "GOWNS", "BLOUSES", "NEW ARRIVALS"].map(item => (
              <li key={item}><a href="#">{item} <i className="fas fa-chevron-right"></i></a></li>
            ))}
          </ul>
        </nav>

        <section className="hero-section">
          <div className="hero-slider">
            {[
              { img: "https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-ranipink-zariwork-puresilk-designer-saree-saus0035699_ranipink_1_1.jpg?v=1721373197", title: "Silk Sarees at Flat 30% off", subtitle: "Shop Now" },
              { img: "https://cdn.shopify.com/s/files/1/0049/3649/9315/files/GCBR0040728_BROWN_7.jpg?v=1738059747", title: "Flat 50% Off Designer Lehengas", subtitle: "Shop Now" },
              { img: "https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SSRM0043361_BLACK_5.jpg?v=1737975407", title: "Flat 40% Off Salwar Suits", subtitle: "Shop Now" },
            ].map((slide, idx) => (
              <div key={idx} className={`hero-slide ${currentSlide === idx ? "active" : ""}`}>
                <img src={slide.img} alt={slide.title} />
                <div className="overlay" />
                <div className="hero-content">
                  <h2>{slide.title}</h2>
                  <a href="#" className="btn-shop">{slide.subtitle}</a>
                </div>
              </div>
            ))}
          </div>
          <div className="hero-dots">
            {[0, 1, 2].map(idx => (
              <span key={idx} className={`dot ${currentSlide === idx ? "active" : ""}`} onClick={() => setCurrentSlide(idx)} />
            ))}
          </div>
        </section>

        <section className="category-icons">
          <div className="container">
            <div className="icon-grid">
              {[
                { img: "https://cdn.shopify.com/s/files/1/0049/3649/9315/files/01_5.jpg?v=1775455849", label: "SALE" },
                { img: "https://cdn.shopify.com/s/files/1/0049/3649/9315/files/02_5.jpg?v=1775455849", label: "SAREES" },
                { img: "https://cdn.shopify.com/s/files/1/0049/3649/9315/files/03_5.jpg?v=1775455849", label: "SALWAR SUITS" },
                { img: "https://cdn.shopify.com/s/files/1/0049/3649/9315/files/04_5.jpg?v=1775455849", label: "DRESS MATERIALS" },
                { img: "https://cdn.shopify.com/s/files/1/0049/3649/9315/files/05_5.jpg?v=1775455849", label: "LEHENGAS" },
                { img: "https://cdn.shopify.com/s/files/1/0049/3649/9315/files/06.jpg?v=1775455849", label: "GOWNS" },
              ].map((item, idx) => (
                <a key={idx} href="#" className="icon-item">
                  <img src={item.img} alt={item.label} />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="container">
          <h2 className="section-title">BESTSELLERS</h2>
          <div className="product-slider">
            {products.map(product => (
              <a key={product.id} href={`/store/${storeId}/products/${product.id}`} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  {product.badge && <span className="badge">{product.badge}</span>}
                  <span className="product-rating">{product.rating}&#9733;</span>
                  <button
                    className={`product-wishlist ${wishlist.includes(product.id) ? "active" : ""}`}
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                  >
                    <i className={wishlist.includes(product.id) ? "fas fa-heart" : "far fa-heart"}></i>
                  </button>
                  <button
                    className="quick-add"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product.id); }}
                  >
                    Quick Add
                  </button>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="price">
                    <span className="sale-price">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice !== product.price && (
                      <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                    )}
                    {product.discount && <span className="discount">{product.discount}% OFF</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <footer className="main-footer">
          <div className="footer-top">
            <div className="container">
              <div className="footer-grid">
                <div className="footer-col">
                  <h4>SHOP</h4>
                  <ul>
                    {["Sarees", "Salwar Suits", "Lehengas", "Gowns", "Dress Materials", "Blouses"].map(item => (
                      <li key={item}><a href="#">{item}</a></li>
                    ))}
                  </ul>
                </div>
                <div className="footer-col">
                  <h4>HELP</h4>
                  <ul>
                    {["Contact Us", "Shipping & Delivery", "Returns & Exchanges", "Size Guide", "Track Order"].map(item => (
                      <li key={item}><a href="#">{item}</a></li>
                    ))}
                  </ul>
                </div>
                <div className="footer-col">
                  <h4>ABOUT</h4>
                  <ul>
                    {["About Us", "Careers", "Store Locator", "Blog"].map(item => (
                      <li key={item}><a href="#">{item}</a></li>
                    ))}
                  </ul>
                </div>
                <div className="footer-col">
                  <h4>CONNECT</h4>
                  <div className="social-links" style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                    {["facebook-f", "instagram", "pinterest-p", "youtube"].map(icon => (
                      <a key={icon} href="#" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                        <i className={`fab fa-${icon}`}></i>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="container">
              <p className="copyright">© 2025 Koskii. All Rights Reserved.</p>
            </div>
          </div>
        </footer>

        <nav className="sticky-nav">
          {[
            { icon: "fa-home", label: "Home", href: `/store/${storeId}` },
            { icon: "fa-th-large", label: "Categories", href: `#` },
            { icon: "fa-tag", label: "Sale", href: `#` },
            { icon: "fa-shopping-bag", label: "Bag", href: `#`, badge: cartCount },
            { icon: "fa-user", label: "Account", href: `/store/${storeId}/account` },
          ].map((item, idx) => (
            <a key={idx} href={item.href} className={`sticky-item ${idx === 0 ? "active" : ""}`}>
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && <span className="badge-count">{item.badge}</span>}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default PrebuiltWebsiteRenderer;