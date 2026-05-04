"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Loader2, ArrowRight } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "bn";
  storeContext?: { storeName?: string; productsCount?: number; ordersCount?: number };
}

export function AIAssistantPanel({
  isOpen,
  onClose,
  lang,
  storeContext,
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        lang === "bn"
          ? `হ্যালো! 👋 আমি BdeshBot, আপনার এআই ই-কমার্স অ্যাসিস্ট্যান্ট।\n\nআমি সাহায্য করতে পারি:\n• স্টোর সেটআপ ও টেমপ্লেট নির্বাচন\n• প্রোডাক্ট বিবরণ তৈরি\n• মার্কেটিং কৌশল ও ক্যাম্পেইন\n• এসইও অপটিমাইজেশন\n• বিকাশ/নগদ পেমেন্ট সেটআপ\n• ডেলিভারি ম্যানেজমেন্ট\n\nআমি কীভাবে সাহায্য করতে পারি?`
          : `Hello! 👋 I'm BdeshBot, your AI e-commerce assistant.\n\nI can help with:\n• Store setup & template selection\n• Product descriptions\n• Marketing strategies & campaigns\n• SEO optimization\n• bKash/Nagad payment setup\n• Delivery management\n\nHow can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickActions = [
    {
      label: lang === "bn" ? "টেমপ্লেট সুপারিশ" : "Recommend Template",
      query:
        lang === "bn"
          ? "আমার ব্যবসার জন্য একটি টেমপ্লেট সুপারিশ করুন"
          : "Recommend a template for my business",
    },
    {
      label: lang === "bn" ? "মার্কেটিং টিপস" : "Marketing Tips",
      query:
        lang === "bn"
          ? "বাংলাদেশে ই-কমার্স মার্কেটিং টিপস দিন"
          : "Give me e-commerce marketing tips for Bangladesh",
    },
    {
      label: lang === "bn" ? "প্রোডাক্ট বিবরণ" : "Product Description",
      query: "Write a product description for my store",
    },
    {
      label: lang === "bn" ? "এসইও সাহায্য" : "SEO Help",
      query: "How do I optimize my store for search engines?",
    },
  ];

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-lang": lang,
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: input },
          ],
        }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.content ||
          (lang === "bn" ? "উত্তর তৈরি করা যায়নি" : "Could not generate response"),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            lang === "bn"
              ? "দুঃখিত, একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন।"
              : "Sorry, an error occurred. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    setInput(query);
    const msg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
    setLoading(true);

    fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-lang": lang,
      },
      body: JSON.stringify({
        messages: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: query },
        ],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.content || "Could not generate response",
            timestamp: new Date(),
          },
        ]);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: lang === "bn" ? "ত্রুটি হয়েছে" : "An error occurred",
            timestamp: new Date(),
          },
        ]);
      })
      .finally(() => setLoading(false));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#008060]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">BdeshBot</h3>
            <p className="text-[10px] text-white/60">AI Assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/80">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-[#008060] text-white rounded-br-md"
                  : "bg-gray-100 text-gray-900 rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span className="text-[10px] opacity-50 mt-1 block">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 size={16} className="animate-spin text-[#008060]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
            {lang === "bn" ? "দ্রুত অ্যাকশন" : "Quick Actions"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.query)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700 hover:bg-[#008060]/10 hover:text-[#008060] transition-colors"
              >
                <Sparkles size={11} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              lang === "bn" ? "এআই কে জিজ্ঞাসা করুন..." : "Ask AI anything..."
            }
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#008060] focus:border-transparent outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-[#008060] text-white hover:bg-[#006A4E] disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
