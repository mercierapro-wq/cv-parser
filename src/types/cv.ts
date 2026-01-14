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

export interface Experience {
  poste: string;
  entreprise: string;
  periode: string;
  description: string;
  points_cles: string[];
  details: string[];
}

export interface Formation {
  diplome: string;
  etablissement: string;
  annee: string;
}

export interface Competences {
  soft_skills: string[];
  hard_skills: string[];
  langues: string[];
}

export interface CVData {
  personne: Personne;
  resume: string;
  experiences: Experience[];
  formation: Formation[];
  competences: Competences;
}

export interface ParseCVResponse {
  output: CVData;
}
