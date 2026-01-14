export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface CVData {
  name: string;
  slug: string;
  skills: string[];
  experience: Experience[];
}
