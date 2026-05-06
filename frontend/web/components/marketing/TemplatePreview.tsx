"use client";

import { useState, useRef, useEffect } from "react";

interface TemplatePreviewProps {
  templateId: string;
  name: string;
  websiteType?: string;
}

export function TemplatePreview({ templateId, name, websiteType = "ecommerce" }: TemplatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);
  const [loaded, setLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => setScale(el.offsetWidth / 1280);
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const getDomain = (websiteType: string) => {
    switch (websiteType) {
      case "ecommerce":
        return "bdesh.shop";
      case "portfolio":
        return "bdesh.portfolio";
      case "corporate":
        return "bdesh.biz";
      case "blog":
        return "bdesh.blog";
      default:
        return "bdesh.site";
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gray-100"
      style={{ paddingBottom: "62%" }}
    >
      {/* Browser chrome */}
      <div className="absolute top-0 inset-x-0 h-7 bg-gray-200/90 z-10 flex items-center px-2.5 gap-1.5 border-b border-gray-300/50">
        <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
        <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
        <div className="w-2 h-2 rounded-full bg-[#28c840]" />
        <div className="ml-2 flex-1 h-4 bg-white/70 rounded text-[8px] text-gray-400 flex items-center px-2 max-w-[180px] truncate">
          {name.toLowerCase()}.{getDomain(websiteType)}
        </div>
      </div>

      {/* Loading skeleton */}
      {!loaded && (
        <div className="absolute inset-x-0 top-7 bottom-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}

      {/* Iframe preview */}
      <div className="absolute inset-x-0 top-7 bottom-0 overflow-hidden">
        {isVisible && (
          <iframe
            src={`/preview/${templateId}?websiteType=${websiteType}`}
            className="pointer-events-none border-0"
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: "1280px",
              height: "1600px",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            title={`${name} preview`}
          />
        )}
      </div>
    </div>
  );
}
