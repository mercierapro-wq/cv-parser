"use client";

import { Sparkles } from "lucide-react";

interface LoadingOverlayProps {
  title: string;
  subtitle: string;
}

export function LoadingOverlay({ title, subtitle }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-10 text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600 animate-pulse" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 max-w-xs mx-auto leading-relaxed">
        {subtitle}
      </p>
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
      </div>
    </div>
  );
}
