"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CVData } from "@/types/cv";
import { 
  Save, 
  X,
  Loader2,
  Lock,
  LogIn,
  Eye,
  Edit3,
  Share2,
  FilePlus,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import CVDisplay from "@/components/CVDisplay";
import ShareModal from "@/components/ShareModal";
import CVEditor from "@/components/CVEditor";
import ToolbarSettings from "@/components/ToolbarSettings";
import OptimizationAssistant from "@/components/OptimizationAssistant";
import DownloadPDFButton from "@/components/DownloadPDFButton";

export default function MonCVPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <MonCVContent />
    </Suspense>
  );
}

function MonCVContent() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isOptimizationAssistantOpen, setIsOptimizationAssistantOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll to hide toolbar logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsToolbarVisible(true);
      } 
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsToolbarVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const fetchCV = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const getCvUrl = process.env.NEXT_PUBLIC_GET_CV_URL;
        
        if (!getCvUrl) {
          throw new Error("La variable d'environnement NEXT_PUBLIC_GET_CV_URL n'est pas définie");
        }
        
        const response = await fetch(getCvUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        });

        if (response.status === 404) {
          setCvData(null);
          return;
        }

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du CV");
        }

        const data = await response.json();
        
        // On vérifie si on a reçu un objet (ou le premier élément d'un tableau)
        const rawData = Array.isArray(data) ? data[0] : data;
        
        if (rawData && (rawData.email || rawData.personne?.contact?.email || rawData.data)) {
          // On récupère le contenu niché dans 'data' s'il existe, sinon on prend l'objet racine
          const content = rawData.data || rawData;

          // Normalisation des données pour correspondre à l'interface CVData
          const normalizedData: CVData = {
            personne: {
              prenom: content.prenom || content.personne?.prenom || rawData.prenom || "",
              nom: content.nom || content.personne?.nom || rawData.nom || "",
              titre_professionnel: content.titre_professionnel || content.personne?.titre_professionnel || "",
              contact: {
                email: rawData.email || content.email || content.personne?.contact?.email || "",
                telephone: content.telephone || content.personne?.contact?.telephone || "",
                linkedin: content.linkedin || content.personne?.contact?.linkedin || "",
                ville: content.ville || content.personne?.contact?.ville || ""
              }
            },
            profilePicture: rawData.profilePicture || content.profilePicture || content.personne?.profilePicture || "",
            profilePictureTransform: rawData.profilePictureTransform || content.profilePictureTransform || content.personne?.profilePictureTransform,
            resume: content.resume || "",
            experiences: Array.isArray(content.experiences) ? content.experiences : [],
            projets: Array.isArray(content.projets) ? content.projets : [],
            formation: Array.isArray(content.formation) ? content.formation : [],
            certifications: Array.isArray(content.certifications) ? content.certifications : [],
            competences: {
              soft_skills: Array.isArray(content.competences?.soft_skills) ? content.competences.soft_skills : [],
              hard_skills: Array.isArray(content.competences?.hard_skills) ? content.competences.hard_skills : [],
              langues: Array.isArray(content.competences?.langues) ? content.competences.langues : []
            },
            visible: rawData.visible ?? content.visible ?? true,
            availability: rawData.availability || content.availability || 'immediate',
            slug: rawData.slug || content.slug || ""
          };
          setCvData(normalizedData);
        } else {
          setCvData(null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Impossible de charger votre CV. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCV();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const handleSave = async (updatedData: CVData) => {
    if (!updatedData) return;

    // Validation Email
    if (!updatedData.personne.contact.email.trim()) {
      setNotification({ 
        message: "L'adresse email est obligatoire pour enregistrer le CV.", 
        type: 'error' 
      });
      return;
    }

    setIsSaving(true);
    setNotification(null); // Clear previous notifications

    try {
      const insertUrl = process.env.NEXT_PUBLIC_INSERT_CV_URL;
      
      if (!insertUrl) {
        throw new Error("La variable d'environnement NEXT_PUBLIC_INSERT_CV_URL n'est pas définie");
      }

      const { visible, availability, slug: currentSlug, profilePicture, profilePictureTransform, ...cvContent } = updatedData;
      
      // Nettoyage des anciennes données photo si présentes dans personne
      if (cvContent.personne) {
        const { profilePicture: _, profilePictureTransform: __, ...cleanPersonne } = cvContent.personne as any;
        cvContent.personne = cleanPersonne;
      }

      const payload = {
        email: updatedData.personne.contact.email,
        nom: updatedData.personne.nom,
        prenom: updatedData.personne.prenom,
        profilePicture: profilePicture,
        profilePictureTransform: profilePictureTransform,
        slug: currentSlug,
        visible: visible ?? true,
        availability: availability || 'immediate',
        data: cvContent
      };

      const response = await fetch(insertUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement du CV");
      }

      const result = await response.json();
      const slug = result[0]?.slug;

      if (!slug) {
        throw new Error("Le serveur n'a pas renvoyé de slug valide");
      }

      setCvData(updatedData);
      setNotification({ 
        message: "CV enregistré avec succès !", 
        type: 'success' 
      });
      
      // Redirection vers la page du CV (/cv/slug) après un court délai pour laisser voir le message
      setTimeout(() => {
        router.push(`/cv/${slug}`);
      }, 1500);
    } catch (error) {
      console.error("Erreur:", error);
      setNotification({ 
        message: "Une erreur est survenue lors de l'enregistrement du CV.", 
        type: 'error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleProtectedAction = (action: () => void) => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      setShowAuthModal(true);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Chargement de votre CV...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Oups !</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-lg">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Accès réservé</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Vous devez être connecté pour accéder à votre espace personnel et gérer vos CV.
          </p>
          <button 
            onClick={() => login()}
            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
          >
            <LogIn className="w-5 h-5" />
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-lg">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FilePlus className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Prêt à créer votre premier CV ?</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Il semble que vous n&apos;ayez pas encore de CV enregistré. 
            Importez votre CV actuel pour commencer à le personnaliser !
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
          >
            Créer mon premier CV
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header Toolbar */}
      <div className={`sticky top-0 z-[100] w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-transform duration-300 ${
        isToolbarVisible ? "translate-y-0" : "-translate-y-full"
      }`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto lg:overflow-visible no-scrollbar relative">
          {/* Left Gradient Fade */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/90 to-transparent z-10 pointer-events-none lg:hidden" />
          {/* Right Gradient Fade */}
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/90 to-transparent z-10 pointer-events-none lg:hidden" />

          <div className="flex items-center justify-between w-full min-w-max lg:min-w-0 gap-2 sm:gap-4">
            {/* Zone Gauche : Statut & Visibilité */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {cvData && (
                <ToolbarSettings 
                  cvData={cvData} 
                  setCvData={setCvData} 
                  user={user} 
                  onShare={() => setIsShareModalOpen(true)}
                />
              )}
            </div>

            {/* Zone Centrale : Mode d'Affichage (Segmented Switch) */}
            <div className="flex bg-slate-100 p-1 rounded-xl h-10 flex-shrink-0">
              <button
                onClick={() => setShowPreview(false)}
                className={`flex items-center gap-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  !showPreview 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Édition</span>
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className={`flex items-center gap-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  showPreview 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Aperçu</span>
              </button>
            </div>

            {/* Zone Droite : Actions Prioritaires */}
            <div className="flex items-center justify-end gap-2 flex-shrink-0">
              {/* AI Button */}
              {!showPreview && (
                <button
                  onClick={() => handleProtectedAction(() => setIsOptimizationAssistantOpen(true))}
                  className="h-10 flex items-center gap-2 px-4 bg-white border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all text-sm font-medium group relative flex-shrink-0"
                  title="Reconstruire tout mon CV avec l'IA"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden md:inline">Reconstruire avec l&apos;IA</span>
                  {!user && (
                    <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm border border-white flex items-center gap-0.5">
                      PRO
                    </div>
                  )}
                </button>
              )}

              {/* Save Button */}
              {!showPreview && (
                <button
                  onClick={() => cvData && handleSave(cvData)}
                  disabled={isSaving}
                  className="h-10 flex items-center justify-center gap-2 px-4 sm:px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm flex-shrink-0"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{isSaving ? "Enregistrement..." : "Enregistrer"}</span>
                </button>
              )}

              {/* Share & Download Buttons - Desktop Only (Hidden on mobile as they are in the gear menu) */}
              <div className="hidden lg:flex items-center gap-2">
                {/* Share Button */}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="h-10 w-10 flex items-center justify-center bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm shrink-0"
                  title="Partager mon CV"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Download PDF Button */}
                {cvData && (
                  <DownloadPDFButton 
                    slug={cvData.slug || ""} 
                    fileName={`CV_${cvData.personne.prenom}_${cvData.personne.nom}`.replace(/\s+/g, '_')} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Notifications */}
          {notification && (
            <div 
              className={`fixed top-20 right-4 z-[999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${
                notification.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                  : 'bg-red-50 border-red-100 text-red-800'
              }`}
            >
              <div className={`p-1.5 rounded-full ${
                notification.type === 'success' ? 'bg-emerald-200 text-emerald-700' : 'bg-red-200 text-red-700'
              }`}>
                {notification.type === 'success' ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </div>
              <p className="font-bold text-sm">{notification.message}</p>
              <button 
                onClick={() => setNotification(null)}
                className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {showPreview ? (
            <div className="animate-in fade-in duration-500">
              <CVDisplay data={cvData} slug={cvData.slug || ""} />
            </div>
          ) : (
            <CVEditor 
              initialData={cvData!} 
              onChange={setCvData}
            />
          )}

          {/* Share Modal */}
          {cvData && (
            <ShareModal 
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              slug={cvData.slug || ""}
              isVisible={cvData.visible ?? true}
            />
          )}

          {/* Optimization Assistant Modal */}
          {cvData && (
            <OptimizationAssistant 
              isOpen={isOptimizationAssistantOpen}
              onClose={() => setIsOptimizationAssistantOpen(false)}
              cvData={cvData}
              onSuccess={(optimizedData) => {
                setCvData(optimizedData);
                setNotification({ message: "CV optimisé avec succès !", type: 'success' });
              }}
            />
          )}

          {/* Auth Modal */}
          {showAuthModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
              <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={() => setShowAuthModal(false)}
              />
              <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
                <div className="p-8 sm:p-10 text-center">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Fonctionnalité Pro</h2>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    L&apos;optimisation par IA est réservée aux membres. Connectez-vous gratuitement pour booster votre CV !
                  </p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={async () => {
                        await login();
                        setShowAuthModal(false);
                        if (pendingAction) {
                          pendingAction();
                          setPendingAction(null);
                        }
                      }}
                      className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      <LogIn className="w-5 h-5" />
                      Se connecter avec Google
                    </button>
                    <button 
                      onClick={() => setShowAuthModal(false)}
                      className="w-full py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      Plus tard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
