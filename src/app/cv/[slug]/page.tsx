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
  Download,
  Share2
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
          // eslint-disable-next-line
          setCvData(JSON.parse(storedData));
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

            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
              {cvData.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-slate-300">
              {/* Placeholder for role if available in future */}
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profil Professionnel
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 sm:p-12">
          
          {/* Main Content - Experience */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Expérience Professionnelle</h2>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {cvData.experience.map((exp, index) => (
                  <div key={index} className="relative flex items-start group is-active">
                    <div className="absolute left-0 ml-5 -translate-x-1/2 translate-y-1.5 border-2 border-slate-200 rounded-full bg-white w-3 h-3 group-hover:border-indigo-500 transition-colors"></div>
                    <div className="pl-10 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                        <h3 className="text-lg font-bold text-slate-900">{exp.title}</h3>
                        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full w-fit mt-1 sm:mt-0">
                          {exp.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 mb-3 text-sm font-medium">
                        <Building2 className="w-4 h-4" />
                        {exp.company}
                      </div>
                      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - Skills & Actions */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Award className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Compétences</h2>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Actions Section (Print/Share) */}
            <section className="pt-8 border-t border-slate-100 print:hidden">
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  Télécharger en PDF
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Lien copié dans le presse-papier !");
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Partager le profil
                </button>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
