"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, Share2, Briefcase } from "lucide-react";
import VisibilityToggle from "./VisibilityToggle";
import AvailabilitySelector from "./AvailabilitySelector";
import DownloadPDFButton from "./DownloadPDFButton";
import { CVData } from "@/types/cv";
import { User } from "firebase/auth";

interface ToolbarSettingsProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData | null>>;
  user: User | null;
  onShare?: () => void;
  onOpenApplicationManager?: () => void;
}

export default function ToolbarSettings({ 
  cvData, 
  setCvData, 
  user, 
  onShare,
  onOpenApplicationManager
}: ToolbarSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:flex items-center gap-2 relative z-50 toolbar-settings">
        {cvData.isMaster && (
          <VisibilityToggle 
            variant="compact"
            initialVisible={cvData.visible ?? true} 
            email={cvData.personne.contact.email}
            isMain={cvData.isMaster}
            cvName={cvData.isMaster ? "main" : (cvData.optimizedFor || "Version optimisée")}
            onUpdate={(visible) => setCvData((prev) => prev ? { ...prev, visible } : null)}
          />
        )}
        <AvailabilitySelector 
          variant="compact"
          initialStatus={cvData.availability}
          email={cvData.personne.contact.email}
          isMain={cvData.isMaster}
          cvName={cvData.isMaster ? "main" : (cvData.optimizedFor || "Version optimisée")}
          onUpdate={(availability) => setCvData((prev) => prev ? { ...prev, availability } : null)}
        />
      </div>

      {/* Mobile View */}
      <div className="lg:hidden relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 w-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-200 transition-all shadow-sm shrink-0"
          title="Réglages du profil"
        >
          <Settings className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        </button>

        {isOpen && (
          <div className="fixed left-4 top-16 z-[150] w-64 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            {cvData.isMaster && (
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visibilité</label>
                <VisibilityToggle 
                  variant="compact"
                  initialVisible={cvData.visible ?? true} 
                  email={cvData.personne.contact.email}
                  isMain={cvData.isMaster}
                  cvName={cvData.isMaster ? "main" : (cvData.optimizedFor || "Version optimisée")}
                  onUpdate={(visible) => setCvData((prev) => prev ? { ...prev, visible } : null)}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Disponibilité</label>
              <AvailabilitySelector 
                variant="compact"
                initialStatus={cvData.availability}
                email={cvData.personne.contact.email}
                isMain={cvData.isMaster}
                cvName={cvData.isMaster ? "main" : (cvData.optimizedFor || "Version optimisée")}
                onUpdate={(availability) => setCvData((prev) => prev ? { ...prev, availability } : null)}
              />
            </div>

            {onOpenApplicationManager && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Candidature</label>
                <button
                  onClick={() => {
                    onOpenApplicationManager();
                    setIsOpen(false);
                  }}
                  className="w-full h-10 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all text-sm font-bold"
                >
                  <Briefcase className="w-4 h-4" />
                  Gérer ma candidature
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              {onShare && (
                <button
                  onClick={() => {
                    onShare();
                    setIsOpen(false);
                  }}
                  className="flex-1 h-10 flex items-center justify-center gap-2 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
              )}
              <DownloadPDFButton 
                slug={cvData.slug || ""} 
                fileName={`CV_${cvData.personne.prenom}_${cvData.personne.nom}`.replace(/\s+/g, '_')} 
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
