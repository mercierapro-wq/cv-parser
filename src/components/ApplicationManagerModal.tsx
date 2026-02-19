"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Loader2, 
  Save, 
  Sparkles, 
  FileText, 
  Briefcase,
  Target,
  AlertCircle
} from "lucide-react";
import { CVData } from "@/types/cv";

interface ApplicationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  onSaveOffer: (offer: string) => Promise<void>;
  onSaveCoverLetter: (text: string) => Promise<void>;
  onDownloadCoverLetterPDF: (text: string) => Promise<void>;
  onGenerateCoverLetter: () => Promise<void>;
  isGeneratingCoverLetter: boolean;
  isFetchingOffer?: boolean;
  fetchedOffer?: string | null;
}

export default function ApplicationManagerModal({
  isOpen,
  onClose,
  cvData,
  onSaveOffer,
  onSaveCoverLetter,
  onDownloadCoverLetterPDF,
  onGenerateCoverLetter,
  isGeneratingCoverLetter,
  isFetchingOffer = false,
  fetchedOffer = null
}: ApplicationManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'offer' | 'letter'>('offer');
  const [editableLetter, setEditableLetter] = useState(cvData.cover_letter || "");
  const [localOffer, setLocalOffer] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingOffer, setIsSavingOffer] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (isOpen) {
      // Prioritize cvData.jobOffer if it exists (especially for optimized CVs)
      // Fallback to fetchedOffer if cvData.jobOffer is empty
      setLocalOffer(cvData.jobOffer || fetchedOffer || "");
    }
  }, [isOpen, cvData.jobOffer, fetchedOffer]);

  useEffect(() => {
    setEditableLetter(cvData.cover_letter || "");
  }, [cvData.cover_letter]);

  const handleCopy = async () => {
    if (!editableLetter) return;
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(editableLetter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch (err) {
      // Fallback for older browsers or focus issues
      try {
        const textArea = document.createElement("textarea");
        textArea.value = editableLetter;
        
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
          setTimeout(() => setCopied(false), 2000);
        } else {
          throw new Error("execCommand copy failed");
        }
      } catch (fallbackErr) {
        console.error("Fallback copy failed: ", fallbackErr);
        setNotification({ message: "Erreur lors de la copie", type: 'error' });
      }
    }
  };

  const handleDownload = async () => {
    if (!editableLetter) return;
    setIsDownloading(true);
    try {
      await onDownloadCoverLetterPDF(editableLetter);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveLetter = async () => {
    if (!editableLetter) return;
    setIsSaving(true);
    try {
      await onSaveCoverLetter(editableLetter);
      setNotification({ message: "Lettre de motivation enregistrée !", type: 'success' });
      // Redirection is handled by the parent (onSaveCoverLetter should redirect)
    } catch (error) {
      setNotification({ message: "Erreur lors de l'enregistrement", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveOfferAction = async () => {
    if (!localOffer.trim()) {
      setNotification({ message: "Veuillez renseigner l'offre", type: 'error' });
      return;
    }
    
    setIsSavingOffer(true);
    try {
      await onSaveOffer(localOffer);
      setNotification({ message: "Offre enregistrée !", type: 'success' });
      setTimeout(() => setActiveTab('letter'), 1000);
    } catch (error) {
      setNotification({ message: "Erreur lors de l'enregistrement de l'offre", type: 'error' });
    } finally {
      setIsSavingOffer(false);
    }
  };

  if (!isOpen) return null;

  const hasOffer = !!(cvData.jobOffer?.trim() || fetchedOffer?.trim());

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Gestion de Candidature</h2>
          </div>
          
          {notification && (
            <div className={`absolute left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold animate-in slide-in-from-top-2 duration-300 shadow-lg z-50 ${
              notification.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {notification.message}
            </div>
          )}

          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="px-8 pt-4 bg-white border-b border-slate-100">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('offer')}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === 'offer' 
                  ? "text-indigo-600" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                L&apos;Offre d&apos;emploi
              </div>
              {activeTab === 'offer' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full animate-in fade-in slide-in-from-bottom-1" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('letter')}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === 'letter' 
                  ? "text-indigo-600" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Lettre de Motivation
              </div>
              {activeTab === 'letter' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full animate-in fade-in slide-in-from-bottom-1" />
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 flex flex-col min-h-[400px]">
          {activeTab === 'offer' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {isFetchingOffer ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-slate-500 font-medium">Chargement de l&apos;offre...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Texte de l&apos;annonce</label>
                    <span className="text-[10px] font-medium text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">Édition libre</span>
                  </div>
                  <textarea
                    value={localOffer}
                    onChange={(e) => setLocalOffer(e.target.value)}
                    placeholder="Collez ici le texte de l'offre d'emploi pour laquelle vous postulez..."
                    className="w-full min-h-[350px] p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700 leading-relaxed font-medium"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col animate-in fade-in duration-300">
              {!hasOffer ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-12">
                  <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <div className="text-center space-y-2 max-w-sm">
                    <h3 className="text-lg font-bold text-slate-900">Offre manquante</h3>
                    <p className="text-slate-500 text-sm">Veuillez renseigner l&apos;offre d&apos;emploi dans l&apos;onglet précédent pour générer une lettre personnalisée.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('offer')}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Aller à l&apos;offre
                  </button>
                </div>
              ) : !editableLetter ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-12">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <div className="text-center space-y-2 max-w-sm">
                    <h3 className="text-lg font-bold text-slate-900">Prêt à générer ?</h3>
                    <p className="text-slate-500 text-sm">L&apos;IA va analyser votre CV et l&apos;offre d&apos;emploi pour rédiger une lettre de motivation percutante.</p>
                  </div>
                  <button
                    onClick={onGenerateCoverLetter}
                    disabled={isGeneratingCoverLetter}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50"
                  >
                    {isGeneratingCoverLetter ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    Générer ma lettre
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Votre lettre personnalisée</label>
                    <div className="flex items-center gap-2">
                      {isGeneratingCoverLetter && <span className="text-[10px] font-bold text-indigo-600 animate-pulse uppercase tracking-wider">Génération en cours...</span>}
                    </div>
                  </div>
                  <textarea
                    value={editableLetter}
                    onChange={(e) => setEditableLetter(e.target.value)}
                    className="flex-1 min-h-[400px] bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm font-sans text-slate-700 leading-relaxed whitespace-pre-wrap outline-none focus:border-indigo-500 transition-all resize-none"
                    placeholder="Écrivez votre lettre de motivation ici..."
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions (only for Letter tab when letter exists) */}
        {activeTab === 'letter' && editableLetter && hasOffer && (
          <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-end gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto mr-auto">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-500" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copier
                  </>
                )}
              </button>
              <button
                onClick={onGenerateCoverLetter}
                disabled={isGeneratingCoverLetter}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
                title="Regénérer la lettre avec l'IA"
              >
                {isGeneratingCoverLetter ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                Regénérer
              </button>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleSaveLetter}
                disabled={isSaving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Enregistrer
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                PDF
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions (for Offer tab) */}
        {activeTab === 'offer' && (
          <div className="p-6 border-t border-slate-100 bg-white flex justify-end">
            <button
              onClick={handleSaveOfferAction}
              disabled={isSavingOffer || isFetchingOffer}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center gap-2"
            >
              {isSavingOffer && <Loader2 className="w-4 h-4 animate-spin" />}
              Valider l&apos;offre
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
