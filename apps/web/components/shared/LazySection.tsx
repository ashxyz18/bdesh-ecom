"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  placeholderHeight?: number;
}

export function LazySection({ children, className = "", id, placeholderHeight = 400 }: LazySectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={className} style={{ minHeight: visible ? undefined : placeholderHeight }}>
      {visible ? children : <div className="skeleton w-full" style={{ height: placeholderHeight }} />}
    </section>
  );
}
