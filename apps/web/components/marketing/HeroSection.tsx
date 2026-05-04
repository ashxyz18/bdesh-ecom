"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { VideoBackground } from "./VideoBackground";
import { ArrowRight, Play, Check } from "lucide-react";
import { Button } from "../shared/Button";

export function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-black">
      <VideoBackground
        src="/videos/hero-bg.mp4"
      />

      <div className="relative z-10 w-full">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-32 md:py-40">
          <div className={`max-w-3xl transition-all duration-1000 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Be the next<br />big thing
            </h1>

            <p className={`text-base sm:text-lg md:text-xl text-white/70 max-w-[520px] mt-6 transition-all duration-700 delay-200 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}>
              Dream big and build fast with BdeshShop. The world's leading commerce platform, powered by you.
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 mt-8 transition-all duration-700 delay-400 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}>
              <Link href="/register">
                <Button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-base px-8 py-3.5 shadow-lg shadow-[#1d4ed8]/25">
                  Start for free
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="secondary" className="text-base px-8 py-3.5 bg-white/10 text-white border border-white/20 hover:bg-white/20">
                  <Play size={16} className="mr-2" fill="currentColor" />
                  Watch demo
                </Button>
              </Link>
            </div>

            <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 text-sm text-white/50 transition-all duration-700 delay-600 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}>
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
                <Check size={14} className="text-[#1d4ed8]" /> bKash & Nagad
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
