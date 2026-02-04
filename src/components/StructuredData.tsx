import { CVData } from "@/types/cv";

interface StructuredDataProps {
  data: CVData;
}

export default function StructuredData({ data }: StructuredDataProps) {
  const { personne, competences, resume, slug } = data;
  const fullName = `${personne.prenom} ${personne.nom}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nodalcv.com";
  const profileUrl = `${baseUrl}/cv/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": fullName,
    "givenName": personne.prenom,
    "familyName": personne.nom,
    "jobTitle": personne.titre_professionnel,
    "description": resume,
    "url": profileUrl,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": personne.contact.ville,
    },
    "knowsAbout": [
      ...(competences.hard_skills || []),
      ...(competences.soft_skills || []),
    ],
    "sameAs": [
      personne.contact.linkedin,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
