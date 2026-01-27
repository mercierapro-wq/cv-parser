import { notFound } from "next/navigation";
import { CVData } from "@/types/cv";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { 
  Mail, 
  Phone, 
  Linkedin, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  FolderKanban, 
  Award, 
  Wrench,
  User
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCVData(slug: string): Promise<CVData | null> {
  const baseUrl = process.env.N8N_WEBHOOK_BASE_URL;
  if (!baseUrl) {
    console.error("N8N_WEBHOOK_BASE_URL is not defined");
    return null;
  }

  const url = `${baseUrl}${slug}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    
    // Selon la structure n8n : data du premier élément du tableau
    if (Array.isArray(result) && result.length > 0 && result[0].data) {
      return result[0].data as CVData;
    }

    return null;
  } catch (error) {
    console.error("Error fetching CV data:", error);
    return null;
  }
}

export default async function CVProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const cvData = await getCVData(slug);

  if (!cvData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <AnalyticsTracker cvOwnerEmail={cvData.personne.contact.email} />
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Card */}
        <header className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 sm:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight">
                  {cvData.personne.prenom} {cvData.personne.nom}
                </h1>
                <p className="text-xl text-indigo-600 font-medium font-sans">
                  {cvData.personne.titre_professionnel}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-y-3 gap-x-6 text-slate-500 text-sm">
                {cvData.personne.contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${cvData.personne.contact.email}`} className="hover:text-indigo-600 transition-colors">
                      {cvData.personne.contact.email}
                    </a>
                  </div>
                )}
                {cvData.personne.contact.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{cvData.personne.contact.telephone}</span>
                  </div>
                )}
                {cvData.personne.contact.ville && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{cvData.personne.contact.ville}</span>
                  </div>
                )}
                {cvData.personne.contact.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-slate-400" />
                    <a href={cvData.personne.contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 border border-slate-100">
                <User className="w-12 h-12" />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Profil / Résumé */}
            <section className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-900">Profil Professionnel</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-sans whitespace-pre-line">
                {cvData.resume}
              </p>
            </section>

            {/* Expériences */}
            <section className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-900">Parcours Professionnel</h2>
              </div>

              <div className="space-y-10">
                {cvData.experiences.map((exp, index) => (
                  <div key={index} className="relative pl-8 border-l-2 border-slate-100 space-y-4 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 shadow-sm" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{exp.poste}</h3>
                        <p className="text-indigo-600 font-medium">{exp.entreprise}</p>
                      </div>
                      <span className="text-sm font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full w-fit">
                        {exp.periode_debut} — {exp.periode_fin}
                      </span>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed">
                      {exp.description}
                    </p>

                    {exp.details && exp.details.length > 0 && (
                      <ul className="space-y-2">
                        {exp.details.map((detail, i) => (
                          <li key={i} className="text-sm text-slate-500 flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}

                    {exp.competences_cles && exp.competences_cles.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {exp.competences_cles.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-50 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Projets */}
            {cvData.projets && cvData.projets.length > 0 && (
              <section className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-50 rounded-xl text-cyan-600">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-slate-900">Réalisations & Projets</h2>
                </div>
                <div className="space-y-10">
                  {cvData.projets.map((proj, index) => (
                    <div key={index} className="relative pl-8 border-l-2 border-slate-100 space-y-3 last:pb-0">
                      {/* Square marker for projects to differentiate from circles in experiences */}
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded bg-white border-2 border-cyan-500 shadow-sm" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{proj.nom}</h3>
                        <span className="text-sm font-medium text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full w-fit">
                          {proj.periode_debut} {proj.periode_fin ? `— ${proj.periode_fin}` : ''}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            
            {/* Compétences */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-900">Expertise</h2>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hard Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {cvData.competences.hard_skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium border border-indigo-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {cvData.competences.soft_skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium border border-slate-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Langues</h3>
                  <div className="flex flex-wrap gap-2">
                    {cvData.competences.langues.map((lang, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white text-slate-700 rounded-xl text-sm font-bold border border-slate-200 shadow-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Éducation */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-900">Éducation</h2>
              </div>
              <div className="space-y-6">
                {cvData.formation.map((form, index) => (
                  <div key={index} className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{form.diplome}</h3>
                    <p className="text-slate-500 text-xs">{form.etablissement}</p>
                    <p className="text-indigo-600 text-[10px] font-bold uppercase">{form.annee}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications */}
            {cvData.certifications && cvData.certifications.length > 0 && (
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-slate-900">Certifications</h2>
                </div>
                <div className="space-y-4">
                  {cvData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-slate-900 text-xs leading-tight">{cert.nom}</h3>
                        <p className="text-[10px] text-amber-700 font-medium">{cert.date_obtention}</p>
                      </div>
                      {cert.score && (
                        <span className="text-xs font-bold text-amber-600 bg-white px-2 py-1 rounded-lg shadow-sm shrink-0">
                          {cert.score}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
