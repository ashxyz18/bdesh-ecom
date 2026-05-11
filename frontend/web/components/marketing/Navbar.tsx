"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../shared/Button";
import {
  Monitor, Palette, Globe, User, Sparkles, ShoppingBag,
  MessageCircle, Store, Smartphone, Share2, Globe2,
  Building2, Map, Megaphone, Mail, Tag, BarChart3,
  CreditCard, Wallet, Receipt, Bot, Grid3X3, Code2,
  ChevronRight, ArrowRight, Menu, X, ChevronDown, ShieldCheck, Zap,
} from "lucide-react";

interface MenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  desc: string;
  href: string;
}

interface MenuColumn {
  title: string;
  items: MenuItem[];
}

const productsMenu: { columns: MenuColumn[]; promo: { title: string; card: { title: string; description: string; href: string } }; footer: MenuItem[] } = {
  columns: [
    {
      title: "BUILD YOUR WEBSITE",
      items: [
        { icon: Palette, label: "Templates", desc: "Pre-built store designs", href: "/#templates" },
        { icon: Monitor, label: "Customize", desc: "Personalize your store", href: "/register" },
        { icon: Globe, label: "Domains", desc: "Custom URLs", href: "/register" },
        { icon: User, label: "Customer Accounts", desc: "Login management", href: "/login" },
        { icon: Sparkles, label: "Sidekick", desc: "AI assistant", href: "/#features" },
      ],
    },
    {
      title: "SELL ANYWHERE",
      items: [
        { icon: ShoppingBag, label: "Online", desc: "Your storefront", href: "/register" },
        { icon: MessageCircle, label: "AI Chats", desc: "Conversational commerce", href: "#features" },
        { icon: Store, label: "Point of Sale", desc: "In-person selling", href: "/register" },
        { icon: Smartphone, label: "Shop App", desc: "Shopping app", href: "/#features" },
        { icon: Share2, label: "Social & Marketplaces", desc: "Multi-channel", href: "/#features" },
        { icon: Globe2, label: "Global", desc: "International sales", href: "/register" },
        { icon: Building2, label: "B2B", desc: "Wholesale", href: "/register" },
        { icon: Map, label: "Across Markets", desc: "Regional expansion", href: "/#features" },
      ],
    },
    {
      title: "MARKETING & ANALYTICS",
      items: [
        { icon: Megaphone, label: "Advertising & Campaigns", desc: "Reach more customers", href: "/#pricing" },
        { icon: Mail, label: "Email & Customer Chat", desc: "Stay connected", href: "/register" },
        { icon: Tag, label: "Discounts", desc: "Boost sales", href: "/#pricing" },
        { icon: BarChart3, label: "Analytics", desc: "Track performance", href: "/#features" },
      ],
    },
    {
      title: "GET PAID",
      items: [
        { icon: CreditCard, label: "Checkout", desc: "One-click buy", href: "/register" },
        { icon: Wallet, label: "Payments", desc: "bKash, Nagad & more", href: "/#features" },
        { icon: Receipt, label: "Taxes", desc: "Auto-calculate", href: "/#features" },
      ],
    },
  ],
  promo: {
    title: "NON-STOP INNOVATION",
    card: {
      title: "BixelBD Editions",
      description: "150+ updates to BixelBD, twice a year.",
      href: "/register",
    },
  },
  footer: [
    { icon: Bot, label: "Commerce for Agents", desc: "Build with our agent tools", href: "/register" },
    { icon: Grid3X3, label: "App Store", desc: "Largest commerce ecosystem", href: "/#features" },
    { icon: Code2, label: "Developer Docs", desc: "Dev docs, CLI, and more", href: "/register" },
  ],
};

const navItems = [
  { label: "Why BixelBD", href: "/#features", hasDropdown: false },
  { label: "Products", href: "#", hasDropdown: true },
  { label: "Pricing", href: "/#pricing", hasDropdown: false },
  { label: "Enterprise", href: "/register", hasDropdown: false },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuHoverClass =
    "flex items-start gap-3 p-2 -ml-2 rounded-lg hover:bg-white/10 group transition-colors";

  const MenuLink = ({ item }: { item: MenuItem }) => (
    <Link
      href={item.href}
      className={menuHoverClass}
      onClick={() => { setActiveDropdown(null); setMobileMenuOpen(false); }}
    >
      <item.icon size={18} className="text-white/70 mt-0.5 shrink-0 group-hover:text-[#1d4ed8] transition-colors" />
      <div>
        <div className="text-sm font-medium text-white group-hover:text-[#1d4ed8] transition-colors">
          {item.label}
        </div>
        <div className="text-xs text-white/60 mt-0.5 leading-tight">{item.desc}</div>
      </div>
    </Link>
  );

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled || activeDropdown
            ? "bg-black/40 backdrop-blur-2xl border-b border-white/10"
            : "bg-transparent border-b border-transparent"
        }`}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L2 8v4c0 6.627 5.373 12 12 12s12-5.373 12-12V8L14 2z" fill="#1d4ed8"/>
                <path d="M14 8l-6 3.5v7L14 22l6-3.5v-7L14 8z" fill="#1d4ed8" fillOpacity="0.3"/>
                <path d="M14 10l-3.5 2v4L14 18l3.5-2v-4L14 10z" fill="#1d4ed8" fillOpacity="0.6"/>
              </svg>
              <span className="font-bold text-white text-lg">BixelBD</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
                >
                  {item.hasDropdown ? (
                    <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white/70 hover:text-white rounded-lg transition-colors">
                      {item.label}
                      <ChevronDown size={14} className={`transition-transform ${activeDropdown === item.label ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white/70 hover:text-white rounded-lg transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-white/70 hover:text-white">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-lg shadow-[#1d4ed8]/20">
                Start for free <ArrowRight size={16} className="ml-1" />
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Products dropdown - full-width glassmorphic */}
        {activeDropdown === "Products" && (
          <div className="absolute inset-x-0 top-full bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-w-[1400px] mx-auto px-6 py-8">
              <div className="grid grid-cols-5 gap-8">
                {productsMenu.columns.map((column) => (
                  <div key={column.title}>
                    <h3 className="text-[11px] font-semibold tracking-wider text-[#1d4ed8] mb-4 uppercase">
                      {column.title}
                    </h3>
                    <div className="space-y-1">
                      {column.items.map((item) => (
                        <MenuLink key={item.label} item={item} />
                      ))}
                    </div>
                  </div>
                ))}

                <div>
                  <h3 className="text-[11px] font-semibold tracking-wider text-[#1d4ed8] mb-4 uppercase">
                    {productsMenu.promo.title}
                  </h3>
                  <Link
                    href={productsMenu.promo.card.href}
                    className="block bg-white/10 rounded-xl p-5 border border-white/10 hover:bg-white/[0.12] transition-colors"
                  >
                    <div className="w-full h-32 bg-gradient-to-br from-[#1d4ed8]/20 to-[#1e3a8a]/20 rounded-lg mb-4 flex items-center justify-center">
                      <Sparkles size={32} className="text-[#1d4ed8]" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">
                      {productsMenu.promo.card.title}
                    </h4>
                    <p className="text-xs text-white/60 mt-1">
                      {productsMenu.promo.card.description}
                    </p>
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/[0.04] px-6">
              <div className="max-w-[1400px] mx-auto py-5">
                <div className="grid grid-cols-3 gap-8">
                  {productsMenu.footer.map((item) => (
                    <MenuLink key={item.label} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-black/80 backdrop-blur-2xl border-l border-white/10 overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-lg">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left text-white/70 hover:text-white py-2.5 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                {/* Mobile: all mega menu items */}
                {productsMenu.columns.map((column) => (
                  <div key={column.title}>
                    <p className="text-[10px] font-semibold tracking-wider text-[#1d4ed8] mb-2 uppercase mt-4">
                      {column.title}
                    </p>
                    <div className="space-y-0.5">
                      {column.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 py-2 text-sm text-white/60 hover:text-white"
                        >
                          <item.icon size={16} className="text-white/50 shrink-0" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-center text-white/70">Log in</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center bg-[#1d4ed8] hover:bg-[#1e40af] text-white">
                    Start for free <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
