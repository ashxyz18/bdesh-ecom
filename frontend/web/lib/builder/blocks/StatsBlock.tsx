"use client";

import React, { useEffect, useState, useRef } from "react";
import { BlockComponentProps } from "./types";
import { EditableText } from "./EditableText";
import { Users, Star, Award, TrendingUp } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Users, Star, Award, TrendingUp
};

interface StatItem {
  icon: string;
  value: string;
  label: string;
}

export function StatsBlock({ id, data, isEditable, isActive, onUpdate }: BlockComponentProps) {
  const statsProp = data.props.stats as StatItem[] | undefined;
  const title = (data.props.title as string) || "Our Impact";
  const subtitle = (data.props.subtitle as string) || "Numbers that speak for themselves.";
  const stats: StatItem[] = statsProp ?? [
    { icon: "Users", value: "10,000+", label: "Happy Customers" },
    { icon: "Star", value: "4.9", label: "Average Rating" },
    { icon: "Award", value: "50+", label: "Awards Won" },
    { icon: "TrendingUp", value: "99%", label: "Success Rate" }
  ];

  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      stats.forEach((stat: StatItem, index: number) => {
        const target = parseInt(stat.value.replace(/[^0-9]/g, '')) || 0;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setCounts(prev => {
            const newCounts = [...prev];
            newCounts[index] = Math.floor(current);
            return newCounts;
          });
        }, duration / steps);
      });
    }
  }, [isVisible, stats]);

  const handleStatChange = (index: number, field: string, value: string) => {
    if (!onUpdate) return;
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onUpdate(id, { props: { ...data.props, stats: newStats } });
  };

  const formatValue = (value: string, count: number) => {
    if (value.includes('%')) return `${count}%`;
    if (value.includes('+')) return `${count.toLocaleString()}+`;
    return count.toLocaleString();
  };

  return (
    <div ref={ref} className={`py-20 px-6 bg-slate-900 ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <EditableText
            tagName="h2"
            className="text-4xl font-bold text-white mb-4"
            value={title}
            onChange={(val) => onUpdate?.(id, { props: { ...data.props, title: val } })}
            placeholder="Stats Title"
          />
          <EditableText
            className="text-xl text-slate-400 max-w-2xl mx-auto"
            value={subtitle}
            multiline
            onChange={(val) => onUpdate?.(id, { props: { ...data.props, subtitle: val } })}
            placeholder="Stats Subtitle"
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat: StatItem, i: number) => {
            const IconComponent = iconMap[stat.icon] || TrendingUp;
            const displayValue = isVisible ? formatValue(stat.value, counts[i]) : "0";
            
            return (
              <div 
                key={i} 
                className="text-center p-8 rounded-3xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:scale-105"
              >
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <IconComponent size={28} />
                </div>
                <div className="text-5xl font-extrabold text-white mb-2 transition-all duration-500">
                  {isVisible ? displayValue : "0"}
                </div>
                <EditableText
                  className="text-slate-400 font-medium"
                  value={stat.label}
                  onChange={(val) => handleStatChange(i, "label", val)}
                  placeholder="Stat Label"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
