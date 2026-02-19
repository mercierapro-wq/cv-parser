"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CVData } from "@/types/cv";
import { 
  Save, 
  X,
  Loader2,
  Eye,
  Edit3,
  Share2,
  Sparkles,
  Target,
  Briefcase
} from "lucide-react";
import CVEditor from "@/components/CVEditor";
import CVDisplay from "@/components/CVDisplay";
import ToolbarSettings from "@/components/ToolbarSettings";
import RebuildAssistant from "@/components/RebuildAssistant";
import OfferOptimizer from "@/components/OfferOptimizer";
import ApplicationManagerModal from "@/components/ApplicationManagerModal";
import ShareModal from "@/components/ShareModal";
import DownloadPDFButton from "@/components/DownloadPDFButton";

export default function EditCVPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <EditCVContent />
    </Suspense>
  );
}

function EditCVContent() {
  const router = useRouter();
  const params = useParams();
  const cvNameParam = params.cvName as string;
  const { user, loading: authLoading } = useAuth();
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRebuildAssistantOpen, setIsRebuildAssistantOpen] = useState(false);
  const [isOfferOptimizerOpen, setIsOfferOptimizerOpen] = useState(false);
  const [isApplicationManagerOpen, setIsApplicationManagerOpen] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [fetchedOffer, setFetchedOffer] = useState<string | null>(null);
  const [isFetchingOffer, setIsFetchingOffer] = useState(false);
  const [existingTitles, setExistingTitles] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll to hide toolbar logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsToolbarVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsToolbarVisible(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const fetchCV = async () => {
      if (!user?.email) return;

      try {
        setIsLoading(true);

        // Vérifier d'abord si des données reconstruites sont en attente (via le dashboard)
        const rebuiltData = sessionStorage.getItem('rebuilt_cv_data');
        if (rebuiltData && cvNameParam === 'main') {
          try {
            const parsedData = JSON.parse(rebuiltData);
            setCvData(parsedData);
            sessionStorage.removeItem('rebuilt_cv_data');
            // On continue quand même pour charger les existingTitles
          } catch (e) {
            console.error("Error parsing rebuilt data", e);
            sessionStorage.removeItem('rebuilt_cv_data');
          }
        }

        const getCvUrl = process.env.NEXT_PUBLIC_GET_CV_URL;
        if (!getCvUrl) throw new Error("URL non configurée");
        
        const response = await fetch(getCvUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération");

        const data = await response.json();
        const rawDataList = Array.isArray(data) ? data : [data];
        
        // Find master CV first to use its profile picture for others
        const masterRaw = rawDataList.find((raw, idx) => raw.isMaster ?? raw.isMain ?? (idx === 0));
        const masterPhoto = masterRaw?.profilePicture || (masterRaw?.data?.profilePicture) || "";
        const masterTransform = masterRaw?.profilePictureTransform || (masterRaw?.data?.profilePictureTransform);

        // Store all existing titles for uniqueness check
        const titles = rawDataList.map(rawData => {
          const isMain = rawData.isMaster ?? rawData.isMain ?? false;
          return isMain ? "main" : (rawData.cvName || rawData.optimizedFor || "");
        });
        setExistingTitles(titles);
        
        // Find the CV that matches cvNameParam
        const targetCv = rawDataList.find(rawData => {
          const isMain = rawData.isMaster ?? rawData.isMain ?? false;
          const name = isMain ? "main" : (rawData.cvName || rawData.optimizedFor || "");
          // Decode cvNameParam in case it contains encoded characters like %20
          const decodedParam = decodeURIComponent(cvNameParam);
          return name === decodedParam || name === cvNameParam || rawData._id === cvNameParam;
        });

        if (!targetCv) {
          router.push("/mon-cv");
          return;
        }

        const content = targetCv.data || targetCv;
        const isMaster = targetCv.isMaster ?? targetCv.isMain ?? (cvNameParam === 'main');
        const normalized: CVData = {
          personne: {
            prenom: content.prenom || content.personne?.prenom || targetCv.prenom || "",
            nom: content.nom || content.personne?.nom || targetCv.nom || "",
            titre_professionnel: content.titre_professionnel || content.personne?.titre_professionnel || "",
            contact: {
              email: targetCv.email || content.email || content.personne?.contact?.email || "",
              telephone: content.telephone || content.personne?.contact?.telephone || "",
              linkedin: content.linkedin || content.personne?.contact?.linkedin || "",
              ville: content.ville || content.personne?.contact?.ville || ""
            }
          },
          profilePicture: isMaster ? (targetCv.profilePicture || content.profilePicture || "") : masterPhoto,
          profilePictureTransform: isMaster ? (targetCv.profilePictureTransform || content.profilePictureTransform) : masterTransform,
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
          visible: targetCv.visible ?? content.visible ?? true,
          availability: targetCv.availability || content.availability || 'immediate',
          slug: targetCv.slug || content.slug || "",
          isMaster: isMaster,
          cvName: targetCv.cvName || (isMaster ? "main" : ""),
          optimizedFor: isMaster ? "" : (targetCv.cvName || targetCv.optimizedFor || ""),
          jobOffer: targetCv.offer || "",
          cover_letter: targetCv.coverLetter || targetCv.cover_letter || content.coverLetter || content.cover_letter || "",
          id: targetCv._id
        };

        setCvData(prev => prev || normalized);
      } catch (err) {
        console.error(err);
        router.push("/mon-cv");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchCV();
    else if (!authLoading) setIsLoading(false);
  }, [user, authLoading, cvNameParam, router]);

  const handleOpenApplicationManager = async () => {
    setIsApplicationManagerOpen(true);
    if (cvData?.isMaster || (fetchedOffer && cvData?.cover_letter) || !cvData?.id) return;

    setIsFetchingOffer(true);
    try {
      const getOfferUrl = process.env.NEXT_PUBLIC_GET_OFFER_URL;
      if (!getOfferUrl) throw new Error("URL non configurée");

      const response = await fetch(getOfferUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: cvData.id }),
      });

      if (!response.ok) throw new Error("Erreur lors de la récupération de l'offre");

      const data = await response.json();
      const rawData = Array.isArray(data) ? data[0] : data;
      const offerText = rawData?.offer;
      const coverLetter = rawData?.coverLetter;
      
      if (offerText) {
        setFetchedOffer(offerText);
      }

      if (coverLetter && !cvData.cover_letter) {
        setCoverLetterText(coverLetter);
        setCvData(prev => prev ? { ...prev, cover_letter: coverLetter } : null);
      }
    } catch (error) {
      console.error(error);
      if (!fetchedOffer) setFetchedOffer("Erreur lors du chargement de l'offre.");
    } finally {
      setIsFetchingOffer(false);
    }
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (!cvData?.id || !newTitle) return;

    try {
      const updateUrl = process.env.NEXT_PUBLIC_UPDATE_CV_URL;
      if (!updateUrl) throw new Error("URL de mise à jour non configurée");

      const response = await fetch(updateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: cvData.id,
          cvName: newTitle
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du titre");
      
      setNotification({ message: "Titre mis à jour !", type: 'success' });
    } catch (error) {
      console.error(error);
      setNotification({ message: "Erreur lors de la mise à jour du titre", type: 'error' });
    }
  };

  const handleSave = async (updatedData: CVData) => {
    if (!updatedData || !user) return;
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
        profilePicture: (updatedData.isMaster ?? (cvNameParam === 'main')) ? profilePicture : null,
        profilePictureTransform: (updatedData.isMaster ?? (cvNameParam === 'main')) ? profilePictureTransform : null,
        slug: currentSlug,
        visible: (updatedData.isMaster ?? (cvNameParam === 'main')) ? (visible ?? true) : false,
        availability: availability || 'immediate',
        isMain: updatedData.isMaster ?? (cvNameParam === 'main'),
        cvName: (updatedData.isMaster ?? (cvNameParam === 'main')) ? "main" : (updatedData.optimizedFor || cvNameParam),
        offer: updatedData.jobOffer,
        data: cvContent
      };

      const response = await fetch(insertUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement");
      
      setNotification({ message: "CV enregistré avec succès !", type: 'success' });
      
      // Update local state with the new slug if it changed
      const result = await response.json();
      const newSlug = result[0]?.slug;
      if (newSlug && newSlug !== currentSlug) {
        setCvData(prev => prev ? { ...prev, slug: newSlug } : null);
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: "Une erreur est survenue", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!cvData) return;

    if (!cvData.jobOffer) {
      setNotification({ message: "L'offre d'emploi est manquante pour générer la lettre", type: 'error' });
      return;
    }
    
    setIsGeneratingCoverLetter(true);
    try {
      const url = process.env.NEXT_PUBLIC_CREATE_COVER_LETTER_URL;
      if (!url) throw new Error("URL non configurée");

      const { profilePicture, profilePictureTransform, ...cvWithoutImage } = cvData;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv: cvWithoutImage,
          job_offer: cvData.jobOffer
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la génération de la lettre de motivation");

      const result = await response.json();
      const text = Array.isArray(result) ? result[0]?.output : result?.output;
      
      if (!text) throw new Error("Format de réponse invalide");

      setCoverLetterText(text);
      setCvData(prev => prev ? { ...prev, cover_letter: text } : null);
      setNotification({ message: "Lettre de motivation générée !", type: 'success' });
    } catch (error) {
      console.error(error);
      setNotification({ message: "Une erreur est survenue lors de la génération", type: 'error' });
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleSaveOffer = async (offer: string) => {
    if (!cvData?.id) return;

    try {
      const url = process.env.NEXT_PUBLIC_SAVE_OFFER_URL;
      if (!url) throw new Error("URL non configurée");

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: cvData.id,
          offer: offer
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement de l'offre");

      // Si l'offre est nouvelle, on efface l'ancienne lettre
      const currentOffer = cvData.isMaster ? cvData.jobOffer : fetchedOffer;
      const isNewOffer = currentOffer !== offer;
      setCvData(prev => prev ? { 
        ...prev, 
        jobOffer: cvData.isMaster ? offer : prev.jobOffer,
        cover_letter: isNewOffer ? "" : prev.cover_letter 
      } : null);
      
      if (!cvData.isMaster) {
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
    if (!cvData?.id) {
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
          _id: cvData.id,
          coverLetter: currentText
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement de la lettre");

      setCoverLetterText(currentText);
      setCvData(prev => prev ? { ...prev, cover_letter: currentText } : null);
      setNotification({ message: "Lettre de motivation enregistrée !", type: 'success' });
      
      // Redirection vers le dashboard après un court délai
      setTimeout(() => {
        router.push('/mon-cv');
      }, 1500);
    } catch (error) {
      console.error(error);
      setNotification({ message: "Une erreur est survenue lors de l'enregistrement", type: 'error' });
      throw error;
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

  useEffect(() => {
    if (!authLoading && !isLoading && (!user || !cvData)) {
      router.push("/mon-cv");
    }
  }, [user, cvData, authLoading, isLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Chargement de votre CV...</p>
      </div>
    );
  }

  if (!user || !cvData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className={`sticky top-0 z-[100] w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-transform duration-300 ${isToolbarVisible ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <button onClick={() => router.push('/mon-cv')} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm shrink-0">
            <X className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="flex items-center justify-between w-full gap-2 sm:gap-4">
              <div className="flex items-center gap-4">
                <ToolbarSettings 
                  cvData={cvData} 
                  setCvData={(newData) => setCvData(newData as CVData)} 
                  user={user} 
                  onShare={() => setIsShareModalOpen(true)}
                  onOpenApplicationManager={handleOpenApplicationManager}
                  onRebuild={() => setIsRebuildAssistantOpen(true)}
                />
              </div>

            <div className="flex bg-slate-100 p-1 rounded-xl h-10">
              <button onClick={() => setShowPreview(false)} className={`flex items-center gap-2 px-4 rounded-lg text-sm font-medium transition-all ${!showPreview ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">Édition</span>
              </button>
              <button onClick={() => setShowPreview(true)} className={`flex items-center gap-2 px-4 rounded-lg text-sm font-medium transition-all ${showPreview ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <Eye className="w-4 h-4" /> <span className="hidden sm:inline">Aperçu</span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2">
              {!showPreview && (
                <button 
                  onClick={handleOpenApplicationManager} 
                  className="hidden md:flex h-10 items-center gap-2 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium shrink-0"
                >
                  <Briefcase className="w-4 h-4 text-indigo-600" /> 
                  <span className="hidden md:inline">Candidature</span>
                </button>
              )}
              {!showPreview && cvData.isMaster && (
                <>
                  <button 
                    onClick={() => setIsRebuildAssistantOpen(true)} 
                    className="hidden md:flex h-10 items-center gap-2 px-4 bg-white border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all text-sm font-medium"
                  >
                    <Sparkles className="w-4 h-4" /> <span className="hidden md:inline">Reconstruire</span>
                  </button>
                </>
              )}
              {!showPreview && (
                <button onClick={() => handleSave(cvData)} disabled={isSaving} className="h-10 flex items-center justify-center gap-2 px-4 sm:px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all text-sm font-medium shadow-sm">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isSaving ? "Enregistrement..." : "Enregistrer"}</span>
                </button>
              )}
              <div className="hidden lg:flex items-center gap-2">
                <button onClick={() => setIsShareModalOpen(true)} className="h-10 w-10 flex items-center justify-center bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm"><Share2 className="w-4 h-4" /></button>
                <DownloadPDFButton slug={cvData.slug || ""} fileName={`CV_${cvData.personne.prenom}_${cvData.personne.nom}`.replace(/\s+/g, '_')} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {!cvData.isMaster && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    Nom de cette version
                  </h3>
                  <p className="text-xs text-slate-500">Personnalisez le nom pour mieux identifier ce CV (ex: Nom de l&apos;entreprise ou du poste)</p>
                </div>
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={cvData.optimizedFor || ""}
                    onChange={(e) => setCvData(prev => prev ? { ...prev, optimizedFor: e.target.value } : null)}
                    onBlur={(e) => handleUpdateTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateTitle((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    placeholder="Ex: Développeur Fullstack - Google"
                    className="w-full h-11 pl-4 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {notification && (
            <div className={`fixed top-20 right-4 z-[999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
              <p className="font-bold text-sm">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="ml-4 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
          )}

          {showPreview ? (
            <div className="animate-in fade-in duration-500">
              <CVDisplay 
                 data={cvData} 
                 slug={cvData.slug || ""} 
                 onViewCoverLetter={handleOpenApplicationManager}
               />
            </div>
          ) : (
            <CVEditor initialData={cvData} onChange={setCvData} />
          )}
        </div>
      </div>

      {isShareModalOpen && <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} slug={cvData.slug || ""} isVisible={cvData.visible ?? true} />}
      {isRebuildAssistantOpen && <RebuildAssistant isOpen={isRebuildAssistantOpen} onClose={() => setIsRebuildAssistantOpen(false)} cvData={cvData} onSuccess={(optimizedData) => { setCvData(optimizedData); setNotification({ message: "CV reconstruit avec succès !", type: 'success' }); setIsRebuildAssistantOpen(false); }} />}
      {isOfferOptimizerOpen && <OfferOptimizer isOpen={isOfferOptimizerOpen} onClose={() => setIsOfferOptimizerOpen(false)} cvData={cvData} existingTitles={existingTitles} onSuccess={async (optimizedData, saveAsNew) => { if (saveAsNew) { await handleSave(optimizedData); } setIsOfferOptimizerOpen(false); }} />}
      
      <ApplicationManagerModal 
        isOpen={isApplicationManagerOpen}
        onClose={() => setIsApplicationManagerOpen(false)}
        cvData={cvData}
        onSaveOffer={handleSaveOffer}
        onSaveCoverLetter={handleSaveCoverLetter}
        onDownloadCoverLetterPDF={handleDownloadCoverLetterPDF}
        onGenerateCoverLetter={handleGenerateCoverLetter}
        isGeneratingCoverLetter={isGeneratingCoverLetter}
        isFetchingOffer={isFetchingOffer}
        fetchedOffer={fetchedOffer}
      />
    </div>
  );
}
