"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
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
  LogIn,
  Camera,
  Globe
} from "lucide-react";
import { CVData, Experience, Formation, Projet, Certification } from "@/types/cv";
import { useAuth } from "@/context/AuthContext";
import { ProfilePictureManager } from "./ProfilePictureManager";

// --- Sub-components for Performance Optimization ---

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  type?: "text" | "textarea" | "email" | "tel";
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const EditableField = memo(({ 
  value, 
  onSave, 
  type = "text", 
  placeholder, 
  className,
  disabled,
  autoFocus,
  onKeyDown
}: EditableFieldProps) => {
  const [localValue, setLocalValue] = useState(value || "");
  
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleBlur = () => {
    if (localValue !== (value || "")) {
      onSave(localValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  if (type === "textarea") {
    return (
      <textarea
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        autoFocus={autoFocus}
      />
    );
  }

  return (
    <input
      type={type}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      autoFocus={autoFocus}
    />
  );
});

EditableField.displayName = "EditableField";

interface ExperienceItemProps {
  exp: Experience;
  index: number;
  isReadOnly: boolean;
  optimizingIndex: number | null;
  shimmerIndex: number | null;
  hasOriginal: boolean;
  onUpdate: (index: number, field: keyof Experience, value: string | string[]) => void;
  onRemove: (index: number) => void;
  onOptimize: (index: number) => void;
  onUndo: (index: number) => void;
  onAddSkill: (index: number, skill: string) => void;
  onRemoveSkill: (index: number, skillIndex: number) => void;
}

const ExperienceItem = memo(({
  exp,
  index,
  isReadOnly,
  optimizingIndex,
  shimmerIndex,
  hasOriginal,
  onUpdate,
  onRemove,
  onOptimize,
  onUndo,
  onAddSkill,
  onRemoveSkill
}: ExperienceItemProps) => {
  return (
    <div className="relative p-6 bg-slate-50 rounded-xl border border-slate-100 group">
      {!isReadOnly && (
        <button 
          onClick={() => onRemove(index)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Poste</label>
          <EditableField 
            value={exp.poste}
            onSave={(val) => onUpdate(index, 'poste', val)}
            disabled={isReadOnly}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entreprise</label>
          <EditableField 
            value={exp.entreprise}
            onSave={(val) => onUpdate(index, 'entreprise', val)}
            disabled={isReadOnly}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Début</label>
          <EditableField 
            value={exp.periode_debut}
            onSave={(val) => onUpdate(index, 'periode_debut', val)}
            placeholder="MM/AAAA"
            disabled={isReadOnly}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fin</label>
          <EditableField 
            value={exp.periode_fin}
            onSave={(val) => onUpdate(index, 'periode_fin', val)}
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
              {hasOriginal && (
                <button
                  onClick={() => onUndo(index)}
                  className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                  title="Annuler l'optimisation"
                >
                  <RotateCcw className="w-3 h-3" />
                  Annuler
                </button>
              )}
              <button
                onClick={() => onOptimize(index)}
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
              </button>
            </div>
          )}
        </div>
        <EditableField 
          type="textarea"
          value={exp.details.join('\n')}
          onSave={(val) => onUpdate(index, 'details', val)}
          disabled={optimizingIndex === index || isReadOnly}
          placeholder="Un élément par ligne"
          className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] text-black transition-all ${
            shimmerIndex === index ? "animate-shimmer ring-2 ring-indigo-400 border-indigo-400" : ""
          } ${optimizingIndex === index ? "opacity-50" : ""} disabled:opacity-60`}
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compétences clés</label>
        <SkillBadgeList 
          skills={exp.competences_cles || []}
          onAdd={(skill) => onAddSkill(index, skill)}
          onRemove={(sIndex) => onRemoveSkill(index, sIndex)}
          isReadOnly={isReadOnly}
          placeholder="Ajouter une compétence clé..."
          variant="key"
        />
      </div>
    </div>
  );
});

ExperienceItem.displayName = "ExperienceItem";

interface ProjectItemProps {
  proj: Projet;
  index: number;
  isReadOnly: boolean;
  onUpdate: (index: number, field: keyof Projet, value: string) => void;
  onRemove: (index: number) => void;
}

const ProjectItem = memo(({ proj, index, isReadOnly, onUpdate, onRemove }: ProjectItemProps) => (
  <div className="relative p-6 bg-slate-50 rounded-xl border border-slate-100 group space-y-4">
    {!isReadOnly && (
      <button 
        onClick={() => onRemove(index)}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}
    
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom du projet</label>
      <EditableField 
        value={proj.nom}
        onSave={(val) => onUpdate(index, 'nom', val)}
        disabled={isReadOnly}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Début</label>
        <EditableField 
          value={proj.periode_debut}
          onSave={(val) => onUpdate(index, 'periode_debut', val)}
          placeholder="MM/AAAA"
          disabled={isReadOnly}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fin</label>
        <EditableField 
          value={proj.periode_fin}
          onSave={(val) => onUpdate(index, 'periode_fin', val)}
          placeholder="MM/AAAA"
          disabled={isReadOnly}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
        />
      </div>
    </div>

    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
      <EditableField 
        type="textarea"
        value={proj.description}
        onSave={(val) => onUpdate(index, 'description', val)}
        disabled={isReadOnly}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] text-black disabled:opacity-60"
      />
    </div>
  </div>
));

ProjectItem.displayName = "ProjectItem";

interface FormationItemProps {
  form: Formation;
  index: number;
  isReadOnly: boolean;
  onUpdate: (index: number, field: keyof Formation, value: string) => void;
  onRemove: (index: number) => void;
}

const FormationItem = memo(({ form, index, isReadOnly, onUpdate, onRemove }: FormationItemProps) => (
  <div className="relative p-6 bg-slate-50 rounded-xl border border-slate-100 group">
    {!isReadOnly && (
      <button 
        onClick={() => onRemove(index)}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1 space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diplôme</label>
        <EditableField 
          value={form.diplome}
          onSave={(val) => onUpdate(index, 'diplome', val)}
          disabled={isReadOnly}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
        />
      </div>
      <div className="md:col-span-1 space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Établissement</label>
        <EditableField 
          value={form.etablissement}
          onSave={(val) => onUpdate(index, 'etablissement', val)}
          disabled={isReadOnly}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
        />
      </div>
      <div className="md:col-span-1 space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Année</label>
        <EditableField 
          value={form.annee}
          onSave={(val) => onUpdate(index, 'annee', val)}
          placeholder="AAAA"
          disabled={isReadOnly}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black disabled:opacity-60"
        />
      </div>
    </div>
  </div>
));

FormationItem.displayName = "FormationItem";

interface CertificationItemProps {
  cert: Certification;
  index: number;
  isReadOnly: boolean;
  onUpdate: (index: number, field: keyof Certification, value: string) => void;
  onRemove: (index: number) => void;
}

const CertificationItem = memo(({ cert, index, isReadOnly, onUpdate, onRemove }: CertificationItemProps) => (
  <div className="relative p-4 bg-slate-50 rounded-xl border border-slate-100 group space-y-3">
    {!isReadOnly && (
      <button 
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nom</label>
      <EditableField 
        value={cert.nom}
        onSave={(val) => onUpdate(index, 'nom', val)}
        disabled={isReadOnly}
        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm text-black outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
      />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</label>
        <EditableField 
          value={cert.score}
          onSave={(val) => onUpdate(index, 'score', val)}
          disabled={isReadOnly}
          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm text-black outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
        <EditableField 
          value={cert.date_obtention}
          onSave={(val) => onUpdate(index, 'date_obtention', val)}
          placeholder="AAAA"
          disabled={isReadOnly}
          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm text-black outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
        />
      </div>
    </div>
  </div>
));

CertificationItem.displayName = "CertificationItem";

interface SkillBadgeListProps {
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (index: number) => void;
  isReadOnly: boolean;
  placeholder?: string;
  variant?: 'hard' | 'soft' | 'key' | 'lang';
}

const SkillBadgeList = memo(({ skills, onAdd, onRemove, isReadOnly, placeholder, variant = 'key' }: SkillBadgeListProps) => {
  const colors = {
    hard: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:text-emerald-900",
    soft: "bg-amber-50 text-amber-700 border-amber-100 hover:text-amber-900",
    key: "bg-indigo-50 text-indigo-700 border-indigo-100 hover:text-indigo-900",
    lang: "bg-cyan-50 text-cyan-700 border-cyan-100 hover:text-cyan-900"
  };

  const colorClass = colors[variant];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map((skill, index) => (
          <span 
            key={`skill-${index}`}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass.split(' hover:')[0]}`}
          >
            {skill}
            {!isReadOnly && (
              <button 
                onClick={() => onRemove(index)}
                className={colorClass.split(' border ')[1]}
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
            placeholder={`${placeholder || "Ajouter..."} (Entrée)`}
            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = (e.target as HTMLInputElement).value;
                if (val.trim()) {
                  onAdd(val.trim());
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
});

SkillBadgeList.displayName = "SkillBadgeList";

// --- Main Component ---

interface CVEditorProps {
  initialData: CVData;
  isGuest?: boolean;
  isReadOnly?: boolean;
  onChange?: (data: CVData) => void;
}

export default function CVEditor({ 
  initialData, 
  isGuest = false, 
  isReadOnly = false,
  onChange
}: CVEditorProps) {
  const { user, login } = useAuth();
  const [cvData, setCvData] = useState<CVData>(initialData);
  const [optimizingIndex, setOptimizingIndex] = useState<number | null>(null);
  const [originalDescriptions, setOriginalDescriptions] = useState<Record<number, string[]>>({});
  const [shimmerIndex, setShimmerIndex] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  const isInternalUpdate = useRef(false);

  // Helper to update local state and flag it as internal
  const updateCvData = useCallback((update: CVData | ((prev: CVData) => CVData)) => {
    isInternalUpdate.current = true;
    setCvData(update);
  }, []);

  // Notify parent of changes ONLY if they were internal
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      if (onChange) {
        onChange(cvData);
      }
    }
  }, [cvData, onChange]);

  // Update local state if initialData changes from outside
  useEffect(() => {
    const hasChanged = JSON.stringify(initialData) !== JSON.stringify(cvData);
    if (hasChanged && !isInternalUpdate.current) {
      setCvData(initialData);
    }
  }, [initialData]);

  // Sync email with logged-in user
  useEffect(() => {
    if (user?.email && cvData.personne.contact.email !== user.email) {
      const newData = {
        ...cvData,
        personne: {
          ...cvData.personne,
          contact: { ...cvData.personne.contact, email: user.email! }
        }
      };
      updateCvData(newData);
    }
  }, [user, cvData.personne.contact.email, updateCvData]);

  const handleProtectedAction = (action: () => void) => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      setShowAuthModal(true);
    }
  };

  const handleOptimizeDescription = useCallback(async (index: number) => {
    handleProtectedAction(async () => {
      if (optimizingIndex !== null) return;

      const exp = cvData.experiences[index];
      const currentDescription = exp.details.join('\n');
      
      setOptimizingIndex(index);

      try {
        const token = await user?.getIdToken();
        if (!token) throw new Error("Session expirée");

        const response = await fetch("/api/n8n-proxy", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            action: "optimize-desc",
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
        updateCvData({ ...cvData, experiences: newExperiences });

        // Trigger shimmer effect
        setShimmerIndex(index);
        setTimeout(() => setShimmerIndex(null), 2000);
      } catch (error) {
        console.error("Optimization error:", error);
      } finally {
        setOptimizingIndex(null);
      }
    });
  }, [cvData, optimizingIndex, updateCvData]);

  const handleUndoOptimization = useCallback((index: number) => {
    if (!originalDescriptions[index]) return;

    const newExperiences = [...cvData.experiences];
    newExperiences[index] = { ...newExperiences[index], details: originalDescriptions[index] };
    updateCvData({ ...cvData, experiences: newExperiences });

    const newOriginals = { ...originalDescriptions };
    delete newOriginals[index];
    setOriginalDescriptions(newOriginals);
  }, [cvData, originalDescriptions, updateCvData]);

  // Helper functions for form updates
  const updatePersonne = useCallback((field: string, value: string) => {
    updateCvData((prev) => ({
      ...prev,
      personne: { ...prev.personne, [field]: value }
    }));
  }, [updateCvData]);

  const updateContact = useCallback((field: string, value: string) => {
    if (field === 'email' && user) return;
    updateCvData((prev) => ({
      ...prev,
      personne: {
        ...prev.personne,
        contact: { ...prev.personne.contact, [field]: value }
      }
    }));
  }, [user, updateCvData]);

  const updateExperience = useCallback((index: number, field: keyof Experience, value: string | string[]) => {
    const newExperiences = [...cvData.experiences];
    if (field === 'details' && typeof value === 'string') {
      newExperiences[index] = { ...newExperiences[index], details: value.split('\n').filter(l => l.trim() !== "") };
    } else {
      newExperiences[index] = { ...newExperiences[index], [field]: value } as Experience;
    }
    updateCvData({ ...cvData, experiences: newExperiences });
  }, [cvData, updateCvData]);

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      poste: "",
      entreprise: "",
      periode_debut: "",
      periode_fin: "",
      description: "",
      competences_cles: [],
      details: []
    };
    updateCvData({ ...cvData, experiences: [newExp, ...cvData.experiences] });
  };

  const removeExperience = useCallback((index: number) => {
    const newExperiences = cvData.experiences.filter((_, i) => i !== index);
    updateCvData({ ...cvData, experiences: newExperiences });
  }, [cvData, updateCvData]);

  const addCompetenceCle = useCallback((expIndex: number, point: string) => {
    if (!point.trim()) return;
    const newExperiences = [...cvData.experiences];
    const currentPoints = newExperiences[expIndex].competences_cles || [];
    if (!currentPoints.includes(point.trim())) {
      newExperiences[expIndex] = { 
        ...newExperiences[expIndex], 
        competences_cles: [...currentPoints, point.trim()] 
      };
      updateCvData({ ...cvData, experiences: newExperiences });
    }
  }, [cvData, updateCvData]);

  const removeCompetenceCle = useCallback((expIndex: number, pointIndex: number) => {
    const newExperiences = [...cvData.experiences];
    newExperiences[expIndex] = { 
      ...newExperiences[expIndex], 
      competences_cles: newExperiences[expIndex].competences_cles.filter((_, i) => i !== pointIndex)
    };
    updateCvData({ ...cvData, experiences: newExperiences });
  }, [cvData, updateCvData]);

  const updateProjet = useCallback((index: number, field: keyof Projet, value: string) => {
    const newProjets = [...cvData.projets];
    newProjets[index] = { ...newProjets[index], [field]: value };
    updateCvData({ ...cvData, projets: newProjets });
  }, [cvData, updateCvData]);

  const addProjet = () => {
    const newProj: Projet = {
      id: crypto.randomUUID(),
      nom: "",
      description: "",
      periode_debut: "",
      periode_fin: ""
    };
    updateCvData({ ...cvData, projets: [newProj, ...cvData.projets] });
  };

  const removeProjet = useCallback((index: number) => {
    const newProjets = cvData.projets.filter((_, i) => i !== index);
    updateCvData({ ...cvData, projets: newProjets });
  }, [cvData, updateCvData]);

  const updateCertification = useCallback((index: number, field: keyof Certification, value: string) => {
    const newCerts = [...cvData.certifications];
    newCerts[index] = { ...newCerts[index], [field]: value };
    updateCvData({ ...cvData, certifications: newCerts });
  }, [cvData, updateCvData]);

  const addCertification = () => {
    const newCert: Certification = {
      id: crypto.randomUUID(),
      nom: "",
      score: "",
      date_obtention: ""
    };
    updateCvData({ ...cvData, certifications: [newCert, ...cvData.certifications] });
  };

  const removeCertification = useCallback((index: number) => {
    const newCerts = cvData.certifications.filter((_, i) => i !== index);
    updateCvData({ ...cvData, certifications: newCerts });
  }, [cvData, updateCvData]);

  const updateFormation = useCallback((index: number, field: keyof Formation, value: string) => {
    const newFormation = [...cvData.formation];
    newFormation[index] = { ...newFormation[index], [field]: value };
    updateCvData({ ...cvData, formation: newFormation });
  }, [cvData, updateCvData]);

  const addFormation = () => {
    const newForm: Formation = {
      id: crypto.randomUUID(),
      diplome: "",
      etablissement: "",
      annee: ""
    };
    updateCvData({ ...cvData, formation: [newForm, ...cvData.formation] });
  };

  const removeFormation = useCallback((index: number) => {
    const newFormation = cvData.formation.filter((_, i) => i !== index);
    updateCvData({ ...cvData, formation: newFormation });
  }, [cvData, updateCvData]);

  const addGlobalSkill = useCallback((category: 'soft_skills' | 'hard_skills' | 'langues', skill: string) => {
    const currentSkills = cvData.competences[category] || [];
    if (!currentSkills.includes(skill)) {
      updateCvData({
        ...cvData,
        competences: { ...cvData.competences, [category]: [...currentSkills, skill] }
      });
    }
  }, [cvData, updateCvData]);

  const removeGlobalSkill = useCallback((category: 'soft_skills' | 'hard_skills' | 'langues', index: number) => {
    const currentSkills = cvData.competences[category] || [];
    updateCvData({
      ...cvData,
      competences: { ...cvData.competences, [category]: currentSkills.filter((_, i) => i !== index) }
    });
  }, [cvData, updateCvData]);

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
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Informations Personnelles</h2>
                  {cvData.isMaster && (
                    <div className="group relative">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                        CV de Référence
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ProfilePictureManager
                prenom={cvData.personne.prenom}
                nom={cvData.personne.nom}
                profilePicture={cvData.profilePicture}
                transform={cvData.profilePictureTransform}
                onUpdate={(base64, transform) => updateCvData(prev => ({ 
                  ...prev, 
                  profilePicture: base64,
                  profilePictureTransform: transform
                }))}
                disabled={isReadOnly || !cvData.isMaster}
              />
            </div>
            {!cvData.isMaster && (
              <p className="text-[10px] text-slate-400 text-center italic">
                La photo du CV de référence est utilisée pour toutes les versions.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prénom</label>
                <EditableField 
                  value={cvData.personne.prenom}
                  onSave={(val) => updatePersonne('prenom', val)}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</label>
                <EditableField 
                  value={cvData.personne.nom}
                  onSave={(val) => updatePersonne('nom', val)}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Titre Professionnel</label>
              <EditableField 
                value={cvData.personne.titre_professionnel}
                onSave={(val) => updatePersonne('titre_professionnel', val)}
                disabled={isReadOnly}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black disabled:opacity-60"
              />
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-slate-400">
                <Mail className="w-4 h-4" />
                <div 
                  className="flex-1 relative group/email"
                  title={user ? "Ce champ est obligatoirement celui du profil connecté" : ""}
                >
                  <EditableField 
                    type="email"
                    value={cvData.personne.contact.email}
                    onSave={(val) => updateContact('email', val)}
                    placeholder="Email"
                    disabled={isReadOnly || !!user}
                    className="w-full bg-transparent border-b border-slate-100 focus:border-indigo-500 outline-none py-1 text-black disabled:opacity-60"
                  />
                  {user && (
                    <div className="absolute left-0 -top-8 hidden group-hover/email:block bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                      L&apos;email doit correspondre à votre profil connecté
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Phone className="w-4 h-4" />
                <EditableField 
                  type="tel"
                  value={cvData.personne.contact.telephone}
                  onSave={(val) => updateContact('telephone', val)}
                  placeholder="Téléphone"
                  disabled={isReadOnly}
                  className="flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-500 outline-none py-1 text-black disabled:opacity-60"
                />
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Linkedin className="w-4 h-4" />
                <EditableField 
                  value={cvData.personne.contact.linkedin}
                  onSave={(val) => updateContact('linkedin', val)}
                  placeholder="LinkedIn URL"
                  disabled={isReadOnly}
                  className="flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-500 outline-none py-1 text-black disabled:opacity-60"
                />
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-4 h-4" />
                <EditableField 
                  value={cvData.personne.contact.ville}
                  onSave={(val) => updateContact('ville', val)}
                  placeholder="Ville, Pays"
                  disabled={isReadOnly}
                  className="flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-500 outline-none py-1 text-black disabled:opacity-60"
                />
              </div>
            </div>
          </section>

          {/* Resume */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Résumé</h2>
            </div>
            <EditableField 
                type="textarea"
                value={cvData.resume}
                onSave={(val) => updateCvData(prev => ({ ...prev, resume: val }))}
                disabled={isReadOnly}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px] text-black leading-relaxed disabled:opacity-60"
            />
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
                <CertificationItem 
                  key={cert.id || `cert-${index}`}
                  cert={cert}
                  index={index}
                  isReadOnly={isReadOnly}
                  onUpdate={updateCertification}
                  onRemove={removeCertification}
                />
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hard Skills</label>
                <SkillBadgeList 
                  skills={cvData.competences.hard_skills}
                  onAdd={(skill) => addGlobalSkill('hard_skills', skill)}
                  onRemove={(index) => removeGlobalSkill('hard_skills', index)}
                  isReadOnly={isReadOnly}
                  placeholder="Ajouter un hard skill..."
                  variant="hard"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Soft Skills</label>
                <SkillBadgeList 
                  skills={cvData.competences.soft_skills}
                  onAdd={(skill) => addGlobalSkill('soft_skills', skill)}
                  onRemove={(index) => removeGlobalSkill('soft_skills', index)}
                  isReadOnly={isReadOnly}
                  placeholder="Ajouter un soft skill..."
                  variant="soft"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Langues</label>
                <SkillBadgeList 
                  skills={cvData.competences.langues}
                  onAdd={(skill) => addGlobalSkill('langues', skill)}
                  onRemove={(index) => removeGlobalSkill('langues', index)}
                  isReadOnly={isReadOnly}
                  placeholder="Ajouter une langue..."
                  variant="lang"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Experience, Projects, Formation */}
        <div className="lg:col-span-2 space-y-8">
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
                <ExperienceItem 
                  key={exp.id || `exp-${index}`}
                  exp={exp}
                  index={index}
                  isReadOnly={isReadOnly}
                  optimizingIndex={optimizingIndex}
                  shimmerIndex={shimmerIndex}
                  hasOriginal={!!originalDescriptions[index]}
                  onUpdate={updateExperience}
                  onRemove={removeExperience}
                  onOptimize={handleOptimizeDescription}
                  onUndo={handleUndoOptimization}
                  onAddSkill={addCompetenceCle}
                  onRemoveSkill={removeCompetenceCle}
                />
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
                <ProjectItem 
                  key={proj.id || `proj-${index}`}
                  proj={proj}
                  index={index}
                  isReadOnly={isReadOnly}
                  onUpdate={updateProjet}
                  onRemove={removeProjet}
                />
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
                <FormationItem 
                  key={form.id || `form-${index}`}
                  form={form}
                  index={index}
                  isReadOnly={isReadOnly}
                  onUpdate={updateFormation}
                  onRemove={removeFormation}
                />
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
