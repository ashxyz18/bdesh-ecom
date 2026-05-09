import {
  Store, ShoppingBag, CreditCard, Truck, Shield, Smartphone,
  ArrowRight, Check, Star, Play,
  Zap, Globe, BarChart3, Layers, Palette, MousePointerClick,
  Users, Award, Eye,
} from "lucide-react";

export interface Template {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  accent: string;
  category: string;
  features: string[];
  isNew?: boolean;
  isPopular?: boolean;
  isBuilder?: boolean;
}

/** ─── Store Templates (e-commerce) ───────────────────────────────── */
const storeTemplates: Template[] = [
  {
    id: "roseo",
    name: "Roseo",
    tagline: "Premium & Luxurious",
    description: "Dark, elegant design for leather goods, fashion, and premium products",
    color: "from-stone-900 to-amber-900",
    accent: "text-amber-400",
    category: "Fashion",
    features: ["Dark luxury aesthetic", "Product quick view", "Wishlist & cart", "Customer reviews"],
    isPopular: true,
  },
  {
    id: "default",
    name: "Modern Shop",
    tagline: "Clean & Professional",
    description: "Bright, modern layout perfect for any type of product store",
    color: "from-emerald-600 to-teal-700",
    accent: "text-emerald-400",
    category: "General",
    features: ["Clean product grid", "Collection filters", "Fast checkout", "Mobile-first"],
  },
  {
    id: "shopify",
    name: "Minimal",
    tagline: "Simple & Fast",
    description: "Minimalist design focused on speed and conversion for any store",
    color: "from-blue-600 to-indigo-700",
    accent: "text-blue-400",
    category: "General",
    features: ["Ultra-fast loading", "One-page checkout", "Smart search", "Inventory alerts"],
  },
  {
    id: "shopnest",
    name: "ShopNest",
    tagline: "Elegant & Refined",
    description: "Sophisticated design with warm tones for boutique and lifestyle brands",
    color: "from-[#8b7355] to-[#be9f7e]",
    accent: "text-[#be9f7e]",
    category: "Fashion",
    features: ["Warm color palette", "Quick add to cart", "Brand showcase", "Recently viewed"],
  },
  {
    id: "food",
    name: "Foodie",
    tagline: "Fresh & Appetizing",
    description: "Designed specifically for restaurants, bakeries, and food delivery",
    color: "from-orange-500 to-red-600",
    accent: "text-orange-400",
    category: "Food",
    features: ["Menu layout", "Order tracking", "Delivery zones", "Special offers"],
    isNew: true,
  },
  {
    id: "electro",
    name: "Electro",
    tagline: "Tech & Gadgets",
    description: "Dark, futuristic electronics template with spec-driven cards, flash deals, and neon accents",
    color: "from-gray-900 to-cyan-600",
    accent: "text-cyan-400",
    category: "Electronics",
    features: ["Spec-driven cards", "Flash sale hero", "Category icon bar", "Dark tech theme"],
    isPopular: true,
  },
  {
    id: "boutique",
    name: "Boutique",
    tagline: "Elegant Fashion",
    description: "Soft, editorial fashion template with lookbook-style display and blush rose tones",
    color: "from-rose-400 to-pink-600",
    accent: "text-rose-400",
    category: "Fashion",
    features: ["Editorial lookbook", "Quick add overlay", "Blush & rose tones", "Curated collections"],
  },
  {
    id: "grocer",
    name: "Grocer",
    tagline: "Fresh & Organic",
    description: "Fresh grocery template with category navigation, freshness badges, and same-day delivery",
    color: "from-green-500 to-emerald-600",
    accent: "text-emerald-400",
    category: "Grocery",
    features: ["Category navigation", "Freshness badges", "Same-day delivery", "Bulk pricing"],
    isNew: true,
  },
  {
    id: "salon",
    name: "Salon Pro",
    tagline: "Beauty & Wellness",
    description: "Professional salon template with service menu, booking, and stylist profiles",
    color: "from-purple-500 to-pink-600",
    accent: "text-pink-400",
    category: "Salon",
    features: ["Service menu", "Booking calendar", "Stylist profiles", "Price list"],
    isNew: true,
  },
  {
    id: "tuition",
    name: "Tuition Hub",
    tagline: "Learn & Grow",
    description: "Education template with course listings, instructor profiles, and batch schedules",
    color: "from-blue-600 to-indigo-700",
    accent: "text-blue-400",
    category: "Tuition",
    features: ["Course listings", "Instructor profiles", "Batch schedules", "Enrollment"],
    isNew: true,
  },
  {
    id: "clinic",
    name: "MediClinic",
    tagline: "Healthcare & Trust",
    description: "Healthcare template with doctor profiles, appointment booking, and service listings",
    color: "from-emerald-500 to-teal-700",
    accent: "text-teal-400",
    category: "Clinic",
    features: ["Doctor profiles", "Appointment booking", "Service list", "Timing schedule"],
    isNew: true,
  },
  {
    id: "pharmacy",
    name: "PharmaCart",
    tagline: "Medicines Delivered",
    description: "Pharmacy template with medicine catalog, prescription upload, and delivery zones",
    color: "from-red-500 to-rose-700",
    accent: "text-rose-400",
    category: "Pharmacy",
    features: ["Medicine catalog", "Prescription upload", "Delivery zones", "Health articles"],
    isNew: true,
  },
  {
    id: "corporate",
    name: "BizHub",
    tagline: "Enterprise Excellence",
    description: "Corporate template with service portfolio, team section, and case studies",
    color: "from-slate-700 to-gray-900",
    accent: "text-slate-400",
    category: "Corporate",
    features: ["Service portfolio", "Team section", "Case studies", "Contact form"],
    isPopular: true,
  },
  {
    id: "portfolio",
    name: "CreativeFolio",
    tagline: "Showcase Your Work",
    description: "Creative portfolio with project gallery, about section, and skills showcase",
    color: "from-violet-500 to-purple-700",
    accent: "text-purple-400",
    category: "Portfolio",
    features: ["Project gallery", "About section", "Skills showcase", "Contact form"],
    isNew: true,
  },
];

/** ─── Builder/Website Templates (pre-built) ─────────────────────────── */
const builderTemplates: Template[] = [
  {
    id: "startup-saas",
    name: "Startup SaaS",
    tagline: "Modern SaaS Landing",
    description: "Modern SaaS landing page with hero, features, pricing, and FAQ. Perfect for startups.",
    color: "from-indigo-500 to-purple-600",
    accent: "text-indigo-400",
    category: "Business",
    features: ["Hero section", "Feature grid", "Pricing tables", "FAQ", "Testimonials"],
    isNew: true,
    isBuilder: true,
  },
  {
    id: "restaurant-bistro",
    name: "Bistro & Grill",
    tagline: "Restaurant & Cafe",
    description: "Elegant restaurant website with menu, gallery, hours, and contact. Perfect for restaurants.",
    color: "from-red-600 to-orange-500",
    accent: "text-red-400",
    category: "Restaurant",
    features: ["Menu showcase", "Image gallery", "Hours & location", "Reservations", "Testimonials"],
    isNew: true,
    isBuilder: true,
  },
  {
    id: "law-firm",
    name: "Legal Partners",
    tagline: "Professional Law",
    description: "Professional law firm website with services, team profiles, testimonials, and contact form.",
    color: "from-slate-800 to-slate-900",
    accent: "text-slate-400",
    category: "Professional",
    features: ["Practice areas", "Team profiles", "Client testimonials", "Contact form", "Case stats"],
    isNew: true,
    isBuilder: true,
  },
  {
    id: "creative-agency",
    name: "Creative Studio",
    tagline: "Bold & Creative",
    description: "Bold creative agency website with portfolio, services, team, and stats. For agencies.",
    color: "from-pink-500 to-rose-600",
    accent: "text-pink-400",
    category: "Creative",
    features: ["Portfolio gallery", "Services showcase", "Team section", "Stats counter", "Testimonials"],
    isNew: true,
    isBuilder: true,
  },
  {
    id: "medical-clinic",
    name: "HealthFirst Clinic",
    tagline: "Medical & Healthcare",
    description: "Trustworthy medical clinic website with services, team, hours, testimonials, and contact.",
    color: "from-emerald-500 to-teal-600",
    accent: "text-teal-400",
    category: "Healthcare",
    features: ["Service listings", "Doctor profiles", "Patient testimonials", "FAQ", "Contact"],
    isNew: true,
    isBuilder: true,
  },
  {
    id: "fitness-gym",
    name: "PowerFit Gym",
    tagline: "Fitness & Wellness",
    description: "Motivating fitness website with features, pricing, team, and testimonials. For gyms.",
    color: "from-orange-500 to-amber-600",
    accent: "text-amber-400",
    category: "Fitness",
    features: ["Membership plans", "Trainer profiles", "Class schedules", "Stats", "Contact"],
    isNew: true,
    isBuilder: true,
  },
  {
    id: "nike-ecommerce",
    name: "Nike Style Store",
    tagline: "Athletic Store",
    description: "Bold athletic footwear and apparel store inspired by Nike's iconic design. Features product showcase, categories, and member benefits.",
    color: "from-black to-slate-800",
    accent: "text-slate-400",
    category: "E-Commerce",
    features: ["Product showcase", "Categories", "Member benefits", "Testimonials", "Newsletter"],
    isNew: true,
    isPopular: true,
    isBuilder: true,
  },
];

/** ─── Merged template list ───────────────────────────────────────── */
export const templates: Template[] = [...storeTemplates, ...builderTemplates];

export const templateCategories = [
  "All", "General", "Fashion", "Food", "Electronics", "Grocery",
  "Salon", "Tuition", "Cl Clinic", "Pharmacy", "Corporate", "Portfolio",
  "Business", "Restaurant", "Professional", "Creative", "Healthcare", "Fitness", "E-Commerce",
];

// Category group mapping for the website template section
export const categoryGroups: Record<string, string> = {
  // Store templates
  General: "Online Store",
  Electronics: "Online Store",
  Grocery: "Online Store",
  Fashion: "Fashion & Beauty",
  Salon: "Fashion & Beauty",
  Corporate: "Home Services",
  Portfolio: "Home Services",
  Tuition: "Home Services",
  Clinic: "Health & Fitness",
  Pharmacy: "Health & Fitness",
  Food: "Restaurants & Food",
  // Builder templates
  Business: "Business",
  Restaurant: "Restaurants & Food",
  Professional: "Business",
  Creative: "Creative",
  Healthcare: "Health & Fitness",
  Fitness: "Health & Fitness",
  "E-Commerce": "Online Store",
};

export const websiteTemplateCategories = [
  "All Templates",
  "Online Store",
  "Coming Soon",
  "Fashion & Beauty",
  "Home Services",
  "Health & Fitness",
  "Restaurants & Food",
  "Business",
  "Creative",
];

export function getTemplatesByGroup(group: string): Template[] {
  if (group === "All Templates") return templates;
  if (group === "Coming Soon") return templates.filter((t) => t.isNew);
  return templates.filter((t) => categoryGroups[t.category] === group);
}

export interface Feature {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}

export const features: Feature[] = [
  { icon: CreditCard, title: "bKash, Nagad & COD", description: "Accept payments through bKash, Nagad, Rocket, and Cash on Delivery." },
  { icon: ShoppingBag, title: "Product Management", description: "Add products with variants, multiple images, track inventory, and organize into collections." },
  { icon: Truck, title: "Order & Delivery", description: "Manage orders, track deliveries, and notify customers with automated updates." },
  { icon: Shield, title: "Secure & Reliable", description: "SSL encryption, secure checkout, and 99.9% uptime guarantee for your store." },
  { icon: Smartphone, title: "Mobile Optimized", description: "Every template is fully responsive and optimized for mobile shopping experiences." },
  { icon: Zap, title: "Lightning Fast", description: "Optimized performance with CDN, lazy loading, and efficient asset delivery." },
  { icon: Globe, title: "Custom Domain", description: "Connect your own domain or get a free .bdesh.shop subdomain instantly." },
  { icon: BarChart3, title: "Analytics Dashboard", description: "Track sales, visitors, conversion rates, and customer behavior in real-time." },
];

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    name: "Rahim Ahmed",
    role: "Founder",
    company: "Dhaka Fashion House",
    quote: "I launched my boutique online store in under 30 minutes. The Roseo template is absolutely stunning and my customers love it!",
    rating: 5,
  },
  {
    name: "Fatima Khan",
    role: "Owner",
    company: "Tasty Bites Restaurant",
    quote: "The Foodie template transformed our online ordering. Orders increased by 200% in the first month alone.",
    rating: 5,
  },
  {
    name: "Kamal Hossain",
    role: "CEO",
    company: "TechZone BD",
    quote: "Electro template is perfect for our gadget store. The dark theme and spec cards make our products look premium.",
    rating: 5,
  },
];

export interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: 0,
    period: "forever",
    description: "Perfect for trying out Bdesh",
    features: ["1 store", "3 products", "Basic templates", "Bdesh subdomain", "Community support"],
    cta: "Start free",
  },
  {
    name: "Business",
    price: 999,
    period: "month",
    description: "Best for growing businesses",
    features: ["3 stores", "Unlimited products", "All templates", "Custom domain", "Priority support", "Analytics dashboard", "bKash/Nagad integration"],
    highlighted: true,
    cta: "Start Business",
  },
  {
    name: "Enterprise",
    price: 2999,
    period: "month",
    description: "For large scale operations",
    features: ["Unlimited stores", "Unlimited products", "White-label option", "API access", "Dedicated manager", "Custom integrations", "SLA guarantee"],
    cta: "Contact Sales",
  },
];

export interface Stat {
  value: string;
  label: string;
}

export const stats: Stat[] = [
  { value: "2,500+", label: "Stores Created" },
  { value: "₹50L+", label: "GMV Processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "User Rating" },
];
