"use client";

import React from "react";
import { BlockComponentProps } from "./types";
import { EditableText } from "./EditableText";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const socialIconMap: Record<string, React.ElementType> = {
  Facebook, Twitter, Linkedin, Instagram
};

export function TeamBlock({ id, data, isEditable, isActive, onUpdate }: BlockComponentProps) {
  const { 
    title = "Meet Our Team",
    subtitle = "The talented people behind our success.",
    members = [
      { name: "John Doe", role: "CEO & Founder", bio: "Visionary leader with 15+ years of experience.", social: { linkedin: "#", twitter: "#" } },
      { name: "Jane Smith", role: "CTO", bio: "Tech expert passionate about innovation.", social: { linkedin: "#", twitter: "#" } },
      { name: "Mike Johnson", role: "Design Lead", bio: "Creative mind with an eye for detail.", social: { linkedin: "#", twitter: "#" } },
      { name: "Sarah Williams", role: "Marketing Director", bio: "Strategic thinker with data-driven approach.", social: { linkedin: "#", twitter: "#" } }
    ]
  } = data.props;

  const handleMemberChange = (index: number, field: string, value: string) => {
    if (!onUpdate) return;
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    onUpdate(id, { props: { ...data.props, members: newMembers } });
  };

  return (
    <div className={`py-20 px-6 bg-slate-50 ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <EditableText
            tagName="h2"
            className="text-4xl font-bold text-slate-900 mb-4"
            value={title}
            onChange={(val) => onUpdate?.(id, { props: { ...data.props, title: val } })}
            placeholder="Team Title"
          />
          <EditableText
            className="text-xl text-slate-600 max-w-2xl mx-auto"
            value={subtitle}
            multiline
            onChange={(val) => onUpdate?.(id, { props: { ...data.props, subtitle: val } })}
            placeholder="Team Subtitle"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((member: any, i: number) => (
            <div 
              key={i} 
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full mb-6 flex items-center justify-center text-4xl font-bold">
                {member.name ? member.name.charAt(0) : "U"}
              </div>
              <EditableText
                tagName="h3"
                className="text-xl font-bold text-slate-900 mb-1"
                value={member.name}
                onChange={(val) => handleMemberChange(i, "name", val)}
                placeholder="Name"
              />
              <EditableText
                className="text-emerald-600 font-semibold mb-3"
                value={member.role}
                onChange={(val) => handleMemberChange(i, "role", val)}
                placeholder="Role"
              />
              <EditableText
                className="text-slate-600 leading-relaxed mb-6"
                value={member.bio}
                multiline
                onChange={(val) => handleMemberChange(i, "bio", val)}
                placeholder="Bio"
              />
              <div className="flex gap-3">
                {Object.entries(member.social || {}).map(([platform, url]: [string, any]) => {
                  const IconComponent = socialIconMap[platform.charAt(0).toUpperCase() + platform.slice(1)] || null;
                  return IconComponent ? (
                    <a key={platform} href={url} className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                      <IconComponent size={14} />
                    </a>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
