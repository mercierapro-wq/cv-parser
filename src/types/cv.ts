export interface Contact {
  email: string;
  telephone: string;
  linkedin: string;
  ville: string;
}

export interface Personne {
  prenom: string;
  nom: string;
  titre_professionnel: string;
  contact: Contact;
}

export interface ProfilePictureTransform {
  x: number;
  y: number;
  scale: number;
}

export interface Experience {
  poste: string;
  entreprise: string;
  periode_debut: string;
  periode_fin: string;
  description: string;
  competences_cles: string[];
  details: string[];
}

export interface Projet {
  nom: string;
  description: string;
  periode_debut: string;
  periode_fin: string;
}

export interface Formation {
  diplome: string;
  etablissement: string;
  annee: string;
}

export interface Certification {
  nom: string;
  score: string;
  date_obtention: string;
}

export interface Competences {
  soft_skills: string[];
  hard_skills: string[];
  langues: string[];
}

export type AvailabilityStatus = 'immediate' | '1_month' | '3_months' | 'unavailable';

export interface CVData {
  personne: Personne;
  resume: string;
  experiences: Experience[];
  projets: Projet[];
  formation: Formation[];
  competences: Competences;
  certifications: Certification[];
  visible?: boolean;
  availability?: AvailabilityStatus;
  slug?: string;
  profilePicture?: string;
  profilePictureTransform?: ProfilePictureTransform;
}
