"use client";

import { useState } from "react";
import { LoadingOverlay } from "./LoadingOverlay";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Rocket, 
  Building2, 
  Briefcase, 
  Users, 
  UserCircle,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Loader2,
  Target,
  Trophy,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { CVData } from "@/types/cv";

interface OptimizationAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  onSuccess: (optimizedData: CVData) => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export default function OptimizationAssistant({ isOpen, onClose, cvData, onSuccess }: OptimizationAssistantProps) {
  const [step, setStep] = useState<Step>(1);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    targetJob: "",
    targetUniverse: [] as string[],
    majorAchievement: "",
    careerPath: "" as "evolution" | "reconversion" | "",
    aspectsToClarify: "",
    additionalInfo: ""
  });

  const steps = [
    { id: 1, title: "Poste visé" },
    { id: 2, title: "Univers" },
    { id: 3, title: "Réussite" },
    { id: 4, title: "Parcours" },
    { id: 5, title: "Précisions" },
    { id: 6, title: "Motivations" },
    { id: 7, title: "Validation" }
  ];

  const universes = [
    { id: "startup", label: "Startup", icon: Rocket },
    { id: "grand_groupe", label: "Grand Groupe CAC40", icon: Building2 },
    { id: "conseil", label: "Cabinet de conseil", icon: Briefcase },
    { id: "pme", label: "PME", icon: Users },
    { id: "freelance", label: "Freelance", icon: UserCircle }
  ];

  const handleUniverseToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      targetUniverse: prev.targetUniverse.includes(id)
        ? prev.targetUniverse.filter(u => u !== id)
        : [...prev.targetUniverse, id]
    }));
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setError(null);

    try {
      const optimizeUrl = process.env.NEXT_PUBLIC_OPTIMIZE_CV_URL;
      
      if (!optimizeUrl) {
        throw new Error("L'URL d'optimisation globale n'est pas configurée.");
      }
      
      const response = await fetch(optimizeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cv: cvData,
          optimization_goals: formData
        }),
      });

      if (!response.ok) {
        throw new Error("Une erreur est survenue lors de l'optimisation de votre CV.");
      }

      const result = await response.json();
      
      // Normalisation de la réponse pour extraire les données du CV
      // Gère les formats : [ { output: { ... } } ], { data: { ... } }, ou { ... }
      const rawData = Array.isArray(result) ? result[0] : result;
      const content = rawData.output || rawData.data || rawData;

      if (!content || !content.personne) {
        throw new Error("Le format de réponse de l'IA est invalide.");
      }

      onSuccess(content);
      onClose();
    } catch (err) {
      console.error("Optimization error:", err);
      setError(err instanceof Error ? err.message : "Une erreur inconnue est survenue.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const nextStep = () => setStep(prev => (prev < 7 ? (prev + 1) as Step : prev));
  const prevStep = () => setStep(prev => (prev > 1 ? (prev - 1) as Step : prev));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={!isOptimizing ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[95vh] bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 custom-scrollbar">
        
        {/* Progress Bar */}
        <div className="sticky top-0 left-0 w-full h-1.5 bg-slate-100 z-20">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        <div className="p-5 sm:p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Assistant d&apos;Optimisation</h2>
                <p className="text-slate-500 text-sm font-medium">Étape {step} sur 7 : {steps.find(s => s.id === step)?.title}</p>
              </div>
            </div>
            {!isOptimizing && (
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px] flex flex-col">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Target className="w-5 h-5" />
                    <label className="text-lg font-bold">Quel est l&apos;intitulé du poste précis que tu vises aujourd&apos;hui ?</label>
                  </div>
                  <p className="text-slate-500 text-sm">Soyez le plus précis possible (ex: Senior Product Manager, Développeur Fullstack React/Node...)</p>
                  <input 
                    type="text"
                    autoFocus
                    value={formData.targetJob}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetJob: e.target.value }))}
                    placeholder="Ex: Responsable Marketing Digital"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 text-lg font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Building2 className="w-5 h-5" />
                    <label className="text-lg font-bold">Quel univers vises-tu ?</label>
                  </div>
                  <p className="text-slate-500 text-sm">Sélectionne un ou plusieurs types d&apos;entreprises qui t&apos;intéressent.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {universes.map((u) => {
                      const Icon = u.icon;
                      const isSelected = formData.targetUniverse.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleUniverseToggle(u.id)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                            isSelected 
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100" 
                              : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${isSelected ? "bg-indigo-600 text-white" : "bg-white text-slate-400"}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-bold">{u.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Trophy className="w-5 h-5" />
                    <label className="text-lg font-bold">Ta réussite majeure ou expertise unique ?</label>
                  </div>
                  <p className="text-slate-500 text-sm">C&apos;est le moment de briller. Quelle est la chose dont tu es le plus fier ?</p>
                  <textarea 
                    autoFocus
                    value={formData.majorAchievement}
                    onChange={(e) => setFormData(prev => ({ ...prev, majorAchievement: e.target.value }))}
                    placeholder="Ex: J&apos;ai piloté la refonte complète du tunnel de vente, augmentant le taux de conversion de 25% en 6 mois."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 text-lg font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all min-h-[150px] resize-none"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <TrendingUp className="w-5 h-5" />
                    <label className="text-lg font-bold">Quelle est ta dynamique actuelle ?</label>
                  </div>
                  <p className="text-slate-500 text-sm">Cela aidera l&apos;IA à adapter le ton et les arguments de ton CV.</p>
                  <div className="grid grid-cols-1 gap-4 pt-2">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, careerPath: "evolution" }))}
                      className={`flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left ${
                        formData.careerPath === "evolution"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100" 
                          : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className={`p-4 rounded-2xl ${formData.careerPath === "evolution" ? "bg-indigo-600 text-white" : "bg-white text-slate-400"}`}>
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="block text-xl font-bold mb-1">Évoluer</span>
                        <span className="text-sm opacity-80">Même métier, mais avec plus de responsabilités ou dans un meilleur environnement.</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, careerPath: "reconversion" }))}
                      className={`flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left ${
                        formData.careerPath === "reconversion"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100" 
                          : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className={`p-4 rounded-2xl ${formData.careerPath === "reconversion" ? "bg-indigo-600 text-white" : "bg-white text-slate-400"}`}>
                        <RefreshCw className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="block text-xl font-bold mb-1">Se reconvertir</span>
                        <span className="text-sm opacity-80">Changer de métier ou de secteur d&apos;activité de manière significative.</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <AlertCircle className="w-5 h-5" />
                    <label className="text-lg font-bold">Un aspect à clarifier ou minimiser ?</label>
                  </div>
                  <p className="text-slate-500 text-sm">Trou dans le CV, expérience courte, changement fréquent... L&apos;IA saura comment le présenter.</p>
                  <textarea 
                    autoFocus
                    value={formData.aspectsToClarify}
                    onChange={(e) => setFormData(prev => ({ ...prev, aspectsToClarify: e.target.value }))}
                    placeholder="Ex: J&apos;ai un trou de 6 mois en 2022 pour un projet personnel, j&apos;aimerais que ce soit perçu positivement."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 text-lg font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all min-h-[150px] resize-none"
                  />
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <MessageSquare className="w-5 h-5" />
                    <label className="text-lg font-bold">Tes motivations ou ta personnalité ?</label>
                  </div>
                  <p className="text-slate-500 text-sm">Y a-t-il autre chose que l&apos;IA doit savoir pour rendre ton CV vraiment unique ?</p>
                  <textarea 
                    autoFocus
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    placeholder="Ex: Je suis passionné par l&apos;écologie et je cherche une entreprise à impact. Je suis très autonome et j&apos;aime le mentorat."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 text-lg font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all min-h-[150px] resize-none"
                  />
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center py-2">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2 text-center mb-4">
                  <h3 className="text-2xl font-bold text-slate-900">Tout est prêt !</h3>
                  <p className="text-slate-600 leading-relaxed max-w-md">
                    Je vais maintenant réécrire vos <span className="font-bold text-indigo-600">{cvData.experiences.length} expériences</span> et votre profil pour cibler un poste de <span className="font-bold text-indigo-600">{formData.targetJob || "votre choix"}</span>.
                  </p>
                </div>

                <div className="w-full max-h-[350px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Poste visé</p>
                        <p className="font-bold text-slate-800">{formData.targetJob}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Univers</p>
                        <p className="font-bold text-slate-800">
                          {formData.targetUniverse.map(u => universes.find(v => v.id === u)?.label).join(', ') || "Tous secteurs"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dynamique</p>
                        <p className="font-bold text-slate-800">
                          {formData.careerPath === "evolution" ? "Évolution de carrière" : formData.careerPath === "reconversion" ? "Reconversion" : "Standard"}
                        </p>
                      </div>
                    </div>

                    {formData.majorAchievement && (
                      <div className="space-y-1 pt-2 border-t border-slate-200/60">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Réussite majeure</p>
                        <p className="italic text-slate-700 leading-relaxed">&quot;{formData.majorAchievement}&quot;</p>
                      </div>
                    )}

                    {formData.aspectsToClarify && (
                      <div className="space-y-1 pt-2 border-t border-slate-200/60">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Points à clarifier</p>
                        <p className="text-slate-700 leading-relaxed">{formData.aspectsToClarify}</p>
                      </div>
                    )}

                    {formData.additionalInfo && (
                      <div className="space-y-1 pt-2 border-t border-slate-200/60">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Motivations & Personnalité</p>
                        <p className="text-slate-700 leading-relaxed">{formData.additionalInfo}</p>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="w-full mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-slate-100">
            <button
              onClick={prevStep}
              disabled={step === 1 || isOptimizing}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                step === 1 || isOptimizing
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Retour
            </button>

            {step < 7 ? (
              <button
                onClick={nextStep}
                disabled={step === 1 && !formData.targetJob}
                className={`flex items-center gap-2 px-6 sm:px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 ${
                  step === 1 && !formData.targetJob ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl sm:rounded-[1.5rem] font-bold shadow-xl shadow-indigo-200 transition-all hover:shadow-indigo-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="whitespace-nowrap">Optimisation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="whitespace-nowrap">Lancer</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {isOptimizing && (
          <LoadingOverlay 
            title="L'IA travaille sur votre CV"
            subtitle="Nous réécrivons vos expériences pour qu'elles correspondent parfaitement à vos objectifs. Cela peut prendre quelques secondes..."
          />
        )}
      </div>
    </div>
  );
}
