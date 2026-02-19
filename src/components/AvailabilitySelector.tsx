"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, Loader2, ChevronDown } from "lucide-react";
import { AvailabilityStatus } from "@/types/cv";
import { AVAILABILITY_CONFIG } from "./AvailabilityBadge";

interface AvailabilitySelectorProps {
  initialStatus?: AvailabilityStatus;
  email: string;
  isMain?: boolean;
  cvName?: string;
  onUpdate?: (status: AvailabilityStatus) => void;
  variant?: 'default' | 'compact';
}

export default function AvailabilitySelector({ 
  initialStatus, 
  email, 
  isMain = true,
  cvName = "main",
  onUpdate, 
  variant = 'default' 
}: AvailabilitySelectorProps) {
  const [status, setStatus] = useState<AvailabilityStatus | undefined>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = async (newStatus: AvailabilityStatus) => {
    if (newStatus === status) {
      setIsOpen(false);
      return;
    }

    const previousStatus = status;
    setStatus(newStatus);
    setIsLoading(true);
    setIsOpen(false);
    setNotification(null);

    try {
      const updateUrl = process.env.NEXT_PUBLIC_UPDATE_CV_URL || process.env.NEXT_PUBLIC_INSERT_CV_URL;
      
      if (!updateUrl) {
        throw new Error("Endpoint non configuré");
      }

      const response = await fetch(updateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          availability: newStatus,
          isMain,
          cvName
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      if (onUpdate) onUpdate(newStatus);
      
      setNotification({ message: "Disponibilité mise à jour", type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error updating availability:", error);
      setStatus(previousStatus);
      setNotification({ message: "Erreur lors de la mise à jour", type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const currentConfig = status ? AVAILABILITY_CONFIG[status] : null;

  if (variant === 'compact') {
    return (
      <div className="relative w-full lg:w-auto" ref={dropdownRef}>
        <button
          onClick={() => !isLoading && setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`h-10 flex items-center justify-between lg:justify-start gap-2 px-3 rounded-xl transition-all text-left bg-slate-100 hover:bg-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none w-full lg:w-auto ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Changer ma disponibilité"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {currentConfig && (
              <div className={`w-2 h-2 rounded-full shrink-0 ${currentConfig.dotColor} ${status === 'immediate' ? 'animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.4)]' : ''}`} />
            )}
            <span className="text-sm font-medium text-slate-700 whitespace-nowrap truncate">
              {currentConfig?.label || "Disponibilité"}
            </span>
          </div>
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-indigo-600 flex-shrink-0" />
          ) : (
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </button>

        {isOpen && (
          <div className="absolute left-0 z-[999] w-48 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {(Object.keys(AVAILABILITY_CONFIG) as AvailabilityStatus[]).map((key) => {
              const config = AVAILABILITY_CONFIG[key];
              const isSelected = status === key;
              
              return (
                <button
                  key={key}
                  onClick={() => handleStatusChange(key)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 ${isSelected ? 'bg-indigo-50/50' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full ${config.dotColor} ${key === 'immediate' && isSelected ? 'animate-pulse' : ''}`} />
                  <span className={`text-sm ${isSelected ? 'font-bold text-indigo-600' : 'text-slate-600'}`}>
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
          <Clock className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Disponibilité</h2>
      </div>

      <p className="text-sm text-slate-500 leading-relaxed">
        Indiquez aux recruteurs quand vous êtes prêt à démarrer une nouvelle mission.
      </p>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => !isLoading && setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all text-left bg-slate-50 border-slate-200 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-3">
            {currentConfig ? (
              <>
                <div className={`w-3 h-3 rounded-full ${currentConfig.dotColor} ${status === 'immediate' ? 'animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]' : ''}`} />
                <span className="text-sm font-bold text-slate-700">{currentConfig.label}</span>
              </>
            ) : (
              <span className="text-sm text-slate-400">Sélectionner votre disponibilité</span>
            )}
          </div>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          ) : (
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {(Object.keys(AVAILABILITY_CONFIG) as AvailabilityStatus[]).map((key) => {
              const config = AVAILABILITY_CONFIG[key];
              const isSelected = status === key;
              
              return (
                <button
                  key={key}
                  onClick={() => handleStatusChange(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${isSelected ? 'bg-indigo-50/50' : ''}`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor} ${key === 'immediate' && isSelected ? 'animate-pulse' : ''}`} />
                  <span className={`text-sm ${isSelected ? 'font-bold text-indigo-600' : 'text-slate-600'}`}>
                    {config.label}
                  </span>
                  {isSelected && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  )}
                </button>
              );
            })}
          </div>
        )}
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
