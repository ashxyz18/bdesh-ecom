"use client";

import { Navbar } from "@/components/marketing/Navbar";
import { HeroSection } from "@/components/marketing/HeroSection";
import { TemplatePreview } from "@/components/marketing/TemplatePreview";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { LazySection } from "@/components/shared/LazySection";
import {
  Store, ShoppingBag, CreditCard, Truck, Shield, Smartphone,
  ArrowRight, Check, Star, Eye,
  Zap, Globe, BarChart3, Layers, Palette, MousePointerClick,
  Users, Award, Sparkles,
} from "lucide-react";
import { useState } from "react";
import {
  templates,
  templateCategories,
  features,
  testimonials,
  stats,
  pricingPlans,
} from "@/lib/marketing-data";

const AIWebsiteBuilder = dynamic(() => import("@/components/ai/AIWebsiteBuilder").then(mod => ({ default: mod.AIWebsiteBuilder })), { ssr: false });

const steps = [
  { number: "01", title: "Pick a Template", description: "Choose from our collection", icon: Palette },
  { number: "02", title: "Add Your Products", description: "Upload products with images and prices", icon: ShoppingBag },
  { number: "03", title: "Go Live!", description: "Your store is instantly live with payments", icon: Zap },
];

export default function LandingPage() {
  const [templateFilter, setTemplateFilter] = useState("All");

  const filteredTemplates = templateFilter === "All"
    ? templates
    : templates.filter((t) => t.category === templateFilter);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <HeroSection />

      {/* Stats Bar */}
      <section className="bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Website Builder */}
      <LazySection className="py-20 md:py-28 bg-black border-t border-white/5" placeholderHeight={600}>
        <div className="max-w-[1400px] mx-auto px-6">
          <AIWebsiteBuilder />
        </div>
      </LazySection>

      {/* Templates */}
      <LazySection id="templates" className="py-20 md:py-28 bg-white" placeholderHeight={500}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1d4ed8]/5 text-[#1d4ed8] text-sm font-medium mb-4">
              <Layers size={14} /> Template Gallery
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Choose Your Design</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">Professionally designed templates for every type of shop.</p>
          </div>
          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap" role="tablist">
            {templateCategories.map((cat) => (
              <button key={cat} onClick={() => setTemplateFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  templateFilter === cat ? "bg-[#1d4ed8] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                }`}>{cat}</button>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredTemplates.map((tpl) => (
              <div key={tpl.id} className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="relative h-56">
                  <TemplatePreview templateId={tpl.id} name={tpl.name} />
                  {/* Overlay with name, badges, and preview link */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none">
                    <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-auto">
                      {tpl.isNew && <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full">NEW</span>}
                      {tpl.isPopular && <span className="px-2 py-0.5 bg-[#ffc453]/90 text-black text-[10px] font-bold rounded-full">POPULAR</span>}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-auto">
                      <div>
                        <span className="text-white font-bold text-sm drop-shadow-md">{tpl.name}</span>
                        <p className="text-white/80 text-xs drop-shadow-sm">{tpl.tagline}</p>
                      </div>
                      <Link href={`/preview/${tpl.id}`} target="_blank">
                        <Button size="sm" className="bg-white text-black hover:bg-gray-100 text-xs shadow-lg"><Eye size={12} className="mr-1" /> Preview</Button>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{tpl.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tpl.features.slice(0, 3).map((f) => (
                      <span key={f} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{f}</span>
                    ))}
                  </div>
                  <Link href={`/register?template=${tpl.id}`}>
                    <Button className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white justify-center text-sm">
                      Use Template <ArrowRight size={14} className="ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LazySection>

      {/* How It Works */}
      <LazySection className="py-20 md:py-28 bg-white" placeholderHeight={400}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Live in 3 Simple Steps</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">No technical skills needed.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.number} className="text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${i === 0 ? "bg-[#1d4ed8]/10" : i === 1 ? "bg-blue-500/10" : "bg-purple-500/10"}`}>
                  <step.icon className={`w-7 h-7 ${i === 0 ? "text-[#1d4ed8]" : i === 1 ? "text-blue-500" : "text-purple-500"}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </LazySection>

      {/* Features */}
      <LazySection id="features" className="py-20 md:py-28 bg-gray-50" placeholderHeight={500}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">All the tools to run a successful online store in Bangladesh.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
            {features.map((feature, i) => (
              <div key={feature.title} className={`p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-shadow ${i === 3 ? "md:col-span-2 lg:col-span-4" : "md:col-span-2 lg:col-span-2"}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  i === 0 ? "bg-[#1d4ed8]/10" : i === 1 ? "bg-blue-500/10" : i === 2 ? "bg-amber-500/10" : i === 3 ? "bg-purple-500/10" : i === 4 ? "bg-rose-500/10" : i === 5 ? "bg-cyan-500/10" : "bg-indigo-500/10"
                }`}>
                  <feature.icon className={`w-6 h-6 ${
                    i === 0 ? "text-[#1d4ed8]" : i === 1 ? "text-blue-500" : i === 2 ? "text-amber-500" : i === 3 ? "text-purple-500" : i === 4 ? "text-rose-500" : i === 5 ? "text-cyan-500" : "text-indigo-500"
                  }`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </LazySection>

      {/* Testimonials */}
      <LazySection className="py-20 md:py-28 bg-white" placeholderHeight={400}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by Merchants</h2>
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
      </LazySection>

      {/* Pricing */}
      <LazySection id="pricing" className="py-20 md:py-28 bg-white" placeholderHeight={500}>
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
                <Link href="/register">
                  <Button className={`w-full justify-center ${plan.highlighted ? "bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-md" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                    {plan.cta} <ArrowRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </LazySection>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a] relative overflow-hidden">
        <div className="relative max-w-[1400px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Selling?</h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8 text-lg">Join Bangladeshi businesses already selling online.</p>
          <Link href="/register">
            <Button className="bg-white text-[#1d4ed8] hover:bg-gray-100 text-base font-semibold px-10 py-3.5">
              Create Your Store — It&apos;s Free <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 pt-16 pb-8">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-[#1d4ed8] rounded-lg flex items-center justify-center"><Store className="h-5 w-5 text-white" /></div>
                <span className="font-bold text-xl text-white">BdeshShop</span>
              </Link>
              <p className="text-white/40 text-sm leading-relaxed">The easiest way to create an online store in Bangladesh.</p>
            </div>
            <div><h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                {[{ label: "Features", href: "#features" }, { label: "Templates", href: "#templates" }, { label: "Pricing", href: "#pricing" }, { label: "AI Builder", href: "/ai-builder" }].map((l) => (
                  <li key={l.label}><Link href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div><h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                {[{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Careers", href: "#" }, { label: "Contact", href: "#" }].map((l) => (
                  <li key={l.label}><span className="text-sm text-white/40">{l.label}</span></li>
                ))}
              </ul>
            </div>
            <div><h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                {[{ label: "Privacy Policy", href: "#" }, { label: "Terms of Service", href: "#" }].map((l) => (
                  <li key={l.label}><span className="text-sm text-white/40">{l.label}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/30">&copy; {new Date().getFullYear()} BdeshShop. All rights reserved.</p>
            <p className="text-sm text-white/30">Made with ❤️ in Bangladesh</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
