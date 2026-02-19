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
  FileText,
  Sparkles,
  Trash2,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import CVDisplay from "@/components/CVDisplay";
import RebuildAssistant from "@/components/RebuildAssistant";
import OfferOptimizer from "@/components/OfferOptimizer";
import ApplicationManagerModal from "@/components/ApplicationManagerModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState<string | null>(null);
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null);
  const [isApplicationManagerOpen, setIsApplicationManagerOpen] = useState(false);
  const [currentCvId, setCurrentCvId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cvToDeleteId, setCvToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fetchedOffer, setFetchedOffer] = useState<string | null>(null);
  const [isFetchingOffer, setIsFetchingOffer] = useState(false);

  const masterCv = cvs.find(cv => cv.isMaster) || cvs[0];
  const adaptedVersions = cvs.filter(cv => !cv.isMaster && cv !== masterCv);

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
            jobOffer: rawData.offer || "",
            cover_letter: rawData.coverLetter || rawData.cover_letter || content.coverLetter || content.cover_letter || "",
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
      const insertUrl = process.env.NEXT_PUBLIC_INSERT_CV_URL;
      if (!insertUrl) throw new Error("URL non configurée");

      const { visible, availability, slug: currentSlug, profilePicture, profilePictureTransform, ...cvContent } = updatedData;
      
      if (cvContent.personne) {
        const { profilePicture: _, profilePictureTransform: __, ...cleanPersonne } = cvContent.personne as any;
        cvContent.personne = cleanPersonne;
      }

      const payload = {
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
        offer: updatedData.jobOffer,
        data: cvContent
      };

      const response = await fetch(insertUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      
      setNotification({ message: "CV enregistré avec succès !", type: 'success' });
      
      setTimeout(() => {
        const cvName = updatedData.isMaster ? "main" : (updatedData.optimizedFor || "Version optimisée");
        router.push(`/mon-cv/${cvName}/edit`);
      }, 1500);
    } catch (error) {
      console.error(error);
      setNotification({ message: "Une erreur est survenue", type: 'error' });
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
      const deleteUrl = process.env.NEXT_PUBLIC_DELETE_CV_URL;
      if (!deleteUrl) throw new Error("URL de suppression non configurée");

      const response = await fetch(deleteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: cvToDeleteId }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du CV");
      }

      // Update local state
      setCvs(prevCvs => prevCvs.filter(cv => cv.id !== cvToDeleteId));
      setNotification({ message: "CV supprimé avec succès", type: 'success' });
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
    // Si on n'a pas de lettre localement, on essaie de la récupérer via l'offre
    if (!cv.cover_letter && cv.id) {
      setIsFetchingOffer(true);
      try {
        const getOfferUrl = process.env.NEXT_PUBLIC_GET_OFFER_URL;
        if (getOfferUrl) {
          const response = await fetch(getOfferUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: cv.id }),
          });

          if (response.ok) {
            const data = await response.json();
            const rawData = Array.isArray(data) ? data[0] : data;
            const coverLetter = rawData?.coverLetter;
            const offerText = rawData?.offer;
            
            if (offerText) {
              setFetchedOffer(offerText);
            }

            if (coverLetter) {
              setCoverLetterText(coverLetter);
              setCurrentCvId(cv.id || null);
              // Update the CV in the list
              setCvs(prev => prev.map(c => c.id === cv.id ? { ...c, cover_letter: coverLetter } : c));
              setIsApplicationManagerOpen(true);
              setIsFetchingOffer(false);
              return;
            }
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
    if (!cv || !cv.jobOffer || !currentCvId) {
      setNotification({ message: "L'offre d'emploi est manquante pour générer la lettre", type: 'error' });
      return;
    }
    
    setGeneratingCoverLetter(currentCvId);
    try {
      const url = process.env.NEXT_PUBLIC_CREATE_COVER_LETTER_URL;
      if (!url) throw new Error("URL non configurée");

      const { profilePicture: _, profilePictureTransform: __, ...cvWithoutImage } = cv;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv: cvWithoutImage,
          job_offer: cv.jobOffer
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la génération de la lettre de motivation");

      const result = await response.json();
      const text = Array.isArray(result) ? result[0]?.output : result?.output;
      
      if (!text) throw new Error("Format de réponse invalide");

      setCoverLetterText(text);
      // Update the CV in the list as well
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
      // On crée un document HTML simple pour la lettre
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

      // On utilise window.print() comme alternative fiable.
      
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
    if (!currentCvId) return;

    try {
      const url = process.env.NEXT_PUBLIC_SAVE_OFFER_URL;
      if (!url) throw new Error("URL non configurée");

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: currentCvId,
          offer: offer
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement de l'offre");

      // Si l'offre est nouvelle, on efface l'ancienne lettre
      const cv = cvs.find(c => c.id === currentCvId);
      const currentOffer = cv?.isMaster ? cv.jobOffer : fetchedOffer;
      const isNewOffer = currentOffer !== offer;
      
      setCvs(prev => prev.map(c => c.id === currentCvId ? { 
        ...c, 
        jobOffer: c.isMaster ? offer : c.jobOffer,
        cover_letter: isNewOffer ? "" : c.cover_letter 
      } : c));
      
      if (cv && !cv.isMaster) {
        setFetchedOffer(offer);
      }
      
      if (isNewOffer) {
        setCoverLetterText("");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSaveCoverLetter = async (currentText: string) => {
    if (!currentCvId) {
      setNotification({ message: "ID du CV manquant", type: 'error' });
      return;
    }

    try {
      const url = process.env.NEXT_PUBLIC_SAVE_COVER_LETTER_URL;
      if (!url) throw new Error("URL non configurée");

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: currentCvId,
          coverLetter: currentText
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement de la lettre");

      setCoverLetterText(currentText);
      setNotification({ message: "Lettre de motivation enregistrée !", type: 'success' });
      
      // Redirection vers le dashboard (ici on ferme juste la modale car on y est déjà)
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
      <div className="max-w-5xl mx-auto space-y-12">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Mon CV de Référence</h2>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">Source de référence</span>
            </div>
          </div>

          {masterCv && (
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden group transition-all hover:shadow-2xl hover:shadow-indigo-100/50">
              <div className="p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-48 h-64 bg-slate-50 rounded-2xl border border-slate-100 flex-shrink-0 overflow-hidden relative">
                  <div className="absolute inset-0 p-4 scale-[0.25] origin-top-left w-[400%] h-[400%] pointer-events-none opacity-40">
                    <CVDisplay 
                       data={masterCv} 
                       slug={masterCv.slug || ""} 
                       isPrintMode 
                       onViewCoverLetter={() => handleOpenApplicationManager(masterCv)}
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
                    <button onClick={() => setIsOfferOptimizerOpen(true)} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all">
                      <Sparkles className="w-5 h-5" /> Optimiser pour une offre
                    </button>
                    <button 
                      onClick={() => handleOpenApplicationManager(masterCv)} 
                      className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <Briefcase className="w-5 h-5 text-indigo-600" /> Candidature
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Versions adaptées</h2>
          {adaptedVersions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {adaptedVersions.map((cv, idx) => (
                <div key={cv.id || idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all opacity-80 hover:opacity-100 group">
                  <div className="space-y-4">
                    <div className="h-40 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative">
                      <div className="absolute inset-0 p-4 scale-[0.2] origin-top-left w-[500%] h-[500%] pointer-events-none opacity-30">
                        <CVDisplay data={cv} slug={cv.slug || ""} isPrintMode />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 truncate">{cv.optimizedFor || "Version adaptée"}</h4>
                      <p className="text-xs text-slate-500">Dernière modif : {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Link href={`/mon-cv/${cv.id || cv.cvName || cv.optimizedFor || "Version-adaptee"}/edit`} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all text-center">Éditer</Link>
                      <button 
                        onClick={() => handleOpenApplicationManager(cv)} 
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Candidature"
                      >
                        <Briefcase className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => cv.id && handleDelete(cv.id)} 
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
              <p className="text-slate-500 font-medium">Vous n&apos;avez pas encore de versions adaptées. Utilisez l&apos;IA pour en créer une !</p>
            </div>
          )}
        </section>

        {masterCv && (
          <RebuildAssistant 
            isOpen={isRebuildAssistantOpen} 
            onClose={() => setIsRebuildAssistantOpen(false)} 
            cvData={masterCv} 
            onSuccess={async (optimizedData) => {
              // Stocker temporairement les données pour la page d'édition sans enregistrer en BDD
              sessionStorage.setItem('rebuilt_cv_data', JSON.stringify(optimizedData));
              // Rediriger vers la page d'édition du CV de référence
              router.push('/mon-cv/main/edit');
              setIsRebuildAssistantOpen(false);
            }} 
          />
        )}

        {masterCv && (
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
        )}

        <ApplicationManagerModal 
          isOpen={isApplicationManagerOpen}
          onClose={() => setIsApplicationManagerOpen(false)}
          cvData={cvs.find(c => c.id === currentCvId) || masterCv}
          onSaveOffer={handleSaveOffer}
          onSaveCoverLetter={handleSaveCoverLetter}
          onDownloadCoverLetterPDF={handleDownloadCoverLetterPDF}
          onGenerateCoverLetter={handleGenerateCoverLetter}
          isGeneratingCoverLetter={!!generatingCoverLetter}
          isFetchingOffer={isFetchingOffer}
          fetchedOffer={fetchedOffer}
        />

        <DeleteConfirmationModal 
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCvToDeleteId(null);
          }}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
