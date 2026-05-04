"use client";

import { useState } from "react";
import {
  Share2, Facebook, Instagram, ExternalLink, Copy, Sparkles,
  MessageSquare, Image, Calendar, Send, Check, X, Loader2,
  Twitter, Youtube, Linkedin,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useDashboard } from "../../DashboardContext";

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  imageUrl?: string;
  status: "draft" | "scheduled" | "published";
  scheduledAt?: string;
  createdAt: string;
}

const platforms = [
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    description: "Share to your page or group",
    connected: false,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    hoverColor: "hover:from-purple-600 hover:to-pink-600",
    description: "Share product photos & stories",
    connected: false,
  },
  {
    id: "twitter",
    name: "Twitter / X",
    icon: Twitter,
    color: "bg-slate-800",
    hoverColor: "hover:bg-slate-900",
    description: "Post updates and promotions",
    connected: false,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "bg-red-600",
    hoverColor: "hover:bg-red-700",
    description: "Share product videos",
    connected: false,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700",
    hoverColor: "hover:bg-blue-800",
    description: "Professional network sharing",
    connected: false,
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: MessageSquare,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    description: "Send to customer lists",
    connected: false,
  },
];

const mockPosts: SocialPost[] = [
  {
    id: "1",
    platform: "facebook",
    content: "🎉 Eid Mubarak! Get 20% off on all products this festive season. Shop now at our online store! #EidSale #Bangladesh",
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    platform: "instagram",
    content: "New arrivals just dropped! ✨ Check out our latest collection. Link in bio.",
    status: "draft",
    createdAt: new Date().toISOString(),
  },
];

export default function SocialPage() {
  const { activeStore } = useDashboard();
  const [posts, setPosts] = useState<SocialPost[]>(mockPosts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newPost, setNewPost] = useState({
    platform: "facebook",
    content: "",
    imageUrl: "",
    scheduledAt: "",
  });

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return;
    setCreating(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const post: SocialPost = {
        id: Date.now().toString(),
        platform: newPost.platform,
        content: newPost.content,
        imageUrl: newPost.imageUrl || undefined,
        status: newPost.scheduledAt ? "scheduled" : "draft",
        scheduledAt: newPost.scheduledAt || undefined,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [post, ...prev]);
      setShowCreateModal(false);
      setNewPost({ platform: "facebook", content: "", imageUrl: "", scheduledAt: "" });
    } finally {
      setCreating(false);
    }
  };

  const handleAIGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Generate a catchy social media post for my online store "${activeStore?.name || "My Store"}" in Bangladesh. Include relevant hashtags. Make it engaging and suitable for ${newPost.platform}. Keep it under 280 characters.`,
            },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewPost((prev) => ({ ...prev, content: data.message || data.content || "" }));
      }
    } catch {
      // Fallback content
      setNewPost((prev) => ({
        ...prev,
        content: `🎉 Special offer at ${activeStore?.name || "our store"}! Shop the best products in Bangladesh with fast delivery. bKash & Nagad accepted! 🛒 #Bangladesh #OnlineShopping #BdeshShop`,
      }));
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const platformIcon = (id: string) => {
    const p = platforms.find((pl) => pl.id === id);
    return p ? p.icon : Share2;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Share2 size={24} className="text-[#008060]" /> Social Media
          </h1>
          <p className="text-slate-500 mt-1">Share your store and products on social media</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#008060] hover:bg-[#006A4E] text-white"
        >
          <Plus size={16} className="mr-2" /> New Post
        </Button>
      </div>

      {/* Platform Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${platform.color} flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{platform.name}</h3>
                  <p className="text-xs text-slate-500">{platform.description}</p>
                </div>
              </div>
              <Button className={`w-full ${platform.color} ${platform.hoverColor} text-white text-sm`}>
                <ExternalLink size={14} className="mr-1.5" /> Connect {platform.name}
              </Button>
            </div>
          );
        })}
      </div>

      {/* AI Post Generator */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#008060]/5 to-emerald-50 border border-[#008060]/20 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-[#008060]" />
          <h3 className="font-semibold text-slate-900">AI Social Post Generator</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Let AI create engaging social media posts from your product catalog, optimized for Bangladesh audience
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setNewPost({ platform: "facebook", content: "", imageUrl: "", scheduledAt: "" });
              setShowCreateModal(true);
            }}
            className="bg-[#008060] hover:bg-[#006A4E] text-white text-sm"
          >
            <Sparkles size={14} className="mr-1.5" /> Generate with AI
          </Button>
          <Button variant="outline" className="text-sm border-slate-200 text-slate-700">
            <Image size={14} className="mr-1.5" /> From Product
          </Button>
        </div>
      </div>

      {/* Scheduled Posts */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Post Queue</h2>
          <span className="text-xs text-slate-400">{posts.length} posts</span>
        </div>
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No posts scheduled</h3>
            <p className="text-slate-500 mb-6">Create your first social media post</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#008060] hover:bg-[#006A4E] text-white"
            >
              <Plus size={16} className="mr-2" /> Create Post
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {posts.map((post) => {
              const PlatformIcon = platformIcon(post.platform);
              const platform = platforms.find((p) => p.id === post.platform);
              return (
                <div key={post.id} className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${platform?.color || "bg-slate-500"} flex items-center justify-center shrink-0 mt-0.5`}>
                      <PlatformIcon size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-900">{platform?.name || post.platform}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[post.status]}`}>
                          {post.status}
                        </span>
                        {post.scheduledAt && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Calendar size={10} /> {new Date(post.scheduledAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{post.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Create Social Post</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {platforms.slice(0, 6).map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setNewPost({ ...newPost, platform: p.id })}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                          newPost.platform === p.id
                            ? "border-[#008060] bg-[#008060]/5 text-[#008060]"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <Icon size={14} />
                        {p.name.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-700">Content</label>
                  <button
                    onClick={handleAIGenerate}
                    disabled={generating}
                    className="flex items-center gap-1 text-xs font-medium text-[#008060] hover:text-[#006A4E]"
                  >
                    {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {generating ? "Generating..." : "AI Generate"}
                  </button>
                </div>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm resize-none"
                  placeholder="Write your post content or use AI to generate..."
                />
                <p className="text-xs text-slate-400 mt-1">{newPost.content.length} characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Image URL (optional)</label>
                <input
                  type="url"
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Schedule (optional)</label>
                <input
                  type="datetime-local"
                  value={newPost.scheduledAt}
                  onChange={(e) => setNewPost({ ...newPost, scheduledAt: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="text-sm">
                Cancel
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={creating || !newPost.content.trim()}
                className="bg-[#008060] hover:bg-[#006A4E] text-white text-sm"
              >
                {creating ? (
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                ) : newPost.scheduledAt ? (
                  <Calendar size={14} className="mr-1.5" />
                ) : (
                  <Send size={14} className="mr-1.5" />
                )}
                {newPost.scheduledAt ? "Schedule Post" : "Save Draft"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Plus({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
