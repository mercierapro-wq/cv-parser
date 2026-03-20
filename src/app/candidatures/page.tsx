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
  Briefcase,
  Trash2,
  FileText,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import CVDisplay from "@/components/CVDisplay";
import ApplicationManagerModal from "@/components/ApplicationManagerModal";
import InterviewSimulator from "@/components/InterviewSimulator";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import OfferOptimizer from "@/components/OfferOptimizer";

export default function CandidaturesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <CandidaturesContent />
    </Suspense>
  );
}

function CandidaturesContent() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();
  const [cvs, setCvs] = useState<CVData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Offer Optimizer state
  const [isOfferOptimizerOpen, setIsOfferOptimizerOpen] = useState(false);
  const [offerOptimizerKey, setOfferOptimizerKey] = useState(0);

  // Application Manager state
  const [isApplicationManagerOpen, setIsApplicationManagerOpen] = useState(false);
  const [currentCvId, setCurrentCvId] = useState<string | null>(null);
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState<string | null>(null);
  const [fetchedOffer, setFetchedOffer] = useState<string | null>(null);
  const [isFetchingOffer, setIsFetchingOffer] = useState(false);

  // Interview Simulator state
  const [interviewCv, setInterviewCv] = useState<CVData | null>(null);

  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cvToDeleteId, setCvToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const masterCv = cvs.find(cv => cv.isMaster) || cvs[0];
  const candidatures = cvs.filter(cv => !cv.isMaster && cv !== masterCv);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
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
          throw new Error("Erreur lors de la récupération des candidatures");
        }

        const data = await response.json();
        const rawDataList = Array.isArray(data) ? data : [data];

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
            jobOffer: rawData.offer || "",
            cover_letter: rawData.coverLetter || rawData.cover_letter || content.coverLetter || content.cover_letter || "",
            id: rawData._id
          };
        });

        setCvs(normalizedCvs);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Impossible de charger vos candidatures. Veuillez réessayer plus tard.");
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

  const handleSaveNewCandidature = async (optimizedData: CVData) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const token = await user.getIdToken();
      const { visible, availability, slug: currentSlug, profilePicture, profilePictureTransform, ...cvContent } = optimizedData;

      if (cvContent.personne) {
        const { profilePicture: _, profilePictureTransform: __, ...cleanPersonne } = cvContent.personne as any;
        cvContent.personne = cleanPersonne;
      }

      const payload = {
        action: "insert-cv",
        email: user.email,
        nom: optimizedData.personne.nom,
        prenom: optimizedData.personne.prenom,
        profilePicture: null,
        profilePictureTransform: null,
        slug: `cv-${Date.now()}`,
        visible: false,
        availability: availability || 'immediate',
        isMain: false,
        cvName: optimizedData.optimizedFor || "Candidature",
        offer: optimizedData.jobOffer,
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
      const slug = result[0]?.slug || payload.slug;

      const newCandidature: CVData = {
        ...optimizedData,
        slug,
        isMaster: false,
        id: result[0]?._id || result[0]?.id
      };

      setCvs(prev => [...prev, newCandidature]);
      setNotification({ message: "Candidature créée avec succès !", type: 'success' });
    } catch (error) {
      console.error(error);
      setNotification({ message: "Une erreur est survenue lors de la création", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (cvId: string) => {
    setCvToDeleteId(cvId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!cvToDeleteId || !user) return;

    setIsDeleting(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/n8n-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "delete-cv",
          _id: cvToDeleteId
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      setCvs(prevCvs => prevCvs.filter(cv => cv.id !== cvToDeleteId));
      setNotification({ message: "Candidature supprimée avec succès", type: 'success' });
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      setNotification({ message: "Erreur lors de la suppression", type: 'error' });
    } finally {
      setIsDeleting(false);
      setCvToDeleteId(null);
    }
  };

  const handleOpenApplicationManager = async (cv: CVData) => {
    if (!cv.cover_letter && cv.id) {
      setIsFetchingOffer(true);
      try {
        const token = await user?.getIdToken();
        const response = await fetch("/api/n8n-proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            action: "get-offer",
            _id: cv.id
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawData = Array.isArray(data) ? data[0] : data;
          const coverLetter = rawData?.coverLetter;
          const offerText = rawData?.offer;

          if (offerText) setFetchedOffer(offerText);

          if (coverLetter) {
            setCoverLetterText(coverLetter);
            setCurrentCvId(cv.id || null);
            setCvs(prev => prev.map(c => c.id === cv.id ? { ...c, cover_letter: coverLetter } : c));
            setIsApplicationManagerOpen(true);
            setIsFetchingOffer(false);
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching cover letter:", error);
      } finally {
        setIsFetchingOffer(false);
      }
    }

    setCoverLetterText(cv.cover_letter || "");
    setCurrentCvId(cv.id || null);
    setIsApplicationManagerOpen(true);
  };

  const handleGenerateCoverLetter = async () => {
    const cv = cvs.find(c => c.id === currentCvId);
    if (!cv || !cv.jobOffer || !currentCvId || !user) {
      setNotification({ message: "L'offre d'emploi est manquante pour générer la lettre", type: 'error' });
      return;
    }

    setGeneratingCoverLetter(currentCvId);
    try {
      const token = await user.getIdToken();
      const { profilePicture: _, profilePictureTransform: __, ...cvWithoutImage } = cv;

      const response = await fetch("/api/n8n-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "create-cover-letter",
          cv: cvWithoutImage,
          job_offer: cv.jobOffer
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la génération de la lettre de motivation");

      const result = await response.json();
      const text = Array.isArray(result) ? result[0]?.output : result?.output;

      if (!text) throw new Error("Format de réponse invalide");

      setCoverLetterText(text);
      setCvs(prev => prev.map(c => c.id === currentCvId ? { ...c, cover_letter: text } : c));
      setNotification({ message: "Lettre de motivation générée !", type: 'success' });
    } catch (error) {
      console.error(error);
      setNotification({ message: "Une erreur est survenue lors de la génération", type: 'error' });
    } finally {
      setGeneratingCoverLetter(null);
    }
  };

  const handleDownloadCoverLetterPDF = async (currentText: string) => {
    if (!currentText) return;
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: sans-serif; line-height: 1.6; padding: 40px; color: #334155; }
            .content { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="content">${currentText}</div>
        </body>
        </html>
      `;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
    }
  };

  const handleSaveOffer = async (offer: string) => {
    if (!currentCvId || !user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/n8n-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "save-offer",
          _id: currentCvId,
          offer: offer
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement de l'offre");

      const cv = cvs.find(c => c.id === currentCvId);
      const currentOffer = fetchedOffer;
      const isNewOffer = currentOffer !== offer;

      setCvs(prev => prev.map(c => c.id === currentCvId ? {
        ...c,
        jobOffer: c.isMaster ? offer : c.jobOffer,
        cover_letter: isNewOffer ? "" : c.cover_letter
      } : c));

      if (cv && !cv.isMaster) setFetchedOffer(offer);
      if (isNewOffer) setCoverLetterText("");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSaveCoverLetter = async (currentText: string) => {
    if (!currentCvId || !user) {
      setNotification({ message: "ID du CV manquant", type: 'error' });
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/n8n-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "save-cover-letter",
          _id: currentCvId,
          coverLetter: currentText
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement de la lettre");

      setCoverLetterText(currentText);
      setNotification({ message: "Lettre de motivation enregistrée !", type: 'success' });

      setTimeout(() => {
        setIsApplicationManagerOpen(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      setNotification({ message: "Une erreur est survenue lors de l'enregistrement", type: 'error' });
      throw error;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Chargement de vos candidatures...</p>
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
          <p className="text-slate-600 mb-8 leading-relaxed">Vous devez être connecté pour accéder à vos candidatures.</p>
          <button onClick={() => login()} className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100">
            <LogIn className="w-5 h-5" /> Se connecter
          </button>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mes Candidatures</h1>
            <p className="text-slate-500 text-sm mt-1">CV adapté, lettre de motivation et simulateur d&apos;entretien pour chaque offre</p>
          </div>
          <button
            onClick={() => { setOfferOptimizerKey(k => k + 1); setIsOfferOptimizerOpen(true); }}
            disabled={!masterCv || isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all text-sm disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" /> Nouvelle candidature
          </button>
        </div>

        {/* Candidatures grid */}
        {candidatures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidatures.map((cv, idx) => (
              <div
                key={cv.id || idx}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-indigo-50 transition-all group flex flex-col"
              >
                {/* CV Preview thumbnail */}
                <div className="h-48 bg-slate-50 rounded-t-3xl border-b border-slate-100 overflow-hidden relative">
                  <div className="absolute inset-0 p-4 scale-[0.2] origin-top-left w-[500%] h-[500%] pointer-events-none opacity-30">
                    <CVDisplay data={cv} slug={cv.slug || ""} isPrintMode />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base leading-tight truncate">
                      {cv.optimizedFor || "Candidature sans titre"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{cv.personne.titre_professionnel}</p>
                  </div>

                  {/* Status badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      cv.cover_letter ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-50 text-slate-400 border border-slate-200'
                    }`}>
                      <FileText className="w-3 h-3" />
                      Lettre {cv.cover_letter ? 'rédigée' : 'à rédiger'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100">
                    <Link
                      href={`/mon-cv/${cv.id || cv.cvName || cv.optimizedFor || "candidature"}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> CV
                    </Link>
                    <button
                      onClick={() => handleOpenApplicationManager(cv)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
                      title="Lettre de motivation"
                    >
                      <Briefcase className="w-3.5 h-3.5" /> Lettre
                    </button>
                    <button
                      onClick={() => setInterviewCv(cv)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-violet-50 text-violet-700 rounded-xl text-xs font-bold hover:bg-violet-100 transition-all"
                      title="Simulateur d'entretien"
                    >
                      <Target className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => cv.id && handleDelete(cv.id)}
                      className="flex items-center justify-center py-2 px-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Supprimer la candidature"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Aucune candidature pour l&apos;instant</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Créez votre première candidature depuis votre CV de référence en cliquant sur &quot;Nouvelle candidature&quot;.
            </p>
            <button
              onClick={() => { setOfferOptimizerKey(k => k + 1); setIsOfferOptimizerOpen(true); }}
              disabled={!masterCv}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all text-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> Créer ma première candidature
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {masterCv && (
        <OfferOptimizer
          key={offerOptimizerKey}
          isOpen={isOfferOptimizerOpen}
          onClose={() => setIsOfferOptimizerOpen(false)}
          cvData={masterCv}
          existingTitles={cvs.map(c => c.isMaster ? "main" : (c.optimizedFor || ""))}
          onSuccess={async (optimizedData, saveAsNew) => {
            if (saveAsNew) {
              await handleSaveNewCandidature(optimizedData);
            } else {
              setNotification({ message: "Préparation du téléchargement...", type: 'success' });
            }
            setIsOfferOptimizerOpen(false);
          }}
        />
      )}

      <ApplicationManagerModal
        isOpen={isApplicationManagerOpen}
        onClose={() => setIsApplicationManagerOpen(false)}
        cvData={cvs.find(c => c.id === currentCvId) || (masterCv as CVData)}
        onSaveOffer={handleSaveOffer}
        onSaveCoverLetter={handleSaveCoverLetter}
        onDownloadCoverLetterPDF={handleDownloadCoverLetterPDF}
        onGenerateCoverLetter={handleGenerateCoverLetter}
        isGeneratingCoverLetter={!!generatingCoverLetter}
        isFetchingOffer={isFetchingOffer}
        fetchedOffer={fetchedOffer}
      />

      <InterviewSimulator
        isOpen={!!interviewCv}
        onClose={() => setInterviewCv(null)}
        cvData={interviewCv || (masterCv as CVData)}
        jobOffer={interviewCv?.jobOffer}
        defaultExpanded={true}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCvToDeleteId(null);
        }}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Supprimer cette candidature ?"
        message="Êtes-vous sûr de vouloir supprimer cette candidature ? Le CV adapté, la lettre de motivation et les données associées seront définitivement supprimés."
      />
    </div>
  );
}
