import { CVData } from "@/types/cv";
import AvailabilityBadge from "./AvailabilityBadge";
import DownloadPDFButton from "./DownloadPDFButton";
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

interface CVDisplayProps {
  data: CVData;
  slug: string;
  isPrintMode?: boolean;
}

export default function CVDisplay({ data, slug, isPrintMode = false }: CVDisplayProps) {
  const fullName = `${data.personne.prenom} ${data.personne.nom}`;
  const fileName = `CV_${data.personne.prenom}_${data.personne.nom}`.replace(/\s+/g, '_');

  return (
    <div className="w-full space-y-8 font-sans">
      {/* Header Card */}
      <header className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 sm:p-12 flex flex-col md:flex-row justify-between items-center md:items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-6 md:gap-8 w-full md:w-auto">
            {/* Profile Picture for Mobile */}
            <div className="md:hidden">
              {data.profilePicture ? (
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-50 relative">
                  <img 
                    src={data.profilePicture} 
                    alt={`Photo de profil de ${data.personne.prenom} ${data.personne.nom}`}
                    className="absolute max-w-full max-h-full w-auto h-auto"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: data.profilePictureTransform 
                        ? `translate(calc(-50% + ${data.profilePictureTransform.x}px), calc(-50% + ${data.profilePictureTransform.y}px)) scale(${data.profilePictureTransform.scale || 1})`
                        : 'translate(-50%, -50%)'
                    }}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm">
                  <User className="w-16 h-16" />
                </div>
              )}
            </div>

            <div className="space-y-4 text-center md:text-left w-full">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight">
                    {data.personne.prenom} {data.personne.nom}
                  </h1>
                  {!isPrintMode && (
                    <DownloadPDFButton 
                      slug={slug} 
                      fileName={fileName} 
                      cvOwnerEmail={data.personne.contact.email}
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <p className="text-xl text-indigo-600 font-medium font-sans">
                    {data.personne.titre_professionnel}
                  </p>
                  <AvailabilityBadge status={data.availability} />
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-y-3 gap-x-6 text-slate-500 text-sm">
                {data.personne.contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${data.personne.contact.email}`} className="hover:text-indigo-600 transition-colors">
                      {data.personne.contact.email}
                    </a>
                  </div>
                )}
                {data.personne.contact.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{data.personne.contact.telephone}</span>
                  </div>
                )}
                {data.personne.contact.ville && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{data.personne.contact.ville}</span>
                  </div>
                )}
                {data.personne.contact.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-slate-400" />
                    <a href={data.personne.contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Profile Picture for Desktop */}
          <div className="hidden md:block">
            {data.profilePicture ? (
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-50 relative">
                <img 
                  src={data.profilePicture} 
                  alt={`Photo de profil de ${data.personne.prenom} ${data.personne.nom}`}
                  className="absolute max-w-full max-h-full w-auto h-auto"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: data.profilePictureTransform 
                      ? `translate(calc(-50% + ${data.profilePictureTransform.x}px), calc(-50% + ${data.profilePictureTransform.y}px)) scale(${data.profilePictureTransform.scale || 1})`
                      : 'translate(-50%, -50%)'
                  }}
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm">
                <User className="w-16 h-16" />
              </div>
            )}
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
              {data.resume}
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
              {data.experiences.map((exp, index) => (
                <div key={index} className="experience-item relative pl-8 border-l-2 border-slate-100 space-y-4 last:pb-0">
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
          {data.projets && data.projets.length > 0 && (
            <section className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-50 rounded-xl text-cyan-600">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-900">Réalisations & Projets</h2>
              </div>
              <div className="space-y-10">
                {data.projets.map((proj, index) => (
                  <div key={index} className="project-item relative pl-8 border-l-2 border-slate-100 space-y-3 last:pb-0">
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
                  {data.competences.hard_skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium border border-indigo-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.competences.soft_skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium border border-slate-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Langues</h3>
                <div className="flex flex-wrap gap-2">
                  {data.competences.langues.map((lang, i) => (
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
              {data.formation.map((form, index) => (
                <div key={index} className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">{form.diplome}</h3>
                  <p className="text-slate-500 text-xs">{form.etablissement}</p>
                  <p className="text-indigo-600 text-[10px] font-bold uppercase">{form.annee}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-900">Certifications</h2>
              </div>
              <div className="space-y-4">
                {data.certifications.map((cert, index) => (
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
  );
}
