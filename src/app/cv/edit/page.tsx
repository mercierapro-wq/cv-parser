"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CVData, Experience, Formation, Projet, Certification } from "@/types/cv";
import { 
  Briefcase, 
  User, 
  GraduationCap, 
  Wrench, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  FolderKanban,
  Award
} from "lucide-react";

export default function EditCVPage() {
  const router = useRouter();
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const formatParsedDate = (dateStr: string) => {
    if (!dateStr) return "";
    
    const monthsMap: { [key: string]: string } = {
      'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04', 'mai': '05', 'juin': '06',
      'juillet': '07', 'août': '08', 'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12',
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
      'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };

    let normalized = dateStr.toLowerCase().trim();
    
    // Essayer de trouver un mois textuel suivi d'une année
    for (const [monthName, monthNum] of Object.entries(monthsMap)) {
      if (normalized.includes(monthName)) {
        const yearMatch = normalized.match(/\d{4}/);
        if (yearMatch) {
          return `${monthNum}/${yearMatch[0]}`;
        }
      }
    }

    return dateStr; // Retourne tel quel si pas de correspondance
  };

  useEffect(() => {
    const storedData = localStorage.getItem("pending-cv-data");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        
        // Normalisation des données avec transformation des dates
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
          experiences: (Array.isArray(parsed.experiences) ? parsed.experiences : []).map((exp: any) => ({
            ...exp,
            periode_debut: formatParsedDate(exp.periode_debut),
            periode_fin: formatParsedDate(exp.periode_fin)
          })),
          projets: (Array.isArray(parsed.projets) ? parsed.projets : []).map((proj: any) => ({
            ...proj,
            periode_debut: formatParsedDate(proj.periode_debut),
            periode_fin: formatParsedDate(proj.periode_fin)
          })),
          formation: (Array.isArray(parsed.formation) ? parsed.formation : []).map((form: any) => ({
            ...form,
            annee: formatParsedDate(form.annee)
          })),
          competences: {
            soft_skills: Array.isArray(parsed.competences?.soft_skills) ? parsed.competences.soft_skills : [],
            hard_skills: Array.isArray(parsed.competences?.hard_skills) ? parsed.competences.hard_skills : [],
            langues: Array.isArray(parsed.competences?.langues) ? parsed.competences.langues : []
          },
          certifications: (Array.isArray(parsed.certifications) ? parsed.certifications : []).map((cert: any) => ({
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

  const isValidDate = (dateStr: string) => {
    if (!dateStr) return true; // On autorise vide si non obligatoire, la validation se fera au moment du publish
    const regex = /^(?:(?:0[1-9]|1[0-2])\/)?\d{4}$/;
    return regex.test(dateStr) || dateStr.toLowerCase() === "présent";
  };

  const handlePublish = async () => {
    if (!cvData) return;

    // Validation Email
    if (!cvData.personne.contact.email.trim()) {
      alert("L'adresse email est obligatoire pour publier le CV.");
      return;
    }

    setIsPublishing(true);

    try {
      const insertUrl = process.env.NEXT_PUBLIC_INSERT_CV_URL || "https://souplike-marjorie-fierily.ngrok-free.dev/webhook/insert_cv";
      
      const response = await fetch(insertUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cvData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la publication du CV");
      }

      const result = await response.json();
      const slug = result[0]?.slug;

      if (!slug) {
        throw new Error("Le serveur n'a pas renvoyé de slug valide");
      }

      alert("CV publié avec succès !");
      localStorage.removeItem("pending-cv-data");
      
      // Redirection vers la page du CV (/slug) renvoyé par le backend
      router.push(`/cv/${slug}`);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue lors de la publication du CV.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.")) {
      localStorage.removeItem("pending-cv-data");
      router.push("/");
    }
  };

  if (!cvData) return null;

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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Révision du CV</h1>
            <p className="text-slate-500">Vérifiez et modifiez les informations extraites avant de publier.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleCancel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-indigo-200"
            >
              {isPublishing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Publier
            </button>
          </div>
        </div>

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
                  <Mail className={`w-4 h-4 ${!cvData.personne.contact.email ? 'text-red-500' : ''}`} />
                  <input 
                    type="email" 
                    value={cvData.personne.contact.email}
                    onChange={(e) => updateContact('email', e.target.value)}
                    placeholder="Email (Obligatoire)"
                    className={`flex-1 bg-transparent border-b focus:border-indigo-500 outline-none py-1 text-black ${!cvData.personne.contact.email ? 'border-red-200 placeholder:text-red-300' : 'border-slate-100'}`}
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
      </div>
    </div>
  );
}
