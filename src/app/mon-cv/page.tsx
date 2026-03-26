"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CVData } from "@/types/cv";
import { sortExperiences } from "@/lib/utils";
import {
  X,
  Loader2,
  Lock,
  LogIn,
  Edit3,
  FilePlus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import CVDisplay from "@/components/CVDisplay";
import RebuildAssistant from "@/components/RebuildAssistant";
import OfferOptimizer from "@/components/OfferOptimizer";

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
  const [cvs, setCvs] = useState<CVData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRebuildAssistantOpen, setIsRebuildAssistantOpen] = useState(false);
  const [isOfferOptimizerOpen, setIsOfferOptimizerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const masterCv = cvs.find(cv => cv.isMaster) || cvs[0];

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
        const token = await user.getIdToken();

        const response = await fetch("/api/n8n-proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            action: "get-cv",
            email: user.email
          }),
        });

        if (response.status === 404) {
          setCvs([]);
          return;
        }

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du CV");
        }

        const data = await response.json();
        const rawDataList = Array.isArray(data) ? data : [data];

        // Find master CV first to use its profile picture for others
        const masterRaw = rawDataList.find((raw, idx) => raw.isMaster ?? raw.isMain ?? (idx === 0));
        const masterPhoto = masterRaw?.profilePicture || (masterRaw?.data?.profilePicture) || "";
        const masterTransform = masterRaw?.profilePictureTransform || (masterRaw?.data?.profilePictureTransform);

        const normalizedCvs: CVData[] = rawDataList.map((rawData, index) => {
          const content = rawData.data || rawData;
          const isMaster = rawData.isMaster ?? rawData.isMain ?? (index === 0);
          return {
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
            profilePicture: isMaster ? (rawData.profilePicture || content.profilePicture || "") : masterPhoto,
            profilePictureTransform: isMaster ? (rawData.profilePictureTransform || content.profilePictureTransform) : masterTransform,
            resume: content.resume || "",
            experiences: sortExperiences(Array.isArray(content.experiences) ? content.experiences : []),
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
            slug: rawData.slug || content.slug || "",
            isMaster: isMaster,
            cvName: rawData.cvName || (isMaster ? "main" : ""),
            optimizedFor: (isMaster ? "" : (rawData.cvName || rawData.optimizedFor || content.optimizedFor || "")),
            id: rawData._id
          };
        });

        setCvs(normalizedCvs);
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
    if (!updatedData || !user) return;

    if (!updatedData.personne.contact.email.trim()) {
      setNotification({
        message: "L'adresse email est obligatoire pour enregistrer le CV.",
        type: 'error'
      });
      return;
    }

    setIsSaving(true);
    try {
      const token = await user.getIdToken();
      const { visible, availability, slug: currentSlug, profilePicture, profilePictureTransform, ...cvContent } = updatedData;

      if (cvContent.personne) {
        const { profilePicture: _, profilePictureTransform: __, ...cleanPersonne } = cvContent.personne as any;
        cvContent.personne = cleanPersonne;
      }

      const payload = {
        action: "insert-cv",
        email: user.email,
        nom: updatedData.personne.nom,
        prenom: updatedData.personne.prenom,
        profilePicture: updatedData.isMaster ? profilePicture : null,
        profilePictureTransform: updatedData.isMaster ? profilePictureTransform : null,
        slug: currentSlug,
        visible: updatedData.isMaster ? (visible ?? true) : false,
        availability: availability || 'immediate',
        isMain: updatedData.isMaster || false,
        cvName: updatedData.isMaster ? "main" : (updatedData.optimizedFor || "Version optimisée"),
        data: cvContent
      };

      const response = await fetch("/api/n8n-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement");

      const result = await response.json();
      const slug = result[0]?.slug;

      if (!slug) throw new Error("Slug non valide");

      const savedCv = { ...updatedData, slug };
      const existingIndex = cvs.findIndex(c => c.slug === updatedData.slug);

      if (existingIndex !== -1) {
        const updatedCvs = [...cvs];
        updatedCvs[existingIndex] = savedCv;
        setCvs(updatedCvs);
      } else {
        setCvs(prev => [...prev, savedCv]);
      }

      setNotification({ message: "Candidature enregistrée avec succès !", type: 'success' });

      setTimeout(() => {
        // Redirect to candidatures dashboard after creating a new candidature
        router.push(`/candidatures`);
      }, 1500);
    } catch (error) {
      console.error(error);
      setNotification({ message: "Une erreur est survenue", type: 'error' });
    } finally {
      setIsSaving(false);
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
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold">Réessayer</button>
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
          <p className="text-slate-600 mb-8 leading-relaxed">Vous devez être connecté pour accéder à votre espace personnel.</p>
          <button onClick={() => login()} className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100">
            <LogIn className="w-5 h-5" /> Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (!masterCv) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-lg">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FilePlus className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Prêt à créer votre premier CV ?</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">Importez votre CV actuel pour commencer !</p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100">Créer mon premier CV</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-2xl shadow-lg font-semibold text-sm transition-all animate-in slide-in-from-right ${
          notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Mon CV de Référence</h2>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">Source de référence</span>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden group transition-all hover:shadow-2xl hover:shadow-indigo-100/50">
            <div className="p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-48 h-64 bg-slate-50 rounded-2xl border border-slate-100 flex-shrink-0 overflow-hidden relative">
                <div className="absolute inset-0 p-4 scale-[0.25] origin-top-left w-[400%] h-[400%] pointer-events-none opacity-40">
                  <CVDisplay
                    data={masterCv}
                    slug={masterCv.slug || ""}
                    isPrintMode
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
              </div>

              <div className="flex-1 space-y-6 text-center md:text-left">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">{masterCv.personne.prenom} {masterCv.personne.nom}</h3>
                  <p className="text-xl text-indigo-600 font-medium">{masterCv.personne.titre_professionnel}</p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Link href="/mon-cv/main/edit" className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                    <Edit3 className="w-5 h-5" /> Éditer
                  </Link>
                  <button
                    onClick={() => setIsRebuildAssistantOpen(true)}
                    className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-indigo-200 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-sm"
                  >
                    <Sparkles className="w-5 h-5" /> Reconstruire
                  </button>
                  <button
                    onClick={() => setIsOfferOptimizerOpen(true)}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all"
                    disabled={isSaving}
                  >
                    <Sparkles className="w-5 h-5" /> Nouvelle candidature
                  </button>
                </div>

                <p className="text-sm text-slate-400">
                  Créez une candidature depuis ce CV pour postuler à une offre spécifique.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <RebuildAssistant
        isOpen={isRebuildAssistantOpen}
        onClose={() => setIsRebuildAssistantOpen(false)}
        cvData={masterCv}
        onSuccess={async (optimizedData) => {
          sessionStorage.setItem('rebuilt_cv_data', JSON.stringify(optimizedData));
          router.push('/mon-cv/main/edit');
          setIsRebuildAssistantOpen(false);
        }}
      />

      <OfferOptimizer
        isOpen={isOfferOptimizerOpen}
        onClose={() => setIsOfferOptimizerOpen(false)}
        cvData={masterCv}
        existingTitles={cvs.map(c => c.isMaster ? "main" : (c.optimizedFor || ""))}
        onSuccess={async (optimizedData, saveAsNew) => {
          if (saveAsNew) {
            const newCv = {
              ...optimizedData,
              isMaster: false,
              optimizedFor: optimizedData.optimizedFor || "Version optimisée",
              slug: `cv-${Date.now()}`
            };
            await handleSave(newCv);
          } else {
            setNotification({ message: "Préparation du téléchargement...", type: 'success' });
          }
          setIsOfferOptimizerOpen(false);
        }}
      />
    </div>
  );
}
