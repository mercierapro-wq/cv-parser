"use client";

import { useState } from "react";
import { 
  X, 
  Sparkles, 
  FileText, 
  Loader2, 
  Download,
  Save,
  Edit3,
  Eye
} from "lucide-react";
import { CVData } from "@/types/cv";
import { sortExperiences } from "@/lib/utils";
import CVDisplay from "./CVDisplay";
import CVEditor from "./CVEditor";

interface OfferOptimizerProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  onSuccess: (optimizedData: CVData, saveAsNew: boolean) => void;
  existingTitles?: string[];
}

export default function OfferOptimizer({ isOpen, onClose, cvData, onSuccess, existingTitles = [] }: OfferOptimizerProps) {
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [jobOffer, setJobOffer] = useState("");
  const [optimizedData, setOptimizedData] = useState<CVData | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvName, setCvName] = useState("");
  const [view, setView] = useState<'edit' | 'preview'>('preview');
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveAction = (asNew: boolean) => {
    setSaveError(null);
    
    if (asNew) {
      if (!cvName.trim()) {
        setSaveError("Le titre du CV est obligatoire pour l'enregistrement.");
        return;
      }
      
      const isDuplicate = existingTitles.some(title => 
        title.toLowerCase() === cvName.trim().toLowerCase()
      );
      
      if (isDuplicate) {
        setSaveError("Un CV avec ce titre existe déjà. Veuillez en choisir un autre.");
        return;
      }
    }

    if (optimizedData) {
      onSuccess({ 
        ...optimizedData, 
        cvName: cvName.trim() || "Version optimisée",
        optimizedFor: cvName.trim() || "Version optimisée", 
        isMaster: false,
        jobOffer: jobOffer 
      }, asNew);
    }
  };

  const handleOptimize = async () => {
    console.log("handleOptimize called", { jobOffer: !!jobOffer, cvData: !!cvData });
    if (!jobOffer.trim()) return;
    setIsOptimizing(true);
    setStep('processing');
    setError(null);

    try {
      const optimizeUrl = process.env.NEXT_PUBLIC_OPTIMIZE_BY_OFFER_URL;
      console.log("Optimize URL:", optimizeUrl);
      if (!optimizeUrl) throw new Error("URL d'optimisation non configurée");
      
      // 1. Extraction : Sauvegarder l'image actuelle
      const savedImage = cvData.profilePicture;
      const savedTransform = cvData.profilePictureTransform;

      // 2. Appel API : Envoyer les données sans l'image
      const { profilePicture, profilePictureTransform, ...cvWithoutImage } = cvData;

      const response = await fetch(optimizeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv: cvWithoutImage,
          job_offer: jobOffer
        }),
      });

      console.log("Response status:", response.status);
      if (!response.ok) throw new Error("Erreur lors de l'optimisation");

      const result = await response.json();
      const rawData = Array.isArray(result) ? result[0] : result;
      const content = rawData.output || rawData.data || rawData;

      // 3. Fusion (Merge) : Réinjecter l'image sauvegardée
      const mergedData = {
        ...content,
        experiences: sortExperiences(Array.isArray(content.experiences) ? content.experiences : []),
        profilePicture: savedImage,
        profilePictureTransform: savedTransform
      };

      setOptimizedData(mergedData);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setStep('input');
    } finally {
      setIsOptimizing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={!isOptimizing ? onClose : undefined} />
      <div className={`relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 flex flex-col ${step === 'result' ? "w-[95vw] h-[90vh]" : "w-full max-w-2xl"}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Sparkles className="w-5 h-5" /></div>
            <h2 className="text-xl font-bold text-slate-900">
              {step === 'result' ? "Optimisation terminée !" : "Optimiser pour une offre"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {step === 'result' && (
              <div className="flex bg-slate-100 p-1 rounded-xl h-10">
                <button
                  onClick={() => setView('edit')}
                  className={`flex items-center gap-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    view === 'edit' 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Édition</span>
                </button>
                <button
                  onClick={() => setView('preview')}
                  className={`flex items-center gap-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    view === 'preview' 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Aperçu</span>
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"><X className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {step === 'input' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-3">
                <label className="text-lg font-bold text-slate-900 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" />Collez l&apos;offre d&apos;emploi</label>
                <textarea autoFocus value={jobOffer} onChange={(e) => setJobOffer(e.target.value)} placeholder="Collez ici le texte de l'annonce..." className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 text-lg font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all min-h-[250px] resize-none" />
              </div>
              <button type="button" onClick={handleOptimize} disabled={!jobOffer.trim() || isOptimizing} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                {isOptimizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}Lancer l&apos;optimisation
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
              <div className="relative"><div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" /><Sparkles className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" /></div>
              <h3 className="text-2xl font-bold text-slate-900">L&apos;IA analyse l&apos;offre...</h3>
            </div>
          )}

          {step === 'result' && optimizedData && (
            <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 w-full flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                    <Edit3 className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={cvName} 
                      onChange={(e) => {
                        setCvName(e.target.value);
                        setSaveError(null);
                      }}
                      placeholder="Donnez un titre à cette version (ex: Développeur React - Startup X)..."
                      className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                    <button onClick={() => handleSaveAction(false)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"><Download className="w-4 h-4" />Télécharger</button>
                    <button onClick={() => handleSaveAction(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg transition-all"><Save className="w-4 h-4" />Enregistrer</button>
                  </div>
                </div>
                
                {saveError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
                    {saveError}
                  </div>
                )}
              </div>

              <div className="flex-1 bg-slate-50 rounded-3xl border border-slate-200 overflow-y-auto p-8">
                {view === 'preview' ? (
                  <div className="max-w-4xl mx-auto">
                    <CVDisplay data={optimizedData} slug="" isPrintMode />
                  </div>
                ) : (
                  <div className="max-w-5xl mx-auto">
                    <CVEditor 
                      initialData={optimizedData} 
                      onChange={(newData) => setOptimizedData(newData)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
