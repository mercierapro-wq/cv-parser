"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CVData, Experience, Formation, Projet, Certification } from "@/types/cv";
import { 
  Briefcase, 
  User, 
  GraduationCap, 
  Wrench, 
  Save, 
  Plus, 
  Trash2,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  FolderKanban,
  Award,
  X,
  Loader2,
  FilePlus,
  Lock,
  LogIn,
  Eye,
  Edit3,
  BarChart3,
  Share2
} from "lucide-react";
import Link from "next/link";
import CVDisplay from "@/components/CVDisplay";
import VisibilityToggle from "@/components/VisibilityToggle";
import AvailabilitySelector from "@/components/AvailabilitySelector";
import ShareModal from "@/components/ShareModal";

export default function MonCVPage() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
              prenom: rawData.prenom || content.prenom || content.personne?.prenom || "",
              nom: rawData.nom || content.nom || content.personne?.nom || "",
              titre_professionnel: content.titre_professionnel || content.personne?.titre_professionnel || "",
              contact: {
                email: rawData.email || content.email || content.personne?.contact?.email || "",
                telephone: content.telephone || content.personne?.contact?.telephone || "",
                linkedin: content.linkedin || content.personne?.contact?.linkedin || "",
                ville: content.ville || content.personne?.contact?.ville || ""
              }
            },
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
            visible: content.visible ?? true, // Default to true if not specified
            availability: content.availability || 'immediate',
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

  const handleSave = async () => {
    if (!cvData) return;

    // Validation Email
    if (!cvData.personne.contact.email.trim()) {
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

      const response = await fetch(insertUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cvData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement du CV");
      }

      const result = await response.json();
      const slug = result[0]?.slug;

      if (!slug) {
        throw new Error("Le serveur n'a pas renvoyé de slug valide");
      }

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

  // Helper functions for form updates (copied and adapted from EditCVPage)
  const updatePersonne = (field: string, value: string) => {
    if (!cvData) return;
    setCvData({
      ...cvData,
      personne: { ...cvData.personne, [field]: value }
    });
  };

  const updateContact = (field: string, value: string) => {
    if (!cvData) return;
    setCvData({
      ...cvData,
      personne: {
        ...cvData.personne,
        contact: { ...cvData.personne.contact, [field]: value }
      }
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string | string[]) => {
    if (!cvData) return;
    const newExperiences = [...cvData.experiences];
    if (field === 'details' && typeof value === 'string') {
      newExperiences[index] = { ...newExperiences[index], details: value.split('\n').filter(l => l.trim() !== "") };
    } else {
      newExperiences[index] = { ...newExperiences[index], [field]: value } as Experience;
    }
    setCvData({ ...cvData, experiences: newExperiences });
  };

  const addExperience = () => {
    if (!cvData) return;
    const newExp: Experience = {
      poste: "",
      entreprise: "",
      periode_debut: "",
      periode_fin: "",
      description: "",
      competences_cles: [],
      details: []
    };
    setCvData({ ...cvData, experiences: [newExp, ...cvData.experiences] });
  };

  const removeExperience = (index: number) => {
    if (!cvData) return;
    const newExperiences = cvData.experiences.filter((_, i) => i !== index);
    setCvData({ ...cvData, experiences: newExperiences });
  };

  const addCompetenceCle = (expIndex: number, point: string) => {
    if (!cvData || !point.trim()) return;
    const newExperiences = [...cvData.experiences];
    const currentPoints = newExperiences[expIndex].competences_cles || [];
    if (!currentPoints.includes(point.trim())) {
      newExperiences[expIndex] = { 
        ...newExperiences[expIndex], 
        competences_cles: [...currentPoints, point.trim()] 
      };
      setCvData({ ...cvData, experiences: newExperiences });
    }
  };

  const removeCompetenceCle = (expIndex: number, pointIndex: number) => {
    if (!cvData) return;
    const newExperiences = [...cvData.experiences];
    newExperiences[expIndex] = { 
      ...newExperiences[expIndex], 
      competences_cles: newExperiences[expIndex].competences_cles.filter((_, i) => i !== pointIndex)
    };
    setCvData({ ...cvData, experiences: newExperiences });
  };

  const updateProjet = (index: number, field: keyof Projet, value: string) => {
    if (!cvData) return;
    const newProjets = [...cvData.projets];
    newProjets[index] = { ...newProjets[index], [field]: value };
    setCvData({ ...cvData, projets: newProjets });
  };

  const addProjet = () => {
    if (!cvData) return;
    const newProj: Projet = {
      nom: "",
      description: "",
      periode_debut: "",
      periode_fin: ""
    };
    setCvData({ ...cvData, projets: [newProj, ...cvData.projets] });
  };

  const removeProjet = (index: number) => {
    if (!cvData) return;
    const newProjets = cvData.projets.filter((_, i) => i !== index);
    setCvData({ ...cvData, projets: newProjets });
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    if (!cvData) return;
    const newCerts = [...cvData.certifications];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setCvData({ ...cvData, certifications: newCerts });
  };

  const addCertification = () => {
    if (!cvData) return;
    const newCert: Certification = {
      nom: "",
      score: "",
      date_obtention: ""
    };
    setCvData({ ...cvData, certifications: [newCert, ...cvData.certifications] });
  };

  const removeCertification = (index: number) => {
    if (!cvData) return;
    const newCerts = cvData.certifications.filter((_, i) => i !== index);
    setCvData({ ...cvData, certifications: newCerts });
  };

  const updateFormation = (index: number, field: keyof Formation, value: string) => {
    if (!cvData) return;
    const newFormation = [...cvData.formation];
    newFormation[index] = { ...newFormation[index], [field]: value };
    setCvData({ ...cvData, formation: newFormation });
  };

  const addFormation = () => {
    if (!cvData) return;
    const newForm: Formation = {
      diplome: "",
      etablissement: "",
      annee: ""
    };
    setCvData({ ...cvData, formation: [newForm, ...cvData.formation] });
  };

  const removeFormation = (index: number) => {
    if (!cvData) return;
    const newFormation = cvData.formation.filter((_, i) => i !== index);
    setCvData({ ...cvData, formation: newFormation });
  };

  const updateSkills = (category: 'soft_skills' | 'hard_skills' | 'langues', value: string) => {
    if (!cvData) return;
    const skillsArray = value.split(',').map(s => s.trim()).filter(s => s !== "");
    setCvData({
      ...cvData,
      competences: { ...cvData.competences, [category]: skillsArray }
    });
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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Notifications */}
        {notification && (
          <div 
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${
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

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-900">Mon CV</h1>
            <p className="text-slate-500">Gérez et modifiez vos informations professionnelles.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Share Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-bold shadow-sm"
              title="Partager mon CV"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Partager</span>
            </button>

            {/* Toggle View */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setShowPreview(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  !showPreview 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Édition
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  showPreview 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Eye className="w-4 h-4" />
                Aperçu
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-indigo-200"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Enregistrer
            </button>
          </div>
        </div>

        {showPreview ? (
          <div className="animate-in fade-in duration-500">
            <CVDisplay data={cvData} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          
          {/* Left Column - Personal Info, Certifications & Skills */}
          <div className="space-y-8">
            {/* Visibility Settings */}
            <VisibilityToggle 
              initialVisible={cvData.visible ?? true} 
              email={cvData.personne.contact.email}
              onUpdate={(visible) => setCvData(prev => prev ? { ...prev, visible } : null)}
            />

            <AvailabilitySelector 
              initialStatus={cvData.availability}
              email={cvData.personne.contact.email}
              onUpdate={(availability) => setCvData(prev => prev ? { ...prev, availability } : null)}
            />

            {/* Personne & Contact */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Informations Personnelles</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prénom</label>
                  <input 
                    type="text" 
                    value={cvData.personne.prenom}
                    onChange={(e) => updatePersonne('prenom', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</label>
                  <input 
                    type="text" 
                    value={cvData.personne.nom}
                    onChange={(e) => updatePersonne('nom', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Titre Professionnel</label>
                <input 
                  type="text" 
                  value={cvData.personne.titre_professionnel}
                  onChange={(e) => updatePersonne('titre_professionnel', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black"
                />
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                  <input 
                    type="email" 
                    value={cvData.personne.contact.email}
                    onChange={(e) => updateContact('email', e.target.value)}
                    placeholder="Email"
                    className="flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-500 outline-none py-1 text-black"
                  />
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Phone className="w-4 h-4" />
                  <input 
                    type="text" 
                    value={cvData.personne.contact.telephone}
                    onChange={(e) => updateContact('telephone', e.target.value)}
                    placeholder="Téléphone"
                    className="flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-500 outline-none py-1 text-black"
                  />
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Linkedin className="w-4 h-4" />
                  <input 
                    type="text" 
                    value={cvData.personne.contact.linkedin}
                    onChange={(e) => updateContact('linkedin', e.target.value)}
                    placeholder="LinkedIn URL"
                    className="flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-500 outline-none py-1 text-black"
                  />
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <input 
                    type="text" 
                    value={cvData.personne.contact.ville}
                    onChange={(e) => updateContact('ville', e.target.value)}
                    placeholder="Ville, Pays"
                    className="flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-500 outline-none py-1 text-black"
                  />
                </div>
              </div>
            </section>

            {/* Certifications */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Certifications</h2>
                </div>
                <button 
                  onClick={addCertification}
                  className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>

              <div className="space-y-4">
                {cvData.certifications?.map((cert, index) => (
                  <div key={index} className="relative p-4 bg-slate-50 rounded-xl border border-slate-100 group space-y-3">
                    <button 
                      onClick={() => removeCertification(index)}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nom</label>
                      <input 
                        type="text" 
                        value={cert.nom}
                        onChange={(e) => updateCertification(index, 'nom', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm text-black outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</label>
                        <input 
                          type="text" 
                          value={cert.score}
                          onChange={(e) => updateCertification(index, 'score', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm text-black outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
                        <input 
                          type="text" 
                          value={cert.date_obtention}
                          onChange={(e) => updateCertification(index, 'date_obtention', e.target.value)}
                          placeholder="AAAA"
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm text-black outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Competences */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Compétences</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hard Skills (séparés par des virgules)</label>
                  <textarea 
                    value={cvData.competences.hard_skills.join(', ')}
                    onChange={(e) => updateSkills('hard_skills', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[80px] text-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Soft Skills (séparés par des virgules)</label>
                  <textarea 
                    value={cvData.competences.soft_skills.join(', ')}
                    onChange={(e) => updateSkills('soft_skills', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[80px] text-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Langues (séparées par des virgules)</label>
                  <input 
                    type="text" 
                    value={cvData.competences.langues.join(', ')}
                    onChange={(e) => updateSkills('langues', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Resume, Experience, Projects, Formation */}
          <div className="lg:col-span-2 space-y-8">
            {/* Resume */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Résumé</h2>
              </div>
              <textarea 
                value={cvData.resume}
                onChange={(e) => setCvData({...cvData, resume: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px] text-black leading-relaxed"
              />
            </section>

            {/* Experience */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Expériences Professionnelles</h2>
                </div>
                <button 
                  onClick={addExperience}
                  className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>

              <div className="space-y-8">
                {cvData.experiences.map((exp, index) => (
                  <div key={index} className="relative p-6 bg-slate-50 rounded-xl border border-slate-100 group">
                    <button 
                      onClick={() => removeExperience(index)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Poste</label>
                        <input 
                          type="text" 
                          value={exp.poste}
                          onChange={(e) => updateExperience(index, 'poste', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entreprise</label>
                        <input 
                          type="text" 
                          value={exp.entreprise}
                          onChange={(e) => updateExperience(index, 'entreprise', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Début</label>
                        <input 
                          type="text" 
                          value={exp.periode_debut}
                          onChange={(e) => updateExperience(index, 'periode_debut', e.target.value)}
                          placeholder="MM/AAAA"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fin</label>
                        <input 
                          type="text" 
                          value={exp.periode_fin}
                          onChange={(e) => updateExperience(index, 'periode_fin', e.target.value)}
                          placeholder="MM/AAAA"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description (Détails)</label>
                      <textarea 
                        value={exp.details.join('\n')}
                        onChange={(e) => updateExperience(index, 'details', e.target.value)}
                        placeholder="Un élément par ligne"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] text-black"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compétences clés</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {exp.competences_cles?.map((point, pIndex) => (
                          <span 
                            key={pIndex}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100"
                          >
                            {point}
                            <button 
                              onClick={() => removeCompetenceCle(index, pIndex)}
                              className="hover:text-indigo-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Ajouter une compétence clé..."
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCompetenceCle(index, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg text-cyan-600">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Projets</h2>
                </div>
                <button 
                  onClick={addProjet}
                  className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>

              <div className="space-y-6">
                {cvData.projets?.map((proj, index) => (
                  <div key={index} className="relative p-6 bg-slate-50 rounded-xl border border-slate-100 group space-y-4">
                    <button 
                      onClick={() => removeProjet(index)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom du projet</label>
                      <input 
                        type="text" 
                        value={proj.nom}
                        onChange={(e) => updateProjet(index, 'nom', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Début</label>
                        <input 
                          type="text" 
                          value={proj.periode_debut}
                          onChange={(e) => updateProjet(index, 'periode_debut', e.target.value)}
                          placeholder="MM/AAAA"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fin</label>
                        <input 
                          type="text" 
                          value={proj.periode_fin}
                          onChange={(e) => updateProjet(index, 'periode_fin', e.target.value)}
                          placeholder="MM/AAAA"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                      <textarea 
                        value={proj.description}
                        onChange={(e) => updateProjet(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] text-black"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Formation */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Formation</h2>
                </div>
                <button 
                  onClick={addFormation}
                  className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>

              <div className="space-y-6">
                {cvData.formation.map((form, index) => (
                  <div key={index} className="relative p-6 bg-slate-50 rounded-xl border border-slate-100 group">
                    <button 
                      onClick={() => removeFormation(index)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diplôme</label>
                        <input 
                          type="text" 
                          value={form.diplome}
                          onChange={(e) => updateFormation(index, 'diplome', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                        />
                      </div>
                      <div className="md:col-span-1 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Établissement</label>
                        <input 
                          type="text" 
                          value={form.etablissement}
                          onChange={(e) => updateFormation(index, 'etablissement', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                        />
                      </div>
                      <div className="md:col-span-1 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Année</label>
                        <input 
                          type="text" 
                          value={form.annee}
                          onChange={(e) => updateFormation(index, 'annee', e.target.value)}
                          placeholder="AAAA"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
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
      </div>
    </div>
  );
}
