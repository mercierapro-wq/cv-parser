"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  User, 
  GraduationCap, 
  Wrench, 
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
  Sparkles,
  RotateCcw,
  AlertCircle,
  Lock,
  LogIn
} from "lucide-react";
import { CVData, Experience, Formation, Projet, Certification } from "@/types/cv";
import { useAuth } from "@/context/AuthContext";

interface CVEditorProps {
  initialData: CVData;
  isGuest?: boolean;
  isReadOnly?: boolean;
}

export default function CVEditor({ 
  initialData, 
  isGuest = false, 
  isReadOnly = false
}: CVEditorProps) {
  const { user, login } = useAuth();
  const [cvData, setCvData] = useState<CVData>(initialData);
  const [optimizingIndex, setOptimizingIndex] = useState<number | null>(null);
  const [originalDescriptions, setOriginalDescriptions] = useState<Record<number, string[]>>({});
  const [shimmerIndex, setShimmerIndex] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Update local state if initialData changes
  useEffect(() => {
    setCvData(initialData);
  }, [initialData]);

  const handleProtectedAction = (action: () => void) => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      setShowAuthModal(true);
    }
  };

  const handleOptimizeDescription = async (index: number) => {
    handleProtectedAction(async () => {
      if (optimizingIndex !== null) return;

      const exp = cvData.experiences[index];
      const currentDescription = exp.details.join('\n');
      
      setOptimizingIndex(index);

      try {
        const optimizeUrl = process.env.NEXT_PUBLIC_OPTIMIZE_DESC_URL;
        if (!optimizeUrl) throw new Error("URL d'optimisation non configurée");

        const response = await fetch(optimizeUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: currentDescription,
            jobTitle: exp.poste,
            companyName: exp.entreprise,
            resume: cvData.resume,
            job_skills: exp.competences_cles
          }),
        });

        if (!response.ok) throw new Error("Erreur lors de l'optimisation");

        const result = await response.json();
        const optimizedText = result.description || result.optimizedDescription || result.text || result[0]?.description || result[0]?.optimizedDescription;

        if (!optimizedText) throw new Error("Réponse invalide de l'IA");

        // Store original for undo
        setOriginalDescriptions(prev => ({ ...prev, [index]: exp.details }));

        // Update experience
        const newExperiences = [...cvData.experiences];
        newExperiences[index] = { 
          ...newExperiences[index], 
          details: optimizedText.split('\n').filter((l: string) => l.trim() !== "") 
        };
        setCvData({ ...cvData, experiences: newExperiences });

        // Trigger shimmer effect
        setShimmerIndex(index);
        setTimeout(() => setShimmerIndex(null), 2000);
      } catch (error) {
        console.error("Optimization error:", error);
      } finally {
        setOptimizingIndex(null);
      }
    });
  };

  const handleUndoOptimization = (index: number) => {
    if (!originalDescriptions[index]) return;

    const newExperiences = [...cvData.experiences];
    newExperiences[index] = { ...newExperiences[index], details: originalDescriptions[index] };
    setCvData({ ...cvData, experiences: newExperiences });

    const newOriginals = { ...originalDescriptions };
    delete newOriginals[index];
    setOriginalDescriptions(newOriginals);
  };

  // Helper functions for form updates
  const updatePersonne = (field: string, value: string) => {
    setCvData({
      ...cvData,
      personne: { ...cvData.personne, [field]: value }
    });
  };

  const updateContact = (field: string, value: string) => {
    setCvData({
      ...cvData,
      personne: {
        ...cvData.personne,
        contact: { ...cvData.personne.contact, [field]: value }
      }
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string | string[]) => {
    const newExperiences = [...cvData.experiences];
    if (field === 'details' && typeof value === 'string') {
      newExperiences[index] = { ...newExperiences[index], details: value.split('\n').filter(l => l.trim() !== "") };
    } else {
      newExperiences[index] = { ...newExperiences[index], [field]: value } as Experience;
    }
    setCvData({ ...cvData, experiences: newExperiences });
  };

  const addExperience = () => {
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
    const newExperiences = cvData.experiences.filter((_, i) => i !== index);
    setCvData({ ...cvData, experiences: newExperiences });
  };

  const addCompetenceCle = (expIndex: number, point: string) => {
    if (!point.trim()) return;
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
    const newExperiences = [...cvData.experiences];
    newExperiences[expIndex] = { 
      ...newExperiences[expIndex], 
      competences_cles: newExperiences[expIndex].competences_cles.filter((_, i) => i !== pointIndex)
    };
    setCvData({ ...cvData, experiences: newExperiences });
  };

  const updateProjet = (index: number, field: keyof Projet, value: string) => {
    const newProjets = [...cvData.projets];
    newProjets[index] = { ...newProjets[index], [field]: value };
    setCvData({ ...cvData, projets: newProjets });
  };

  const addProjet = () => {
    const newProj: Projet = {
      nom: "",
      description: "",
      periode_debut: "",
      periode_fin: ""
    };
    setCvData({ ...cvData, projets: [newProj, ...cvData.projets] });
  };

  const removeProjet = (index: number) => {
    const newProjets = cvData.projets.filter((_, i) => i !== index);
    setCvData({ ...cvData, projets: newProjets });
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const newCerts = [...cvData.certifications];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setCvData({ ...cvData, certifications: newCerts });
  };

  const addCertification = () => {
    const newCert: Certification = {
      nom: "",
      score: "",
      date_obtention: ""
    };
    setCvData({ ...cvData, certifications: [newCert, ...cvData.certifications] });
  };

  const removeCertification = (index: number) => {
    const newCerts = cvData.certifications.filter((_, i) => i !== index);
    setCvData({ ...cvData, certifications: newCerts });
  };

  const updateFormation = (index: number, field: keyof Formation, value: string) => {
    const newFormation = [...cvData.formation];
    newFormation[index] = { ...newFormation[index], [field]: value };
    setCvData({ ...cvData, formation: newFormation });
  };

  const addFormation = () => {
    const newForm: Formation = {
      diplome: "",
      etablissement: "",
      annee: ""
    };
    setCvData({ ...cvData, formation: [newForm, ...cvData.formation] });
  };

  const removeFormation = (index: number) => {
    const newFormation = cvData.formation.filter((_, i) => i !== index);
    setCvData({ ...cvData, formation: newFormation });
  };

  const updateSkills = (category: 'soft_skills' | 'hard_skills' | 'langues', value: string) => {
    const skillsArray = value.split(',').map(s => s.trim()).filter(s => s !== "");
    setCvData({
      ...cvData,
      competences: { ...cvData.competences, [category]: skillsArray }
    });
  };

  return (
    <div className="space-y-8">
      {/* Guest Banner */}
      {isGuest && !user && (
        <div className="bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="font-medium">Vous éditez actuellement un profil invité. Créez un compte pour ne pas perdre vos modifications.</p>
          </div>
          <button 
            onClick={() => login()}
            className="h-10 flex items-center gap-2 px-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all whitespace-nowrap shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Se connecter</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Personal Info, Certifications & Skills */}
        <div className="space-y-8">
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
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</label>
                <input 
                  type="text" 
                  value={cvData.personne.nom}
                  onChange={(e) => updatePersonne('nom', e.target.value)}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Titre Professionnel</label>
              <input 
                type="text" 
                value={cvData.personne.titre_professionnel}
                onChange={(e) => updatePersonne('titre_professionnel', e.target.value)}
                disabled={isReadOnly}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black disabled:opacity-60"
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
                  disabled={isReadOnly}
                  className="flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-500 outline-none py-1 text-black disabled:opacity-60"
                />
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Phone className="w-4 h-4" />
                <input 
                  type="text" 
                  value={cvData.personne.contact.telephone}
                  onChange={(e) => updateContact('telephone', e.target.value)}
                  placeholder="Téléphone"
                  disabled={isReadOnly}
                  className="flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-500 outline-none py-1 text-black disabled:opacity-60"
                />
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Linkedin className="w-4 h-4" />
                <input 
                  type="text" 
                  value={cvData.personne.contact.linkedin}
                  onChange={(e) => updateContact('linkedin', e.target.value)}
                  placeholder="LinkedIn URL"
                  disabled={isReadOnly}
                  className="flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-500 outline-none py-1 text-black disabled:opacity-60"
                />
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-4 h-4" />
                <input 
                  type="text" 
                  value={cvData.personne.contact.ville}
                  onChange={(e) => updateContact('ville', e.target.value)}
                  placeholder="Ville, Pays"
                  disabled={isReadOnly}
                  className="flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-500 outline-none py-1 text-black disabled:opacity-60"
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
              {!isReadOnly && (
                <button 
                  onClick={addCertification}
                  className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              )}
            </div>

            <div className="space-y-4">
              {cvData.certifications?.map((cert, index) => (
                <div key={index} className="relative p-4 bg-slate-50 rounded-xl border border-slate-100 group space-y-3">
                  {!isReadOnly && (
                    <button 
                      onClick={() => removeCertification(index)}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nom</label>
                    <input 
                      type="text" 
                      value={cert.nom}
                      onChange={(e) => updateCertification(index, 'nom', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm text-black outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</label>
                      <input 
                        type="text" 
                        value={cert.score}
                        onChange={(e) => updateCertification(index, 'score', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm text-black outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
                      <input 
                        type="text" 
                        value={cert.date_obtention}
                        onChange={(e) => updateCertification(index, 'date_obtention', e.target.value)}
                        placeholder="AAAA"
                        disabled={isReadOnly}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm text-black outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
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
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[80px] text-black disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Soft Skills (séparés par des virgules)</label>
                <textarea 
                  value={cvData.competences.soft_skills.join(', ')}
                  onChange={(e) => updateSkills('soft_skills', e.target.value)}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[80px] text-black disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Langues (séparées par des virgules)</label>
                <input 
                  type="text" 
                  value={cvData.competences.langues.join(', ')}
                  onChange={(e) => updateSkills('langues', e.target.value)}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black disabled:opacity-60"
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
              disabled={isReadOnly}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px] text-black leading-relaxed disabled:opacity-60"
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
              {!isReadOnly && (
                <button 
                  onClick={addExperience}
                  className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              )}
            </div>

            <div className="space-y-8">
              {cvData.experiences.map((exp, index) => (
                <div key={index} className="relative p-6 bg-slate-50 rounded-xl border border-slate-100 group">
                  {!isReadOnly && (
                    <button 
                      onClick={() => removeExperience(index)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Poste</label>
                      <input 
                        type="text" 
                        value={exp.poste}
                        onChange={(e) => updateExperience(index, 'poste', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entreprise</label>
                      <input 
                        type="text" 
                        value={exp.entreprise}
                        onChange={(e) => updateExperience(index, 'entreprise', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
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
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fin</label>
                      <input 
                        type="text" 
                        value={exp.periode_fin}
                        onChange={(e) => updateExperience(index, 'periode_fin', e.target.value)}
                        placeholder="MM/AAAA"
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 relative">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description (Détails)</label>
                      {!isReadOnly && (
                        <div className="flex items-center gap-2">
                          {originalDescriptions[index] && (
                            <button
                              onClick={() => handleUndoOptimization(index)}
                              className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                              title="Annuler l'optimisation"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Annuler
                            </button>
                          )}
                          <button
                            onClick={() => handleOptimizeDescription(index)}
                            disabled={optimizingIndex !== null}
                            className={`group relative flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              optimizingIndex === index
                                ? "bg-indigo-50 text-indigo-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200 active:scale-95"
                            }`}
                            title="Améliorer cette description avec l'IA"
                          >
                            {optimizingIndex === index ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className={`w-3 h-3 ${optimizingIndex === null ? "group-hover:animate-pulse" : ""}`} />
                            )}
                            {optimizingIndex === index ? "Optimisation..." : "Optimiser par IA"}
                            {!user && (
                              <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[8px] font-black px-1 py-0.5 rounded-full shadow-sm border border-white flex items-center gap-0.5">
                                PRO
                              </div>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    <textarea 
                      value={exp.details.join('\n')}
                      onChange={(e) => updateExperience(index, 'details', e.target.value)}
                      disabled={optimizingIndex === index || isReadOnly}
                      placeholder="Un élément par ligne"
                      className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] text-black transition-all ${
                        shimmerIndex === index ? "animate-shimmer ring-2 ring-indigo-400 border-indigo-400" : ""
                      } ${optimizingIndex === index ? "opacity-50" : ""} disabled:opacity-60`}
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
                          {!isReadOnly && (
                            <button 
                              onClick={() => removeCompetenceCle(index, pIndex)}
                              className="hover:text-indigo-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    {!isReadOnly && (
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
                    )}
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
              {!isReadOnly && (
                <button 
                  onClick={addProjet}
                  className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              )}
            </div>

            <div className="space-y-6">
              {cvData.projets?.map((proj, index) => (
                <div key={index} className="relative p-6 bg-slate-50 rounded-xl border border-slate-100 group space-y-4">
                  {!isReadOnly && (
                    <button 
                      onClick={() => removeProjet(index)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom du projet</label>
                    <input 
                      type="text" 
                      value={proj.nom}
                      onChange={(e) => updateProjet(index, 'nom', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
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
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fin</label>
                      <input 
                        type="text" 
                        value={proj.periode_fin}
                        onChange={(e) => updateProjet(index, 'periode_fin', e.target.value)}
                        placeholder="MM/AAAA"
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea 
                      value={proj.description}
                      onChange={(e) => updateProjet(index, 'description', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] text-black disabled:opacity-60"
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
              {!isReadOnly && (
                <button 
                  onClick={addFormation}
                  className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              )}
            </div>

            <div className="space-y-6">
              {cvData.formation.map((form, index) => (
                <div key={index} className="relative p-6 bg-slate-50 rounded-xl border border-slate-100 group">
                  {!isReadOnly && (
                    <button 
                      onClick={() => removeFormation(index)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diplôme</label>
                      <input 
                        type="text" 
                        value={form.diplome}
                        onChange={(e) => updateFormation(index, 'diplome', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
                      />
                    </div>
                    <div className="md:col-span-1 space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Établissement</label>
                      <input 
                        type="text" 
                        value={form.etablissement}
                        onChange={(e) => updateFormation(index, 'etablissement', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
                      />
                    </div>
                    <div className="md:col-span-1 space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Année</label>
                      <input 
                        type="text" 
                        value={form.annee}
                        onChange={(e) => updateFormation(index, 'annee', e.target.value)}
                        placeholder="AAAA"
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
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
  );
}
