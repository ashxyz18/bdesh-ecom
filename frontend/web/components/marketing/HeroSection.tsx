import Link from "next/link";
import { ArrowRight, Play, Check } from "lucide-react";
import { Button } from "../shared/Button";
import { VideoBackground } from "./VideoBackground";
import "./hero-animations.css";

/**
 * Server component. Animations are pure CSS (`animate-hero-fade-up`) so the
 * hero text appears immediately on first paint instead of waiting for the
 * client bundle to download, hydrate, and run a useEffect.
 *
 * Honours prefers-reduced-motion via the CSS file.
 */
export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-black">
      <VideoBackground src="/videos/hero-bg.mp4" />

      <div className="relative z-10 w-full">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-32 md:py-40">
          <div className="max-w-3xl">
            <h1 className="animate-hero-fade-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Be the next
              <br />
              big thing
            </h1>

            <p className="animate-hero-fade-up animate-hero-delay-1 text-base sm:text-lg md:text-xl text-white/70 max-w-[520px] mt-6">
              Dream big and build fast with BixelBD. The world&apos;s leading
              commerce platform, powered by you.
            </p>

            <div className="animate-hero-fade-up animate-hero-delay-2 flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/signup">
                <Button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-base px-8 py-3.5 shadow-lg shadow-[#1d4ed8]/25">
                  Start for free
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="secondary"
                  className="text-base px-8 py-3.5 bg-white/10 text-white border border-white/20 hover:bg-white/20"
                >
                  <Play size={16} className="mr-2" fill="currentColor" />
                  Watch demo
                </Button>
              </Link>
            </div>

            <div className="animate-hero-fade-up animate-hero-delay-3 flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 text-sm text-white/50">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#1d4ed8]" /> Free to start
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#1d4ed8]" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#1d4ed8]" /> 99.9% uptime
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#1d4ed8]" /> bKash &amp; Nagad
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
