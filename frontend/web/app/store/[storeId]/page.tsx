"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BlockData } from "@/lib/builder/blocks/types";
import { 
  HeroBlock, AboutBlock, ServicesBlock, ContactBlock, 
  TestimonialsBlock, HoursBlock, GalleryBlock, ContactFormBlock,
  PricingBlock, FeaturesBlock, FAQBlock, TeamBlock, NewsletterBlock, StatsBlock,
  ProductGridBlock, FeaturedProductsBlock, CartSummaryBlock
} from "@/lib/builder/blocks";
import { ShoppingCart, Package, Menu, X, Facebook, Twitter, Instagram } from "lucide-react";

interface StoreInfo {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  color?: string;
  templateId?: string;
}

function StoreNavbar({ store, cartCount }: { store: StoreInfo; cartCount: number }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
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

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href={`/store/${store.id}`} className="hover:text-slate-900 transition-colors">Home</Link>
            <Link href={`/store/${store.id}/products`} className="hover:text-slate-900 transition-colors">Products</Link>
            <Link href={`/store/${store.id}/cart`} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
              <ShoppingCart size={16} />
              Cart
              {cartCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
          </div>

          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden p-2">
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-3 space-y-2">
            <Link href={`/store/${store.id}`} onClick={() => setMobileNavOpen(false)} className="block text-sm font-medium text-slate-600 py-2">Home</Link>
            <Link href={`/store/${store.id}/products`} onClick={() => setMobileNavOpen(false)} className="block text-sm font-medium text-slate-600 py-2">Products</Link>
            <Link href={`/store/${store.id}/cart`} onClick={() => setMobileNavOpen(false)} className="flex items-center gap-1 text-sm font-medium text-slate-600 py-2">
              <ShoppingCart size={16} /> Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function StoreFooter({ store }: { store: StoreInfo }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-lg mb-2">{store.name}</h3>
            {store.description && <p className="text-slate-400 text-sm max-w-md">{store.description}</p>}
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-slate-200">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href={`/store/${store.id}`} className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href={`/store/${store.id}/products`} className="hover:text-white transition-colors">Products</Link></li>
              <li><Link href={`/store/${store.id}/cart`} className="hover:text-white transition-colors">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-slate-200">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram size={20} /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
          © {year} {store.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function PublicBlock({ data, storeId }: { data: BlockData; storeId: string }) {
  const props = { id: data.id, data, storeId, isEditable: false };
  switch (data.type) {
    case "hero": return <HeroBlock {...props} />;
    case "about": return <AboutBlock {...props} />;
    case "services": return <ServicesBlock {...props} />;
    case "contact": return <ContactBlock {...props} />;
    case "contactForm": return <ContactFormBlock {...props} />;
    case "testimonials": return <TestimonialsBlock {...props} />;
    case "hours": return <HoursBlock {...props} />;
    case "gallery": return <GalleryBlock {...props} />;
    case "pricing": return <PricingBlock {...props} />;
    case "features": return <FeaturesBlock {...props} />;
    case "faq": return <FAQBlock {...props} />;
    case "team": return <TeamBlock {...props} />;
    case "newsletter": return <NewsletterBlock {...props} />;
    case "stats": return <StatsBlock {...props} />;
    case "productGrid": return <ProductGridBlock {...props} />;
    case "featuredProducts": return <FeaturedProductsBlock {...props} />;
    default: return null;
  }
}

export default function StorePage() {
  const params = useParams<{ storeId: string }>();
  const storeId = params.storeId;
  
  const [store, setStore] = useState<StoreInfo>({ id: storeId, name: "My Store" });
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Fetch store theme
  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await fetch(`/api/stores/${storeId}`);
        if (res.ok) {
          const data = await res.json();
          setStore({ id: storeId, name: data.name || "Store", description: data.description, logo: data.logo, color: data.color, templateId: data.templateId });
        }
      } catch {
        // fallback
      }
    }
    fetchStore();
  }, [storeId]);

  // Fetch builder blocks
  useEffect(() => {
    async function fetchBlocks() {
      setLoading(true);
      try {
        const res = await fetch(`/api/templates/${storeId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.blocks) && data.blocks.length > 0) {
            setBlocks(data.blocks);
          }
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchBlocks();
  }, [storeId]);

  // Cart count
  useEffect(() => {
    const saved = localStorage.getItem("store-cart");
    if (saved) {
      try {
        const items = JSON.parse(saved);
        setCartCount(items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0));
      } catch {
        // ignore
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <StoreNavbar store={store} cartCount={cartCount} />
      <main>
        {blocks.length > 0 ? (
          blocks.map(block => (
            <PublicBlock key={block.id} data={block} storeId={storeId} />
          ))
        ) : (
          <>
            <HeroBlock id="default-hero" data={{ id: "default-hero", type: "hero", props: { title: `Welcome to ${store.name}`, subtitle: store.description || "Discover amazing products." } }} isEditable={false} />
            <FeaturedProductsBlock id="featured" data={{ id: "featured", type: "featuredProducts", props: { title: "Featured Products", subtitle: "Handpicked for you" } }} isEditable={false} storeId={storeId} />
            <ProductGridBlock id="products" data={{ id: "products", type: "productGrid", props: { title: "Our Products", showSearch: true } }} isEditable={false} storeId={storeId} />
          </>
        )}
      </main>
      <StoreFooter store={store} />
    </div>
  );
}
