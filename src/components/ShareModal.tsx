"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, AlertTriangle, Share2 } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  isVisible: boolean;
}

export default function ShareModal({ isOpen, onClose, slug, isVisible }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_SHARE_BASE_URL || "https://nodalcv.nodalforge.cloud/cv/";
  const shareUrl = `${baseUrl}${slug}`;

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch (err) {
      // Fallback for older browsers or focus issues
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        
        // Ensure the textarea is not visible but part of the DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
        } else {
          throw new Error("execCommand copy failed");
        }
      } catch (fallbackErr) {
        console.error("Fallback copy failed: ", fallbackErr);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Share2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Partager votre profil</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Copiez le lien ci-dessous pour partager votre CV avec des recruteurs ou sur vos réseaux sociaux.
          </p>

          {/* Visibility Alert */}
          {!isVisible && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">
                Attention : votre CV est actuellement en mode privé. Ce lien ne sera pas accessible aux personnes externes.
              </p>
            </div>
          )}

          {/* Link Field */}
          <div className="space-y-2">
            <div className="relative flex items-center">
              <input 
                type="text" 
                readOnly 
                value={shareUrl}
                className="w-full pl-4 pr-24 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-sm font-medium focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`absolute right-2 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  copied 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
