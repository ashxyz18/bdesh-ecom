import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { HeroSection } from "@/components/marketing/HeroSection";
import { Button } from "@/components/shared/Button";
import { LandingTemplatePreview } from "@/components/marketing/LandingTemplatePreview";
import { BUILTIN_TEMPLATES } from "@/lib/storefront/templates";
import {
  Store,
  ShoppingBag,
  ArrowRight,
  Check,
  Star,
  Zap,
  Palette,
  Shield,
  Truck,
} from "lucide-react";

/**
 * Landing page — fully server-rendered. The previous version was `"use
 * client"` which forced React to ship the entire 350-line tree as JS and
 * hydrate it on every visit. Now only the Navbar megamenu and a few inline
 * client components hydrate; the rest paints as static HTML.
 *
 * Templates are loaded from the in-memory BUILTIN_TEMPLATES registry — zero
 * DB calls, zero waterfalls.
 */

export const revalidate = 3600; // Static for an hour, then re-render in background.

const stats = [
  { value: "10,000+", label: "Active Stores" },
  { value: "50,000+", label: "Products Listed" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

const features = [
  { title: "Easy Setup", description: "Create your store in minutes with our intuitive dashboard. No coding required.", icon: Zap },
  { title: "Secure Payments", description: "Accept payments via bKash, Nagad, SSLCommerz, and cash on delivery.", icon: Shield },
  { title: "Mobile First", description: "Your store looks great on any device. Optimized for mobile shopping.", icon: Palette },
  { title: "Analytics", description: "Track your sales, visitors, and growth with built-in analytics dashboard.", icon: Star },
  { title: "Bangladesh Focus", description: "Built for Bangladeshi businesses with local payment methods and shipping.", icon: Store },
  { title: "Fast Delivery", description: "Integrated courier management for seamless order fulfillment.", icon: Truck },
];

const testimonials = [
  { name: "Rahim Ahmed", role: "Fashion Entrepreneur", company: "Dhaka Styles", quote: "BixelBD made it incredibly easy to take my boutique online. Sales doubled within the first month!", rating: 5 },
  { name: "Fatima Begum", role: "Restaurant Owner", company: "Chittagong Eats", quote: "The food template was perfect. Customers can now order online and we handle delivery seamlessly.", rating: 5 },
  { name: "Kamal Hossain", role: "Electronics Seller", company: "TechBD", quote: "From setup to first sale in under 30 minutes. The platform understood exactly what I needed.", rating: 5 },
];

const pricingPlans = [
  { name: "Starter", price: "0", period: "month", description: "Perfect for trying out", highlighted: false, cta: "Start Free", features: ["1 Store", "Up to 50 Products", "Basic Analytics", "bKash Payments", "Community Support"] },
  { name: "Pro", price: "499", period: "month", description: "For growing businesses", highlighted: true, cta: "Start Pro Trial", features: ["5 Stores", "Unlimited Products", "Advanced Analytics", "All Payment Methods", "Priority Support", "Custom Domain"] },
  { name: "Enterprise", price: "1999", period: "month", description: "For large operations", highlighted: false, cta: "Contact Sales", features: ["Unlimited Stores", "Unlimited Products", "Custom Analytics", "All Payment Methods", "Dedicated Support", "Custom Domain", "API Access", "White Label"] },
];

const steps = [
  { number: "01", title: "Set Up Your Store", description: "Create and customize in minutes", icon: Palette },
  { number: "02", title: "Add Your Products", description: "Upload products with images and prices", icon: ShoppingBag },
  { number: "03", title: "Go Live!", description: "Your store is instantly live with payments", icon: Zap },
];

export default function LandingPage() {
  // Build the small template card list at render time from the in-memory registry.
  const featuredTemplates = BUILTIN_TEMPLATES.slice(0, 3).map((t) => ({
    id: t.slug,
    name: t.name,
    description: t.description,
    thumbnail: t.thumbnail,
    previewUrl: `/templates/preview/${t.slug}`,
  }));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />

      {/* Stats */}
      <section className="bg-gray-950 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Live in 3 Simple Steps</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">No technical skills needed. Get your store online today.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.number} className="text-center relative">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${i === 0 ? "bg-[#1d4ed8]/10" : i === 1 ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
                  <step.icon className={`w-7 h-7 ${i === 0 ? "text-[#1d4ed8]" : i === 1 ? "text-blue-500" : "text-emerald-500"}`} />
                </div>
                <span className="text-xs font-bold text-gray-300 mb-2 block">{step.number}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Beautiful Templates</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Start with a professionally designed template and customize it for your brand.
            </p>
          </div>

          <LandingTemplatePreview templates={featuredTemplates} />

          <div className="text-center mt-12">
            <Link href="/templates">
              <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-[#1d4ed8] hover:border-[#1d4ed8]/30 px-8 py-3 transition-colors">
                View All Templates <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">All the tools to run a successful online store in Bangladesh.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <div key={feature.title} className="p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  i === 0 ? "bg-[#1d4ed8]/10" : i === 1 ? "bg-emerald-500/10" : i === 2 ? "bg-amber-500/10" : i === 3 ? "bg-rose-500/10" : i === 4 ? "bg-cyan-500/10" : "bg-violet-500/10"
                }`}>
                  <feature.icon className={`w-6 h-6 ${
                    i === 0 ? "text-[#1d4ed8]" : i === 1 ? "text-emerald-500" : i === 2 ? "text-amber-500" : i === 3 ? "text-rose-500" : i === 4 ? "text-cyan-500" : "text-violet-500"
                  }`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by Merchants</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">See what Bangladeshi business owners are saying.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (<Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-xs text-gray-400">{t.role}, {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Start Free, Scale As You Grow</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">No hidden fees. No surprises.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`relative flex flex-col p-6 md:p-8 rounded-2xl border bg-white transition-all hover:-translate-y-1 ${
                plan.highlighted ? "border-[#1d4ed8]/30 shadow-xl shadow-[#1d4ed8]/5 scale-[1.02]" : "border-gray-200 hover:shadow-lg"
              }`}>
                {plan.highlighted && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#1d4ed8] text-white text-xs font-bold rounded-full">Most Popular</div>}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                <div className="my-6"><span className="text-4xl font-bold text-gray-900">৳{plan.price}</span><span className="text-gray-400">/{plan.period}</span></div>
                <ul className="flex-1 space-y-3 mb-6">
                  {plan.features.map((f) => (<li key={f} className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-[#1d4ed8] shrink-0" /><span className="text-gray-600">{f}</span></li>))}
                </ul>
                <Link href="/templates">
                  <Button className={`w-full justify-center ${plan.highlighted ? "bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-md" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                    Browse Templates <ArrowRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a] relative overflow-hidden">
        <div className="relative max-w-[1400px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Selling?</h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8 text-lg">Join thousands of Bangladeshi businesses already selling online.</p>
          <Link href="/templates">
            <Button className="bg-white text-[#1d4ed8] hover:bg-gray-100 text-base font-semibold px-10 py-3.5">
              Browse Templates <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-white/10 pt-16 pb-8">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-[#1d4ed8] rounded-lg flex items-center justify-center"><Store className="h-5 w-5 text-white" /></div>
                <span className="font-bold text-xl text-white">BixelBD</span>
              </Link>
              <p className="text-white/40 text-sm leading-relaxed">The easiest way to create an online store in Bangladesh.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                {[
                  { label: "Features", href: "#features" },
                  { label: "Templates", href: "/templates" },
                  { label: "Pricing", href: "#pricing" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                {["About", "Blog", "Careers", "Contact"].map((l) => (
                  <li key={l}><span className="text-sm text-white/40">{l}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                {["Privacy Policy", "Terms of Service"].map((l) => (
                  <li key={l}><span className="text-sm text-white/40">{l}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/30">&copy; {new Date().getFullYear()} BixelBD. All rights reserved.</p>
            <p className="text-sm text-white/30">Made with care in Bangladesh</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
