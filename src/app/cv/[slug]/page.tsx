"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CVData } from "@/types/cv";
import { 
  Briefcase, 
  User, 
  Award, 
  Building2, 
  ArrowLeft,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  GraduationCap
} from "lucide-react";

export default function CVPage() {
  const params = useParams();
  const router = useRouter();
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      const storedData = localStorage.getItem(`cv-data-${params.slug}`);
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCvData(parsed);
        } catch (e) {
          console.error("Erreur de parsing des données CV", e);
        }
      }
    }
    setLoading(false);
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">CV introuvable</h1>
        <p className="text-slate-600 mb-6">Les données de ce CV ne sont pas disponibles ou ont expiré.</p>
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Header / Profile Section */}
        <div className="bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <User className="w-64 h-64" />
          </div>
          
          <div className="relative z-10">
            <button 
              onClick={() => router.push("/")}
              className="mb-8 flex items-center gap-2 text-slate-300 hover:text-white transition-colors print:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>

            <h1 className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight">
              {cvData.personne.prenom} {cvData.personne.nom}
            </h1>
            <p className="text-xl text-indigo-400 font-medium mb-6">
              {cvData.personne.titre_professionnel}
            </p>
            
            <div className="flex flex-wrap gap-6 text-slate-300 text-sm">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {cvData.personne.contact.email}
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {cvData.personne.contact.telephone}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {cvData.personne.contact.ville}
              </span>
              {cvData.personne.contact.linkedin && (
                <span className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 sm:p-12">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-10">
            {/* Resume */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider">Profil</h2>
              <p className="text-slate-600 leading-relaxed">
                {cvData.resume}
              </p>
            </section>

            {/* Experience */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Expérience Professionnelle</h2>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {cvData.experiences.map((exp, index) => (
                  <div key={index} className="relative flex items-start group">
                    <div className="absolute left-0 ml-5 -translate-x-1/2 translate-y-1.5 border-2 border-slate-200 rounded-full bg-white w-3 h-3 group-hover:border-indigo-500 transition-colors"></div>
                    <div className="pl-10 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                        <h3 className="text-lg font-bold text-slate-900">{exp.poste}</h3>
                        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full w-fit mt-1 sm:mt-0">
                          {exp.periode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 mb-3 text-sm font-medium">
                        <Building2 className="w-4 h-4" />
                        {exp.entreprise}
                      </div>
                      <p className="text-slate-600 leading-relaxed text-sm mb-4">
                        {exp.description}
                      </p>
                      {exp.points_cles && exp.points_cles.length > 0 && (
                        <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                          {exp.points_cles.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Formation */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Formation</h2>
              </div>
              <div className="space-y-6">
                {cvData.formation.map((form, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{form.diplome}</h3>
                      <p className="text-slate-600">{form.etablissement}</p>
                    </div>
                    <span className="text-sm font-medium text-slate-500">{form.annee}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Award className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Compétences</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Hard Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {cvData.competences.hard_skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {cvData.competences.soft_skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Langues</h3>
                  <div className="flex flex-wrap gap-2">
                    {cvData.competences.langues.map((lang, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
