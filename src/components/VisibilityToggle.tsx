"use client";

import { useState } from "react";
import { Shield, Loader2 } from "lucide-react";

interface VisibilityToggleProps {
  initialVisible: boolean;
  email: string;
  onUpdate?: (visible: boolean) => void;
  variant?: 'default' | 'compact';
}

export default function VisibilityToggle({ initialVisible, email, onUpdate, variant = 'default' }: VisibilityToggleProps) {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleToggle = async () => {
    const previousValue = isVisible;
    const newValue = !isVisible;
    
    // Optimistic update
    setIsVisible(newValue);
    setIsLoading(true);
    setNotification(null);
    
    try {
      // Appel de l'endpoint update_cv avec le nouvel état de visibilité
      const updateUrl = process.env.NEXT_PUBLIC_UPDATE_CV_URL;
      
      if (!updateUrl) {
        console.warn("NEXT_PUBLIC_UPDATE_CV_URL n'est pas défini, repli sur INSERT_CV_URL");
      }

      const finalUrl = updateUrl || process.env.NEXT_PUBLIC_INSERT_CV_URL;

      if (!finalUrl) {
        throw new Error("Aucun endpoint de mise à jour configuré");
      }

      const response = await fetch(finalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          visible: newValue 
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      if (onUpdate) onUpdate(newValue);
      
      setNotification({ message: "Profil mis à jour avec succès", type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error updating visibility:", error);
      // Revert on error
      setIsVisible(previousValue);
      setNotification({ message: "Erreur lors de la mise à jour", type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="h-10 flex items-center gap-3 px-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full shrink-0 ${isVisible ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-slate-400'}`} />
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap hidden sm:inline">
            {isVisible ? "Public" : "Privé"}
          </span>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
            isVisible ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
          title={isVisible ? "Passer en privé" : "Passer en public"}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              isVisible ? 'translate-x-4.5' : 'translate-x-1'
            }`}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/20 rounded-full">
              <Loader2 className="w-2 h-2 animate-spin text-white" />
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
          <Shield className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Paramètres de confidentialité</h2>
      </div>

      <p className="text-sm text-slate-500 leading-relaxed">
        Lorsqu&apos;il est invisible, votre profil n&apos;apparaîtra plus dans les résultats de recherche et ne sera plus accessible via votre lien public.
      </p>

      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isVisible ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-slate-300'}`} />
          <span className="text-sm font-medium text-slate-700">
            Votre profil est actuellement <span className={isVisible ? "text-emerald-600 font-bold" : "text-slate-600 font-bold"}>
              {isVisible ? "Public" : "Privé"}
            </span>
          </span>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${
            isVisible ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isVisible ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/20 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin text-white" />
            </div>
          )}
        </button>
      </div>

      {notification && (
        <div className={`text-xs font-medium px-3 py-2 rounded-lg animate-in fade-in slide-in-from-top-1 ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}
