"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CVData, Experience, Formation, Projet, Certification } from "@/types/cv";
import { 
  Save, 
  X,
  Loader2,
  Edit3,
  Eye
} from "lucide-react";
import CVEditor from "@/components/CVEditor";
import CVDisplay from "@/components/CVDisplay";

export default function EditCVPage() {
  const router = useRouter();
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const formatParsedDate = (dateStr: string) => {
    if (!dateStr) return "";
    
    const monthsMap: { [key: string]: string } = {
      'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04', 'mai': '05', 'juin': '06',
      'juillet': '07', 'août': '08', 'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12',
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
      'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };

    const normalized = dateStr.toLowerCase().trim();
    
    for (const [monthName, monthNum] of Object.entries(monthsMap)) {
      if (normalized.includes(monthName)) {
        const yearMatch = normalized.match(/\d{4}/);
        if (yearMatch) {
          return `${monthNum}/${yearMatch[0]}`;
        }
      }
    }

    return dateStr;
  };

  useEffect(() => {
    const storedData = localStorage.getItem("pending-cv-data");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        
        const normalizedData: CVData = {
          personne: {
            prenom: parsed.personne?.prenom || "",
            nom: parsed.personne?.nom || "",
            titre_professionnel: parsed.personne?.titre_professionnel || "",
            contact: {
              email: parsed.personne?.contact?.email || "",
              telephone: parsed.personne?.contact?.telephone || "",
              linkedin: parsed.personne?.contact?.linkedin || "",
              ville: parsed.personne?.contact?.ville || ""
            }
          },
          resume: parsed.resume || "",
          experiences: (Array.isArray(parsed.experiences) ? parsed.experiences : []).map((exp: Experience) => ({
            ...exp,
            periode_debut: formatParsedDate(exp.periode_debut),
            periode_fin: formatParsedDate(exp.periode_fin)
          })),
          projets: (Array.isArray(parsed.projets) ? parsed.projets : []).map((proj: Projet) => ({
            ...proj,
            periode_debut: formatParsedDate(proj.periode_debut),
            periode_fin: formatParsedDate(proj.periode_fin)
          })),
          formation: (Array.isArray(parsed.formation) ? parsed.formation : []).map((form: Formation) => ({
            ...form,
            annee: formatParsedDate(form.annee)
          })),
          competences: {
            soft_skills: Array.isArray(parsed.competences?.soft_skills) ? parsed.competences.soft_skills : [],
            hard_skills: Array.isArray(parsed.competences?.hard_skills) ? parsed.competences.hard_skills : [],
            langues: Array.isArray(parsed.competences?.langues) ? parsed.competences.langues : []
          },
          certifications: (Array.isArray(parsed.certifications) ? parsed.certifications : []).map((cert: Certification) => ({
            ...cert,
            date_obtention: formatParsedDate(cert.date_obtention)
          }))
        };
        
        setCvData(normalizedData);
      } catch (e) {
        console.error("Erreur de parsing des données CV", e);
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const handlePublish = async (updatedData: CVData) => {
    if (!updatedData) return;

    // Validation Email
    if (!updatedData.personne.contact.email.trim()) {
      setNotification({ 
        message: "L'adresse email est obligatoire pour publier le CV.", 
        type: 'error' 
      });
      return;
    }

    setIsPublishing(true);
    setNotification(null);

    try {
      const insertUrl = process.env.NEXT_PUBLIC_INSERT_CV_URL;
      
      if (!insertUrl) {
        throw new Error("La variable d'environnement NEXT_PUBLIC_INSERT_CV_URL n'est pas définie");
      }

      const response = await fetch(insertUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la publication du CV");
      }

      const result = await response.json();
      const slug = result[0]?.slug;

      if (!slug) {
        throw new Error("Le serveur n'a pas renvoyé de slug valide");
      }

      setNotification({ 
        message: "CV publié avec succès !", 
        type: 'success' 
      });
      localStorage.removeItem("pending-cv-data");
      
      setTimeout(() => {
        router.push(`/cv/${slug}`);
      }, 1500);
    } catch (error) {
      console.error("Erreur:", error);
      setNotification({ 
        message: "Une erreur est survenue lors de la publication du CV.", 
        type: 'error' 
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!cvData) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header Toolbar */}
      <div className="sticky top-0 z-[100] w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Zone Gauche : Statut (Guest mode) */}
          <div className="flex items-center gap-2 flex-1">
            <div className="h-10 px-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shrink-0" />
              <span className="hidden sm:inline">Mode Invité</span>
            </div>
          </div>

          {/* Zone Centrale : Mode d'Affichage (Segmented Switch) */}
          <div className="flex bg-slate-100 p-1 rounded-xl h-10">
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
          <div className="flex items-center justify-end gap-2 flex-1">
            {/* Publish Button */}
            {!showPreview && (
              <button
                onClick={() => cvData && handlePublish(cvData)}
                disabled={isPublishing}
                className="h-10 flex items-center justify-center gap-2 px-4 sm:px-8 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm"
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isPublishing ? "Publication..." : "Publier mon CV"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Notifications */}
          {notification && (
            <div 
              className={`fixed top-20 right-4 z-[110] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${
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
              <CVDisplay data={cvData} />
            </div>
          ) : (
            <CVEditor 
              initialData={cvData} 
              isGuest={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
