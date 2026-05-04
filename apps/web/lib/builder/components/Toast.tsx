"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export interface ToastData {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  messageBn?: string;
}

interface ToastProps {
  toast: ToastData;
  lang: "en" | "bn";
  onDismiss: (id: string) => void;
}

export function Toast({ toast, lang, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 4000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
      icon: CheckCircle,
    },
    error: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-700",
      icon: XCircle,
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-700",
      icon: CheckCircle,
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 ${
        config.bg
      } ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      <Icon size={18} className={config.text} />
      <span className={`text-sm font-medium ${config.text}`}>
        {lang === "bn" && toast.messageBn ? toast.messageBn : toast.message}
      </span>
      <button onClick={() => onDismiss(toast.id)} className="ml-2 p-0.5 rounded hover:bg-black/5">
        <X size={14} className={config.text} />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  lang,
  onDismiss,
}: {
  toasts: ToastData[];
  lang: "en" | "bn";
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} lang={lang} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
